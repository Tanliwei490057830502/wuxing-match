"use client";

// 「对对碰」: two phones knock heads → each phone detects the bump, writes it to
// Firebase with the SERVER time, then looks for another bump within ±WINDOW ms.
// Both phones run the same logic, so each finds the other and shows the same
// (symmetric) score.

import { DATABASE_URL, firebaseReady } from "@/lib/firebase";
import type { Profile } from "@/lib/bazi";
import { parseGender } from "@/lib/bazi";

export const WINDOW_MS = 2000; // two bumps this close in time = the same knock
const LISTEN_MS = 3500; // how long to wait for the other phone's bump

export type BumpEntry = { key: string; n: string; g: string; d: string; h: string; t: number; id: string };

/** Pure matching rule: the closest other device's bump inside the window (or null). */
export function pickPartner(mine: { key: string; t: number; id: string }, entries: BumpEntry[]): BumpEntry | null {
  let best: BumpEntry | null = null;
  for (const e of entries) {
    if (e.key === mine.key || e.id === mine.id) continue;
    const dt = Math.abs(e.t - mine.t);
    if (dt > WINDOW_MS) continue;
    if (!best || dt < Math.abs(best.t - mine.t)) best = e;
  }
  return best;
}

export function entryToProfile(e: BumpEntry): Profile {
  return { name: e.n, gender: parseGender(e.g), date: e.d, hour: e.h ?? "" };
}

/** A per-device id so a phone never matches with itself. */
export function deviceId(): string {
  try {
    let id = localStorage.getItem("wuxing-device");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      localStorage.setItem("wuxing-device", id);
    }
    return id;
  } catch {
    return "anon-" + Date.now().toString(36);
  }
}

async function db(path: string, init?: RequestInit) {
  const res = await fetch(`${DATABASE_URL}/${path}`, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`firebase ${res.status}`);
  return res.json();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Send my bump and wait for a partner. Resolves with the partner, or null if nobody bumped. */
export async function sendBumpAndWait(me: Profile): Promise<Profile | null> {
  if (!firebaseReady) throw new Error("firebase-not-configured");
  const id = deviceId();
  // write my bump with the SERVER timestamp
  const created = (await db("bumps.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ n: me.name, g: me.gender, d: me.date, h: me.hour, t: { ".sv": "timestamp" }, id }),
  })) as { name: string };
  const key = created.name;
  const cleanup = () => {
    setTimeout(() => {
      fetch(`${DATABASE_URL}/bumps/${key}.json`, { method: "DELETE" }).catch(() => {});
    }, 4000);
  };

  try {
    const mineVal = (await db(`bumps/${key}.json`)) as { t: number } | null;
    const t = mineVal?.t ?? Date.now();
    const mine = { key, t, id };
    const q = `bumps.json?orderBy=${encodeURIComponent('"t"')}&startAt=${t - WINDOW_MS}&endAt=${t + WINDOW_MS}`;

    // poll for the other phone's bump
    const deadline = Date.now() + LISTEN_MS;
    let found: BumpEntry | null = null;
    while (Date.now() < deadline) {
      const data = ((await db(q)) ?? {}) as Record<string, Omit<BumpEntry, "key">>;
      const list = Object.entries(data).map(([k, v]) => ({ key: k, ...v }));
      const p = pickPartner(mine, list);
      if (p) {
        if (found) break; // seen twice → settled on the closest
        found = p;
        await sleep(400);
        continue;
      }
      await sleep(400);
    }
    if (found) {
      // re-check once so the closest bump wins
      const data = ((await db(q)) ?? {}) as Record<string, Omit<BumpEntry, "key">>;
      found = pickPartner(mine, Object.entries(data).map(([k, v]) => ({ key: k, ...v }))) ?? found;
    }
    return found ? entryToProfile(found) : null;
  } finally {
    cleanup(); // keeps birthdays out of the database
  }
}

// ---------- motion ----------

const THRESHOLD = 16; // m/s², a firm knock (gravity removed)
const COOLDOWN_MS = 1500;

type IOSMotion = typeof DeviceMotionEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function motionSupported() {
  return typeof window !== "undefined" && "DeviceMotionEvent" in window;
}

/** iPhone needs a permission prompt, triggered from a button tap. */
export async function requestMotionPermission(): Promise<boolean> {
  const M = (typeof DeviceMotionEvent !== "undefined" ? DeviceMotionEvent : undefined) as IOSMotion | undefined;
  if (M && typeof M.requestPermission === "function") {
    try {
      return (await M.requestPermission()) === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

/** Calls onBump when the phone feels a sharp knock. Returns a stop function. */
export function listenForBump(onBump: () => void): () => void {
  let last = 0;
  const handler = (e: DeviceMotionEvent) => {
    let mag: number | null = null;
    const a = e.acceleration;
    if (a && a.x !== null && a.y !== null && a.z !== null) {
      mag = Math.hypot(a.x, a.y, a.z);
    } else {
      const g = e.accelerationIncludingGravity;
      if (g && g.x !== null && g.y !== null && g.z !== null) mag = Math.abs(Math.hypot(g.x, g.y, g.z) - 9.81);
    }
    if (mag === null) return;
    const now = Date.now();
    if (mag > THRESHOLD && now - last > COOLDOWN_MS) {
      last = now;
      onBump();
    }
  };
  window.addEventListener("devicemotion", handler);
  return () => window.removeEventListener("devicemotion", handler);
}
