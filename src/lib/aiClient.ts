"use client";

// 前端取 AI 文案：先用内置文案秒开，AI 回来再无缝换掉；结果缓存在本机。
// Starts from the built-in copy (instant), swaps in the AI version when it
// arrives, and caches it so repeat visits and demo re-runs are instant.
//
// Call it with a stable cache id and an already-serialised request body:
//   useAiText(`persona:${date}|${hour}`, JSON.stringify({ kind: "persona", profile }), fallback)

import { useEffect, useState } from "react";
import type { AiPayload, AiResponse } from "@/lib/aiShared";

const TTL = 12 * 60 * 60 * 1000; // 12 hours
// 改了提示词就把版本号 +1：旧缓存自动作废，不用让用户清浏览器数据
const CACHE_VERSION = 4;

type Cached = { at: number; data: AiPayload };

function readCache(key: string): AiPayload | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cached;
    if (!c?.data || Date.now() - c.at > TTL) return null;
    return c.data;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: AiPayload) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data } satisfies Cached));
  } catch {
    // storage full / private mode — not important
  }
}

export function useAiText<T extends AiPayload>(
  cacheId: string,
  requestJson: string,
  fallback: T,
): { data: T; live: boolean; loading: boolean } {
  const key = `wuxing-ai:v${CACHE_VERSION}:${cacheId}`;
  // 只在「同一个 key」时才用存下来的结果；key 一换（换了人/重测），立刻回到新兜底
  const [stored, setStored] = useState<{ key: string; data: T; live: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const same = stored !== null && stored.key === key;
  const data = same ? stored.data : fallback;
  const live = same ? stored.live : false;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    void (async () => {
      const cached = readCache(key);
      if (cached) {
        setStored({ key, data: cached as T, live: true });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestJson,
          signal: controller.signal,
        });
        const json = (await res.json()) as AiResponse;
        if (cancelled || !json.ok || !json.data) return;
        setStored({ key, data: json.data as T, live: true });
        writeCache(key, json.data);
      } catch {
        // offline / aborted / no key: keep the built-in copy
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [key, requestJson]);

  return { data, live, loading };
}
