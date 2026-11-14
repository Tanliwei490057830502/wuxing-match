// 三层解读的文案 —— 每一句都从这张盘算出来，换个人 / 换个生日就变。
// 哪一行最旺、月令藏了什么、哪一层被合化转走，都直接写进句子里。

import {
  BRANCHES,
  ELEMENTS,
  ELEMENT_INFO,
  HIDDEN_STEMS,
  STEMS,
  STEM_ELEMENT,
  type Chart,
  type Element,
  type Layer,
} from "@/lib/bazi";

// 「别人第一眼看到你」—— 按第一层最旺的那一行写
const IMPRESSION: Record<Element, string> = {
  wood: "话不多、先动手，看起来像「这个人靠得住」。",
  fire: "声音先到、人后到，看起来像「这个人很好聊」。",
  earth: "不抢话、不着急，看起来像「这个人什么都不慌」。",
  metal: "说话直、边界清楚，看起来像「这个人有点冷」。",
  water: "什么都接得住、什么都好说，看起来像「这个人没脾气」。",
};

// 「熟了以后才会发现的那一面」—— 按地支里藏着的五行写
const HIDDEN_SIDE: Record<Element, string> = {
  wood: "其实很轴，认定的事九头牛拉不回",
  fire: "其实很需要被回应，冷场会自己脑补一堆",
  earth: "其实心里有本账，谁欠谁记得清清楚楚",
  metal: "其实很容易受伤，只是不肯说",
  water: "其实想得最多，半夜会把一句话反复拆开",
};

function zh(el: Element) {
  return ELEMENT_INFO[el].zh;
}

function topElement(pct: Record<Element, number>, exclude?: Element): Element {
  const pool = exclude ? ELEMENTS.filter((el) => el !== exclude) : ELEMENTS;
  return pool.reduce((a, el) => (pct[el] > pct[a] ? el : a), pool[0]);
}

/** 每一层一句「决定什么」，句子里的名字、数字、事件都来自这张盘 */
export function layerNarrative(chart: Chart, layers: Layer[]) {
  const day = chart.pillars[2]?.pillar; // 日柱
  const month = chart.pillars[1]; // 月柱（月令）

  // ---- 第一层：字数最多的那一行
  const firstTop = topElement(layers[0].percent);
  const chars = chart.pillars.length * 2;
  const firstN = Math.round((layers[0].percent[firstTop] / 100) * chars);

  // ---- 第二层：月令藏干 + 其它地支藏着的五行
  // 除了「表面上最重的那一行」，底色里还多出来哪一行（第二层比第一层涨得最多的）
  const delta = (el: Element) => layers[1].percent[el] - layers[0].percent[el];
  const others = ELEMENTS.filter((el) => el !== firstTop);
  const hiddenTop = others.reduce((a, el) => (delta(el) > delta(a) ? el : a), others[0]);
  const hiddenGain = delta(hiddenTop);
  const monthStems = month ? HIDDEN_STEMS[month.pillar.branch].map((st) => STEMS[st]).join("、") : "";
  const monthBranch = month ? BRANCHES[month.pillar.branch] : "";
  const hasOther = hiddenGain > 0;

  // ---- 第三层：真正发生过的合 / 冲
  const events = layers[2].events.filter((e) => !e.includes("和第二层一样"));
  const shortEvents = events.map((e) => e.split("：")[0]);
  const thirdPct = layers[2].percent;
  const remaining = ELEMENTS.filter((el) => thirdPct[el] >= 10);
  const zeroed = ELEMENTS.filter((el) => layers[1].percent[el] >= 5 && thirdPct[el] === 0);

  return {
    first: {
      headline: "第一印象",
      body: `第一眼看过去最重的是「${zh(firstTop)}」，${chars} 个字里有 ${firstN} 个是它。${IMPRESSION[firstTop]}`,
    },
    second: {
      headline: "你的底色",
      body:
        hasOther && monthBranch
          ? `出生在「${monthBranch}」月，月令里藏着 ${monthStems}，这几个字算双倍。所以除了表面的${zh(firstTop)}，你底色里还压着一层${zh(hiddenTop)} —— ${HIDDEN_SIDE[hiddenTop]}。`
          : monthBranch
            ? `出生在「${monthBranch}」月，月令里只藏着 ${monthStems}，没有别的五行在底下顶着。你表里挺一致，不用猜。`
            : "这个盘只有三柱，底色看不太出来，补上出生时辰会更准。",
    },
    third: {
      headline: "真正起作用的你",
      body: shortEvents.length
        ? `${shortEvents.join("、")} 把你的分数改判过：${zeroed.length ? `${zeroed.map(zh).join("、")}被转走，` : ""}最后还在跑的只剩 ${remaining
            .map(zh)
            .join("、")}。身强弱、喜用神、今天的宜忌，都是从这一组算出来的。`
        : `这个盘没有相邻的合或冲，${remaining.map(zh).join("、")}平平稳稳地一起跑。身强弱、喜用神、今天的宜忌，都是从这一层算的。`,
    },
    // 给结论句用的补充
    dayElement: day ? STEM_ELEMENT[day.stem] : chart.element,
  };
}
