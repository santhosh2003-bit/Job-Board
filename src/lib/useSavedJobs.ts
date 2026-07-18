"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "workwave:saved-jobs";
const EVENT = "workwave:saved-jobs-changed";
const EMPTY: string[] = [];

// Cache the parsed value so getSnapshot returns a stable reference until the
// underlying localStorage string actually changes (required by
// useSyncExternalStore to avoid infinite re-renders).
let cachedRaw: string | null = null;
let cachedValue: string[] = EMPTY;

function getSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedValue = JSON.parse(raw);
    } catch {
      cachedValue = EMPTY;
    }
  }
  return cachedValue;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * Client-side bookmarking backed by localStorage. A custom window event keeps
 * every mounted instance (cards, the saved-count badge) in sync.
 */
export function useSavedJobs() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  return { saved, isSaved, toggle };
}
