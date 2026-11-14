// 照片压缩 · 手机原图几 MB，发请求前统一压到长边 1024px 的 JPEG。
// 只在前端用：结果是一个 data URL，直接塞进 /api/ai 的 images。

export const MAX_SHOT_SIDE = 1024;
export const MAX_TOTAL_CHARS = 3_200_000; // 留余量卡住 Vercel 4.5MB 的请求体上限

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

export async function shrink(src: string, maxSide: number, quality: number): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function fileToSmallJpeg(file: File, maxSide = MAX_SHOT_SIDE, quality = 0.72): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    return await shrink(url, maxSide, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** 一批照片超预算时整体再压一档，宁可糊一点也别让请求失败 */
export async function fitBudget(urls: string[], fallbackSide = 800, quality = 0.55): Promise<string[]> {
  if (urls.reduce((n, u) => n + u.length, 0) <= MAX_TOTAL_CHARS) return urls;
  const out: string[] = [];
  for (const u of urls) out.push(await shrink(u, fallbackSide, quality));
  return out;
}
