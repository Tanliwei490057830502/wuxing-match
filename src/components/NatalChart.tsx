import {
  ANIMALS,
  BRANCHES,
  BRANCH_ELEMENT,
  BRANCH_PINYIN,
  ELEMENT_INFO,
  HIDDEN_STEMS,
  STEMS,
  STEM_ELEMENT,
  STEM_PINYIN,
  type Chart,
} from "@/lib/bazi";
import { tenGod } from "@/lib/tenGods";

const ROW_LABELS = [
  { zh: "干", en: "Stems" },
  { zh: "支", en: "Branches" },
  { zh: "藏", en: "Hidden" },
];

/** 本命八字盘 · natal chart：时 日 月 年 四列，天干 / 地支 / 藏干 三行 */
export default function NatalChart({ chart }: { chart: Chart }) {
  // 传统排法从右往左，这里照参考图：左起 时 日 月 年
  const cols = [...chart.pillars].reverse();
  const dayStem = chart.dayMaster;

  return (
    <div
      data-testid="natal-chart"
      className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-[#e0d3f7] bg-white"
    >
      <div className="flex items-center justify-between bg-[#5b2a4a] px-3 py-1.5">
        <p className="text-[9px] font-black tracking-[0.18em] text-white">NATAL CHART · 本命八字</p>
        <p className="text-[8px] font-bold text-white/60">仅供娱乐</p>
      </div>

      <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_30px]">
        {/* 表头 */}
        {cols.map(({ label }, i) => {
          const [zh, en] = label.split(" ");
          const isDay = zh === "日";
          return (
            <div
              key={`h-${label}`}
              className={`border-l border-[#ece3f8] py-1 text-center ${isDay ? "bg-[#fff3cf]" : "bg-[#f8f4ff]"}`}
            >
              <p className="text-[11px] leading-none font-black text-[#6b4f8f]">{zh}</p>
              <p className="mt-0.5 text-[7px] font-bold text-[#b9aed0]">{en}</p>
              {i === 0 && <span className="sr-only">时柱</span>}
            </div>
          );
        })}
        <div className="bg-[#f8f4ff]" />

        {/* 天干 */}
        {cols.map(({ label, pillar }) => {
          const isDay = label.startsWith("日");
          const el = ELEMENT_INFO[STEM_ELEMENT[pillar.stem]];
          const god = isDay ? { zh: "日元", abbr: "DM" } : tenGod(dayStem, pillar.stem);
          return (
            <div
              key={`s-${label}`}
              className={`border-t border-l border-[#ece3f8] px-0.5 py-1.5 text-center ${
                isDay ? "bg-[#fff8e1]" : ""
              }`}
            >
              <p className="text-[8px] leading-none font-bold" style={{ color: el.color }}>
                {god.zh} {god.abbr}
              </p>
              <p className="mt-1 text-[24px] leading-none font-black" style={{ color: el.color }}>
                {STEMS[pillar.stem]}
              </p>
              <p className="mt-1 text-[7px] leading-none font-bold text-[#8a7aa3]">{STEM_PINYIN[pillar.stem]}</p>
              <p className="mt-0.5 text-[6.5px] leading-none font-bold" style={{ color: el.color }}>
                {el.zh} {el.en}
              </p>
            </div>
          );
        })}
        <RowLabel {...ROW_LABELS[0]} />

        {/* 地支 */}
        {cols.map(({ label, pillar }) => {
          const isDay = label.startsWith("日");
          const el = ELEMENT_INFO[BRANCH_ELEMENT[pillar.branch]];
          return (
            <div
              key={`b-${label}`}
              className={`border-t border-l border-[#ece3f8] px-0.5 py-1.5 text-center ${
                isDay ? "bg-[#fff8e1]" : ""
              }`}
            >
              <p className="text-[7px] leading-none font-bold text-[#8a7aa3]">{BRANCH_PINYIN[pillar.branch]}</p>
              <p className="mt-1 text-[24px] leading-none font-black" style={{ color: el.color }}>
                {BRANCHES[pillar.branch]}
              </p>
              <p className="mt-1 text-[7px] leading-none font-bold text-[#6b4f8f]">
                {ANIMALS[pillar.branch].zh} {ANIMALS[pillar.branch].en}
              </p>
              <p className="mt-0.5 text-[6.5px] leading-none font-bold" style={{ color: el.color }}>
                {el.zh} {el.en}
              </p>
            </div>
          );
        })}
        <RowLabel {...ROW_LABELS[1]} />

        {/* 藏干 */}
        {cols.map(({ label, pillar }) => {
          const isDay = label.startsWith("日");
          const stems = HIDDEN_STEMS[pillar.branch];
          return (
            <div
              key={`h2-${label}`}
              className={`border-t border-l border-[#ece3f8] px-0.5 py-1 ${isDay ? "bg-[#fff8e1]" : ""}`}
            >
              <div className="flex justify-center gap-0.5">
                {stems.map((st, i) => {
                  const el = ELEMENT_INFO[STEM_ELEMENT[st]];
                  const god = tenGod(dayStem, st);
                  return (
                    <div key={`${st}-${i}`} className="min-w-0 flex-1 text-center">
                      <p className="text-[14px] leading-none font-black" style={{ color: el.color }}>
                        {STEMS[st]}
                      </p>
                      <p className="mt-0.5 text-[6px] leading-none font-bold" style={{ color: el.color }}>
                        {el.zh}
                      </p>
                      <p className="mt-0.5 text-[6px] leading-none text-[#8a7aa3]">{god.zh}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <RowLabel {...ROW_LABELS[2]} />
      </div>
    </div>
  );
}

function RowLabel({ zh, en }: { zh: string; en: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 border-t border-l border-[#ece3f8] bg-[#f8f4ff] py-1">
      <span className="text-[11px] leading-none font-black text-[#6b4f8f]">{zh}</span>
      <span className="text-[6px] leading-none text-[#b9aed0] [writing-mode:vertical-rl]">{en}</span>
    </div>
  );
}
