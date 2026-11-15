"use client";

// 五行小队房间 · Squad rooms (Firebase Realtime Database over REST, no SDK).
// A room is just: rooms/{4-digit code} = { meta, members }.
// The page polls every few seconds — simple and reliable on stage.

import { DATABASE_URL, firebaseReady } from "@/lib/firebase";
import type { Profile } from "@/lib/bazi";

export type SquadMember = {
  id: string;
  name: string;
  date: string;
  hour: string;
  gender: string;
  t: number;
};

export const MAX_MEMBERS = 5;

function assertReady() {
  if (!firebaseReady) throw new Error("没有配置 Firebase · Firebase is not configured");
}

async function db(path: string, init?: RequestInit) {
  assertReady();
  const res = await fetch(`${DATABASE_URL}/${path}`, { ...init, cache: "no-store" });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("房间数据库没有权限 · Room rules not published yet");
    throw new Error(`firebase ${res.status}`);
  }
  return res.json() as Promise<unknown>;
}

export function validCode(code: string) {
  return /^\d{4}$/.test(code);
}

/** A free 4-digit code. Retries a few times if the number is taken. */
export async function createRoom(host: string): Promise<string> {
  // 不能先「读」一个空房间来判断号有没有被占：规则里没有数据的路径读是会被拒的。
  // 直接 PUT meta（规则只允许在不存在时创建），被占就换一个号。
  for (let i = 0; i < 12; i++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    try {
      await db(`rooms/${code}/meta.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.slice(0, 20), createdAt: { ".sv": "timestamp" } }),
      });
      return code;
    } catch {
      // 这个号已经被占了（或者网络抖了一下），换下一个
    }
  }
  throw new Error("生成房间号失败，请再试一次 · Could not create a room");
}

export async function roomExists(code: string) {
  try {
    const meta = await db(`rooms/${code}/meta.json`);
    return meta !== null;
  } catch {
    // 空房间在规则里是不可读的，按「不存在」处理
    return false;
  }
}

export async function joinRoom(code: string, profile: Profile, id: string): Promise<void> {
  await db(`rooms/${code}/members/${id}.json`, {
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

export async function fetchRoom(code: string): Promise<SquadMember[]> {
  const data = (await db(`rooms/${code}/members.json`)) as Record<string, Omit<SquadMember, "id">> | null;
  if (!data) return [];
  return Object.entries(data).map(([id, m]) => ({ id, ...m }));
}

export async function leaveRoom(code: string, id: string) {
  await db(`rooms/${code}/members/${id}.json`, { method: "DELETE" });
}

export function squadUrl(origin: string, code: string) {
  return `${origin}/squad/${code}`;
}
