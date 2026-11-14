"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import CharacterAvatar from "@/components/CharacterAvatar";
import { Bi, BiInline } from "@/components/Bi";
import ProfileForm from "@/components/ProfileForm";
import QrCode from "@/components/QrCode";
import SquadRadar from "@/components/SquadRadar";
import { useAiText } from "@/lib/aiClient";
import { ELEMENTS, ELEMENT_INFO, computeChart, type Element } from "@/lib/bazi";
import type { AiSquad } from "@/lib/aiShared";
import {
  SQUAD_COMPLETE,
  SQUAD_COMPLETE_ADVICE,
  SQUAD_MISSING,
  SQUAD_MULTI_MISSING,
  SQUAD_ROLES,
  SQUAD_SAME,
} from "@/lib/copy";
import { fetchRoom, joinRoom, leaveRoom, squadUrl, type SquadMember } from "@/lib/squad";
import { deviceId } from "@/lib/device";
import { saveProfile, useOrigin, useSavedProfile } from "@/lib/useClientValues";

const EMPTY_SQUAD: AiSquad = { title: "", badge: "✨", headline: "", advice: [], roles: [] };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function mockMember(i: number): SquadMember {
  const names = ["小林", "Aiman", "Ziqi", "Nurul", "Bryan"];
  const y = 2000 + (i % 6);
  const m = 1 + ((i * 5) % 12);
  const d = 1 + ((i * 7) % 28);
  return {
    id: `mock-${i}`,
    name: names[i % names.length],
    date: `${y}-${pad(m)}-${pad(d)}`,
    hour: String((i * 3) % 12),
    gender: i % 2 === 0 ? "f" : "m",
    t: 0,
  };
}

