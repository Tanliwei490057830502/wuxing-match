// 五行性格问卷 · a MBTI-style quiz built on the five elements.
// 15 题，每题四个选项，每个选项给一个主五行 +2、一个副五行 +1，并记一次阴阳倾向。
// 答完：主五行 + 阴阳 → 十天干里的一种（甲…癸），对应 10 种性格类型。

import { ELEMENTS, type Element } from "@/lib/bazi";

export type QuizOption = {
  text: string;
  el: Element; // 主五行 +2
  sub: Element; // 副五行 +1
  yang: boolean; // 阳明倾向
};

export type QuizQuestion = { q: string; options: QuizOption[] };

export const QUIZ: QuizQuestion[] = [
  {
    q: "周五晚上突然空出来，你更想：",
    options: [
      { text: "叫上一群人出去，越热闹越好", el: "fire", sub: "wood", yang: true },
      { text: "一个人把拖了很久的事做完", el: "metal", sub: "earth", yang: true },
      { text: "窝着刷手机，想到什么算什么", el: "water", sub: "wood", yang: false },
      { text: "约一个朋友慢慢聊到深夜", el: "earth", sub: "water", yang: false },
    ],
  },
  {
    q: "小组作业分到没人想做的部分，你会：",
    options: [
      { text: "直接举手接下来，先把坑填了", el: "earth", sub: "metal", yang: true },
      { text: "提议重新分工，把规则说清楚", el: "metal", sub: "fire", yang: true },
      { text: "私下问谁其实有想法，再一起定", el: "wood", sub: "water", yang: false },
      { text: "先做着，边做边看情况", el: "water", sub: "earth", yang: false },
    ],
  },
  {
    q: "朋友说「我没事」，你第一反应是：",
    options: [
      { text: "不信，继续追问", el: "fire", sub: "wood", yang: true },
      { text: "观察几天，看他有没有变", el: "water", sub: "metal", yang: false },
      { text: "直接带他去吃东西", el: "earth", sub: "fire", yang: false },
      { text: "说「需要就说」，然后留着", el: "wood", sub: "metal", yang: false },
    ],
  },
  {
    q: "做决定时你最怕：",
    options: [
      { text: "想太久，错过机会", el: "fire", sub: "wood", yang: true },
      { text: "做错了被人说", el: "metal", sub: "earth", yang: false },
      { text: "被绑住，不自由", el: "water", sub: "wood", yang: true },
      { text: "对不起别人", el: "earth", sub: "water", yang: false },
    ],
  },
  {
    q: "你的桌子 / 房间通常是：",
    options: [
      { text: "乱，但我知道东西在哪", el: "water", sub: "fire", yang: false },
      { text: "分类清楚，位置固定", el: "metal", sub: "earth", yang: true },
      { text: "干净，但随时会摆上吃的", el: "earth", sub: "wood", yang: false },
      { text: "看心情，隔一阵大整理一次", el: "wood", sub: "fire", yang: true },
    ],
  },
  {
    q: "有人在群里 @ 你问一个你也不确定的问题：",
    options: [
      { text: "先回一句，边查边答", el: "fire", sub: "water", yang: true },
      { text: "查清楚再一次性回", el: "metal", sub: "earth", yang: true },
      { text: "等其他人的答案再补", el: "water", sub: "earth", yang: false },
      { text: "私聊对方，问清楚再一起回", el: "wood", sub: "earth", yang: false },
    ],
  },
  {
    q: "你更容易被哪种人吸引：",
    options: [
      { text: "很有想法、会带你走的人", el: "wood", sub: "fire", yang: false },
      { text: "很稳、说到做到的人", el: "earth", sub: "metal", yang: false },
      { text: "很亮、走到哪都热闹的人", el: "fire", sub: "wood", yang: true },
      { text: "很安静但一开口就准的人", el: "metal", sub: "water", yang: true },
    ],
  },
  {
    q: "计划被打乱时，你：",
    options: [
      { text: "立刻改一版新的", el: "metal", sub: "fire", yang: true },
      { text: "先烦一下，然后随便", el: "water", sub: "wood", yang: false },
      { text: "先安抚大家的情绪", el: "earth", sub: "fire", yang: false },
      { text: "干脆借机做点更想做的", el: "fire", sub: "wood", yang: true },
    ],
  },
  {
    q: "你熬夜最常因为：",
    options: [
      { text: "聊天 / 刷视频停不下来", el: "fire", sub: "water", yang: true },
      { text: "一遍遍改东西", el: "metal", sub: "earth", yang: false },
      { text: "想事情，越想越清醒", el: "water", sub: "wood", yang: false },
      { text: "陪别人，不好意思先走", el: "earth", sub: "wood", yang: false },
    ],
  },
  {
    q: "别人夸你，你心里更想听：",
    options: [
      { text: "「你真的很会带气氛」", el: "fire", sub: "wood", yang: true },
      { text: "「交给你我最放心」", el: "earth", sub: "metal", yang: true },
      { text: "「你想得好细」", el: "metal", sub: "water", yang: false },
      { text: "「跟你聊天很舒服」", el: "wood", sub: "water", yang: false },
    ],
  },
  {
    q: "遇到不喜欢的人，你：",
    options: [
      { text: "表面客气，私下远离", el: "water", sub: "metal", yang: false },
      { text: "直接让对方知道", el: "fire", sub: "metal", yang: true },
      { text: "忍着，但会跟朋友讲", el: "wood", sub: "earth", yang: false },
      { text: "该合作还是照做", el: "earth", sub: "metal", yang: true },
    ],
  },
  {
    q: "你更相信：",
    options: [
      { text: "直觉，先做了再说", el: "fire", sub: "wood", yang: true },
      { text: "经验，做过才知道", el: "earth", sub: "metal", yang: false },
      { text: "逻辑，讲得通才做", el: "metal", sub: "water", yang: true },
      { text: "感觉，哪边舒服往哪边", el: "water", sub: "wood", yang: false },
    ],
  },
  {
    q: "一个项目结束，你最想：",
    options: [
      { text: "马上开下一个", el: "fire", sub: "metal", yang: true },
      { text: "好好总结一下", el: "metal", sub: "earth", yang: true },
      { text: "先躺几天", el: "water", sub: "earth", yang: false },
      { text: "跟队友吃一顿", el: "earth", sub: "fire", yang: false },
    ],
  },
  {
    q: "你最难忍的是：",
    options: [
      { text: "没效率、反复改", el: "metal", sub: "fire", yang: true },
      { text: "被忽视、没人回应", el: "fire", sub: "wood", yang: true },
      { text: "被控制、没有空间", el: "water", sub: "wood", yang: false },
      { text: "被误会、说不清", el: "wood", sub: "water", yang: false },
    ],
  },
  {
    q: "如果要用一句话介绍自己：",
    options: [
      { text: "「我很好相处」", el: "earth", sub: "water", yang: false },
      { text: "「我很有分寸」", el: "metal", sub: "earth", yang: true },
      { text: "「我很有意思」", el: "fire", sub: "wood", yang: true },
      { text: "「我很好懂，也很难懂」", el: "water", sub: "wood", yang: false },
    ],
  },
];

