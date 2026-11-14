import type { Metadata } from "next";
import Home from "./HomeClient";

export const metadata: Metadata = {
  title: "WuXing Engine · 五行引擎",
};

export default async function HomePage(props: PageProps<"/">) {
  const q = await props.searchParams;
  // 从问卷结果点「填生日」回来时，直接落在表单上，不再过一次介绍页
  const autoStart = (Array.isArray(q.start) ? q.start[0] : q.start) === "1";
  return <Home autoStart={autoStart} />;
}