export default function SquadRoom({ code, demo = 0 }: { code: string; demo?: number }) {
  const profile = useSavedProfile();
  const origin = useOrigin();
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [mock, setMock] = useState<SquadMember[]>(() =>
    Array.from({ length: Math.max(0, Math.min(4, demo)) }, (_, i) => mockMember(i)),
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const idRef = useRef("");
  const joinedRef = useRef(false);

  const link = origin ? squadUrl(origin, code) : "";

  // join once with the saved profile
  useEffect(() => {
    if (!profile || joinedRef.current) return;
    const key = `wuxing-squad-${code}`;
    let id = "";
    try {
      id = localStorage.getItem(key) ?? "";
    } catch {
      id = "";
    }
    if (!id) {
      id = deviceId();
      try {
        localStorage.setItem(key, id);
      } catch {
        // ignore
      }
    }
    idRef.current = id;
    joinedRef.current = true;
    joinRoom(code, profile, id).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Could not join the room · 加入房间失败");
    });
  }, [code, profile]);

  // poll the room
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const list = await fetchRoom(code);
        if (!cancelled) {
          setMembers(list);
          setError("");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not read the room · 读取房间失败");
      }
    };
    void tick();
    const timer = setInterval(() => void tick(), 2500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [code]);

  const all = useMemo(() => [...members, ...mock], [members, mock]);

  const elements = useMemo(
    () =>
      all
        .map((m) => computeChart({ name: m.name, gender: m.gender === "m" ? "m" : "f", date: m.date, hour: m.hour }))
        .map((c) => c?.element)
        .filter((e): e is Element => Boolean(e)),
    [all],
  );

  const missing = ELEMENTS.filter((el) => !elements.includes(el));
  const complete = all.length >= 5 && missing.length === 0;

  // 英文主体 + 中文小字：AI 写英文，内置文案两边都备好
  const [fallback, fallbackZh] = useMemo<[AiSquad, AiSquad]>(() => {
    const rows = all
      .map((m) => {
        const c = computeChart({ name: m.name, gender: m.gender === "m" ? "m" : "f", date: m.date, hour: m.hour });
        if (!c) return null;
        return { name: m.name, role: SQUAD_ROLES[c.element] };
      })
      .filter((r): r is { name: string; role: (typeof SQUAD_ROLES)[Element] } => r !== null);

    const rolesEn = rows.map((r) => ({ name: r.name, role: r.role.roleEn, why: r.role.whyEn }));
    const rolesZh = rows.map((r) => ({ name: r.name, role: r.role.role, why: r.role.why }));

    if (all.length === 0) return [EMPTY_SQUAD, EMPTY_SQUAD];

    if (complete) {
      return [
        {
          title: SQUAD_COMPLETE.titleEn,
          badge: "🏆",
          headline: SQUAD_COMPLETE.messageEn,
          advice: SQUAD_COMPLETE_ADVICE.map((a) => a.en),
          roles: rolesEn,
        },
        {
          title: SQUAD_COMPLETE.title,
          badge: "🏆",
          headline: SQUAD_COMPLETE.message,
          advice: SQUAD_COMPLETE_ADVICE.map((a) => a.zh),
          roles: rolesZh,
        },
      ];
    }
    if (new Set(elements).size === 1 && elements.length >= 2) {
      return [
        { title: SQUAD_SAME.titleEn, badge: "🪞", headline: SQUAD_SAME.warningEn, advice: [], roles: rolesEn },
        { title: SQUAD_SAME.title, badge: "🪞", headline: SQUAD_SAME.warning, advice: [], roles: rolesZh },
      ];
    }
    if (missing.length === 1) {
      const m = SQUAD_MISSING[missing[0]];
      return [
        { title: m.titleEn, badge: ELEMENT_INFO[missing[0]].emoji, headline: m.warningEn, advice: [], roles: rolesEn },
        { title: m.title, badge: ELEMENT_INFO[missing[0]].emoji, headline: m.warning, advice: [], roles: rolesZh },
      ];
    }
    return [
      {
        title: SQUAD_MULTI_MISSING.titleEn,
        badge: "🧩",
        headline: `${SQUAD_MULTI_MISSING.warningEn} (missing: ${missing.map((m) => ELEMENT_INFO[m].en).join(", ")})`,
        advice: [],
        roles: rolesEn,
      },
      {
        title: SQUAD_MULTI_MISSING.title,
        badge: "🧩",
        headline: `${SQUAD_MULTI_MISSING.warning}（现在缺 ${missing.map((m) => ELEMENT_INFO[m].zh).join("、")}）`,
        advice: [],
        roles: rolesZh,
      },
    ];
  }, [all, complete, elements, missing]);

  const ai = useAiText(
    `squad:${code}:${all.map((m) => m.id).join(",")}`,
    all.length >= 2 ? JSON.stringify({ kind: "squad", members: all.map(({ name, date, hour, gender }) => ({ name, date, hour, gender })) }) : "",
    fallback,
  );
  const squad = ai.data;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center gap-2">
        <Link href="/squad" className="text-sm font-bold text-[#8a7aa3] underline">
          <BiInline en="← Leave" zh="← 退出" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-extrabold text-[#6b4f8f]">
          <Bi
            en={
              <>
                Room{" "}
                <span className="tracking-[0.2em] text-[#ff5c93]" data-testid="room-code">
                  {code}
                </span>
              </>
            }
            zh={
              <>
                房间{" "}
                <span className="tracking-[0.2em] text-[#ff5c93]">{code}</span>
              </>
            }
          />
        </h1>
        <span className="w-10" />
      </header>

      {!profile && (
        <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
          <p className="mb-3 text-center font-bold text-[#6b4f8f]">
            <Bi en="Enter your birthday to join this room" zh="输入你的生日，加入这个房间" />
          </p>
          <ProfileForm submitLabel="🚪 Join the room · 加入房间" onSubmit={(p) => saveProfile(p)} />
        </section>
      )}

      {!profile && (
        <p className="text-center text-xs text-[#8a7aa3]">
          <Bi en="Already joined? The room updates by itself." zh="已经加入？房间会自动更新。" />
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-xs font-bold text-[#c0392b]" data-testid="room-error">
          {error}
          <span className="mt-1 block font-normal opacity-80">
            <Bi
              en="This room uses Firebase Realtime Database. On first use, paste database.rules.json into the Firebase console (steps are in the README)."
              zh="房间用 Firebase 实时数据库。第一次用需要把 database.rules.json 贴进 Firebase 控制台（README 有步骤）。"
            />
          </span>
        </p>
      )}

      <section className="rounded-[2rem] border-4 border-white bg-white p-4 shadow-[0_8px_24px_rgba(155,140,255,0.2)]">
        <div className="flex flex-col items-center gap-2">
          <SquadRadar elements={elements} />
          <p className="text-center text-sm font-extrabold text-[#6b4f8f]">
            {all.length === 0 ? (
              <BiInline en="Waiting for friends…" zh="等大家加入…" />
            ) : complete ? (
              <BiInline en="All five elements!" zh="五行齐全！" />
            ) : (
              <BiInline
                en={`Still missing ${missing.length} ${missing.length === 1 ? "element" : "elements"} · ${elements.length}/${all.length} counted`}
                zh={`还缺 ${missing.length} 种五行 · ${elements.length}/${all.length} 人已算`}
              />
            )}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-4 shadow-[0_8px_24px_rgba(255,143,177,0.2)]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-extrabold text-[#6b4f8f]">
            <Bi en="👥 Members" zh="👥 队员" />
          </h2>
          <span className="text-xs font-bold text-[#8a7aa3]">{all.length}/5</span>
        </div>
        <ul className="flex flex-col gap-2" data-testid="member-list">
          {all.map((m) => {
            const c = computeChart({ name: m.name, gender: m.gender === "m" ? "m" : "f", date: m.date, hour: m.hour });
            const info = c ? ELEMENT_INFO[c.element] : null;
            return (
              <li key={m.id} className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5">
                {c ? (
                  <CharacterAvatar index={c.dayMaster} className="h-9 w-auto rounded-lg" />
                ) : (
                  <span className="text-xl">🙂</span>
                )}
                <span className="flex-1 truncate text-sm font-bold text-[#4a3566]">{m.name}</span>
                {info && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-black"
                    style={{ background: info.soft, color: info.color }}
                  >
                    {info.emoji} <BiInline en={info.en} zh={info.zh} />
                  </span>
                )}
                {m.id.startsWith("mock-") && (
                  <span className="text-[10px] text-[#b9aed0]">
                    <BiInline en="Demo" zh="演示" />
                  </span>
                )}
              </li>
            );
          })}
          {Array.from({ length: Math.max(0, Math.min(5, 3) - all.length) }).map((_, i) => (
            <li
              key={`empty-${i}`}
              className="flex items-center justify-center rounded-2xl border-2 border-dashed border-[#e6d7ff] px-2 py-2 text-xs text-[#b9aed0]"
            >
              <BiInline en="Waiting for a friend…" zh="等一位朋友…" />
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="share-room"
            onClick={async () => {
              if (!link) return;
              try {
                if (typeof navigator.share === "function") {
                  await navigator.share({
                    title: "Join my element squad · 加入我的五行小队",
                    text: `Room ${code} — come test your element! 房间号 ${code}，一起来测五行！`,
                    url: link,
                  });
                  return;
                }
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                // cancelled
              }
            }}
            className="flex-1 rounded-full bg-[#25d366] px-4 py-2 text-sm font-extrabold text-white"
          >
            {copied ? (
              <BiInline en="✅ Copied" zh="✅ 已复制" />
            ) : (
              <BiInline en="💬 Share to the group" zh="💬 甩进群" />
            )}
          </button>
          <button
            type="button"
            data-testid="mock-join"
            onClick={() => setMock((m) => [...m, mockMember(m.length)])}            disabled={all.length >= 5}
            className="rounded-full border-2 border-dashed border-[#d9cfe6] px-3 py-2 text-xs font-bold text-[#8a7aa3] disabled:opacity-40"
          >
            <BiInline en="🧪 Add a demo teammate" zh="🧪 模拟队友" />
          </button>
        </div>
      </section>

      <section
        data-testid="squad-diagnosis"
        className={`rounded-[2rem] border-4 p-5 shadow-[0_8px_24px_rgba(155,140,255,0.25)] ${
          complete
            ? "border-[#ffe9a8] bg-gradient-to-br from-[#fff6d8] via-[#ffe9c2] to-[#ffd9a8]"
            : "border-white bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-3xl">{squad.badge}</p>
            <h2 className="mt-1 text-xl font-black text-[#4a3566]" data-testid="squad-title">
              {squad.title ? (
                <Bi en={squad.title} zh={fallbackZh.title} />
              ) : all.length < 2 ? (
                <BiInline en="No diagnosis yet" zh="还没开始诊断" />
              ) : (
                <BiInline en="Diagnosing…" zh="诊断中…" />
              )}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#b9aed0]">
            {ai.live ? (
              <BiInline en="✦ AI team read" zh="✦ AI 团队推演" />
            ) : ai.loading ? (
              <BiInline en="AI is working…" zh="AI 正在推演…" />
            ) : (
              <BiInline en="Preset diagnosis" zh="预设诊断" />
            )}
          </span>
        </div>
        <div className="mt-2 text-sm leading-relaxed text-[#4a3566]">
          <Bi en={squad.headline} zh={fallbackZh.headline} className="text-sm leading-relaxed" />
        </div>
        {squad.advice.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {squad.advice.map((a, i) => (
              <li key={a} className="rounded-xl bg-white/70 px-3 py-1.5">
                · <BiInline en={a} zh={fallbackZh.advice[i]} />
              </li>
            ))}
          </ul>
        )}
        {complete && squad.roles.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white/80 p-3">
            <p className="mb-1 text-xs font-black text-[#b8860b]">
              <Bi en="👑 Suggested team roles" zh="团队分工建议" />
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {squad.roles.map((r) => {
                const zh = fallbackZh.roles.find((x) => x.name === r.name);
                return (
                  <li key={r.name + r.role}>
                    <b>{r.name}</b> → <BiInline en={r.role} zh={zh?.role} />
                    {r.why ? (
                      <span className="block text-[#8a7aa3]">
                        <BiInline en={r.why} zh={zh?.why} />
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-2 rounded-[2rem] border-4 border-white bg-white p-4 text-center">
        <p className="text-sm font-extrabold text-[#6b4f8f]">
          <Bi en="📱 Group QR code · Scan to join" zh="📱 群二维码 · 扫码进队" />
        </p>
        {link && <QrCode value={link} />}
        <p className="text-xs text-[#8a7aa3]">
          <Bi en={<>Room {code} · Best with 3–5 people</>} zh={<>房间号 {code} · 3–5 人最好玩</>} />
        </p>
      </section>

      {profile && (
        <button
          type="button"
          onClick={() => {
            if (idRef.current) void leaveRoom(code, idRef.current).catch(() => {});
          }}
          className="text-center text-xs font-bold text-[#b9aed0] underline"
        >
          <BiInline en="Leave the room" zh="离开房间" />
        </button>
      )}

      <p className="text-center text-xs text-[#b9aed0]">
        <BiInline en="Just for fun 🎉" zh="仅供娱乐" />
      </p>
    </main>
  );
}
