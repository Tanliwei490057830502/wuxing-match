"use client";

// 首页的介绍段：先说清楚这个站能干嘛，再让人开始测试。
// 只在「还没有生日信息」的第一次出现，老用户直接进结果页。

const FEATURES = [
  {
    emoji: "🃏",
    title: "日柱人设卡",
    body: "MBTI 式代号、反差属性条、一句灵魂暴击，还能下载成海报发 IG。",
  },
  {
    emoji: "💞",
    title: "1v1 合盘",
    body: "扫码看你们配几分，再解锁 AI 毒舌锐评或走心建议。",
  },
  {
    emoji: "🧑‍🚀",
    title: "五行小队",
    body: "3–5 人开一个房间，雷达告诉你这队缺哪种五行、谁该当 Leader。",
  },
  {
    emoji: "🔮",
    title: "每日补给",
    body: "签到领奖励、AI 今日宜忌，还有一键解压的小玩具。",
  },
] as const;

export default function LandingIntro({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-[2rem] border-4 border-white bg-white/85 p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.25)]">
        <p className="text-xs font-black tracking-[0.2em] text-[#b48cff]">30 秒 · 不用注册</p>
        <h2 className="mt-1 text-xl font-black text-[#4a3566]">这站能做什么？</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#8a7aa3]">
          输入一次生日，拿到你的「日柱人设卡」，
          <br />
          再拿去和朋友的卡对一对、组个队。
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2">
        {FEATURES.map((f) => (
          <li key={f.title} className="flex items-start gap-3 rounded-[1.6rem] border-2 border-white bg-white/80 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f6f1ff] text-xl">
              {f.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#4a3566]">{f.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#8a7aa3]">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-testid="start-test"
        onClick={onStart}
        className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] transition active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
      >
        🚀 开始测试 · Start
      </button>

      <a
        href="/quiz"
        data-testid="quiz-link"
        className="rounded-2xl border-2 border-dashed border-[#e0d3f7] bg-white/60 px-4 py-3 text-center"
      >
        <span className="block text-sm font-extrabold text-[#6b4f8f]">🧪 不想填生日？先做 15 题问卷</span>
        <span className="text-[11px] text-[#8a7aa3]">2 分钟，不用出生时间，也能测出你是哪一型</span>
      </a>

      <p className="text-center text-[11px] leading-relaxed text-[#b9aed0]">
        生日只存在你自己的浏览器里，不会上传；不填时辰也能算。
      </p>
    </section>
  );
}
