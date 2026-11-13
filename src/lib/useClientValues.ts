"use client";

import { useSyncExternalStore } from "react";
import { type Profile } from "@/lib/bazi";

const STORAGE_KEY = "wuxing-profile";
const EVENT = "wuxing-profile-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Profile | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Profile;
    // Profiles saved before gender existed are ignored, so the visitor re-enters them
    if (
      typeof p.name === "string" &&
      typeof p.date === "string" &&
      typeof p.hour === "string" &&
      (p.gender === "m" || p.gender === "f")
    ) {
      return p;
    }
  } catch {
    // ignore
  }
  return null;
}

/** The visitor's own saved profile on this device (null on the server). */
export function useSavedProfile(): Profile | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return parse(raw);
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

const noop = () => () => {};

/** window.location.origin on the client, "" on the server. */
export function useOrigin(): string {
  return useSyncExternalStore(noop, () => window.location.origin, () => "");
}
