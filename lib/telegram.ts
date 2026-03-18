const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function tg(method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram error in ${method}`);
  }
  return data.result;
}

export async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

export async function sendPhoto(chatId: number, photo: string, caption?: string, replyMarkup?: any) {
  return tg("sendPhoto", {
    chat_id: chatId,
    photo,
    caption,
    reply_markup: replyMarkup,
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return tg("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function editMessageText(chatId: number, messageId: number, text: string, replyMarkup?: any) {
  return tg("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: replyMarkup,
  });
}