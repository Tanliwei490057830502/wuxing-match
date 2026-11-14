"use client";

import Link from "next/link";
import { useState } from "react";
import ElementPentagon, { SERIES_COLORS, chartPercents } from "@/components/ElementPentagon";
import CharacterAvatar from "@/components/CharacterAvatar";
import { Bi, BiInline } from "@/components/Bi";
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
import { useAiText } from "@/lib/aiClient";
import { pairCopy } from "@/lib/copy";

function pairKey(a: Profile, b: Profile) {
  const k = (p: Profile) => `${p.date}|${p.hour}|${p.gender}`;
  return [k(a), k(b)].sort().join("~");
}

function MatchLock({
  inviter,
  friend,
  romantic,
  pair,
  tag,
  teaser,
}: {
  inviter: Profile;
  friend: Profile;
  romantic: boolean;
  pair: string;
  tag: string;
  teaser: string;
}) {
  const user = useUserState();
  const [paying, setPaying] = useState(false);
  const refs = Math.min(user.referrals, 2);

  return (
    <section
      data-testid="match-locked"
      className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-gradient-to-br from-[#ffd6e7] via-[#efe4ff] to-[#d9efff] p-5 text-center shadow-[0_8px_24px_rgba(155,140,255,0.3)]"
    >
      <p className="text-lg font-extrabold text-[#6b4f8f]">
        <Bi en="🔒 Want to know why you got this score?" zh="🔒 想知道为什么是这个分数？" />
      </p>
      {(tag || teaser) && (
        <div className="rounded-2xl bg-white/80 p-3 text-left">
          {tag && (
            <p className="text-sm font-extrabold text-[#d9507f]">
              <Bi
                en={<>You two are: <span className="text-base">{tag}</span></>}
                zh={<>你们的关系大概是：<span className="text-base">{tag}</span></>}
              />
            </p>
          )}
          {teaser && <p className="mt-1 text-sm font-bold text-[#6b4f8f]">{teaser}</p>}
        </div>
      )}
      <ul className="mx-auto flex flex-col gap-1 text-left text-sm text-[#6b4f8f]">
        <li>
          <Bi en="📜 Why you match: generating or controlling?" zh="📜 配对原因：相生还是相克" />
        </li>
        <li>
          <Bi en="🖐️ Your two charts, side by side" zh="🖐️ 两人五行对比五角图" />
        </li>
        <li>
          <Bi
            en={`🌟 ${romantic ? "Love" : "Friendship"} reading, and how you complete each other`}
            zh={`🌟 ${romantic ? "缘分" : "友情"}分析与互补加分`}
          />
        </li>
      </ul>
      {user.matchCredits > 0 && (
        <button
          type="button"
          data-testid="unlock-credit"
          onClick={() => unlockMatch(pair, "credit")}
          className="rounded-full bg-[#b48cff] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#8f66e0]"
        >
          <BiInline en={`🎁 Unlock free (${user.matchCredits} left)`} zh={`🎁 用免费配对解锁（剩 ${user.matchCredits} 次）`} />
        </button>
      )}

      <div className="rounded-2xl bg-white/80 p-3 text-left">
        <p className="font-extrabold text-[#6b4f8f]">
          <Bi en="👯 Invite 2 friends to finish the test" zh="👯 邀请 2 位好友完成测试" />
        </p>
        <div className="my-2 flex gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`flex h-10 flex-1 items-center justify-center rounded-xl border-2 text-sm font-bold ${
                i < refs ? "border-[#2e9e63] bg-[#dcf5e5] text-[#2e9e63]" : "border-dashed border-[#d9cfe6] text-[#b9aed0]"
              }`}
            >
              {i < refs ? <BiInline en="✅ Joined" zh="✅ 已加入" /> : <BiInline en={`Friend ${i + 1}`} zh={`好友 ${i + 1}`} />}
            </div>
          ))}
        </div>
        <p className="text-xs text-[#8a7aa3]" data-testid="referral-count">
          <Bi
            en={`Invited ${refs}/2 · Give your QR code to friends. When they finish the test, it counts.`}
            zh={`已邀请 ${refs}/2 · 把你自己的二维码给朋友扫，他们完成测试就算一位`}
          />
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {refs >= 2 ? (
            <button
              type="button"
              data-testid="unlock-referral"
              onClick={() => unlockMatch(pair, "referral")}
              className="flex-1 rounded-full bg-[#2e9e63] px-4 py-2 font-extrabold text-white"
            >
              <BiInline en="🎉 Unlock" zh="🎉 解锁" />
            </button>
          ) : (
            <Link href="/" className="flex-1 rounded-full border-2 border-[#b48cff] px-4 py-2 text-center text-sm font-bold text-[#6b4f8f]">
              <BiInline en="📱 Get my QR code" zh="📱 去拿我的二维码" />
            </Link>
          )}
          <button
            type="button"
            data-testid="demo-referral"
            onClick={demoAddReferral}
            className="rounded-full border-2 border-dashed border-[#d9cfe6] bg-white px-3 py-2 text-xs font-bold text-[#8a7aa3]"
          >
            <BiInline en="🧪 Add a demo friend" zh="🧪 模拟好友加入（演示）" />
          </button>
        </div>
      </div>

      <button
        type="button"
        data-testid="unlock-pay"
        onClick={() => setPaying(true)}
        className="rounded-full bg-[#ff8fb1] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#e06690]"
      >
        <BiInline en="⚡ Unlock now RM 9.9" zh="⚡ 立即解锁 RM 9.9" />
      </button>

      {paying && (
        <DemoPayModal
          title={`${inviter.name} × ${friend.name} match result（配对结果）`}
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
      <p className="font-extrabold text-[#6b4f8f]">
        <Bi en={<>📤 Send the result to {inviter.name}</>} zh={<>📤 把结果发给 {inviter.name}</>} />
      </p>
      <p className="text-xs text-[#8a7aa3]">
        <Bi
          en={<>{inviter.name}&apos;s phone cannot see this result. Send it to them!</>}
          zh={<>{inviter.name} 的手机看不到这个结果，发给 TA 吧！</>}
        />
      </p>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#25d366] px-5 py-3 font-extrabold text-white shadow-[0_5px_0_#1da851] active:translate-y-1 active:shadow-[0_2px_0_#1da851]"
      >
        <BiInline en="💬 Send via WhatsApp" zh="💬 用 WhatsApp 发送" />
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
        {copied ? (
          <BiInline en="✅ Copied!" zh="✅ 已复制" />
        ) : (
          <BiInline en="🔗 Share or copy the result link" zh="🔗 分享 / 复制结果链接" />
        )}
      </button>
    </section>
  );
}

export default function MatchClient({
  inviter,
  sharedFriend,
}: {
  inviter: Profile;
  sharedFriend: Profile | null;
}) {
  const saved = useSavedProfile();
  const user = useUserState();
  // A shared result link already contains the friend, so show the result straight away
  const sharedOk = sharedFriend && computeChart(sharedFriend) ? sharedFriend : null;
  const [friend, setFriend] = useState<Profile | null>(sharedOk);
  const [showForm, setShowForm] = useState(false);
  const [tone, setTone] = useState<"roast" | "heart">("roast");
  const viewingShared = sharedOk !== null && friend === sharedOk;

  const inviterChart = computeChart(inviter);
  const friendChart = friend ? computeChart(friend) : null;
  const pair = friend ? pairKey(inviter, friend) : "";

  // 内置文案秒开，AI 回来再换掉 · built-in copy first, AI text when it lands
  const baseCopy = inviterChart && friendChart ? pairCopy(inviterChart.element, friendChart.element) : null;
  const fallbackPair = baseCopy
    ? { ...baseCopy, tip: "" }
    : { tag: "", teaser: "", roast: "", heart: "", tip: "" };
  const aiPair = useAiText(
    pair ? `pair:${pair}` : "pair:none",
    inviterChart && friend && friendChart ? JSON.stringify({ kind: "pair", profile: inviter, friend }) : "",
    fallbackPair,
  );
  const pairText = aiPair.data;

  if (!inviter.name || !inviterChart) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-5xl">🤔</p>
        <p className="font-bold text-[#6b4f8f]">
          <Bi en="This match link looks broken." zh="这个配对链接好像坏了。" />
        </p>
        <Link href="/" className="rounded-full bg-[#ff8fb1] px-6 py-3 font-extrabold text-white">
          <BiInline en="Go home" zh="回首页" />
        </Link>
      </main>
    );
  }

  const canUseSaved = saved && !samePerson(saved, inviter) && computeChart(saved);
  const result = friendChart ? computeMatch(inviterChart, friendChart, inviter.gender, friend?.gender ?? "") : null;
  const matchUnlocked = pair !== "" && user.unlockedMatches.includes(pair);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="text-center">
        <p className="text-4xl">💌</p>
        {viewingShared && friend ? (
          <>
            <h1 className="mt-1 text-2xl font-extrabold text-[#6b4f8f]" data-testid="invite-title">
              <Bi
                en={<>{friend.name} and {inviter.name}: your match result</>}
                zh={<>{friend.name} 和 {inviter.name} 的配对结果</>}
              />
            </h1>
          </>
        ) : (
          <>
            <h1 className="mt-1 text-2xl font-extrabold text-[#6b4f8f]" data-testid="invite-title">
              <Bi en={<>{inviter.name} invites you to match!</>} zh={<>{inviter.name} 邀请你配对！</>} />
            </h1>
          </>
        )}
      </header>

      {!result || !friend || !friendChart ? (
        <section className="flex flex-col gap-4 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
          {canUseSaved && !showForm ? (
            <>
              <p className="text-center text-[#6b4f8f]">
                <Bi en="You saved your birthday before. Use it?" zh="你之前保存过生日，直接用吗？" />
              </p>
              <button
                type="button"
                onClick={() => setFriend(saved)}
                className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
              >
                <BiInline en={<>💞 Match as {saved.name}</>} zh={<>💞 用「{saved.name}」配对</>} />
              </button>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-sm font-bold text-[#8a7aa3] underline"
              >
                <BiInline en="I'm someone else" zh="我是别人，重新输入" />
              </button>
            </>
          ) : (
            <>
              <p className="text-center font-bold text-[#6b4f8f]">
                <Bi en="Enter your birthday" zh="输入你的生日" />
              </p>
              <ProfileForm
                submitLabel="💞 Show match score · 看配对分数"
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
              {result.labelEn} · {result.label}
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
          <section
            data-testid="ai-report"
            className="rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.2)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#ffe3ee] px-3 py-1 text-sm font-extrabold text-[#d9507f]">
                {pairText.tag || <BiInline en="Your bond" zh="关系定位" />}
              </span>
              <span className="text-[11px] font-bold text-[#b9aed0]">
                {aiPair.live ? (
                  <BiInline en="✦ AI live" zh="✦ AI 现场生成" />
                ) : aiPair.loading ? (
                  <BiInline en="AI is thinking…" zh="AI 正在想…" />
                ) : (
                  <BiInline en="Preset text" zh="预设文案" />
                )}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-[#f6f1ff] p-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tone === "roast"}
                data-testid="tone-roast"
                onClick={() => setTone("roast")}
                className={`rounded-full px-3 py-2 text-sm font-extrabold transition ${
                  tone === "roast" ? "bg-white text-[#d9507f] shadow" : "text-[#8a7aa3]"
                }`}
              >
                <BiInline en="🔥 Roast mode" zh="🔥 毒舌锐评" />
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tone === "heart"}
                data-testid="tone-heart"
                onClick={() => setTone("heart")}
                className={`rounded-full px-3 py-2 text-sm font-extrabold transition ${
                  tone === "heart" ? "bg-white text-[#2e7d4f] shadow" : "text-[#8a7aa3]"
                }`}
              >
                <BiInline en="💗 Heart mode" zh="💗 走心模式" />
              </button>
            </div>

            <p className="mt-3 text-[15px] leading-relaxed text-[#4a3566]" data-testid="ai-report-text">
              {tone === "roast" ? pairText.roast : pairText.heart}
            </p>
            {pairText.tip && (
              <p className="mt-3 rounded-2xl bg-[#f8f4ff] p-3 text-sm font-bold text-[#6b4f8f]">
                💡 {pairText.tip}
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-center font-extrabold text-[#6b4f8f]">
              <Bi en="Element comparison" zh="五行对比" />
            </h2>
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
                <Bi
                  en="More overlap means you are more alike. Where one is big and the other small, you complete each other."
                  zh={
                    <>
                      两个形状重叠越多，五行越相似；一方多、一方少，就是互补。
                    </>
                  }
                />
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border-4 border-white bg-white p-4 text-sm">
            <h2 className="mb-1 font-extrabold text-[#6b4f8f]">
              <Bi en="📜 Why this score?" zh="📜 为什么是这个分数？" />
            </h2>
            <p>
              <Bi
                en={
                  <>
                    We mainly look at your <b>day master</b>: {inviter.name} is{" "}
                    {ELEMENT_INFO[inviterChart.element].en}, and {friend.name} is{" "}
                    {ELEMENT_INFO[friendChart.element].en}.{" "}
                    {
                      {
                        same: "You share one element and a similar nature, so you understand each other easily.",
                        generate: "One of you naturally supports the other, so the score is high.",
                        control: "Your styles clash, so you argue, but you also grow.",
                      }[elementRelation(inviterChart.element, friendChart.element)]
                    }
                  </>
                }
                zh={
                  <>
                    配对主要看两人的<b>日主</b>：{inviter.name}是{ELEMENT_INFO[inviterChart.element].zh}，{friend.name}是
                    {ELEMENT_INFO[friendChart.element].zh}。
                    {
                      {
                        same: "同一种五行，性格相近，最容易懂对方。",
                        generate: "两者「相生」，一方会自然地支持另一方，所以分数高。",
                        control: "两者「相克」，个性互相碰撞，会吵但也会成长。",
                      }[elementRelation(inviterChart.element, friendChart.element)]
                    }
                  </>
                }
              />
            </p>
            <p className="mt-2 text-xs text-[#8a7aa3]">
              <Bi
                en={
                  <>
                    Generating: Wood → Fire → Earth → Metal → Water → Wood
                    <br />
                    Controlling: Wood → Earth → Water → Fire → Metal → Wood
                  </>
                }
                zh={
                  <>
                    相生 Generating：木→火→土→金→水→木
                    <br />
                    相克 Controlling：木→土→水→火→金→木
                  </>
                }
              />
            </p>
            <p className="mt-1 text-xs text-[#8a7aa3]">
              <Bi
                en="Also, filling each other's missing elements adds points."
                zh="另外，对方补足你缺的五行也会加分。"
              />
            </p>
          </section>
            </>
          ) : (
            <MatchLock
              inviter={inviter}
              friend={friend}
              romantic={result.romantic}
              pair={pair}
              tag={pairText.tag}
              teaser={pairText.teaser}
            />
          )}

          {!viewingShared && <ShareBack inviter={inviter} friend={friend} />}

          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-full bg-[#b48cff] px-6 py-3 text-center font-extrabold text-white shadow-[0_5px_0_#8f66e0]"
            >
              <BiInline en="🎉 Invite my own friends" zh="🎉 我也要邀请朋友" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setFriend(null);
                setShowForm(true);
              }}
              className="text-sm font-bold text-[#8a7aa3] underline"
            >
              <BiInline en="🔁 Try someone else" zh="🔁 换个人配对" />
            </button>
          </div>
        </>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">
        <BiInline en="Just for fun 🎉" zh="仅供娱乐" />
      </p>
    </main>
  );
}
