// POST /api/ai — the only place the model key is used.
// The browser never sees the key. Every response is already validated to the
// shape the page renders, and a failure just means "keep the built-in copy".

import { aiConfig, generate } from "@/lib/aiServer";
import type { AiKind, AiRequest, AiResponse } from "@/lib/aiShared";

export const maxDuration = 30;

const KINDS: AiKind[] = ["persona", "pair", "squad", "daily"];

export async function GET() {
  return Response.json({ ready: aiConfig() !== null });
}

type AnyProfile = { name?: unknown; gender?: unknown; date?: unknown; hour?: unknown };

function profile(v: unknown) {
  if (!v || typeof v !== "object") return undefined;
  const p = v as AnyProfile;
  if (typeof p.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) return undefined;
  return {
    name: typeof p.name === "string" ? p.name.slice(0, 20) : "",
    gender: p.gender === "m" || p.gender === "f" ? p.gender : "",
    date: p.date,
    hour: typeof p.hour === "string" && /^\d{1,2}$/.test(p.hour) ? p.hour : "",
  };
}

export async function POST(request: Request) {
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
    profile: profile(raw.profile),
    friend: profile(raw.friend),
    members: Array.isArray(raw.members)
      ? raw.members.map(profile).filter((m): m is NonNullable<ReturnType<typeof profile>> => m !== undefined).slice(0, 5)
      : undefined,
    day: typeof raw.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.day) ? raw.day : undefined,
  };

  const { data, error } = await generate(req);
  if (!data) {
    return Response.json({ ok: false, source: "none", error } satisfies AiResponse);
  }
  return Response.json({ ok: true, source: "ai", data } satisfies AiResponse);
}
