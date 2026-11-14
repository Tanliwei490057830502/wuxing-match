import CharacterAvatar from "@/components/CharacterAvatar";
import { Bi, BiInline } from "@/components/Bi";
import { ELEMENT_INFO, GENDER_INFO, pillarText, type Chart, type Gender } from "@/lib/bazi";
import type { AiPersona } from "@/lib/aiShared";
import { mix, type bond } from "@/lib/persona";

type Bond = ReturnType<typeof bond>;

/** 可收藏的日柱人设卡 · the collectible persona card */
export default function PersonaCard({
  name,
  gender,
  chart,
  persona,
  live,
  partner,
  nemesis,
}: {
  name: string;
  gender: Gender | "";
  chart: Chart;
  persona: AiPersona;
  live: boolean;
  partner: Bond;
  nemesis: Bond;
}) {
  const info = ELEMENT_INFO[chart.element];
  const mixData = mix(chart);

  return (
    <section
      data-testid="persona-card"
      className="relative overflow-hidden rounded-[2.2rem] border-[3px] border-white shadow-[0_18px_40px_rgba(155,140,255,0.35)]"
      style={{ background: `linear-gradient(160deg, #ffffff 0%, ${info.soft} 55%, #efe4ff 100%)` }}
    >
      {/* 全息反光 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 opacity-40 blur-2xl"
        style={{
          background:
            "conic-gradient(from 210deg, rgba(255,143,177,0.5), rgba(180,140,255,0.45), rgba(120,200,255,0.45), rgba(255,214,120,0.4), rgba(255,143,177,0.5))",
          animation: "orb-b 16s ease-in-out infinite",
        }}
      />
      <div className="relative p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-black tracking-[0.12em] text-white"
            style={{ background: info.color }}
          >
            {persona.code}
          </span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#8a7aa3]">
            {live ? <BiInline en="✦ AI live" zh="✦ AI 即时生成" /> : <BiInline en="Persona card" zh="日柱人设卡" />}
          </span>
        </div>

        <div className="relative mt-2 flex justify-center">
          <div
            aria-hidden
            className="absolute inset-x-10 top-6 bottom-4 rounded-full opacity-60 blur-2xl"
            style={{ background: info.soft }}
          />
          <CharacterAvatar
            index={chart.dayMaster}
            priority
            className="relative block h-auto w-[62%] max-w-[230px] drop-shadow-[0_10px_22px_rgba(107,79,143,0.28)]"
          />
        </div>

        <h2 className="mt-2 text-center text-[26px] leading-tight font-black text-[#4a3566]" data-testid="persona-title">
          {persona.title}
        </h2>
        <p className="mt-1 text-center text-sm font-bold text-[#8a7aa3]">
          {name}
          {gender ? ` ${GENDER_INFO[gender].emoji}` : ""} · {pillarText(chart.pillars[2].pillar)}日 · {info.zh}
          {info.en}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {persona.bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex items-baseline justify-between text-xs font-extrabold text-[#6b4f8f]">
                <span>{bar.label}</span>
                <span className="tabular-nums" style={{ color: info.color }}>
                  {bar.value}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/90">
                <div
                  className="bar-fill h-full rounded-full"
                  style={{ width: `${bar.value}%`, background: `linear-gradient(90deg, ${info.color}, #b48cff)` }}
                />
              </div>
            </div>
          ))}
        </div>

        <blockquote className="mt-4 rounded-3xl bg-white/90 p-4 text-[15px] leading-relaxed font-bold text-[#4a3566]">
          <span className="mr-1 text-xl text-[#ff5c93]">“</span>
          {persona.soul}
          <span className="ml-1 text-xl text-[#ff5c93]">”</span>
        </blockquote>

        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <div className="rounded-2xl bg-[#e6f7ec] px-2 py-2 text-[#2e7d4f]">
            <p className="text-[10px] opacity-70">
              <BiInline en="Best duo" zh="最佳拍档" />
            </p>
            <p className="mt-0.5 text-sm">
              {partner.emoji} {partner.stem}
              {partner.zh} · {partner.name}
            </p>
          </div>
          <div className="rounded-2xl bg-[#ffe9e9] px-2 py-2 text-[#c0392b]">
            <p className="text-[10px] opacity-70">
              <BiInline en="Beware" zh="天敌避雷" />
            </p>
            <p className="mt-0.5 text-sm">
              {nemesis.emoji} {nemesis.stem}
              {nemesis.zh} · {nemesis.name}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {mixData.map((m) => (
            <span key={m.el} className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-[#6b4f8f]">
              {m.zh} {m.pct}%
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
