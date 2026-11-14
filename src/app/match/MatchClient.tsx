"use client";

import Link from "next/link";
import { useState } from "react";
import ElementPentagon, { SERIES_COLORS, chartPercents } from "@/components/ElementPentagon";
import CharacterAvatar from "@/components/CharacterAvatar";
import DemoPayModal from "@/components/DemoPayModal";
import ProfileForm from "@/components/ProfileForm";
import {
  DAY_MASTER_TYPES,
  ELEMENT_INFO,
  GENDER_INFO,
  computeChart,
  computeMatch,
  elementRelation,
  resultUrl,
  type Chart,
  type Profile,
} from "@/lib/bazi";
import { saveProfile, useOrigin, useSavedProfile } from "@/lib/useClientValues";
import { demoAddReferral, unlockMatch, useUserState } from "@/lib/userState";

function pairKey(a: Profile, b: Profile) {
  const k = (p: Profile) => `${p.date}|${p.hour}|${p.gender}`;
  return [k(a), k(b)].sort().join("~");
}

function MatchLock({
  inviter,
  friend,
  romantic,
  pair,
}: {
  inviter: Profile;
  friend: Profile;
  romantic: boolean;
  pair: string;
}) {
  const user = useUserState();
  const [paying, setPaying] = useState(false);
  const refs = Math.min(user.referrals, 2);

  return (
    <section
      data-testid="match-locked"
      className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-gradient-to-br from-[#ffd6e7] via-[#efe4ff] to-[#d9efff] p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.3)]"
    >
      <p className="text-lg font-extrabold text-[#6b4f8f]">🔒 想知道为什么是这个分数？</p>
      <p className="-mt-2 text-sm text-[#8a7aa3]">Unlock the reasons behind your score</p>
      <ul className="mx-auto flex flex-col gap-1 text-left text-sm text-[#6b4f8f]">
        <li>📜 配对原因：相生还是相克 · Why you match</li>
        <li>🖐️ 两人五行对比五角图 · Element comparison</li>
        <li>🌟 {romantic ? "缘分" : "友情"}分析与互补加分 · What you complete in each other</li>
      </ul>
      {user.matchCredits > 0 && (
        <button
          type="button"
          data-testid="unlock-credit"
          onClick={() => unlockMatch(pair, "credit")}
          className="rounded-full bg-[#b48cff] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#8f66e0]"
        >
          🎁 用免费配对解锁（剩 {user.matchCredits} 次）
        </button>
      )}

      <div className="rounded-2xl bg-white/80 p-3 text-left">
        <p className="font-extrabold text-[#6b4f8f]">👯 邀请 2 位好友完成测试 · Invite 2 friends</p>
        <div className="my-2 flex gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`flex h-10 flex-1 items-center justify-center rounded-xl border-2 text-sm font-bold ${
                i < refs ? "border-[#2e9e63] bg-[#dcf5e5] text-[#2e9e63]" : "border-dashed border-[#d9cfe6] text-[#b9aed0]"
              }`}
            >
              {i < refs ? "✅ 已加入" : `好友 ${i + 1}`}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#8a7aa3]" data-testid="referral-count">
          已邀请 {refs}/2 · 把你自己的二维码给朋友扫，他们完成测试就算一位
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {refs >= 2 ? (
            <button
              type="button"
              data-testid="unlock-referral"
              onClick={() => unlockMatch(pair, "referral")}
              className="flex-1 rounded-full bg-[#2e9e63] px-4 py-2 font-extrabold text-white"
            >
              🎉 解锁 · Unlock
            </button>
          ) : (
            <Link href="/" className="flex-1 rounded-full border-2 border-[#b48cff] px-4 py-2 text-center text-sm font-bold text-[#6b4f8f]">
              📱 去拿我的二维码
            </Link>
          )}
          <button
            type="button"
            data-testid="demo-referral"
            onClick={demoAddReferral}
            className="rounded-full border-2 border-dashed border-[#d9cfe6] bg-white px-3 py-2 text-xs font-bold text-[#8a7aa3]"
          >
            🧪 模拟好友加入（演示）
          </button>
        </div>
      </div>

      <button
        type="button"
        data-testid="unlock-pay"
        onClick={() => setPaying(true)}
        className="rounded-full bg-[#ff8fb1] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#e06690]"
      >
        ⚡ 立即解锁 RM 9.9 · Unlock now
      </button>

      {paying && (
        <DemoPayModal
          title={`${inviter.name} × ${friend.name} 配对结果`}
          price="RM 9.9"
          onClose={() => setPaying(false)}
          onPaid={() => {
            unlockMatch(pair, "pay");
            setPaying(false);
          }}
        />
      )}
    </section>
  );
}

function samePerson(a: Profile, b: Profile) {
  return a.name === b.name && a.date === b.date && a.hour === b.hour && a.gender === b.gender;
}

function MiniCard({ profile, chart }: { profile: Profile; chart: Chart }) {
  const name = profile.name;
  const info = ELEMENT_INFO[chart.element];
  const type = DAY_MASTER_TYPES[chart.dayMaster];
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-3xl border-4 border-white p-3" style={{ background: info.soft }}>
      <div className="text-center">
        <CharacterAvatar index={chart.dayMaster} className="mx-auto block h-auto w-full max-w-[120px]" />
        <p className="mt-1 truncate font-extrabold text-[#4a3566]">
          {profile.gender ? GENDER_INFO[profile.gender].emoji + " " : ""}
          {name}
        </p>
        <p className="text-sm font-bold" style={{ color: info.color }}>
          {info.zh} {info.en}
        </p>
        <p className="text-xs text-[#8a7aa3]">{type.title}</p>
      </div>
    </div>
  );
}

function ShareBack({ inviter, friend }: { inviter: Profile; friend: Profile }) {
  const origin = useOrigin();
  const [copied, setCopied] = useState(false);
  if (!origin) return null;
  const url = resultUrl(origin, inviter, friend);
  const text = `${inviter.name}，我们的五行配对结果出来了！快看 👉 ${url}`;

  return (
    <section
      data-testid="share-back"
      className="flex flex-col gap-2 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-4 text-center shadow-[0_8px_24px_rgba(255,143,177,0.25)]"
    >
      <p className="font-extrabold text-[#6b4f8f]">📤 把结果发给 {inviter.name}</p>
      <p className="text-xs text-[#8a7aa3]">
        {inviter.name} 的手机看不到这个结果，发给 TA 吧！· Send it so {inviter.name} can see it too
      </p>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#25d366] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#1da851] active:translate-y-1 active:shadow-[0_2px_0_#1da851]"
      >
        💬 用 WhatsApp 发送 · Send via WhatsApp
      </a>
      <button
        type="button"
        data-testid="share-copy"
        onClick={async () => {
          try {
            if (typeof navigator.share === "function") {
              await navigator.share({ title: "五行配对结果", text, url });
              return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // user cancelled share, or clipboard blocked
          }
        }}
        className="rounded-full border-2 border-[#e6d7ff] bg-white px-5 py-2 text-sm font-bold text-[#6b4f8f]"
      >
        {copied ? "✅ 已复制 · Copied!" : "🔗 分享 / 复制结果链接 · Share or copy link"}
      </button>
    </section>
  );
}

export default function MatchClient({
  inviter,
  sharedFriend,
  viaBump = false,
}: {
  inviter: Profile;
  sharedFriend: Profile | null;
  viaBump?: boolean;
}) {
  const saved = useSavedProfile();
  const user = useUserState();
  // A shared result link already contains the friend, so show the result straight away
  const sharedOk = sharedFriend && computeChart(sharedFriend) ? sharedFriend : null;
  const [friend, setFriend] = useState<Profile | null>(sharedOk);
  const [showForm, setShowForm] = useState(false);
  const viewingShared = sharedOk !== null && friend === sharedOk;

  const inviterChart = computeChart(inviter);

  if (!inviter.name || !inviterChart) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-5xl">🤔</p>
        <p className="font-bold text-[#6b4f8f]">
          这个配对链接好像坏了。
          <br />
          This match link looks broken.
        </p>
        <Link href="/" className="rounded-full bg-[#ff8fb1] px-6 py-3 font-extrabold text-white">
          回首页 · Go home
        </Link>
      </main>
    );
  }

  const canUseSaved = saved && !samePerson(saved, inviter) && computeChart(saved);
  const friendChart = friend ? computeChart(friend) : null;
  const result = friendChart ? computeMatch(inviterChart, friendChart, inviter.gender, friend?.gender ?? "") : null;
  const pair = friend ? pairKey(inviter, friend) : "";
  const matchUnlocked = pair !== "" && user.unlockedMatches.includes(pair);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="text-center">
        <p className="text-4xl">💌</p>
        {viaBump && viewingShared && friend ? (
          <>
            <h1 className="mt-1 text-2xl font-extrabold text-[#6b4f8f]" data-testid="invite-title">
              💥 对对碰成功！
            </h1>
            <p className="font-bold text-[#b48cff]">
              你碰到了 {inviter.name} · You bumped into {inviter.name}!
            </p>
          </>
        ) : viewingShared && friend ? (
          <>
            <h1 className="mt-1 text-2xl font-extrabold text-[#6b4f8f]" data-testid="invite-title">
              {friend.name} 和 {inviter.name} 的配对结果
            </h1>
            <p className="font-bold text-[#b48cff]">
              {friend.name} sent you the match result!
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-1 text-2xl font-extrabold text-[#6b4f8f]" data-testid="invite-title">
              {inviter.name} 邀请你配对！
            </h1>
            <p className="font-bold text-[#b48cff]">{inviter.name} invited you to match!</p>
          </>
        )}
      </header>

      {!result || !friend || !friendChart ? (
        <section className="flex flex-col gap-4 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
          {canUseSaved && !showForm ? (
            <>
              <p className="text-center text-[#6b4f8f]">
                你之前保存过生日，直接用吗？
                <br />
                <span className="text-sm text-[#8a7aa3]">Use your saved birthday?</span>
              </p>
              <button
                type="button"
                onClick={() => setFriend(saved)}
                className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
              >
                💞 用「{saved.name}」配对 · Match as {saved.name}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-sm font-bold text-[#8a7aa3] underline"
              >
                我是别人，重新输入 · I&apos;m someone else
              </button>
            </>
          ) : (
            <>
              <p className="text-center font-bold text-[#6b4f8f]">
                输入你的生日 · Enter your birthday
              </p>
              <ProfileForm
                submitLabel="💞 看配对分数 · Show match score"
                onSubmit={(p) => {
                  saveProfile(p);
                  setFriend(p);
                }}
              />
            </>
          )}
        </section>
      ) : (
        <>
          <section
            data-testid="match-result"
            className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-[#ffd6e7] via-[#efe4ff] to-[#d9efff] p-6 text-center shadow-[0_8px_24px_rgba(155,140,255,0.3)]"
          >
            <p className="font-bold text-[#6b4f8f]">
              {inviter.name} {result.romantic ? "💘" : "🤝"} {friend.name}
            </p>
            <p className="text-sm text-[#8a7aa3]" data-testid="match-label">
              {result.label} · {result.labelEn}
            </p>
            <p className="my-1 text-7xl font-black text-[#ff5c93]" data-testid="match-score">
              {result.score}%
            </p>
            <p className="text-2xl font-extrabold text-[#6b4f8f]">{result.title}</p>
            <p className="text-sm font-bold text-[#b48cff]">{result.titleEn}</p>
            {matchUnlocked && (
              <>
                <p className="mt-3">{result.reason}</p>
                <p className="text-sm text-[#8a7aa3]">{result.reasonEn}</p>
              </>
            )}
          </section>

          {matchUnlocked ? (
            <>


          <section>
            <h2 className="mb-2 text-center font-extrabold text-[#6b4f8f]">五行对比 · Element comparison</h2>
            <div className="flex gap-3">
              <MiniCard profile={inviter} chart={inviterChart} />
              <MiniCard profile={friend} chart={friendChart} />
            </div>
            <div className="mt-3 rounded-[2rem] border-4 border-white bg-white p-4" data-testid="match-pentagon">
              <ElementPentagon
                series={[
                  { name: inviter.name, values: chartPercents(inviterChart), color: SERIES_COLORS[0] },
                  { name: friend.name, values: chartPercents(friendChart), color: SERIES_COLORS[1], dashed: true },
                ]}
              />
              <p className="mt-2 text-center text-xs text-[#8a7aa3]">
                两个形状重叠越多，五行越相似；一方多、一方少，就是互补。
                <br />
                More overlap = more alike. Where one is big and the other small, you complete each other.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border-4 border-white bg-white p-4 text-sm">
            <h2 className="mb-1 font-extrabold text-[#6b4f8f]">📜 为什么是这个分数？· Why this score?</h2>
            <p>
              配对主要看两人的<b>日主</b>：{inviter.name}是{ELEMENT_INFO[inviterChart.element].zh}，{friend.name}是
              {ELEMENT_INFO[friendChart.element].zh}。
              {
                {
                  same: "同一种五行，性格相近，最容易懂对方。",
                  generate: "两者「相生」，一方会自然地支持另一方，所以分数高。",
                  control: "两者「相克」，个性互相碰撞，会吵但也会成长。",
                }[elementRelation(inviterChart.element, friendChart.element)]
              }
            </p>
            <p className="mt-2 text-xs text-[#8a7aa3]">
              相生 Generating：木→火→土→金→水→木
              <br />
              相克 Controlling：木→土→水→火→金→木
            </p>
            <p className="mt-1 text-xs text-[#8a7aa3]">另外，对方补足你缺的五行也会加分。· Filling each other&apos;s missing elements adds points.</p>
          </section>
            </>
          ) : (
            <MatchLock inviter={inviter} friend={friend} romantic={result.romantic} pair={pair} />
          )}

          {!viewingShared && <ShareBack inviter={inviter} friend={friend} />}

          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-full bg-[#b48cff] px-6 py-3 text-center font-extrabold text-white shadow-[0_5px_0_#8f66e0]"
            >
              🎉 我也要邀请朋友 · Invite my own friends
            </Link>
            <button
              type="button"
              onClick={() => {
                setFriend(null);
                setShowForm(true);
              }}
              className="text-sm font-bold text-[#8a7aa3] underline"
            >
              🔁 换个人配对 · Try someone else
            </button>
          </div>
        </>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">仅供娱乐 · Just for fun 🎉</p>
    </main>
  );
}
