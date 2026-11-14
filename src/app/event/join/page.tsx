import type { Metadata } from "next";
import { STAGE_ROOM } from "@/lib/event";
import JoinClient from "./JoinClient";

export const metadata: Metadata = {
  title: "现场入场 · Live check-in",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function EventJoinPage(props: PageProps<"/event/join">) {
  const q = await props.searchParams;
  const raw = first(q.room);
  const room = /^[A-Za-z0-9]{1,12}$/.test(raw) ? raw : STAGE_ROOM;
  return <JoinClient room={room} />;
}
