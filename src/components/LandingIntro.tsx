"use client";

// 首页的介绍段：先说清楚这个站能干嘛，再让人开始测试。
// English first, smaller Chinese underneath.

import { Bi } from "@/components/Bi";

const FEATURES = [
  {
    emoji: "🃏",
    en: "Persona card",
    zh: "日柱人设卡",
    bodyEn: "An MBTI-style code, contrast bars and one line that calls you out. Download it as a poster.",
    bodyZh: "MBTI 式代号、反差属性条、一句灵魂暴击，还能下载成海报发 IG。",
  },
  {
    emoji: "💞",
    en: "1v1 match",
    zh: "1v1 合盘",
    bodyEn: "Scan and see your score, then unlock an AI roast or a caring read.",
    bodyZh: "扫码看你们配几分，再解锁 AI 毒舌锐评或走心建议。",
  },
  {
    emoji: "🧑‍🚀",
    en: "Element squad",
    zh: "五行小队",
    bodyEn: "Open a room for 3–5 friends. The radar shows which element the team is missing.",
    bodyZh: "3–5 人开一个房间，雷达告诉你这队缺哪种五行、谁该当 Leader。",
  },
  {
    emoji: "🔮",
    en: "Daily hub",
    zh: "每日补给",
    bodyEn: "Check in for rewards, read your AI almanac, play a small stress toy.",
    bodyZh: "签到领奖励、AI 今日宜忌，还有一键解压的小玩具。",
  },
] as const;

export default function LandingIntro({ onStart, returning = false }: { onStart: () => void; returning?: boolean }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-[2rem] border-4 border-white bg-white/85 p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.25)]">
        <p className="text-xs font-black tracking-[0.2em] text-[#b48cff]">30 SECONDS · NO SIGN-UP</p>
        <h2 className="mt-1 text-xl font-black text-[#4a3566]">
          <Bi en="What can you do here?" zh="这站能做什么？" />
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#8a7aa3]">
          Enter your real birth time and you get a persona card you can compare with friends.
          <br />
          <span className="text-xs">填真实出生时间排盘，就给你一张能跟朋友比的「日柱人设卡」。</span>
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2">
        {FEATURES.map((f) => (
          <li key={f.en} className="flex items-start gap-3 rounded-[1.6rem] border-2 border-white bg-white/80 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f6f1ff] text-xl">
              {f.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#4a3566]">
                {f.en} <span className="text-[11px] font-bold text-[#8a7aa3]">{f.zh}</span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#8a7aa3]">
                {f.bodyEn}
                <br />
                <span className="text-[11px] opacity-80">{f.bodyZh}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-testid="start-test"
        onClick={onStart}
        className="rounded-full bg-[#ff8fb1] px-6 py-4 text-center text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] transition active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
      >
        {returning ? (
          <>
            ← Back to my card
            <span className="mt-0.5 block text-[11px] font-bold opacity-85">回到我的卡</span>
          </>
        ) : (
          <>
            🎂 Enter my birth time
            <span className="mt-0.5 block text-[11px] font-bold opacity-85">填出生时间，开始排盘</span>
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-[#b9aed0]">
        Your birthday stays in your browser.
        <br />
        <span className="text-[10px]">生日只存在你自己的浏览器里，不会上传。</span>
      </p>
    </section>
  );
}
