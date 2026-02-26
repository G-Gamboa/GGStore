export function cldImg(publicId: string, opts?: { w?: number }) {
  const cloud = "dk7aiheee";
  const folder = "ggstore";
  const w = opts?.w ?? 1000;
  const t = `f_auto,q_auto,w_${w},c_limit`;

  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${folder}/${publicId}`;
}