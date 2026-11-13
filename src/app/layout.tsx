import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "五行配对 · Five Elements Match",
  description: "输入生日看你的五行，再扫码和朋友配对！Find your element and match with friends.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
