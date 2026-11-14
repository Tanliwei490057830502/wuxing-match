"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BaziReading from "@/components/BaziReading";
import CharacterAvatar from "@/components/CharacterAvatar";
import ElementCard from "@/components/ElementCard";
import EnergyOrb from "@/components/EnergyOrb";
import LandingIntro from "@/components/LandingIntro";
import LayerBreakdown from "@/components/LayerBreakdown";
import ProfileForm from "@/components/ProfileForm";
import QrCode from "@/components/QrCode";
import { ELEMENT_INFO, computeChart, inviteUrl } from "@/lib/bazi";
import { personaFallback } from "@/lib/persona";
import { saveProfile, useOrigin, useSavedProfile } from "@/lib/useClientValues";

export default function Home({ autoStart = false }: { autoStart?: boolean }) {
  const profile = useSavedProfile();
  const origin = useOrigin();
  const [editing, setEditing] = useState(false);
  const [started, setStarted] = useState(autoStart);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLElement | null>(null);

  const chart = profile ? computeChart(profile) : null;
  const intro = !profile && !editing && !started;
  const showForm = editing || !profile || !chart;
  const link = profile && origin ? inviteUrl(origin, profile) : "";
  const persona = chart ? personaFallback(chart) : null;
  const info = chart ? ELEMENT_INFO[chart.element] : null;

  useEffect(() => {
    if (!started || profile) return;
    const timer = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [started, profile]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="relative text-center">
        <Link
          href="/event"
          data-testid="event-link"
          className="absolute top-0 right-0 rounded-full bg-[#4a3566] px-3 py-1.5 text-center text-[10px] font-black text-white shadow-[0_4px_10px_rgba(74,53,102,0.35)]"
        >
          ⚡ Live mode
          <span className="block text-[8px] font-bold opacity-70">现场模式</span>
        </Link>
        <EnergyOrb size={intro ? 168 : showForm ? 140 : 96} className="mt-3" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#4a3566]">WuXing Engine</h1>
        <p className="text-sm font-black tracking-[0.35em] text-[#b48cff]">五行引擎</p>
        <p className="mt-2 text-sm text-[#8a7aa3]">
          Quiz or birthday → your persona card → match &amp; squad.
          <br />
          <span className="text-xs">做 15 题问卷，或填出生时间 → 拿到你的日柱人设卡 → 合盘、组队。</span>
        </p>
      </header>

      {intro ? (
        <LandingIntro onStart={() => setStarted(true)} />
      ) : showForm ? (
        <section
          ref={formRef}
          className="scroll-mt-4 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]"
        >
          {!profile && !editing && (
            <button
              type="button"
              onClick={() => setStarted(false)}
              className="mb-3 text-xs font-bold text-[#8a7aa3] underline"
            >
              ← Back to intro
              <span className="ml-1 text-[10px]">回到介绍</span>
            </button>
          )}
          <ProfileForm
            initial={profile}
            submitLabelEn="Show my element"
            submitLabel="看我的五行"
            onSubmit={(p) => {
              saveProfile(p);
              setEditing(false);
            }}
          />
          <p className="mt-3 rounded-2xl bg-white/70 p-3 text-xs text-[#8a7aa3]">
            🕐 Forgot the hour? Pick “Not sure”. We use three pillars and it still works.
            <br />
            <span className="text-[11px]">忘记时辰？选「不知道」也能算，只看年月日三柱。</span>
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
              🃏 Open my persona card · poster included
              <span className="ml-1 text-[10px] font-normal text-[#8a7aa3]">打开人设卡，可下载海报</span>
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
                <span className="block text-sm font-black text-[#6b4f8f]">
                  Match QR code <span className="text-[10px] font-bold text-[#8a7aa3]">合盘二维码</span>
                </span>
                <span className="text-[11px] text-[#8a7aa3]">Let a friend scan to see your score · 朋友扫码看分数</span>
              </span>
              <span className="text-xl text-[#b48cff]">›</span>
            </a>
            <Link
              href="/squad"
              data-testid="squad-link"
              className="flex flex-col justify-between rounded-[1.6rem] border-4 border-white bg-gradient-to-br from-[#e4f1ff] to-[#f3f8ff] p-4 shadow-[0_6px_18px_rgba(120,170,255,0.22)]"
            >
              <span className="text-2xl">🧑‍🚀</span>
              <span className="mt-2 block text-sm font-black text-[#6b4f8f]">
                Element squad <span className="text-[10px] text-[#8a7aa3]">五行小队</span>
              </span>
              <span className="text-[11px] text-[#8a7aa3]">3–5 people radar</span>
            </Link>
            <Link
              href="/fortune"
              data-testid="fortune-link"
              className="flex flex-col justify-between rounded-[1.6rem] border-4 border-white bg-gradient-to-br from-[#fff1c9] to-[#fffaf0] p-4 shadow-[0_6px_18px_rgba(255,200,90,0.22)]"
            >
              <span className="text-2xl">🔮</span>
              <span className="mt-2 block text-sm font-black text-[#6b4f8f]">
                Daily hub <span className="text-[10px] text-[#8a7aa3]">每日补给</span>
              </span>
              <span className="text-[11px] text-[#8a7aa3]">Check-in · almanac · toy</span>
            </Link>
          </section>

          <Link
            href="/quiz"
            data-testid="quiz-link"
            className="flex items-center gap-3 rounded-[1.6rem] border-2 border-dashed border-[#e0d3f7] bg-white/60 px-4 py-3"
          >
            <span className="text-xl">🧪</span>
            <span className="flex-1">
              <span className="block text-sm font-black text-[#6b4f8f]">Take the 15-question quiz</span>
              <span className="text-[11px] text-[#8a7aa3]">不用生日，2 分钟测出你是哪一型</span>
            </span>
            <span className="text-[#b48cff]">›</span>
          </Link>

          <ElementCard name={profile!.name} gender={profile!.gender} chart={chart!} />
          <LayerBreakdown chart={chart!} />

          <details className="group rounded-[2rem] border-4 border-white bg-white/70 p-4">
            <summary className="cursor-pointer list-none text-sm font-extrabold text-[#6b4f8f]">
              📜 Full reading: pillars, strength, lucky element
              <span className="ml-1 text-[11px] font-normal text-[#8a7aa3]">八字解读</span>
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
            <h2 className="text-xl font-extrabold text-[#6b4f8f]">
              📱 Let a friend scan
              <span className="mt-0.5 block text-xs font-bold text-[#8a7aa3]">叫朋友扫一扫</span>
            </h2>
            <p className="text-sm text-[#8a7aa3]">
              Your friend scans this with their phone camera to match with you.
              <br />
              <span className="text-xs">朋友用手机相机扫这个二维码，就能和你配对！</span>
            </p>
            {link && <QrCode value={link} />}
            <div className="flex w-full flex-col gap-2">
              <a
                href={link}
                data-testid="invite-link"
                className="rounded-full bg-[#b48cff] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#8f66e0] active:translate-y-1 active:shadow-[0_2px_0_#8f66e0]"
              >
                🔗 Open the match link
                <span className="ml-1 text-[10px] font-normal opacity-80">打开配对链接</span>
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
                {copied ? "✅ Copied · 已复制" : "📋 Copy link · 复制链接"}
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-bold text-[#8a7aa3] underline"
          >
            ✏️ Edit my birthday
            <span className="ml-1 text-[10px]">重新输入生日</span>
          </button>
        </>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">Just for fun 🎉 · 仅供娱乐</p>
    </main>
  );
}
