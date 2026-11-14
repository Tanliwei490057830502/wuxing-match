import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WuXing Engine · 五行引擎",
  description:
    "输入生日，生成你的日柱人设卡，扫码和朋友合盘、组五行小队。Your birthday → a collectible persona card, 1v1 matches and squad energy radar.",
};

export const viewport: Viewport = {
  themeColor: "#fff5fb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
