import { NextRequest, NextResponse } from "next/server";
import { getProductByExternalId, updateProductStatusByExternalId, formatProductText } from "@/lib/services/product-service";
import { answerCallbackQuery, editMessageText, sendMessage, sendPhoto } from "@/lib/telegram";
import { cldImg } from "@/lib/cloudinary";

const ALLOWED_USER_ID = Number(process.env.TELEGRAM_ALLOWED_USER_ID ?? "0");
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

const VALID_STATUSES = ["AVAILABLE", "RESERVED", "SOLD"] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(s: string): s is ProductStatus {
  return (VALID_STATUSES as readonly string[]).includes(s);
}

function isAllowedUser(userId?: number) {
  return !!userId && userId === ALLOWED_USER_ID;
}

function buildStatusButtons(externalId: number) {
  return {
    inline_keyboard: [
      [
        { text: "Disponible", callback_data: `status:${externalId}:AVAILABLE` },
        { text: "Reservado", callback_data: `status:${externalId}:RESERVED` },
        { text: "Vendido", callback_data: `status:${externalId}:SOLD` },
      ],
      [{ text: "Cancelar", callback_data: `cancel:${externalId}` }],
    ],
  };
}

function buildConfirmButtons(externalId: number, status: string) {
  return {
    inline_keyboard: [
      [{ text: "Guardar", callback_data: `confirm:${externalId}:${status}` }],
      [{ text: "Cancelar", callback_data: `cancel:${externalId}` }],
    ],
  };
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const update = await req.json();

  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const userId = msg.from?.id;
    const text = (msg.text || "").trim();

    if (!isAllowedUser(userId)) {
      return NextResponse.json({ ok: true });
    }

    if (/^\/p\s+\d+$/i.test(text)) {
      const externalId = Number(text.split(/\s+/)[1]);
      const product = await getProductByExternalId(externalId);

      if (!product) {
        await sendMessage(chatId, `No encontré el producto con ID ${externalId}.`);
        return NextResponse.json({ ok: true });
      }

      const caption = formatProductText(product);
      const photo = product.imageUrl ? cldImg(product.imageUrl, { w: 1000 }) : null;

      if (photo) {
        await sendPhoto(chatId, photo, caption);
      } else {
        await sendMessage(chatId, caption);
      }

      return NextResponse.json({ ok: true });
    }

    if (/^\/estado\s+\d+$/i.test(text)) {
      const externalId = Number(text.split(/\s+/)[1]);
      const product = await getProductByExternalId(externalId);

      if (!product) {
        await sendMessage(chatId, `No encontré el producto con ID ${externalId}.`);
        return NextResponse.json({ ok: true });
      }

      const textOut =
        `${formatProductText(product)}\n\n` +
        `¿Qué estado quieres ponerle?`;

      await sendMessage(chatId, textOut, buildStatusButtons(externalId));
      return NextResponse.json({ ok: true });
    }

    if (/^\/estado$/i.test(text)) {
      await sendMessage(chatId, "Envíame el comando así: /estado 22");
      return NextResponse.json({ ok: true });
    }
  }

  if (update.callback_query) {
    const cq = update.callback_query;
    const data = String(cq.data || "");
    const userId = cq.from?.id;
    const chatId = cq.message?.chat?.id;
    const messageId = cq.message?.message_id;

    if (!isAllowedUser(userId)) {
      await answerCallbackQuery(cq.id, "No autorizado");
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("status:")) {
      const [, rawId, status] = data.split(":");
      const externalId = Number(rawId);
      const product = await getProductByExternalId(externalId);

      if (!product) {
        await answerCallbackQuery(cq.id, "Producto no encontrado");
        return NextResponse.json({ ok: true });
      }

      const textOut =
        `${formatProductText(product)}\n\n` +
        `Nuevo estado: ${status}\n\n` +
        `¿Deseas guardar el cambio?`;

      await editMessageText(chatId, messageId, textOut, buildConfirmButtons(externalId, status));
      await answerCallbackQuery(cq.id, "Estado seleccionado");
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("confirm:")) {
      const [, rawId, status] = data.split(":");
      const externalId = Number(rawId);

      if (!isValidStatus(status)) {
        await answerCallbackQuery(cq.id, "Estado inválido");
        return NextResponse.json({ ok: true });
      }

      const updated = await updateProductStatusByExternalId(externalId, status);

      await editMessageText(
        chatId,
        messageId,
        `${formatProductText(updated)}\n\nCambio guardado correctamente.`
      );
      await answerCallbackQuery(cq.id, "Guardado");
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("cancel:")) {
      await editMessageText(chatId, messageId, "Operación cancelada.");
      await answerCallbackQuery(cq.id, "Cancelado");
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}