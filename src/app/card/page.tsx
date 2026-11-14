import type { Metadata } from "next";
import { computeChart, parseGender, type Profile } from "@/lib/bazi";
import CardClient from "./CardClient";

export const metadata: Metadata = {
  title: "日柱人设卡 · Persona card",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function CardPage(props: PageProps<"/card">) {
  const q = await props.searchParams;
  const name = first(q.n).slice(0, 20);
  const date = first(q.d);
  const hour = /^\d{1,2}$/.test(first(q.h)) ? first(q.h) : "";
  const gender = parseGender(first(q.g));

  const candidate: Profile = { name, gender, date, hour };
  const preview: Profile | null =
    name && /^\d{4}-\d{2}-\d{2}$/.test(date) && computeChart(candidate) ? candidate : null;

  return <CardClient preview={preview} />;
}
