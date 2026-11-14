"use client";

// 现场破冰模式 · Live event mode.
// Judges scan the big QR, fill in their birthday on the phone, and their
// element card pops up on the projector within a couple of seconds.
// Same Firebase REST pattern as the squad rooms.

import { DATABASE_URL, firebaseReady } from "@/lib/firebase";
import type { Profile } from "@/lib/bazi";

export const STAGE_ROOM = "LIVE";

export type StageEntry = {
  id: string;
  name: string;
  date: string;
  hour: string;
  gender: string;
  t: number;
};

async function db(path: string, init?: RequestInit) {
  if (!firebaseReady) throw new Error("没有配置 Firebase · Firebase is not configured");
  const res = await fetch(`${DATABASE_URL}/${path}`, { ...init, cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("大屏数据库没有权限 · Stage rules not published");
    throw new Error(`firebase ${res.status}`);
  }
  return res.json() as Promise<unknown>;
}

export async function enterStage(room: string, profile: Profile, id: string) {
  await db(`stage/${room}/${id}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: profile.name.slice(0, 20),
      date: profile.date,
      hour: profile.hour,
      gender: profile.gender,
      t: { ".sv": "timestamp" },
    }),
  });
}

export async function fetchStage(room: string): Promise<StageEntry[]> {
  const data = (await db(`stage/${room}.json`)) as Record<string, Omit<StageEntry, "id">> | null;
  if (!data) return [];
  return Object.entries(data)
    .map(([id, e]) => ({ id, ...e }))
    .sort((a, b) => b.t - a.t);
}

export function joinUrl(origin: string, room: string) {
  return `${origin}/event/join?room=${encodeURIComponent(room)}`;
}
