import type { Metadata } from "next";
import { parseGender } from "@/lib/bazi";
import MatchClient from "./MatchClient";

export const metadata: Metadata = {
  title: "Match invite · 五行配对邀请",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default async function MatchPage(props: PageProps<"/match">) {
  const q = await props.searchParams;
  const inviter = {
    name: first(q.n).slice(0, 20),
    gender: parseGender(first(q.g)),
    date: first(q.d),
    hour: first(q.h),
  };
  const friendName = first(q.fn).slice(0, 20);
  const friend =
    friendName && first(q.fd)
      ? { name: friendName, gender: parseGender(first(q.fg)), date: first(q.fd), hour: first(q.fh) }
      : null;
  return <MatchClient inviter={inviter} sharedFriend={friend} />;
}
