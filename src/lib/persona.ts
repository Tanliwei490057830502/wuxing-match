// 日主人设卡的数据：内置文案 + 五合/七杀的拍档与天敌。
// Persona card data. The built-in copy is the instant fallback; AI text
// replaces it when the model answers.

import { CHARACTERS } from "@/components/CharacterAvatar";
import { ELEMENT_INFO, STEMS, STEM_ELEMENT, computeLayers, readChart, type Chart } from "@/lib/bazi";
import { PERSONAS } from "@/lib/copy";
import type { AiPersona } from "@/lib/aiShared";

export function personaFallback(chart: Chart): AiPersona {
  const p = PERSONAS[chart.dayMaster];
  const dayBranch = chart.pillars[2]?.pillar.branch ?? 0;
  return {
    code: p.code,
    title: p.title,
    bars: p.bars,
    soul: p.souls[dayBranch % 2],
  };
}

export function bond(stem: number) {
  return {
    stem: STEMS[stem],
    zh: ELEMENT_INFO[STEM_ELEMENT[stem]].zh,
    emoji: ELEMENT_INFO[STEM_ELEMENT[stem]].emoji,
    name: CHARACTERS[stem].zh,
    index: stem,
  };
}

/** The five-element mix as whole percentages (layer 3, same numbers as the charts). */
export function mix(chart: Chart) {
  const pct = computeLayers(chart)[2].percent;
  return (["wood", "fire", "earth", "metal", "water"] as const).map((el) => ({
    el,
    zh: ELEMENT_INFO[el].zh,
    pct: pct[el],
  }));
}

export function readingOf(chart: Chart) {
  const r = readChart(chart);
  return {
    strong: r.strong,
    missing: r.missing.map((m) => ELEMENT_INFO[m].zh),
    lucky: ELEMENT_INFO[r.lucky],
  };
}
