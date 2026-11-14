import type { Metadata } from "next";
import NameClient from "./NameClient";

export const metadata: Metadata = { title: "名字五格测算 · WuXing Engine" };

function first(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function NamePage(props: PageProps<"/name">) {
  const q = await props.searchParams;
  return (
    <NameClient
      initialSurname={first(q.s).slice(0, 2)}
      initialGiven={first(q.g).slice(0, 20)}
      initialBirth={/^\d{4}-\d{2}-\d{2}$/.test(first(q.d)) ? first(q.d) : ""}
    />
  );
}