// 主五行 → 阳干序号（阴干 = +1）
const BASE_STEM: Record<Element, number> = { wood: 0, fire: 2, earth: 4, metal: 6, water: 8 };

export type QuizResult = {
  stem: number; // 0..9 甲..癸
  element: Element;
  yang: boolean;
  percent: Record<Element, number>; // 问卷得出的五行占比
};

/** 把选择题的答案换算成 → 五行占比 + 十天干之一 */
export function scoreQuiz(answers: (number | null)[]): QuizResult {
  const raw: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  let yangVotes = 0;
  let answered = 0;

  answers.forEach((choice, i) => {
    if (choice === null || choice === undefined) return;
    const opt = QUIZ[i]?.options[choice];
    if (!opt) return;
    raw[opt.el] += 2;
    raw[opt.sub] += 1;
    if (opt.yang) yangVotes += 1;
    answered += 1;
  });

  const total = ELEMENTS.reduce((s, el) => s + raw[el], 0) || 1;
  const percent = {} as Record<Element, number>;
  for (const el of ELEMENTS) percent[el] = Math.round((raw[el] / total) * 100);

  const element = ELEMENTS.reduce((a, el) => (raw[el] > raw[a] ? el : a), ELEMENTS[0]);
  const yang = yangVotes * 2 >= answered;
  const stem = BASE_STEM[element] + (yang ? 0 : 1);

  return { stem, element, yang, percent };
}

