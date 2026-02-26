export function buildWhatsAppLink(params: { number: string; message: string }) {
  const number = params.number.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(params.message);
  return `https://wa.me/${number}?text=${text}`;
}
