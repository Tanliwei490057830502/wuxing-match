"use client";

import Link from "next/link";
import { useState } from "react";
import BaziReading from "@/components/BaziReading";
import CharacterAvatar from "@/components/CharacterAvatar";
import ElementCard from "@/components/ElementCard";
import EnergyOrb from "@/components/EnergyOrb";
import ProfileForm from "@/components/ProfileForm";
import QrCode from "@/components/QrCode";
import { ELEMENT_INFO, computeChart, inviteUrl } from "@/lib/bazi";
import { personaFallback } from "@/lib/persona";
import { saveProfile, useOrigin, useSavedProfile } from "@/lib/useClientValues";

export default function Home() {
  const profile = useSavedProfile();
  const origin = useOrigin();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const chart = profile ? computeChart(profile) : null;
  const showForm = editing || !profile || !chart;
  const link = profile && origin ? inviteUrl(origin, profile) : "";
  const persona = chart ? personaFallback(chart) : null;
  const info = chart ? ELEMENT_INFO[chart.element] : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="relative text-center">
        <Link
          href="/event"
          data-testid="event-link"
          className="absolute top-0 right-0 rounded-full bg-[#4a3566] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_4px_10px_rgba(74,53,102,0.35)]"
        >
          ⚡ 现场模式
        </Link>
        <EnergyOrb size={showForm ? 168 : 96} className="mt-3" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#4a3566]">WuXing Engine</h1>
        <p className="text-sm font-black tracking-[0.35em] text-[#b48cff]">五行引擎</p>
        <p className="mt-2 text-sm text-[#8a7aa3]">
          输入生日 → 拿到你的日柱人设卡 → 扫码合盘、组队破冰。
          <br />
          <span className="text-xs">Your birthday → persona card → match &amp; squad.</span>
        </p>
      </header>

      {showForm ? (
        <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
          <ProfileForm
            initial={profile}
            submitLabel="✨ 看我的五行 · Show my element"
            onSubmit={(p) => {
              saveProfile(p);
              setEditing(false);
            }}
          />
          <p className="mt-3 rounded-2xl bg-white/70 p-3 text-xs text-[#8a7aa3]">
            🕐 忘记时辰？选「不知道」也能算，只看年月日三柱，结果一样好玩。
          </p>
        </section>
      ) : (
        <>
          {/* 1 · persona card */}
          <Link
            href="/card"
            data-testid="card-link"
            className="relative overflow-hidden rounded-[2rem] border-4 border-white p-4 shadow-[0_10px_26px_rgba(155,140,255,0.32)]"
            style={{ background: `linear-gradient(135deg, #ffffff, ${info!.soft})` }}
          >
            <div className="flex items-center gap-3">
              <CharacterAvatar index={chart!.dayMaster} className="h-20 w-auto shrink-0 drop-shadow" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black tracking-[0.2em]" style={{ color: info!.color }}>
                  {persona!.code}
                </p>
                <p className="truncate text-lg font-black text-[#4a3566]">{persona!.title}</p>
                <p className="line-clamp-2 text-xs text-[#8a7aa3]">“{persona!.soul}”</p>
              </div>
              <span className="text-xl text-[#b48cff]">›</span>
            </div>
            <p className="mt-2 rounded-full bg-white/80 px-3 py-1 text-center text-[11px] font-bold text-[#6b4f8f]">
              🃏 打开我的日柱人设卡 · 可下载海报
            </p>
          </Link>

          {/* 2 · modules */}
          <section className="grid grid-cols-2 gap-3">
            <a
              href="#invite"
              className="col-span-2 flex items-center gap-3 rounded-[1.6rem] border-4 border-white bg-gradient-to-br from-[#ffe0ee] to-[#fff5fb] p-4 shadow-[0_6px_18px_rgba(255,143,177,0.22)]"
            >
              <span className="text-2xl">📱</span>
              <span className="flex-1">
                <span className="block text-sm font-black text-[#6b4f8f]">合盘 QR 码</span>
                <span className="text-[11px] text-[#8a7aa3]">朋友扫码，1v1 看合盘分数</span>
              </span>
              <span className="text-xl text-[#b48cff]">›</span>
            </a>
            <Link
              href="/squad"
              data-testid="squad-link"
              className="flex flex-col justify-between rounded-[1.6rem] border-4 border-white bg-gradient-to-br from-[#e4f1ff] to-[#f3f8ff] p-4 shadow-[0_6px_18px_rgba(120,170,255,0.22)]"
            >
              <span className="text-2xl">🧑‍🚀</span>
              <span className="mt-2 block text-sm font-black text-[#6b4f8f]">五行小队</span>
              <span className="text-[11px] text-[#8a7aa3]">3–5 人雷达</span>
            </Link>
            <Link
              href="/fortune"
              data-testid="fortune-link"
              className="flex flex-col justify-between rounded-[1.6rem] border-4 border-white bg-gradient-to-br from-[#fff1c9] to-[#fffaf0] p-4 shadow-[0_6px_18px_rgba(255,200,90,0.22)]"
            >
              <span className="text-2xl">🔮</span>
              <span className="mt-2 block text-sm font-black text-[#6b4f8f]">每日补给</span>
              <span className="text-[11px] text-[#8a7aa3]">签到 · 宜忌 · 解压</span>
            </Link>
          </section>

          <ElementCard name={profile!.name} gender={profile!.gender} chart={chart!} />
          <details className="group rounded-[2rem] border-4 border-white bg-white/70 p-4">
            <summary className="cursor-pointer list-none text-sm font-extrabold text-[#6b4f8f]">
              📜 八字解读 · 四柱、身强弱、喜用神
              <span className="ml-1 text-[#b48cff] group-open:hidden">＋</span>
              <span className="ml-1 hidden text-[#b48cff] group-open:inline">－</span>
            </summary>
            <div className="mt-3">
              <BaziReading chart={chart!} />
            </div>
          </details>

          <section
            id="invite"
            className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.25)]"
          >
            <h2 className="text-xl font-extrabold text-[#6b4f8f]">📱 叫朋友扫一扫 · Let a friend scan</h2>
            <p className="text-sm text-[#8a7aa3]">
              朋友用手机相机扫这个二维码，就能和你配对！
              <br />
              Your friend scans this with their phone camera to match with you.
            </p>
            {link && <QrCode value={link} />}
            <div className="flex w-full flex-col gap-2">
              <a
                href={link}
                data-testid="invite-link"
                className="rounded-full bg-[#b48cff] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#8f66e0] active:translate-y-1 active:shadow-[0_2px_0_#8f66e0]"
              >
                🔗 打开配对链接 · Open match link
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    setCopied(false);
                  }
                }}
                className="rounded-full border-2 border-[#e6d7ff] px-5 py-2 text-sm font-bold text-[#6b4f8f]"
              >
                {copied ? "✅ 已复制 · Copied!" : "📋 复制链接 · Copy link"}
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-bold text-[#8a7aa3] underline"
          >
            ✏️ 重新输入生日 · Edit my birthday
          </button>
        </>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">仅供娱乐 · Just for fun 🎉</p>
    </main>
  );
}
