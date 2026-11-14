"use client";

// 把人设卡画成一张 1080×1920 的海报（IG Story / 小红书都能直接发）。
// Draws the persona card onto a canvas so it can be downloaded as one image.

import QRCode from "qrcode";

export type PosterData = {
  name: string;
  code: string;
  title: string;
  soul: string;
  bars: { label: string; value: number }[];
  elementZh: string;
  color: string;
  charIndex: number;
  qrValue: string;
  partner: string;
  nemesis: string;
  pillars: string;
};

const W = 1080;
const H = 1920;
const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image failed"));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ch === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth - 30) {
      lines[maxLines - 1] = last.slice(0, Math.max(1, last.length - 1)) + "…";
    }
  }
  return lines;
}

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fill();
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export async function buildPoster(d: PosterData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fff5fb");
  bg.addColorStop(0.5, "#f1e6ff");
  bg.addColorStop(1, "#e2f0ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  blob(ctx, 140, 240, 420, "rgba(255,143,177,0.45)");
  blob(ctx, W - 120, 520, 460, "rgba(180,140,255,0.4)");
  blob(ctx, 240, H - 260, 520, "rgba(120,200,255,0.35)");

  // card
  panel(ctx, 60, 60, W - 120, H - 120, 56, "rgba(255,255,255,0.86)");

  const x = 110;
  const innerW = W - 220;
  let y = 150;

  ctx.textAlign = "left";
  ctx.fillStyle = "#8a7aa3";
  ctx.font = `800 30px ${FONT}`;
  ctx.fillText("WUXING ENGINE · 五行引擎", x, y);

  y += 66;
  // code chip
  ctx.font = `800 34px ${FONT}`;
  const codeW = ctx.measureText(d.code).width + 60;
  panel(ctx, x, y, codeW, 64, 32, d.color);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(d.code, x + 30, y + 44);
  y += 64 + 40;

  // title
  ctx.fillStyle = "#4a3566";
  ctx.font = `900 56px ${FONT}`;
  const titleLines = wrapText(ctx, d.title, innerW, 2);
  for (const line of titleLines) {
    ctx.fillText(line, x, y + 52);
    y += 74;
  }

  // name + pillars
  y += 26;
  ctx.fillStyle = "#6b4f8f";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText(`${d.name} · ${d.elementZh}日主`, x, y);
  y += 44;
  ctx.fillStyle = "#8a7aa3";
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText(d.pillars, x, y);

  // character
  y += 30;
  try {
    const img = await loadImage(`/characters/${d.charIndex}.webp`);
    const maxW = innerW;
    const maxH = 560;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const iw = img.width * ratio;
    const ih = img.height * ratio;
    ctx.drawImage(img, W / 2 - iw / 2, y, iw, ih);
    y += ih + 24;
  } catch {
    y += 40;
  }

  // soul line
  ctx.font = `700 34px ${FONT}`;
  const soulLines = wrapText(ctx, d.soul, innerW - 120, 4);
  const soulH = soulLines.length * 52 + 78;
  panel(ctx, x, y, innerW, soulH, 32, "rgba(255,245,251,0.95)");
  ctx.fillStyle = "#ff8fb1";
  ctx.font = `900 78px ${FONT}`;
  ctx.fillText("“", x + 24, y + 78);
  ctx.fillStyle = "#4a3566";
  ctx.font = `700 34px ${FONT}`;
  let sy = y + 68;
  for (const line of soulLines) {
    ctx.fillText(line, x + 82, sy);
    sy += 52;
  }
  y += soulH + 34;

  // bars
  for (const bar of d.bars) {
    ctx.fillStyle = "#6b4f8f";
    ctx.font = `700 28px ${FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(bar.label, x, y + 28);
    ctx.textAlign = "right";
    ctx.fillStyle = d.color;
    ctx.font = `900 30px ${FONT}`;
    ctx.fillText(`${bar.value}%`, x + innerW, y + 28);
    ctx.textAlign = "left";
    y += 46;
    panel(ctx, x, y, innerW, 22, 11, "#f0e8fb");
    panel(ctx, x, y, Math.max(24, (innerW * bar.value) / 100), 22, 11, d.color);
    y += 52;
  }

  // partner / nemesis
  ctx.font = `700 28px ${FONT}`;
  ctx.fillStyle = "#2e9e63";
  ctx.fillText(`♡ 最佳拍档 ${d.partner}`, x, y + 20);
  ctx.fillStyle = "#c0392b";
  ctx.fillText(`⚡ 天敌避雷 ${d.nemesis}`, x + innerW / 2 + 10, y + 20);
  y += 54;

  // QR
  try {
    const qrUrl = await QRCode.toDataURL(d.qrValue, {
      margin: 1,
      width: 480,
      color: { dark: "#4a3566", light: "#ffffff" },
    });
    const qr = await loadImage(qrUrl);
    const size = 190;
    panel(ctx, x + innerW - size - 16, y, size + 32, size + 32, 24, "#ffffff");
    ctx.drawImage(qr, x + innerW - size, y + 16, size, size);
    ctx.fillStyle = "#8a7aa3";
    ctx.font = `600 26px ${FONT}`;
    ctx.fillText("扫码看我们的合盘", x, y + 70);
    ctx.fillStyle = "#b9aed0";
    ctx.font = `600 24px ${FONT}`;
    ctx.fillText("wuxing-engine · 仅供娱乐", x, y + 112);
  } catch {
    // QR failed — the rest of the poster is still useful
  }

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
