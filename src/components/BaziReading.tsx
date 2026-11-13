import {
  ELEMENT_INFO,
  ELEMENT_TRAIT,
  PILLAR_MEANING,
  pillarText,
  readChart,
  stemText,
  type Chart,
  type Element,
} from "@/lib/bazi";

function names(list: Element[]) {
  return list.map((el) => `${ELEMENT_INFO[el].emoji}${ELEMENT_INFO[el].zh}`).join("、");
}

export default function BaziReading({ chart }: { chart: Chart }) {
  const r = readChart(chart);
  const self = ELEMENT_INFO[chart.element];
  const lucky = ELEMENT_INFO[r.lucky];
  const luckyTrait = ELEMENT_TRAIT[r.lucky];

  return (
    <section
      data-testid="bazi-reading"
      className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.2)]"
    >
      <h2 className="text-xl font-extrabold text-[#6b4f8f]">📜 八字解读 · Your reading</h2>

      <div className="rounded-2xl bg-[#f8f4ff] p-3">
        <p className="font-bold text-[#4a3566]">
          🌟 日主：{stemText(chart.dayMaster)}{self.zh}
        </p>
        <p className="text-sm">
          日主是你出生那天的「天干」，代表你自己。你属{self.zh}，五常为{ELEMENT_TRAIT[chart.element].zh}。
        </p>
        <p className="text-xs text-[#8a7aa3]">
          Your day master is the element of your birth day — it represents you. {self.en}: {ELEMENT_TRAIT[chart.element].en}.
        </p>
      </div>

      <div className="rounded-2xl bg-[#f8f4ff] p-3">
        <p className="mb-1 font-bold text-[#4a3566]">🏛️ 四柱是什么？· The pillars</p>
        <ul className="flex flex-col gap-1 text-sm">
          {chart.pillars.map(({ label, pillar }) => (
            <li key={label}>
              <span className="font-bold">
                {label.split(" ")[0]}柱 {pillarText(pillar)}
              </span>
              ：{PILLAR_MEANING[label].zh}
              <span className="text-xs text-[#8a7aa3]"> · {PILLAR_MEANING[label].en}</span>
            </li>
          ))}
        </ul>
        {chart.pillars.length < 4 && (
          <p className="mt-1 text-xs text-[#8a7aa3]">没填时辰，所以只有三柱。· No birth hour, so 3 pillars only.</p>
        )}
      </div>

      <div className="rounded-2xl bg-[#f8f4ff] p-3 text-sm">
        <p className="mb-1 font-bold text-[#4a3566]">⚖️ 五行强弱 · Balance（按第三层）</p>
        <p>
          最旺：<b>{names(r.strongest)}</b>
          {r.missing.length > 0 ? (
            <>
              ，缺 / 很弱：<b>{names(r.missing)}</b>
            </>
          ) : (
            "，五行俱全，很平衡！"
          )}
        </p>
        <p className="mt-1">
          帮你的五行（同类 + 生你的）占 {r.supportPct}%，属于
          <b>{r.strong ? "「身强」：能量足，适合主动出击" : "「身弱」：需要贵人帮，适合团队合作"}</b>。
        </p>
        <p className="text-xs text-[#8a7aa3]">
          {r.strong ? "Strong self — lots of energy, take the lead." : "Gentle self — you shine with good teammates."}
        </p>
      </div>

      <div className="rounded-2xl p-3 text-sm" style={{ background: lucky.soft }}>
        <p className="mb-1 font-bold text-[#4a3566]">
          🍀 幸运五行：{lucky.emoji} {lucky.zh} · Lucky element: {lucky.en}
        </p>
        <p>
          {r.strong ? `你身强，适合用「${lucky.zh}」把多的能量发挥出来。` : `你身弱，「${lucky.zh}」生你，能给你加能量。`}
        </p>
        <p className="mt-1">
          幸运色：<b>{luckyTrait.luckyColor}</b>　幸运方位：<b>{luckyTrait.direction}</b>
        </p>
      </div>

      <p className="text-center text-xs text-[#b9aed0]">简化版排盘，仅供娱乐 · Simplified, just for fun</p>
    </section>
  );
}
