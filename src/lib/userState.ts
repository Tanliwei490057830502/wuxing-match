"use client";

// Per-device demo state: check-ins, pass, credits, unlocks, referrals.
// Stored in localStorage only — no backend yet (Supabase comes later).

import { useSyncExternalStore } from "react";

export type UserState = {
  checkins: string[]; // YYYY-MM-DD, sorted
  passUntil: string | null; // monthly pass valid through this date (inclusive)
  fortuneCredits: number; // free single-day detailed readings (7-day streak reward)
  matchCredits: number; // free compatibility unlocks (30-day streak reward)
  unlockedFortuneDays: string[];
  unlockedMatches: string[]; // pair keys
  referrals: number; // friends who joined through my link (simulated in demo)
  demoDayOffset: number; // demo only: pretend it's N days later
};

const KEY = "wuxing-user";
const EVENT = "wuxing-user-change";

const EMPTY: UserState = {
  checkins: [],
  passUntil: null,
  fortuneCredits: 0,
  matchCredits: 0,
  unlockedFortuneDays: [],
  unlockedMatches: [],
  referrals: 0,
  demoDayOffset: 0,
};

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

let cacheRaw = "\u0000";
let cacheState: UserState = EMPTY;
function parse(raw: string): UserState {
  if (raw === cacheRaw) return cacheState;
  cacheRaw = raw;
  try {
    cacheState = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<UserState>) } : EMPTY;
  } catch {
    cacheState = EMPTY;
  }
  return cacheState;
}

function load(): UserState {
  return parse(readRaw());
}

function save(next: UserState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useUserState(): UserState {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "");
  return parse(raw);
}

// ---------- dates ----------

export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  return ymd(new Date(y, m - 1, d + n));
}

/** "Today" on this device, shifted by the demo offset */
export function todayOf(s: UserState) {
  return addDays(ymd(new Date()), s.demoDayOffset);
}

/** Consecutive check-in days ending today (or yesterday if not checked in yet today) */
export function streakOf(s: UserState) {
  const set = new Set(s.checkins);
  let day = todayOf(s);
  if (!set.has(day)) day = addDays(day, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

export function hasPass(s: UserState) {
  return s.passUntil !== null && s.passUntil >= todayOf(s);
}

// ---------- actions ----------

export type CheckinResult = { streak: number; reward: string | null };

export function checkIn(): CheckinResult | null {
  const s = load();
  const today = todayOf(s);
  if (s.checkins.includes(today)) return null;
  const next: UserState = { ...s, checkins: [...s.checkins, today].sort() };
  const streak = streakOf(next);
  const rewards: string[] = [];
  if (streak % 7 === 0) {
    next.fortuneCredits += 1;
    rewards.push("🎁 连续 7 天：送你 1 次免费单日详细运势！");
  }
  if (streak % 30 === 0) {
    next.matchCredits += 1;
    rewards.push("💞 连续 30 天：送你 1 次免费配对！");
  }
  save(next);
  return { streak, reward: rewards.length ? rewards.join(" ") : null };
}

export function buyPass() {
  const s = load();
  const start = hasPass(s) && s.passUntil ? addDays(s.passUntil, 1) : todayOf(s);
  save({ ...s, passUntil: addDays(start, 29) });
}

export function unlockFortuneDay(day: string, useCredit: boolean) {
  const s = load();
  if (s.unlockedFortuneDays.includes(day)) return;
  if (useCredit && s.fortuneCredits <= 0) return;
  save({
    ...s,
    fortuneCredits: useCredit ? s.fortuneCredits - 1 : s.fortuneCredits,
    unlockedFortuneDays: [...s.unlockedFortuneDays, day],
  });
}

export type MatchUnlockWay = "pay" | "credit" | "referral";

export function unlockMatch(key: string, way: MatchUnlockWay) {
  const s = load();
  if (s.unlockedMatches.includes(key)) return;
  if (way === "credit" && s.matchCredits <= 0) return;
  if (way === "referral" && s.referrals < 2) return;
  save({
    ...s,
    matchCredits: way === "credit" ? s.matchCredits - 1 : s.matchCredits,
    referrals: way === "referral" ? s.referrals - 2 : s.referrals,
    unlockedMatches: [...s.unlockedMatches, key],
  });
}

// ---------- demo helpers ----------

export function demoAddReferral() {
  const s = load();
  save({ ...s, referrals: s.referrals + 1 });
}

export function demoNextDay() {
  const s = load();
  save({ ...s, demoDayOffset: s.demoDayOffset + 1 });
}

export function demoReset() {
  save({ ...EMPTY });
}
