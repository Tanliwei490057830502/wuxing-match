import type { Metadata } from "next";
import FengshuiClient from "./FengshuiClient";

export const metadata: Metadata = {
  title: "Room photo reading · WuXing Engine",
  description:
    "Take a photo of a room and get indoor layout advice: what to keep, what to change, and one thing to do tonight. 拍照看室内布置，只谈看得见的光线、动线和杂物。",
};

export default function FengshuiPage() {
  return <FengshuiClient />;
}