// ---------- 兜底报告（AI 没配/失败时用） ----------

export const ELEMENT_REPORT: Record<
  Element,
  { headline: string; summary: string; strength: string[]; blind: string[]; advice: string }
> = {
  wood: {
    headline: "先定方向，再动手",
    summary:
      "你是先定方向再动手的那种人：别人还在讨论，你已经做出第一版了。对认定的人很护，但嘴上不一定说。",
    strength: ["很会定方向，别人还在犹豫你已经出发", "对人有耐心，愿意陪着慢慢长", "认准的事很能扛"],
    blind: ["容易把自己的标准当成所有人的标准", "不太会说累，别人以为你不需要帮"],
    advice: "偶尔把「我需要什么」说出口，不会塌。",
  },
  fire: {
    headline: "走到哪，哪里就热闹",
    summary:
      "你就是那个把气氛点起来的人：走到哪都有人跟你说话，冷场三秒就忍不住救场。热情是真的，但热度退得也快。",
    strength: ["气氛担当，冷场三秒就被你救回来", "热情是真的，答应的事会冲到底", "很会表达，想法一说就有人跟"],
    blind: ["上头快，下头也快", "容易被「没人回应」戳到，然后情绪走前面"],
    advice: "做决定前先睡一觉，热度第二天还在的才做。",
  },
  earth: {
    headline: "别人慌，你不慌",
    summary:
      "你是那种别人慌了、你还在的人：话不多，但事情到你手上就会稳稳落地。习惯了照顾人，也习惯了把自己的事往后放。",
    strength: ["稳，别人慌的时候你不慌", "说到做到，细节会替大家想到", "很会照顾人，是团队的底盘"],
    blind: ["太能忍，忍到某天突然不想理人", "习惯把别人的事排在自己前面"],
    advice: "你的好要让人知道成本，不然会被当成理所当然。",
  },
  metal: {
    headline: "一眼看到骨头",
    summary:
      "你看事情很准，一眼就看到关键点，不喜欢拖泥带水。对人也是一样：边界清楚，答应的事不打折，只是话直起来会扎人。",
    strength: ["判断准，看问题一眼看到骨头", "讲原则，答应的事不打折", "效率高，不喜欢拖泥带水"],
    blind: ["话说太直，好心也会扎到人", "对自己太苛刻，做得好也先挑错"],
    advice: "开口前加一句「我不是在怪你」，效果差很多。",
  },
  water: {
    headline: "脑子一直在转",
    summary:
      "你脑子一直在转：别人没说出口的话你也听得到，点子来得比别人快。只是想法太多，常常卡在「再想一下」就没了下文。",
    strength: ["脑子转得快，点子多", "很会读空气，别人没说出口你也知道", "适应力强，换环境不太受影响"],
    blind: ["想太多，想到最后一步都没动", "情绪来的时候会把事情全推翻"],
    advice: "给自己定一个「先做 20 分钟」的底线，别等想通。",
  },
};

export function fallbackReport(result: QuizResult) {
  const r = ELEMENT_REPORT[result.element];
  return {
    headline: r.headline,
    summary: r.summary,
    strengths: r.strength,
    watch: r.blind,
    advice: r.advice,
  };
}
