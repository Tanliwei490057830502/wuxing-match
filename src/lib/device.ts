"use client";

// 每台设备一个固定 id：配对、房间、大屏都靠它区分「谁是谁」。
export function deviceId(): string {
  try {
    let id = localStorage.getItem("wuxing-device");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      localStorage.setItem("wuxing-device", id);
    }
    return id;
  } catch {
    return "anon-" + Date.now().toString(36);
  }
}
