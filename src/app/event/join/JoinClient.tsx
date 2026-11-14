"use client";

// 评委手机上的入场页：输入生日 → 大屏弹出你的五行卡片。

import CharacterAvatar from "@/components/CharacterAvatar";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { ELEMENT_INFO, computeChart, stemText, type Profile } from "@/lib/bazi";
import { PERSONAS } from "@/lib/copy";
import { deviceId } from "@/lib/device";
import { enterStage } from "@/lib/event";
import { saveProfile } from "@/lib/useClientValues";
import { useState } from "react";

export default function JoinClient({ room }: { room: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "offline">("idle");

  const chart = profile ? computeChart(profile) : null;

  async function submit(p: Profile) {
    setProfile(p);
    saveProfile(p);
    setStatus("sending");
    try {
      await enterStage(room, p, deviceId());
      setStatus("done");
    } catch {
      // The rules may not be published yet — still show the judge their card.
      setStatus("offline");
    }
  }

  if (!profile || !chart) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
        <header className="text-center">
          <p className="text-4xl">🎟️</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#6b4f8f]">现场入场 · Live check-in</h1>
          <p className="mt-1 text-sm text-[#8a7aa3]">
            输入生日，大屏马上弹出你的五行入场卡。
            <br />
            Type your birthday — your card pops up on the big screen.
          </p>
        </header>
        <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
          <ProfileForm submitLabel="✨ 让我入场 · Enter" onSubmit={(p) => void submit(p)} />
        </section>
        <p className="text-center text-xs text-[#b9aed0]">房间 {room} · 仅供娱乐</p>
      </main>
    );
  }

  const info = ELEMENT_INFO[chart.element];
  const persona = PERSONAS[chart.dayMaster];
  const soul = persona.souls[(chart.pillars[2]?.pillar.branch ?? 0) % 2];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 px-4 py-8 text-center">
      <p className="pop-in text-5xl">{info.emoji}</p>
      <h1 className="text-2xl font-black text-[#6b4f8f]">你入场了！</h1>
      <p className="text-sm text-[#8a7aa3]">
        {status === "sending" ? "正在推到大屏…" : status === "done" ? "抬头看大屏，你的卡片应该出现了 ✨" : "大屏没连上，但你的卡片在这里 👇"}
      </p>

      <section
        className="pop-in w-full overflow-hidden rounded-[2rem] border-4 border-white p-5 shadow-[0_12px_30px_rgba(155,140,255,0.35)]"
        style={{ background: `linear-gradient(160deg,#ffffff, ${info.soft})` }}
      >
        <p className="text-xs font-black tracking-[0.2em]" style={{ color: info.color }}>
          {persona.code}
        </p>
        <CharacterAvatar index={chart.dayMaster} priority className="mx-auto mt-2 block h-auto w-[58%] max-w-[210px]" />
        <p className="mt-2 text-xl font-black text-[#4a3566]">
          {profile.name} · {stemText(chart.dayMaster)}
          {info.zh}日主
        </p>
        <p className="text-sm font-bold text-[#8a7aa3]">{persona.title}</p>
        <p className="mt-3 rounded-2xl bg-white/85 p-3 text-sm font-bold text-[#4a3566]">“{soul}”</p>
      </section>

      <Link href="/" className="rounded-full bg-[#b48cff] px-6 py-3 font-extrabold text-white shadow-[0_5px_0_#8f66e0]">
        🏠 去首页看完整玩法
      </Link>
      <p className="text-xs text-[#b9aed0]">房间 {room}</p>
    </main>
  );
}
