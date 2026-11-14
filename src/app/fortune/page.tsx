"use client";

import Link from "next/link";
import { useState } from "react";
import CharacterAvatar from "@/components/CharacterAvatar";
import DemoPayModal from "@/components/DemoPayModal";
import { ELEMENT_INFO, computeChart } from "@/lib/bazi";
import { dailyFortune } from "@/lib/fortune";
import { useSavedProfile } from "@/lib/useClientValues";
import {
  buyPass,
  checkIn,
  demoNextDay,
  demoReset,
  hasPass,
  streakOf,
  todayOf,
  unlockFortuneDay,
  useUserState,
} from "@/lib/userState";

function Progress({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold text-[#6b4f8f]">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#f3eefc]">
        <div className="h-full rounded-full bg-[#ff8fb1]" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

export default function FortunePage() {
  const profile = useSavedProfile();
  const user = useUserState();
  const [toast, setToast] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const chart = profile ? computeChart(profile) : null;
  const today = todayOf(user);
  const fortune = chart ? dailyFortune(chart, today) : null;
  const streak = streakOf(user);
  const checkedToday = user.checkins.includes(today);
  const pass = hasPass(user);
  const unlocked = pass || user.unlockedFortuneDays.includes(today);

  if (!profile || !chart || !fortune) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-5xl">🔮</p>
        <p className="font-bold text-[#6b4f8f]">
          先输入你的生日，才能看每日运势。
          <br />
          Enter your birthday first.
        </p>
        <Link href="/" className="rounded-full bg-[#ff8fb1] px-6 py-3 font-extrabold text-white">
          去输入 · Go
        </Link>
      </main>
    );
  }

  const lucky = ELEMENT_INFO[fortune.luckyElement];
  const sevenProgress = streak % 7 === 0 && streak > 0 && checkedToday ? 7 : streak % 7;
  const thirtyProgress = streak % 30 === 0 && streak > 0 && checkedToday ? 30 : streak % 30;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          ← 返回
        </Link>
        <h1 className="flex-1 text-center text-2xl font-extrabold text-[#6b4f8f]">🔮 每日运势 · Daily Fortune</h1>
        <span className="w-10" />
      </header>

      {/* ---------- check-in ---------- */}
      <section
        data-testid="checkin"
        className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#8a7aa3]">连续签到 · Streak</p>
            <p className="text-4xl font-black text-[#ff5c93]" data-testid="streak">
              {streak} <span className="text-base font-bold text-[#6b4f8f]">天 days</span>
            </p>
          </div>
          <button
            type="button"
            data-testid="checkin-btn"
            disabled={checkedToday}
            onClick={() => {
              const r = checkIn();
              if (r) setToast(r.reward ?? `✅ 签到成功！已连续 ${r.streak} 天`);
            }}
            className="rounded-full bg-[#ff8fb1] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#e06690] disabled:bg-[#d9cfe6] disabled:shadow-none"
          >
            {checkedToday ? "✅ 今天已签到" : "📅 签到 · Check in"}
          </button>
        </div>
        {toast && (
          <p className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#6b4f8f]" data-testid="checkin-toast">
            {toast}
          </p>
        )}
        <Progress value={sevenProgress} max={7} label="🎁 7 天 → 免费单日详细运势" />
        <Progress value={thirtyProgress} max={30} label="💞 30 天 → 免费配对一次" />
        <p className="text-xs text-[#8a7aa3]">
          我的奖励 · My rewards：免费运势 <b data-testid="fortune-credits">{user.fortuneCredits}</b> 次，免费配对{" "}
          <b>{user.matchCredits}</b> 次
        </p>
      </section>

      {/* ---------- today's fortune ---------- */}
      <section
        data-testid="fortune"
        className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.2)]"
      >
        <div className="flex items-center gap-3">
          <CharacterAvatar index={chart.dayMaster} className="h-auto w-20 shrink-0 rounded-2xl" />
          <div>
            <p className="text-sm text-[#8a7aa3]">
              {today} · 今日 {fortune.todayPillar} 日
            </p>
            <p className="text-xl font-extrabold text-[#6b4f8f]">
              {fortune.god.name} · {fortune.god.en}
            </p>
            <p className="text-2xl tracking-wider" aria-label={`${fortune.stars} / 5`} data-testid="stars">
              {"★".repeat(fortune.stars)}
              <span className="text-[#e6d7ff]">{"★".repeat(5 - fortune.stars)}</span>
            </p>
          </div>
        </div>

        {unlocked ? (
          <div className="flex flex-col gap-2 text-sm" data-testid="fortune-detail">
            <p className="rounded-2xl bg-[#f8f4ff] p-3">
              {fortune.god.zh}
              <br />
              <span className="text-xs text-[#8a7aa3]">{fortune.god.enText}</span>
            </p>
            {fortune.note && <p className="rounded-2xl bg-[#fff3cd] p-3">{fortune.note}</p>}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl p-3" style={{ background: lucky.soft }}>
                <p className="text-xs font-bold text-[#8a7aa3]">🎨 幸运色 · Lucky colour</p>
                <p className="font-extrabold">{fortune.luckyColor}</p>
              </div>
              <div className="rounded-2xl p-3" style={{ background: lucky.soft }}>
                <p className="text-xs font-bold text-[#8a7aa3]">🔢 幸运数字 · Lucky number</p>
                <p className="text-2xl font-black">{fortune.luckyNumber}</p>
              </div>
              <div className="rounded-2xl bg-[#f8f4ff] p-3">
                <p className="text-xs font-bold text-[#8a7aa3]">🧧 今日吉祥物 · Mascot</p>
                <p className="font-extrabold">
                  {fortune.totem.emoji} {fortune.totem.zh} {fortune.totem.en}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8f4ff] p-3">
                <p className="text-xs font-bold text-[#8a7aa3]">🍀 幸运五行 · Element</p>
                <p className="font-extrabold">
                  {lucky.emoji} {lucky.zh} {lucky.en}
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#dcf5e5] p-3">
              <p className="text-xs font-bold text-[#2e7d4f]">😇 贵人 · Benefactors</p>
              <p>
                {fortune.benefactors.map((b) => `${b.emoji} ${b.zh}`).join("、")} 的人容易帮到你。
              </p>
            </div>
            <div className="rounded-2xl bg-[#ffe0e0] p-3">
              <p className="text-xs font-bold text-[#c0392b]">⚠️ 小人 & 注意 · Watch out</p>
              <p>
                小心 {fortune.villain.emoji} {fortune.villain.zh} 的人（跟你的日支相冲）。{fortune.god.caution}
              </p>
              <p className="text-xs text-[#8a7aa3]">{fortune.god.cautionEn}</p>
            </div>
            {pass && (
              <p className="text-center text-xs text-[#8a7aa3]" data-testid="pass-status">
                ✨ 月卡有效至 {user.passUntil} · Pass active
              </p>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl" data-testid="fortune-locked">
            <div className="pointer-events-none select-none blur-sm" aria-hidden>
              <p className="rounded-2xl bg-[#f8f4ff] p-3 text-sm">今天的详细运势内容 …… 幸运色、幸运数字、吉祥物、贵人、小人 ……</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="h-16 rounded-2xl bg-[#f3eefc]" />
                <div className="h-16 rounded-2xl bg-[#f3eefc]" />
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 p-3 text-center">
              <p className="font-extrabold text-[#6b4f8f]">🔒 解锁今日详细运势</p>
              {user.fortuneCredits > 0 && (
                <button
                  type="button"
                  data-testid="use-fortune-credit"
                  onClick={() => unlockFortuneDay(today, true)}
                  className="rounded-full bg-[#b48cff] px-5 py-2 text-sm font-extrabold text-white"
                >
                  🎁 用免费次数解锁（剩 {user.fortuneCredits} 次）
                </button>
              )}
              <button
                type="button"
                data-testid="buy-pass"
                onClick={() => setPaying(true)}
                className="rounded-full bg-[#ff8fb1] px-5 py-2 text-sm font-extrabold text-white"
              >
                👑 月卡 RM 29.9 / 月 · Monthly pass
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ---------- demo controls ---------- */}
      <section className="rounded-2xl border-2 border-dashed border-[#d9cfe6] p-3 text-center text-xs text-[#8a7aa3]">
        <p className="mb-2 font-bold">🧪 演示工具 · Demo tools（给评审看流程用）</p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            data-testid="demo-next-day"
            onClick={() => {
              demoNextDay();
              setToast(null);
            }}
            className="rounded-full border-2 border-[#d9cfe6] bg-white px-3 py-1 font-bold"
          >
            ⏩ 跳到明天
          </button>
          <button
            type="button"
            onClick={() => {
              demoReset();
              setToast(null);
            }}
            className="rounded-full border-2 border-[#d9cfe6] bg-white px-3 py-1 font-bold"
          >
            ♻️ 重置
          </button>
        </div>
      </section>

      {paying && (
        <DemoPayModal
          title="每日运势月卡 · 30 天 / Monthly pass"
          price="RM 29.9"
          onClose={() => setPaying(false)}
          onPaid={() => {
            buyPass();
            setPaying(false);
            setToast("👑 月卡开通成功！30 天内每天都能看详细运势。");
          }}
        />
      )}
    </main>
  );
}
