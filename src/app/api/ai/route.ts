// POST /api/ai — the only place the model key is used.
// The browser never sees the key. Every response is already validated to the
// shape the page renders, and a failure just means "keep the built-in copy".

import { aiConfig, generate } from "@/lib/aiServer";
import type { AiKind, AiRequest, AiResponse } from "@/lib/aiShared";

export const maxDuration = 60;

const KINDS: AiKind[] = ["persona", "pair", "squad", "daily", "quiz", "fengshui", "homegrid"];

// 每个 IP 每小时最多 200 次：一个人一局最多用 4 次，路演全场共用一条 Wi-Fi 也够；
// 挡住的是脚本刷接口，不是评委。（serverless 每个实例单独计数，所以是「大约」）
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 200;
const hits = new Map<string, { n: number; reset: number }>();

function take(ip: string) {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.reset) {
    hits.set(ip, { n: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (cur.n >= LIMIT) return false;
  cur.n += 1;
  return true;
}

export async function GET() {
  return Response.json({ ready: aiConfig() !== null });
}

type AnyProfile = { name?: unknown; gender?: unknown; date?: unknown; hour?: unknown };

function profile(v: unknown) {
  if (!v || typeof v !== "object") return undefined;
  const p = v as AnyProfile;
  if (typeof p.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) return undefined;
  return {
    // 名字会进提示词：去掉尖括号和控制字符，只留普通文字
    name: typeof p.name === "string" ? p.name.replace(/[<>\u0000-\u001f]/g, "").slice(0, 20) : "",
    gender: p.gender === "m" || p.gender === "f" ? p.gender : "",
    date: p.date,
    hour: typeof p.hour === "string" && /^\d{1,2}$/.test(p.hour) ? p.hour : "",
  };
}

function quiz(v: unknown) {
  if (!v || typeof v !== "object") return undefined;
  const q = v as Record<string, unknown>;
  const stem = Number(q.stem);
  if (!Number.isInteger(stem) || stem < 0 || stem > 9) return undefined;
  const src = (q.percent ?? {}) as Record<string, unknown>;
  const percent: Record<string, number> = {};
  for (const el of ["wood", "fire", "earth", "metal", "water"]) {
    percent[el] = Math.max(0, Math.min(100, Number(src[el]) || 0));
  }
  return { stem, yang: q.yang === true, percent };
}

// 照片只在内存里过一遍：压到 1024px，单张 2MB 以内；fengshui 最多 4 张、homegrid 一间一张最多 6 张。
// 超出就直接拒，别把 4.5MB 的请求体撑爆（Vercel 的硬上限）。
const MAX_IMAGE_CHARS = 2_000_000;

function images(v: unknown, max: number): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const ok = v
    .filter((x): x is string => typeof x === "string")
    .filter((x) => x.length <= MAX_IMAGE_CHARS && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x))
    .slice(0, max);
  return ok.length ? ok : undefined;
}

type Cell = { id: number; room: string; dirZh: string; dirEn: string; star: string };

/** 九宫格里的房间：只留 id / 房间 / 方位 / 星，四个都白名单化，别把奇怪的东西带进提示词 */
function cells(v: unknown): Cell[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: Cell[] = [];
  for (const item of v.slice(0, 6)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = Number(o.id);
    const room = typeof o.room === "string" ? o.room.replace(/[^\w-]/g, "").slice(0, 12) : "";
    const dirZh = typeof o.dirZh === "string" ? o.dirZh.replace(/[^\u4e00-\u9fa5]/g, "").slice(0, 4) : "";
    const dirEn = typeof o.dirEn === "string" ? o.dirEn.replace(/[^A-Za-z ]/g, "").slice(0, 20) : "";
    const star = typeof o.star === "string" ? o.star.replace(/[^\u4e00-\u9fa5]/g, "").slice(0, 4) : "";
    if (!Number.isInteger(id) || !room || !dirZh || !star) continue;
    out.push({ id, room, dirZh, dirEn, star });
  }
  return out.length ? out : undefined;
}

export async function POST(request: Request) {
  // 只接受同源调用，别让别人的网站拿我们的额度
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? "";
  if (origin) {
    let same = false;
    try {
      same = new URL(origin).host === host;
    } catch {
      same = false;
    }
    if (!same) {
      return Response.json({ ok: false, source: "none", error: "cross-origin" } satisfies AiResponse, {
        status: 403,
      });
    }
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!take(ip)) {
    return Response.json({ ok: false, source: "none", error: "rate-limited" } satisfies AiResponse, {
      status: 429,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, source: "none", error: "bad-json" } satisfies AiResponse, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const kind = KINDS.find((k) => k === raw.kind);
  if (!kind) {
    return Response.json({ ok: false, source: "none", error: "bad-kind" } satisfies AiResponse, { status: 400 });
  }

  const req: AiRequest = {
    kind,
    room: typeof raw.room === "string" ? raw.room.replace(/[^\w-]/g, "").slice(0, 20) : undefined,
    images: kind === "fengshui" ? images(raw.images, 4) : kind === "homegrid" ? images(raw.images, 6) : undefined,
    cells: kind === "homegrid" ? cells(raw.cells) : undefined,
    profile: profile(raw.profile),
    friend: profile(raw.friend),
    members: Array.isArray(raw.members)
      ? raw.members.map(profile).filter((m): m is NonNullable<ReturnType<typeof profile>> => m !== undefined).slice(0, 5)
      : undefined,
    day: typeof raw.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.day) ? raw.day : undefined,
    quiz: quiz(raw.quiz),
  };

  const { data, error } = await generate(req);
  if (!data) {
    return Response.json({ ok: false, source: "none", error } satisfies AiResponse);
  }
  return Response.json({ ok: true, source: "ai", data } satisfies AiResponse);
}
