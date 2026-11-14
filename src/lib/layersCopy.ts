// 三层解读的文案 —— 每一句都从这张盘算出来，换个人 / 换个生日就变。
// 哪一行最旺、月令藏了什么、哪一层被合化转走，都直接写进句子里。
// 每条文案都是中英一对：英文在上（主体），中文小字在下。

import {
  BRANCHES,
  BRANCH_PINYIN,
  ELEMENTS,
  ELEMENT_INFO,
  HIDDEN_STEMS,
  STEMS,
  STEM_ELEMENT,
  STEM_PINYIN,
  type Chart,
  type Element,
  type Layer,
} from "@/lib/bazi";

/** 一句双语文案：en 在上，zh 作小字在下 */
export type BiText = { en: string; zh: string };

// 「别人第一眼看到你」—— 按第一层最旺的那一行写
const IMPRESSION: Record<Element, BiText> = {
  wood: {
    en: "Not much talk, straight to work. Reads as: this one is dependable.",
    zh: "话不多、先动手，看起来像「这个人靠得住」。",
  },
  fire: {
    en: "You hear them before you see them. Reads as: easy to talk to.",
    zh: "声音先到、人后到，看起来像「这个人很好聊」。",
  },
  earth: {
    en: "Never grabs the mic, never rushes. Reads as: nothing rattles this one.",
    zh: "不抢话、不着急，看起来像「这个人什么都不慌」。",
  },
  metal: {
    en: "Says it straight, keeps clear lines. Reads as: a bit cold.",
    zh: "说话直、边界清楚，看起来像「这个人有点冷」。",
  },
  water: {
    en: "Takes anything, agrees with everything. Reads as: no temper at all.",
    zh: "什么都接得住、什么都好说，看起来像「这个人没脾气」。",
  },
};

// 「熟了以后才会发现的那一面」—— 按地支里藏着的五行写
const HIDDEN_SIDE: Record<Element, BiText> = {
  wood: {
    en: "Actually rock stubborn. Once it is decided, nine oxen could not pull them back",
    zh: "其实很轴，认定的事九头牛拉不回",
  },
  fire: {
    en: "Actually needs a reply. Silence, and they will build a whole story in their head",
    zh: "其实很需要被回应，冷场会自己脑补一堆",
  },
  metal: {
    en: "Actually gets hurt easily. Just never says so",
    zh: "其实很容易受伤，只是不肯说",
  },
  earth: {
    en: "Actually keeps a ledger. Who owes whom is remembered, down to the last cent",
    zh: "其实心里有本账，谁欠谁记得清清楚楚",
  },
  water: {
    en: "Actually overthinks the most. One sentence gets taken apart again at midnight",
    zh: "其实想得最多，半夜会把一句话反复拆开",
  },
};

function zh(el: Element) {
  return ELEMENT_INFO[el].zh;
}

function en(el: Element) {
  return ELEMENT_INFO[el].en;
}

