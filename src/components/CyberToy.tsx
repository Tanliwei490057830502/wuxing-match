"use client";

// 赛博五行解压小玩具：火气旺就敲冰块，财运弱就敲木鱼。
// A tiny toy picked by today's fortune — smash ice when you're fiery, hit the
// wooden fish when money luck is thin. Purely for fun, nothing is stored.

import { useState } from "react";
import { DAILY_TOYS } from "@/lib/copy";

export default function CyberToy({ kind }: { kind: "ice" | "fish" }) {
  const toy = DAILY_TOYS[kind];
  const [taps, setTaps] = useState(0);
  const [hit, setHit] = useState(0);
  const done = taps >= toy.taps;
  const progress = Math.min(1, taps / toy.taps);

  function tap() {
    if (done) return;
    setTaps((n) => n + 1);
    setHit((n) => n + 1);
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border-2 p-4 ${
        kind === "ice"
          ? "border-[#cfe7ff] bg-gradient-to-b from-[#eef8ff] via-[#dcefff] to-[#c3e2ff]"
          : "border-[#ffe6a8] bg-gradient-to-b from-[#fffaf0] via-[#fff1cf] to-[#ffe1a8]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-[#4a3566]">
            {kind === "ice" ? "🧊" : "🪘"} {toy.name}
          </p>
          <p className="text-xs text-[#8a7aa3]">{toy.reason}</p>
        </div>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-bold text-[#6b4f8f]">
          {Math.min(taps, toy.taps)}/{toy.taps}
        </span>
      </div>

      <div className="relative mt-2 flex h-56 items-center justify-center">
        {/* soft glow */}
        <div
          aria-hidden
          className="absolute h-36 w-36 rounded-full blur-2xl"
          style={{ background: kind === "ice" ? "rgba(120,200,255,0.55)" : "rgba(255,200,90,0.55)" }}
        />

        {hit > 0 && (
          <span
            key={`f-${hit}`}
            className="float-up pointer-events-none absolute top-8 text-lg font-black"
            style={{ color: kind === "ice" ? "#2f7fd1" : "#b8860b" }}
          >
            {kind === "ice" ? "❄️ 冷静 +1" : "🙏 功德 +1"}
          </span>
        )}
        {hit > 0 && (
          <span
            key={`r-${hit}`}
            className="ring-out pointer-events-none absolute h-24 w-24 rounded-full border-4"
            style={{ borderColor: kind === "ice" ? "#7cc4ff" : "#f0c060" }}
          />
        )}

        <button
          type="button"
          onClick={tap}
          aria-label={toy.hint}
          data-testid={`toy-${kind}`}
          className="relative z-10 select-none rounded-3xl p-2 transition active:scale-95"
          style={{ transform: `scale(${1 - progress * 0.12})` }}
        >
          <span
            key={`h-${hit}`}
            className={`block text-[110px] leading-none drop-shadow-[0_8px_16px_rgba(80,90,140,0.25)] ${
              hit > 0 && !done ? "crack" : ""
            }`}
          >
            {done ? (kind === "ice" ? "💥" : "✨") : kind === "ice" ? "🧊" : "🪘"}
          </span>
        </button>

        {/* 裂纹随进度出现 */}
        {kind === "ice" && progress > 0 && !done && (
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute h-36 w-36" aria-hidden>
            <g stroke="#ffffff" strokeWidth="2" fill="none" opacity={0.35 + progress * 0.55}>
              <path d="M50 22 L46 42 L54 52 L48 70" />
              {progress > 0.35 && <path d="M46 42 L28 38 L20 46" />}
              {progress > 0.6 && <path d="M54 52 L72 46 L80 54" />}
              {progress > 0.8 && <path d="M48 70 L38 82" />}
            </g>
          </svg>
        )}
      </div>

      <p className="mt-1 text-center text-sm font-extrabold text-[#4a3566]" data-testid={`toy-${kind}-status`}>
        {done ? toy.done : toy.hint}
      </p>
      {done && (
        <button
          type="button"
          onClick={() => {
            setTaps(0);
            setHit(0);
          }}
          className="mx-auto mt-2 block rounded-full bg-white/80 px-4 py-1 text-xs font-bold text-[#6b4f8f]"
        >
          再玩一次 · Again
        </button>
      )}
    </div>
  );
}
