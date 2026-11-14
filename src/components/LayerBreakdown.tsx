"use client";

// 三层算法 · the paid deep-dive.
// 免费只给「最终五行」；三层拆解 + 为什么某一行归零 + 身强弱/喜用神 放在月卡里。
// 这也是路演时最好讲的一段：同一个盘，算得越深，结论越不一样。

import { useState } from "react";
import DemoPayModal from "@/components/DemoPayModal";
import { ELEMENTS, ELEMENT_INFO, computeLayers, readChart, type Chart } from "@/lib/bazi";
import { buyPass, hasPass, useUserState } from "@/lib/userState";

const LAYER_COLORS = ["#7a5bd1", "#a8710f", "#e0457b"];

export default function LayerBreakdown({ chart }: { chart: Chart }) {
  const user = useUserState();
  const [paying, setPaying] = useState(false);
  const unlocked = hasPass(user);

  const layers = computeLayers(chart);
  const reading = readChart(chart);
  const pct = layers[2].percent; // 最终以第三层为准
  const self = ELEMENT_INFO[chart.element];
  const lucky = ELEMENT_INFO[reading.lucky];

  // 第二层还在、第三层归零的五行 —— 就是被合化转走的那几个
  const zeroed = ELEMENTS.filter((el) => layers[1].percent[el] >= 5 && pct[el] === 0).map(
    (el) => ELEMENT_INFO[el].zh,
  );

  const conclusion = [
    `结论全在第三层：${self.zh}日主最后只剩 ${pct[chart.element]}%，属于${reading.strong ? "身强" : "身弱"}，喜用神取${lucky.zh}。`,
    zeroed.length
      ? `${zeroed.join("、")}在第二层还在，是上面那些合化把分数转走了 —— 所以只看第一层会算错。`
      : "这个盘没有相邻的合或冲，三层差别不大，算起来比较稳。",
  ].join("");

  return (
    <section
      data-testid="layer-breakdown"
      className="rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.22)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-[#6b4f8f]">🧮 三层算法 · How deep it goes</h2>
          <p className="text-xs text-[#8a7aa3]">同一个盘，算得越深，结论越不一样。</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff1c9] px-2 py-1 text-[10px] font-black text-[#8a6d00]">
          {unlocked ? "👑 VIP" : "🔒 VIP"}
        </span>
      </div>

      {unlocked ? (
        <div className="mt-3 flex flex-col gap-2">
          {layers.map((l, i) => (
            <div key={l.key} className="rounded-2xl bg-[#f8f4ff] p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-extrabold" style={{ color: LAYER_COLORS[i] }}>
                  {l.title}
                </p>
                <p className="text-[10px] font-bold text-[#b9aed0]">{l.titleEn}</p>
              </div>
              <p className="mt-1 text-xs text-[#6b4f8f]">{l.logic}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {ELEMENTS.map((el) => (
                  <span key={el} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#4a3566]">
                    {ELEMENT_INFO[el].zh} {l.percent[el]}%
                  </span>
                ))}
              </div>
              {l.events.length > 0 && l.key !== 1 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {l.events.map((e) => (
                    <li key={e} className="text-[11px] leading-relaxed text-[#8a7aa3]">
                      · {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="rounded-2xl bg-gradient-to-br from-[#fff5fb] to-[#efe4ff] p-3" data-testid="layer-conclusion">
            <p className="text-xs font-black text-[#d9507f]">🎯 所以结论是</p>
            <p className="mt-1 text-sm leading-relaxed text-[#4a3566]">{conclusion}</p>
          </div>

          <p className="text-[10px] leading-relaxed text-[#b9aed0]">
            说明：这是简化版。真实的合化要看月令撑不撑（冬天合火通常化不成），冲也分远近轻重；这里简化成「相邻就合、差六位就冲」，仅供娱乐。
          </p>
        </div>
      ) : (
        <div className="relative mt-3 overflow-hidden rounded-2xl">
          <div aria-hidden className="pointer-events-none blur-[5px] select-none">
            <div className="flex flex-col gap-2">
              {layers.map((l, i) => (
                <div key={l.key} className="rounded-2xl bg-[#f8f4ff] p-3">
                  <p className="text-sm font-extrabold" style={{ color: LAYER_COLORS[i] }}>
                    第{l.key}层 · {l.title}
                  </p>
                  <p className="mt-1 text-xs text-[#6b4f8f]">{l.logic}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ELEMENTS.map((el) => (
                      <span key={el} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#4a3566]">
                        {ELEMENT_INFO[el].zh} {l.percent[el]}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 p-3 text-center backdrop-blur-[1px]">
            <p className="text-sm font-black text-[#6b4f8f]">🔒 第三层才是结论</p>
            <p className="text-[11px] leading-relaxed text-[#8a7aa3]">
              哪一行被合化转走了、你是身强还是身弱、喜用神取什么
              <br />
              Which element got converted away — and what that means for you
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
          title="三层算法 + 今日黄历 · 月卡"
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
