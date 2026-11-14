"use client";

// 三层算法 · 付费部分是「解释」，不是图。
// 图（三层叠在一张五角图上）人人可看；付费的是：每一层各自决定了什么，
// 以及最后那个结论怎么来的 —— 身强弱、喜用神、哪一行被合化转走。

import { useState } from "react";
import DemoPayModal from "@/components/DemoPayModal";
import { ELEMENTS, ELEMENT_INFO, computeLayers, readChart, type Chart } from "@/lib/bazi";
import { buyPass, hasPass, useUserState } from "@/lib/userState";

const LAYER_COLORS = ["#7a5bd1", "#a8710f", "#e0457b"];

// 每一层「决定」的东西 —— 这才是月卡卖的内容
const LAYER_MEANING = [
  {
    headline: "决定「第一印象」",
    body: "别人第一眼看到的你：外向、稳重、冷淡…… 都从这层来。直观，但也最容易把人看错。",
  },
  {
    headline: "决定「你的底色」",
    body: "地支里藏着的气，加上出生季节（月令）的权重。别人相处久一点才会发现的那一面，在这层。",
  },
  {
    headline: "决定「真正起作用的你」",
    body: "字与字合化、相冲之后，真正在跑的那组五行。身强还是身弱、喜用神取什么、今天的宜忌，全部从这层算。",
  },
] as const;

export default function LayerBreakdown({ chart }: { chart: Chart }) {
  const user = useUserState();
  const [paying, setPaying] = useState(false);
  const unlocked = hasPass(user);

  const layers = computeLayers(chart);
  const reading = readChart(chart);
  const pct = layers[2].percent;
  const self = ELEMENT_INFO[chart.element];
  const lucky = ELEMENT_INFO[reading.lucky];

  const zeroed = ELEMENTS.filter((el) => layers[1].percent[el] >= 5 && pct[el] === 0).map(
    (el) => ELEMENT_INFO[el].zh,
  );

  const conclusion = [
    `${self.zh}日主在第三层只剩 ${pct[chart.element]}%，属于${reading.strong ? "身强" : "身弱"}，喜用神取${lucky.zh}。`,
    zeroed.length
      ? `${zeroed.join("、")}在第二层还在，是合化把分数转走了 —— 只看第一层的人，会把你算成另一个人。`
      : "这个盘没有相邻的合或冲，所以三层差别不大，你算是比较好懂的那种人。",
  ].join("");

  const body = (
    <div className="mt-3 flex flex-col gap-2">
      {layers.map((l, i) => (
        <div key={l.key} className="rounded-2xl bg-[#f8f4ff] p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-extrabold" style={{ color: LAYER_COLORS[i] }}>
              {l.title}
            </p>
            <p className="text-[10px] font-bold text-[#b9aed0]">{l.titleEn}</p>
          </div>
          <p className="mt-1 text-sm font-black text-[#4a3566]">→ {LAYER_MEANING[i].headline}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#6b4f8f]">{LAYER_MEANING[i].body}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {ELEMENTS.map((el) => (
              <span key={el} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#4a3566]">
                {ELEMENT_INFO[el].zh} {l.percent[el]}%
              </span>
            ))}
          </div>
        </div>
      ))}

      <div
        className="rounded-2xl bg-gradient-to-br from-[#fff5fb] to-[#efe4ff] p-3"
        data-testid="layer-conclusion"
      >
        <p className="text-xs font-black text-[#d9507f]">🎯 三层加起来，说明你是这样的人</p>
        <p className="mt-1 text-sm leading-relaxed text-[#4a3566]">{conclusion}</p>
      </div>

      <p className="text-[10px] leading-relaxed text-[#b9aed0]">
        说明：这是简化版。真实的合化要看月令撑不撑（冬天合火通常化不成），冲也分远近轻重；这里简化成「相邻就合、差六位就冲」，仅供娱乐。
      </p>
    </div>
  );

  return (
    <section
      data-testid="layer-breakdown"
      className="rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.22)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-[#6b4f8f]">🧮 三层算法 · 这三层决定了什么</h2>
          <p className="text-xs text-[#8a7aa3]">图在上面已经给你了，这里解释它怎么变成结论。</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff1c9] px-2 py-1 text-[10px] font-black text-[#8a6d00]">
          {unlocked ? "👑 VIP" : "🔒 VIP"}
        </span>
      </div>

      {unlocked ? (
        body
      ) : (
        <div className="relative mt-3 overflow-hidden rounded-2xl">
          <div aria-hidden className="pointer-events-none blur-[5px] select-none">
            {body}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 p-3 text-center backdrop-blur-[1px]">
            <p className="text-sm font-black text-[#6b4f8f]">🔒 图免费，解释要钱</p>
            <p className="text-[11px] leading-relaxed text-[#8a7aa3]">
              这三层各自决定了什么、为什么你最后是身弱、喜用神为什么取金
              <br />
              What each layer actually decides — and why the result is what it is
            </p>
            <button
              type="button"
              data-testid="unlock-layers"
              onClick={() => setPaying(true)}
              className="mt-1 rounded-full bg-[#ff8fb1] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_5px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
            >
              👑 月卡 RM 29.9 / 月 解锁
            </button>
            <button
              type="button"
              onClick={() => buyPass()}
              className="text-[10px] font-bold text-[#b9aed0] underline"
            >
              🧪 演示：直接解锁（评审用）
            </button>
          </div>
        </div>
      )}

      {paying && (
        <DemoPayModal
          title="三层算法解释 + 今日黄历 · 月卡"
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
