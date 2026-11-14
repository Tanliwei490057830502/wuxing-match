"use client";

// 拍照看布置 · Room photo reading
// 照片只在浏览器里压到 1024px，发一次 /api/ai（kind: "fengshui"），
// 拿回「整体 / 可以留 / 可以改 / 一个重点」四段。不存照片、不上传第二次。
// 这里故意不走 useAiText：它会把人设文案缓存进 localStorage，照片太大了，塞不下。

import { useRef, useState } from "react";
import { Bi, BiInline } from "@/components/Bi";
import { FENGSHUI_FALLBACK, FENGSHUI_ROOMS } from "@/lib/copy";
import type { AiFengshui, AiResponse } from "@/lib/aiShared";

const MAX_SHOTS = 4;
// 四张 1024px JPEG 大概 1MB，这里留出余量卡住 3.2MB（Vercel 请求体上限 4.5MB）
const MAX_TOTAL_CHARS = 3_200_000;

type Shot = { id: string; url: string };

const FALLBACK: AiFengshui = {
  overall: { ...FENGSHUI_FALLBACK.overall },
  keep: FENGSHUI_FALLBACK.keep.map((s) => ({ ...s })),
  change: FENGSHUI_FALLBACK.change.map((s) => ({ ...s })),
  focus: { ...FENGSHUI_FALLBACK.focus },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

/** 压成 JPEG data URL：长边不超过 maxSide，手机原图几 MB 也能塞进请求体 */
async function shrink(src: string, maxSide: number, quality: number): Promise<string> {
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

async function fileToSmallJpeg(file: File, maxSide: number, quality: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    return await shrink(url, maxSide, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function FengshuiClient() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [room, setRoom] = useState<string>(FENGSHUI_ROOMS[0].key);
  const [busy, setBusy] = useState<"load" | "analyze" | "">("");
  const [result, setResult] = useState<AiFengshui | null>(null);
  const [preset, setPreset] = useState(false);
  const [error, setError] = useState("");
  const pickRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const lowConfidence = shots.length < 3;

  async function addFiles(list: File[] | FileList | null) {
    if (!list?.length) return;
    const slots = MAX_SHOTS - shots.length;
    if (slots <= 0) return;
    const files = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, slots);
    if (!files.length) return;

    setBusy("load");
    setError("");
    try {
      const added: Shot[] = [];
      for (const f of files) {
        added.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: await fileToSmallJpeg(f, 1024, 0.72),
        });
      }
      let next = [...shots, ...added];
      if (next.reduce((n, s) => n + s.url.length, 0) > MAX_TOTAL_CHARS) {
        // 还是太大：整体再压一档，宁可糊一点也别让请求失败
        const smaller: Shot[] = [];
        for (const s of next) smaller.push({ ...s, url: await shrink(s.url, 800, 0.55) });
        next = smaller;
      }
      setShots(next);
      setResult(null);
      setPreset(false);
    } catch {
      setError("这张照片读不出来，换一张试试。 · Could not read that photo.");
    } finally {
      setBusy("");
    }
  }

  // 演示用：没在房间旁边也能跑一遍完整流程
  async function addSample() {
    if (shots.length >= MAX_SHOTS) return;
    const key = room === "bedroom" ? "bedroom" : "living";
    setBusy("load");
    setError("");
    try {
      const res = await fetch(`/demo/room-${key}.jpg`);
      if (!res.ok) throw new Error("sample missing");
      const blob = await res.blob();
      setRoom(key);
      await addFiles([new File([blob], `room-${key}.jpg`, { type: blob.type || "image/jpeg" })]);
    } catch {
      setError("示例照片没加载出来。 · Could not load the sample photo.");
      setBusy("");
    }
  }

  async function analyze() {
    if (!shots.length || busy) return;
    setBusy("analyze");
    setError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "fengshui", room, images: shots.map((s) => s.url) }),
      });
      const json = (await res.json()) as AiResponse;
      if (json.ok && json.data) {
        setResult(json.data as AiFengshui);
        setPreset(false);
      } else {
        setResult(FALLBACK);
        setPreset(true);
        setError(
          res.status === 429
            ? "这台网络今天用太多了，等一下再试。 · Too many requests, try again in a bit."
            : "AI 这次没回上话，先给你一份通用清单。 · Live reading did not come back, showing the general checklist.",
        );
      }
    } catch {
      setResult(FALLBACK);
      setPreset(true);
      setError("网络断了，先给你一份通用清单。 · Network lost, showing the general checklist.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-xs text-[#8a7aa3]">
        <Bi
          en="Shoot the room, get plain advice: what already works, what to fix, and one thing to do tonight."
          zh="拍几张房间的照片，帮你看看哪儿已经挺好、哪儿能改，还有今晚能做的一件事。"
        />
      </p>
      <p className="-mt-1 self-center rounded-full bg-[#fff3cd] px-3 py-1 text-xs font-black text-[#8a6d00]">
        <BiInline en="Indoor layout advice · just for fun" zh="室内布置建议 · 仅供娱乐" />
      </p>

      {/* 1 · 选房间 */}
      <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-4 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
        <p className="mb-2 text-sm font-extrabold text-[#6b4f8f]">
          <Bi en="1 · Which room is this?" zh="这是哪个房间？" />
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {FENGSHUI_ROOMS.map((r) => (
            <button
              key={r.key}
              type="button"
              data-testid={`room-${r.key}`}
              aria-pressed={room === r.key}
              onClick={() => setRoom(r.key)}
              className={`rounded-2xl border-2 px-1 py-2 text-center text-xs font-bold leading-tight ${
                room === r.key
                  ? "border-[#b48cff] bg-[#f3eefc] text-[#6b4f8f]"
                  : "border-[#e6d7ff] bg-white text-[#8a7aa3]"
              }`}
            >
              {r.zh}
              <span className="mt-0.5 block text-[9px] font-normal">{r.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2 · 拍照 */}
      <section className="rounded-[2rem] border-4 border-white bg-white p-4 shadow-[0_8px_24px_rgba(155,140,255,0.2)]">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-sm font-extrabold text-[#6b4f8f]">
            <Bi en="2 · Take 1–4 photos" zh="拍 1–4 张" />
          </p>
          <span className="text-xs font-bold text-[#8a7aa3]">{shots.length}/{MAX_SHOTS}</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            data-testid="fengshui-camera"
            disabled={shots.length >= MAX_SHOTS || busy === "load"}
            onClick={() => camRef.current?.click()}
            className="flex-1 rounded-full bg-[#ff8fb1] px-4 py-3 text-sm font-extrabold text-white shadow-[0_5px_0_#e06690] active:translate-y-0.5 active:shadow-[0_2px_0_#e06690] disabled:opacity-40"
          >
            <BiInline en="📷 Camera" zh="拍一张" />
          </button>
          <button
            type="button"
            data-testid="fengshui-pick"
            disabled={shots.length >= MAX_SHOTS || busy === "load"}
            onClick={() => pickRef.current?.click()}
            className="rounded-full border-2 border-[#e6d7ff] bg-white px-4 py-3 text-sm font-bold text-[#6b4f8f] disabled:opacity-40"
          >
            <BiInline en="🖼️ Gallery" zh="相册" />
          </button>
        </div>
        <input
          ref={camRef}
          data-testid="fengshui-file-camera"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={pickRef}
          data-testid="fengshui-file"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          data-testid="fengshui-sample"
          disabled={shots.length >= MAX_SHOTS || busy !== ""}
          onClick={() => void addSample()}
          className="mt-2 w-full rounded-full border-2 border-dashed border-[#d9cfe6] bg-white px-3 py-2 text-[11px] font-bold text-[#8a7aa3] disabled:opacity-40"
        >
          <BiInline en="🧪 No photo handy? Try a sample room" zh="没有照片？用示例房间跑一遍" />
        </button>

        {shots.length > 0 && (
          <ul className="mt-3 grid grid-cols-4 gap-2" data-testid="fengshui-shots">
            {shots.map((s) => (
              <li key={s.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => {
                    setShots((list) => list.filter((x) => x.id !== s.id));
                    setResult(null);
                  }}
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#4a3566] text-xs font-black text-white"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {busy === "load" && (
          <p className="mt-2 text-center text-xs font-bold text-[#b48cff]">
            <BiInline en="Compressing…" zh="压照片中…" />
          </p>
        )}

        <p className="mt-2 text-[11px] leading-relaxed text-[#8a7aa3]">
          <Bi
            en="Photos are sent to Google Gemini once for this reading. We do not save them. Shoot the space, not people or ID cards."
            zh="照片只为这一次分析发给 Google Gemini，我们不保存。拍空间就好，不要拍人和证件。"
          />
        </p>

        <details className="mt-2 text-[11px] text-[#8a7aa3]">
          <summary className="cursor-pointer font-bold text-[#6b4f8f]">
            <BiInline en="How to shoot" zh="怎么拍（点开）" />
          </summary>
          <ul className="mt-1 list-disc pl-4">
            <li>
              <Bi
                en="Hold the phone sideways at chest height, about 1.4–1.6 m."
                zh="手机横着拿，举到胸口高度（1.4–1.6 米）。"
              />
            </li>
            <li>
              <Bi en="Turn the lights on, keep the flash off." zh="开灯，关闪光灯。" />
            </li>
            <li>
              <Bi en="Stay on 1x. One photo per direction, no panorama stitching." zh="用 1x，一张拍一个方向，别拼图。" />
            </li>
            <li>
              <Bi en="Stand in the middle of the room and turn around." zh="站在房间中央，转一圈换方向拍。" />
            </li>
          </ul>
        </details>
      </section>

      {/* 3 · 出结果 */}
      <button
        type="button"
        data-testid="fengshui-analyze"
        disabled={!shots.length || busy !== ""}
        onClick={() => void analyze()}
        className="rounded-full bg-[#b48cff] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#8f66e0] active:translate-y-1 active:shadow-[0_2px_0_#8f66e0] disabled:opacity-40"
      >
        {busy === "analyze" ? (
          <BiInline en="👀 Reading the room… (10–20s)" zh="正在看图…（10–20 秒）" />
        ) : (
          <BiInline en="🔍 Read this room" zh="看这间房" />
        )}
      </button>

      {error && (
        <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-xs font-bold text-[#c0392b]" data-testid="fengshui-error">
          {error}
        </p>
      )}

      {result && (
        <section
          data-testid="fengshui-result"
          className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.2)]"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-[#f3eefc] px-3 py-1 text-xs font-extrabold text-[#6b4f8f]">
              {FENGSHUI_ROOMS.find((r) => r.key === room)?.en} ·{" "}
              {FENGSHUI_ROOMS.find((r) => r.key === room)?.zh}
            </span>
            <span className="shrink-0 text-right text-[11px] font-bold text-[#b9aed0]">
              {preset ? (
                <Bi en="General checklist" zh="通用清单" zhClassName="opacity-80" />
              ) : lowConfidence ? (
                <Bi en="Quick look · low confidence" zh="初步判断 · 可信度较低" zhClassName="opacity-80" />
              ) : (
                <Bi en="✦ Read from your photos" zh="按你的照片看的" zhClassName="opacity-80" />
              )}
            </span>
          </div>

          <div>
            <p className="mb-1 text-xs font-black tracking-wide text-[#b48cff]">
              <BiInline en="Overall" zh="整体" />
            </p>
            <p className="text-[15px] leading-relaxed text-[#4a3566]">{result.overall.en}</p>
            <p className="mt-1 text-xs text-[#8a7aa3]">{result.overall.zh}</p>
          </div>

          <div className="rounded-2xl bg-[#eafaf0] p-3">
            <p className="mb-1 text-sm font-extrabold text-[#2e7d4f]">
              <Bi en="✅ Keep these" zh="这几个可以留" />
            </p>
            <ul className="flex flex-col gap-1.5">
              {result.keep.map((k) => (
                <li key={k.en} className="text-sm leading-snug text-[#2f5c44]">
                  {k.en}
                  <span className="mt-0.5 block text-[11px] text-[#6b8a78]">{k.zh}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[#fff7e0] p-3">
            <p className="mb-1 text-sm font-extrabold text-[#8a6d00]">
              <Bi en="🔧 Change these" zh="这几个可以改" />
            </p>
            <ul className="flex flex-col gap-1.5">
              {result.change.map((k) => (
                <li key={k.en} className="text-sm leading-snug text-[#6b5518]">
                  {k.en}
                  <span className="mt-0.5 block text-[11px] text-[#a08a4f]">{k.zh}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-[#f3eefc] p-3">
            <p className="mb-1 text-xs font-black text-[#6b4f8f]">
              <BiInline en="👉 If you only do one thing tonight" zh="今晚只做一件事" />
            </p>
            <p className="text-sm font-bold leading-snug text-[#4a3566]">{result.focus.en}</p>
            <p className="mt-0.5 text-[11px] text-[#8a7aa3]">{result.focus.zh}</p>
          </div>

          <p className="text-[11px] leading-relaxed text-[#b9aed0]">
            <Bi
              en="We only talk about what is visible in the photos: light, clutter, walking space, mirrors, plants, colours. Indoor layout advice, just for fun."
              zh="只说照片里看得见的东西：光线、杂物、走道、镜子、植物、颜色。室内布置建议，仅供娱乐。"
            />
          </p>
        </section>
      )}

      {shots.length > 0 && shots.length < 3 && (
        <p className="text-center text-[11px] text-[#8a7aa3]">
          <Bi en="Two more angles will make the read much better." zh="再加两张不同方向，会准很多。" />
        </p>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">
        <BiInline en="Just for fun 🎉" zh="仅供娱乐" />
      </p>
    </div>
  );
}
