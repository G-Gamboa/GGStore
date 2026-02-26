export async function GET() {
  return Response.json({
    whatsappNumber: process.env.WHATSAPP_NUMBER || "",
    whatsappBaseMessage: process.env.WHATSAPP_BASE_MESSAGE || "",
  });
}
