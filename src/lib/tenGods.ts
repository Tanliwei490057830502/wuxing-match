// 十神 —— 每个天干相对于「日主」的关系：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印。
// Ten Gods: how every stem relates to the day master.

import { ELEMENTS, STEM_ELEMENT, STEM_YANG } from "@/lib/bazi";

export type TenGod = { zh: string; abbr: string };

// delta = 对方五行相对日主的位置（五行按 木→火→土→金→水 相生排列）
// 0 同我 · 1 我生 · 2 我克 · 3 克我 · 4 生我
const TABLE: [TenGod, TenGod][] = [
  [
    { zh: "比肩", abbr: "BP" },
    { zh: "劫财", abbr: "RW" },
  ],
  [
    { zh: "食神", abbr: "EG" },
    { zh: "伤官", abbr: "HO" },
  ],
  [
    { zh: "偏财", abbr: "IW" },
    { zh: "正财", abbr: "DW" },
  ],
  [
    { zh: "七杀", abbr: "7K" },
    { zh: "正官", abbr: "DO" },
  ],
  [
    { zh: "偏印", abbr: "IR" },
    { zh: "正印", abbr: "DR" },
  ],
];

/** 其他天干相对日主是什么十神 */
export function tenGod(dayStem: number, otherStem: number): TenGod {
  const dayEl = STEM_ELEMENT[dayStem];
  const otherEl = STEM_ELEMENT[otherStem];
  const delta = (ELEMENTS.indexOf(otherEl) - ELEMENTS.indexOf(dayEl) + 5) % 5;
  const samePolarity = STEM_YANG[dayStem] === STEM_YANG[otherStem];
  return TABLE[delta][samePolarity ? 0 : 1];
}
