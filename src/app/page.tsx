"use client";

import Link from "next/link";
import { useState } from "react";
import BaziReading from "@/components/BaziReading";
import ElementCard from "@/components/ElementCard";
import ProfileForm from "@/components/ProfileForm";
import QrCode from "@/components/QrCode";
import { computeChart, inviteUrl } from "@/lib/bazi";
import { saveProfile, useOrigin, useSavedProfile } from "@/lib/useClientValues";

export default function Home() {
  const profile = useSavedProfile();
  const origin = useOrigin();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const chart = profile ? computeChart(profile) : null;
  const showForm = editing || !profile || !chart;
  const link = profile && origin ? inviteUrl(origin, profile) : "";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="text-center">
        <p className="text-4xl">🌳🔥⛰️🪙💧</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#6b4f8f]">五行配对</h1>
        <p className="font-bold text-[#b48cff]">Five Elements Match</p>
        <p className="mt-1 text-sm text-[#8a7aa3]">
          输入生日，看看你是哪种五行，再扫码和朋友配对！
          <br />
          Find your element, then scan to match with a friend!
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
        </section>
      ) : (
        <>
          <ElementCard name={profile.name} gender={profile.gender} chart={chart} />
          <BaziReading chart={chart} />

          <section className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.25)]">
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

          <Link
            href="/fortune"
            data-testid="fortune-link"
            className="flex items-center justify-between rounded-[2rem] border-4 border-white bg-gradient-to-r from-[#fff1c9] to-[#ffe0ee] px-5 py-4 shadow-[0_8px_24px_rgba(255,143,177,0.25)]"
          >
            <span>
              <span className="block text-lg font-extrabold text-[#6b4f8f]">🔮 每日运势 & 签到</span>
              <span className="text-xs text-[#8a7aa3]">Daily fortune · check in for rewards</span>
            </span>
            <span className="text-2xl">→</span>
          </Link>

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
