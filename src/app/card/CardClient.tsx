"use client";

import Link from "next/link";
import { useState } from "react";
import PersonaCard from "@/components/PersonaCard";
import QrCode from "@/components/QrCode";
import { useAiText } from "@/lib/aiClient";
import { ELEMENT_INFO, STEMS, computeChart, inviteUrl, pillarText, type Profile } from "@/lib/bazi";
import { PERSONAS } from "@/lib/copy";
import { bond, personaFallback } from "@/lib/persona";
import { buildPoster, downloadDataUrl } from "@/lib/poster";
import { useOrigin, useSavedProfile } from "@/lib/useClientValues";

export default function CardClient({ preview }: { preview: Profile | null }) {
  const saved = useSavedProfile();
  const profile = saved ?? preview;
  const origin = useOrigin();
  const [busy, setBusy] = useState(false);
  const chart = profile ? computeChart(profile) : null;

  const fallback = chart
    ? personaFallback(chart)
    : { code: "WUXING", title: "", bars: [], soul: "" };

  const { data: aiPersona, live } = useAiText(
    profile ? `persona:${profile.date}|${profile.hour}|${profile.name}` : "persona:none",
    profile ? JSON.stringify({ kind: "persona", profile }) : "",
    fallback,
  );

  // 代号由日主决定，不让模型改（不然会跟八字对不上）
  const persona = { ...aiPersona, code: fallback.code };
  // 万一模型漏了「天干+五行」，补上，保证卡片和八字一致
  const stem = STEMS[chart?.dayMaster ?? 0];
  const elZh = ELEMENT_INFO[chart?.element ?? "wood"].zh;
  if (!persona.title.includes(stem)) persona.title = `${stem}${elZh} · ${persona.title}`;

  if (!profile || !chart) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-5xl">🃏</p>
        <p className="font-bold text-[#6b4f8f]">
          先输入生日，才能生成你的人设卡。
          <br />
          Enter your birthday to get your persona card.
        </p>
        <Link href="/" className="rounded-full bg-[#ff8fb1] px-6 py-3 font-extrabold text-white">
          去输入 · Go
        </Link>
      </main>
    );
  }

  const link = origin ? inviteUrl(origin, profile) : "";
  const info = ELEMENT_INFO[chart.element];
  const p = PERSONAS[chart.dayMaster];
  const partner = bond(p.partner);
  const nemesis = bond(p.nemesis);

  async function download() {
    if (!profile || !origin || busy) return;
    setBusy(true);
    try {
      const url = await buildPoster({
        name: profile.name,
        code: persona.code,
        title: persona.title,
        soul: persona.soul,
        bars: persona.bars.length === 2 ? persona.bars : fallback.bars,
        elementZh: info.zh,
        color: info.color,
        charIndex: chart!.dayMaster,
        qrValue: link,
        partner: `${partner.stem}${partner.zh}`,
        nemesis: `${nemesis.stem}${nemesis.zh}`,
        pillars: chart!.pillars.map((x) => pillarText(x.pillar)).join("  "),
      });
      downloadDataUrl(url, `wuxing-${profile.name}-${persona.code}.png`);
    } catch {
      // canvas blocked — ignore, the card is still on screen
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          ← 返回
        </Link>
        <h1 className="flex-1 text-center text-xl font-extrabold text-[#6b4f8f]">🃏 我的日柱人设卡</h1>
        <span className="w-10" />
      </header>

      <PersonaCard
        name={profile.name}
        gender={profile.gender}
        chart={chart}
        persona={persona}
        live={live}
        partner={partner}
        nemesis={nemesis}
      />

      <button
        type="button"
        data-testid="download-poster"
        onClick={() => void download()}
        disabled={busy}
        className="rounded-full bg-[#ff8fb1] px-5 py-4 font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690] disabled:opacity-60"
      >
        {busy ? "⏳ 正在画海报…" : "⬇️ 下载高清海报 · Download poster"}
      </button>

      <section className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.25)]">
        <h2 className="text-lg font-extrabold text-[#6b4f8f]">📱 生成我的合盘 QR 码</h2>
        <p className="text-xs text-[#8a7aa3]">朋友扫码，就能和你 1v1 合盘（先看分数，再看 AI 报告）。</p>
        {link && <QrCode value={link} />}
      </section>

      <Link
        href="/squad"
        className="flex items-center justify-between rounded-[2rem] border-4 border-white bg-gradient-to-r from-[#ffe0ee] to-[#e4f1ff] px-5 py-4 shadow-[0_8px_24px_rgba(155,140,255,0.25)]"
      >
        <span>
          <span className="block text-lg font-extrabold text-[#6b4f8f]">🧑‍🚀 组建五行小队</span>
          <span className="text-xs text-[#8a7aa3]">组一个 3–5 人房间，看团队缺哪种五行</span>
        </span>
        <span className="text-2xl">→</span>
      </Link>

      <p className="mt-auto text-center text-xs text-[#b9aed0]">仅供娱乐 · Just for fun 🎉</p>
    </main>
  );
}
