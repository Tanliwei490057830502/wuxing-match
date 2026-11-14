import { Bi } from "@/components/Bi";
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

function namesEn(list: Element[]) {
  return list.map((el) => `${ELEMENT_INFO[el].emoji}${ELEMENT_INFO[el].en}`).join(" & ");
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
      <h2 className="text-xl font-extrabold text-[#6b4f8f]">
        <Bi en="📜 Your reading" zh="📜 八字解读" />
      </h2>

      <div className="rounded-2xl bg-[#f8f4ff] p-3">
        <p className="font-bold text-[#4a3566]">
          <Bi
            en={
              <>
                🌟 Day master: {stemText(chart.dayMaster)} {self.en}
              </>
            }
            zh={
              <>
                🌟 日主：{stemText(chart.dayMaster)}
                {self.zh}
              </>
            }
          />
        </p>
        <Bi
          className="text-sm"
          en={
            <>
              Your day master is the element of the day you were born. It stands for you. Yours is{" "}
              {self.en}: {ELEMENT_TRAIT[chart.element].en}.
            </>
          }
          zh={
            <>
              日主是你出生那天的「天干」，代表你自己。你属{self.zh}，五常为{ELEMENT_TRAIT[chart.element].zh}。
            </>
          }
          zhClassName="text-[#8a7aa3]"
        />
      </div>

      <div className="rounded-2xl bg-[#f8f4ff] p-3">
        <p className="mb-1 font-bold text-[#4a3566]">
          <Bi en="🏛️ What are the four pillars?" zh="🏛️ 四柱是什么？" />
        </p>
        <ul className="flex flex-col gap-1 text-sm">
          {chart.pillars.map(({ label, pillar }) => (
            <li key={label}>
              <Bi
                en={
                  <>
                    <span className="font-bold">
                      {label.split(" ")[1]} pillar {pillarText(pillar)}
                    </span>
                    : {PILLAR_MEANING[label].en}
                  </>
                }
                zh={
                  <>
                    <span className="font-bold">
                      {label.split(" ")[0]}柱 {pillarText(pillar)}
                    </span>
                    ：{PILLAR_MEANING[label].zh}
                  </>
                }
              />
            </li>
          ))}
        </ul>
        {chart.pillars.length < 4 && (
          <p className="mt-1 text-xs text-[#8a7aa3]">
            <Bi
              en="You did not add a birth hour, so there are only three pillars."
              zh="没填时辰，所以只有三柱。"
              zhClassName="text-[#8a7aa3]"
            />
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-[#f8f4ff] p-3 text-sm">
        <p className="mb-1 font-bold text-[#4a3566]">
          <Bi en="⚖️ Element balance (layer 3)" zh="⚖️ 五行强弱 · Balance（按第三层）" />
        </p>
        <Bi
          en={
            <>
              Strongest: <b>{namesEn(r.strongest)}</b>
              {r.missing.length > 0 ? (
                <>
                  {" "}
                  · Missing or weak: <b>{namesEn(r.missing)}</b>
                </>
              ) : (
                " · You have all five, well balanced!"
              )}
            </>
          }
          zh={
            <>
              最旺：<b>{names(r.strongest)}</b>
              {r.missing.length > 0 ? (
                <>
                  ，缺 / 很弱：<b>{names(r.missing)}</b>
                </>
              ) : (
                "，五行俱全，很平衡！"
              )}
            </>
          }
        />
        <Bi
          className="mt-1"
          en={
            <>
              The elements that help you (the same kind plus the one that feeds you) are{" "}
              {r.supportPct}%. That makes you{" "}
              <b>
                {r.strong
                  ? "a “strong self”: you have lots of energy, so take the lead."
                  : "a “gentle self”: you do better with help, so work in a team."}
              </b>
            </>
          }
          zh={
            <>
              帮你的五行（同类 + 生你的）占 {r.supportPct}%，属于
              <b>{r.strong ? "「身强」：能量足，适合主动出击" : "「身弱」：需要贵人帮，适合团队合作"}</b>。
            </>
          }
        />
      </div>

      <div className="rounded-2xl p-3 text-sm" style={{ background: lucky.soft }}>
        <p className="mb-1 font-bold text-[#4a3566]">
          <Bi
            en={
              <>
                🍀 Lucky element: {lucky.emoji} {lucky.en}
              </>
            }
            zh={
              <>
                🍀 幸运五行：{lucky.emoji} {lucky.zh}
              </>
            }
          />
        </p>
        <Bi
          en={
            r.strong
              ? `You are strong, so use ${lucky.en} to put your extra energy to work.`
              : `You are gentle, so ${lucky.en} feeds you and gives you more energy.`
          }
          zh={
            r.strong
              ? `你身强，适合用「${lucky.zh}」把多的能量发挥出来。`
              : `你身弱，「${lucky.zh}」生你，能给你加能量。`
          }
        />
        <Bi
          className="mt-1"
          en={
            <>
              Lucky color: <b>{luckyTrait.luckyColor}</b>　Lucky direction: <b>{luckyTrait.direction}</b>
            </>
          }
          zh={
            <>
              幸运色：<b>{luckyTrait.luckyColor}</b>　幸运方位：<b>{luckyTrait.direction}</b>
            </>
          }
        />
      </div>

      <p className="text-center text-xs text-[#b9aed0]">
        <Bi en="A simplified chart, just for fun" zh="简化版排盘，仅供娱乐" zhClassName="text-[#b9aed0]" />
      </p>
    </section>
  );
}
