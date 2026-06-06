import type { DayInput, DayPlan } from "./types";

const INPUT_KEY = "mise-last-input";
const PLAN_KEY = "mise-last-plan";

export function loadSavedInput(): DayInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(INPUT_KEY);
    return raw ? (JSON.parse(raw) as DayInput) : null;
  } catch {
    return null;
  }
}

export function saveInput(input: DayInput): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INPUT_KEY, JSON.stringify(input));
}

export function loadSavedPlan(): DayPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as DayPlan) : null;
  } catch {
    return null;
  }
}

export function savePlan(plan: DayPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function clearSavedPlan(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAN_KEY);
}