/** "Wood, Fire and Water" —— 英文列举 */
function listEn(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// 天干 / 地支 -> 拼音，用来把「甲己合土」这样的标签说成英文
const CHAR_PINYIN: Record<string, string> = {};
STEMS.forEach((s, i) => {
  CHAR_PINYIN[s] = STEM_PINYIN[i];
});
BRANCHES.forEach((b, i) => {
  CHAR_PINYIN[b] = BRANCH_PINYIN[i];
});

const ELEMENT_EN_BY_ZH: Record<string, string> = {};
ELEMENTS.forEach((el) => {
  ELEMENT_EN_BY_ZH[ELEMENT_INFO[el].zh] = ELEMENT_INFO[el].en;
});

/** 「甲己合土」-> "Jia and Ji combine into Earth"；「子午相冲」-> "Zi and Wu clash" */
function eventEn(label: string) {
  const clash = /^(.)(.)相冲$/.exec(label);
  if (clash) return `${CHAR_PINYIN[clash[1]]} and ${CHAR_PINYIN[clash[2]]} clash`;
  const combo = /^(.)(.)合(.)$/.exec(label);
  if (combo) {
    return `${CHAR_PINYIN[combo[1]]} and ${CHAR_PINYIN[combo[2]]} combine into ${ELEMENT_EN_BY_ZH[combo[3]]}`;
  }
  return label;
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
  const monthStemsEn = month
    ? HIDDEN_STEMS[month.pillar.branch].map((st) => `${STEM_PINYIN[st]} (${STEMS[st]})`).join(", ")
    : "";
  const monthBranch = month ? BRANCHES[month.pillar.branch] : "";
  const monthBranchEn = month ? `${BRANCH_PINYIN[month.pillar.branch]} (${BRANCHES[month.pillar.branch]})` : "";
  const hasOther = hiddenGain > 0;

  // ---- 第三层：真正发生过的合 / 冲
  const events = layers[2].events.filter((e) => !e.includes("和第二层一样"));
  const shortEvents = events.map((e) => e.split("：")[0]);
  const shortEventsEn = shortEvents.map(eventEn);
  const thirdPct = layers[2].percent;
  const remaining = ELEMENTS.filter((el) => thirdPct[el] >= 10);
  const zeroed = ELEMENTS.filter((el) => layers[1].percent[el] >= 5 && thirdPct[el] === 0);

  return {
    first: {
      headline: { en: "First impression", zh: "第一印象" },
      body: {
        en: `At first glance the heaviest element is ${en(firstTop)}: ${firstN} of your ${chars} characters are ${en(
          firstTop,
        )}. ${IMPRESSION[firstTop].en}`,
        zh: `第一眼看过去最重的是「${zh(firstTop)}」，${chars} 个字里有 ${firstN} 个是它。${IMPRESSION[firstTop].zh}`,
      },
    },
    second: {
      headline: { en: "Your undertone", zh: "你的底色" },
      body:
        hasOther && monthBranch
          ? {
              en: `You were born in the ${monthBranchEn} month. The month branch hides ${monthStemsEn}, and those count double. So under the surface ${en(
                firstTop,
              )} there is another layer of ${en(hiddenTop)} — ${HIDDEN_SIDE[hiddenTop].en}.`,
              zh: `出生在「${monthBranch}」月，月令里藏着 ${monthStems}，这几个字算双倍。所以除了表面的${zh(
                firstTop,
              )}，你底色里还压着一层${zh(hiddenTop)} —— ${HIDDEN_SIDE[hiddenTop].zh}。`,
            }
          : monthBranch
            ? {
                en: `You were born in the ${monthBranchEn} month. The month branch hides only ${monthStemsEn}, and nothing else is holding things up from below. What you see is what you get.`,
                zh: `出生在「${monthBranch}」月，月令里只藏着 ${monthStems}，没有别的五行在底下顶着。你表里挺一致，不用猜。`,
              }
            : {
                en: "This chart has only three pillars, so the undertone is hard to read. Add your birth hour and it gets sharper.",
                zh: "这个盘只有三柱，底色看不太出来，补上出生时辰会更准。",
              },
    },
    third: {
      headline: { en: "The you that actually runs the show", zh: "真正起作用的你" },
      body: shortEvents.length
        ? {
            en: `${listEn(shortEventsEn)} re-scored you: ${
              zeroed.length ? `${listEn(zeroed.map(en))} got moved away, and ` : ""
            }only ${listEn(remaining.map(en))} ${
              remaining.length > 1 ? "are" : "is"
            } still running at the end. Strength, favorable element, today's dos and don'ts — all of it comes from this set.`,
            zh: `${shortEvents.join("、")} 把你的分数改判过：${
              zeroed.length ? `${zeroed.map(zh).join("、")}被转走，` : ""
            }最后还在跑的只剩 ${remaining
              .map(zh)
              .join("、")}。身强弱、喜用神、今天的宜忌，都是从这一组算出来的。`,
          }
        : {
            en: `No combinations or clashes sit next to each other in this chart, so ${listEn(
              remaining.map(en),
            )} just run along together, steady as they are. Strength, favorable element, today's dos and don'ts — all from this layer.`,
            zh: `这个盘没有相邻的合或冲，${remaining
              .map(zh)
              .join("、")}平平稳稳地一起跑。身强弱、喜用神、今天的宜忌，都是从这一层算的。`,
          },
    },
    // 给结论句用的补充
    dayElement: day ? STEM_ELEMENT[day.stem] : chart.element,
  };
}
