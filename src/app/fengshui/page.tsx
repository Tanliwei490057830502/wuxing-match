import type { Metadata } from "next";
import FengshuiTabs from "./FengshuiTabs";

export const metadata: Metadata = {
  title: "Home analysis · 家居分析 · WuXing Engine",
  description:
    "Two ways to read a home: compass + nine-grid eight-house reading, or room photos with indoor layout advice. 罗盘方位八宅，或拍照看室内布置。",
};

export default function FengshuiPage() {
  return <FengshuiTabs />;
}
