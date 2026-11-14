"use client";

// 三层解读卡 · 跟人设卡同一套视觉语言：渐变底、全息反光、代号 chip、
// 一条一条往上长、最后一句大字结论。
// 图（三层五角图）在上面免费看；这张卡解释「这三层各决定了什么」。

import { useState } from "react";
import DemoPayModal from "@/components/DemoPayModal";
import { ELEMENTS, ELEMENT_INFO, computeLayers, readChart, type Chart } from "@/lib/bazi";
import { layerNarrative } from "@/lib/layersCopy";
import { buyPass, hasPass, useUserState } from "@/lib/userState";

const LAYER_COLORS = ["#7a5bd1", "#a8710f", "#e0457b"];
const LAYER_NUM = ["壹", "贰", "叁"];

export default function LayerBreakdown({ chart }: { chart: Chart }) {
  const user = useUserState();
  const [paying, setPaying] = useState(false);
  const unlocked = hasPass(user);

  const layers = computeLayers(chart);
  const reading = readChart(chart);
  const narrative = layerNarrative(chart, layers);
  const means = [narrative.first, narrative.second, narrative.third];
  const pct = layers[2].percent;
  const self = ELEMENT_INFO[chart.element];
  const lucky = ELEMENT_INFO[reading.lucky];

  const zeroed = ELEMENTS.filter((el) => layers[1].percent[el] >= 5 && pct[el] === 0).map(
    (el) => ELEMENT_INFO[el].zh,
  );

  const conclusion = [
    `${self.zh}日主在第三层${reading.strong ? "占了" : "只剩"} ${pct[chart.element]}%，属于${reading.strong ? "身强" : "身弱"}，喜用神取${lucky.zh}。`,
    zeroed.length
      ? `${zeroed.join("、")}在第二层还在，是合化把分数转走了 —— 只看第一层的人，会把你算成另一个人。`
      : "三层差别不大，你算是比较好懂的那种人。",
  ].join("");

  const body = (
    <div className="mt-4 flex flex-col gap-2.5">
      {layers.map((l, i) => {
        const topEl = ELEMENTS.reduce((a, el) => (l.percent[el] > l.percent[a] ? el : a), ELEMENTS[0]);
        return (
        <div key={l.key} className="rounded-3xl bg-white/85 p-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-black text-white shadow-sm"
              style={{ background: LAYER_COLORS[i] }}
            >
              {LAYER_NUM[i]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-tight font-black text-[#4a3566]">
                {means[i].headline}
              </p>
              <p className="text-[10px] font-bold text-[#b9aed0]">{l.title}</p>
            </div>
            <span className="shrink-0 text-right text-[10px] font-bold text-[#8a7aa3]">
              主气
              <br />
              <span className="text-xs font-black" style={{ color: LAYER_COLORS[i] }}>
                {ELEMENT_INFO[topEl].zh} {l.percent[topEl]}%
              </span>
            </span>
          </div>

          <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-[#f3eefc]">
            {ELEMENTS.map((el) => (
              <span
                key={el}
                style={{ width: `${l.percent[el]}%`, background: ELEMENT_INFO[el].color }}
                aria-hidden
              />
            ))}
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-[#6b4f8f]">{means[i].body}</p>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {ELEMENTS.map((el) => (
              <span key={el} className="rounded-full bg-[#f8f4ff] px-2 py-0.5 text-[10px] font-bold text-[#8a7aa3]">
                {ELEMENT_INFO[el].zh} {l.percent[el]}%
              </span>
            ))}
          </div>
        </div>
        );
      })}

      <blockquote
        className="rounded-3xl bg-white/90 p-4 text-[13px] leading-relaxed font-bold text-[#4a3566]"
        data-testid="layer-conclusion"
      >
        <span className="mr-1 text-xl text-[#ff5c93]">“</span>
        {conclusion}
        <span className="ml-1 text-xl text-[#ff5c93]">”</span>
      </blockquote>

      <p className="px-1 text-[10px] leading-relaxed text-[#b9aed0]">
        简化版：合化要看月令撑不撑（冬天合火通常化不成），冲也分远近轻重；这里简化成「相邻就合、差六位就冲」，仅供娱乐。
      </p>
    </div>
  );

  return (
    <section
      data-testid="layer-breakdown"
      className="relative overflow-hidden rounded-[2.2rem] border-[3px] border-white shadow-[0_16px_36px_rgba(155,140,255,0.32)]"
      style={{ background: `linear-gradient(160deg, #ffffff 0%, ${self.soft} 58%, #efe4ff 100%)` }}
    >
      {/* 全息反光，跟人设卡同一招 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 opacity-35 blur-2xl"
        style={{
          background:
            "conic-gradient(from 200deg, rgba(255,143,177,0.5), rgba(180,140,255,0.45), rgba(120,200,255,0.45), rgba(255,214,120,0.4), rgba(255,143,177,0.5))",
          animation: "orb-b 18s ease-in-out infinite",
        }}
      />

      <div className="relative p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#4a3566] px-3 py-1 text-[10px] font-black tracking-[0.14em] text-white">
            3-LAYER · 三层解读
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black ${
              unlocked ? "bg-[#ffe9a8] text-[#8a6d00]" : "bg-white/85 text-[#8a7aa3]"
            }`}
          >
            {unlocked ? "👑 月卡已解锁" : "🔒 月卡内容"}
          </span>
        </div>

        <h2 className="mt-3 text-[24px] leading-tight font-black text-[#4a3566]">
          {unlocked ? "你的三层人格" : "这三层，决定了你是谁"}
        </h2>
        <p className="mt-1 text-xs font-bold text-[#8a7aa3]">
          同一张五角图，三种说法 · 图免费，解读在月卡里
        </p>

        {unlocked ? (
          body
        ) : (
          <div className="relative mt-3 overflow-hidden rounded-3xl">
            <div aria-hidden className="pointer-events-none max-h-[300px] overflow-hidden blur-[6px] select-none">
              {body}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
              <p className="text-sm font-black text-[#6b4f8f]">🔒 图你随便看，解释要钱</p>
              <p className="max-w-[280px] text-[11px] leading-relaxed text-[#8a7aa3]">
                三层各自决定了什么、你为什么是身弱、喜用神为什么取金
              </p>
              <button
                type="button"
                data-testid="unlock-layers"
                onClick={() => setPaying(true)}
                className="mt-1 rounded-full bg-[#ff8fb1] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_5px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
              >
                👑 月卡 RM 29.9 / 月 解锁
              </button>
              <button type="button" onClick={() => buyPass()} className="text-[10px] font-bold text-[#b9aed0] underline">
                🧪 演示：直接解锁（评审用）
              </button>
            </div>
          </div>
        )}
      </div>

      {paying && (
        <DemoPayModal
          title="三层解读 + 今日黄历 · 月卡"
          price="RM 29.9"
          onClose={() => setPaying(false)}
          onPaid={() => {
            buyPass();
            setPaying(false);
          }}
        />
      )}
    </section>
  );
}
