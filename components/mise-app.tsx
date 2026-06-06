"use client";

import { ListChecks } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { DayInputForm } from "@/components/day-input-form";
import { GeneratingState } from "@/components/generating-state";
import { PlanResults } from "@/components/plan-results";
import {
  clearSavedPlan,
  loadSavedInput,
  loadSavedPlan,
  saveInput,
  savePlan,
} from "@/lib/storage";
import { formatMoney } from "@/lib/budget";
import type { AppPhase, DayInput, DayPlan } from "@/lib/types";
import { DEFAULT_INPUT, ENERGY_LABELS, MEAL_LABELS } from "@/lib/types";

function getInitialInput(): DayInput {
  return loadSavedInput() ?? DEFAULT_INPUT;
}

function getInitialPlan(): DayPlan | null {
  return loadSavedPlan();
}

function getInitialPhase(): AppPhase {
  return loadSavedPlan() ? "result" : "input";
}

export function MiseApp() {
  const [phase, setPhase] = useState<AppPhase>(getInitialPhase);
  const [input, setInput] = useState<DayInput>(getInitialInput);
  const [plan, setPlan] = useState<DayPlan | null>(getInitialPlan);
  const [error, setError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const generatePlan = useCallback(
    async (payload: DayInput) => {
      setError(null);
      setPhase("generating");
      setEditing(false);
      saveInput(payload);

      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as {
          plan?: DayPlan;
          model?: string;
          error?: string;
        };

        if (!response.ok || !data.plan) {
          throw new Error(data.error ?? "Could not generate a plan.");
        }

        setPlan(data.plan);
        setModelUsed(data.model ?? null);
        savePlan(data.plan);
        setPhase("result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setPhase(plan ? "result" : "input");
      }
    },
    [plan],
  );

  const handleSubmit = () => generatePlan(input);

  const handleReset = () => {
    clearSavedPlan();
    setPlan(null);
    setPhase("input");
    setEditing(false);
    setError(null);
  };

  const showForm = phase === "input" || (phase === "result" && editing);
  const showSummary = phase === "result" && !editing;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 lg:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <ListChecks size={22} weight="bold" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mise
            </h1>
            <p className="text-sm text-zinc-500">Your cooking to-do for today</p>
          </div>
        </div>
        {phase === "result" && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            New day
          </button>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-zinc-200 bg-surface p-5 dark:border-zinc-800">
            <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {showSummary ? "Day context" : "Plan your day"}
            </h2>

            {showForm ? (
              <DayInputForm
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                disabled={phase === "generating"}
              />
            ) : (
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">
                    {input.people}
                  </span>{" "}
                  people
                </p>
                <p>
                  Energy:{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">
                    {ENERGY_LABELS[input.energy]}
                  </span>
                </p>
                <p>
                  Budget cap:{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">
                    {formatMoney(input.budgetCap, input.currency)}
                  </span>
                </p>
                <p>
                  Meals:{" "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">
                    {input.meals.map((slot) => MEAL_LABELS[slot]).join(", ")}
                  </span>
                </p>
                {input.pantry.length > 0 && <p>Pantry: {input.pantry.join(", ")}</p>}
                {input.dietary.length > 0 && <p>Diet: {input.dietary.join(", ")}</p>}
                {modelUsed && (
                  <p className="pt-2 font-mono text-xs text-zinc-500">
                    Model: {modelUsed}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="pt-2 text-left text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                >
                  Edit inputs
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {phase === "input" && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-surface dark:border-zinc-800">
              <div className="relative aspect-[16/7] w-full bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src="https://picsum.photos/seed/mise-fresh-kitchen-greens/1200/525"
                  alt="A spread of fresh ingredients on a kitchen counter"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 768px"
                />
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Plan today around your day
                </h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Set your people, time, and budget on the left. You get meals, a
                  grocery list, smart swaps, and a budget check in one go.
                </p>
              </div>
            </div>
          )}
          {phase === "generating" && <GeneratingState />}
          {phase === "result" && plan && (
            <PlanResults
              plan={plan}
              onPlanChange={(next) => {
                setPlan(next);
                savePlan(next);
              }}
              onRegenerate={handleSubmit}
              isRegenerating={phase === "generating"}
            />
          )}
        </main>
      </div>
    </div>
  );
}
