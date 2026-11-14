import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SquadRoom from "./SquadRoom";

export const metadata: Metadata = {
  title: "Squad room · 五行小队",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function SquadRoomPage(props: PageProps<"/squad/[code]">) {
  const { code } = await props.params;
  if (!/^\d{4}$/.test(code)) notFound();
  const q = await props.searchParams;
  // ?demo=4 fills the room with demo teammates — handy when presenting alone
  const demo = Math.max(0, Math.min(4, Number(first(q.demo)) || 0));
  return <SquadRoom code={code} demo={demo} />;
}
