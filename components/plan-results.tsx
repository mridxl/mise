"use client";

import {
  ArrowsClockwise,
  CaretDown,
  Check,
  Clock,
  ForkKnife,
  ShoppingCart,
  Swap,
  Users,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import {
  applyAllBudgetFixes,
  applySubstitution,
  toggleGroceryHave,
  toggleTodo,
} from "@/lib/substitutions";
import { budgetStatusLabel, formatMoney } from "@/lib/budget";
import type { DayPlan } from "@/lib/types";
import {
  AISLE_LABELS,
  ENERGY_LABELS,
  MEAL_LABELS,
  REASON_LABELS,
} from "@/lib/types";

interface PlanResultsProps {
  plan: DayPlan;
  onPlanChange: (plan: DayPlan) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

type Status = DayPlan["budget"]["status"];

const STATUS_BAR: Record<Status, string> = {
  under: "bg-emerald-600",
  close: "bg-amber-500",
  over: "bg-rose-500",
};

const STATUS_TEXT: Record<Status, string> = {
  under: "text-emerald-700 dark:text-emerald-400",
  close: "text-amber-700 dark:text-amber-400",
  over: "text-rose-700 dark:text-rose-400",
};

function BudgetMeter({
  plan,
  onPlanChange,
}: {
  plan: DayPlan;
  onPlanChange: (plan: DayPlan) => void;
}) {
  const { estimatedTotal, budgetCap, status, itemsNeedingPurchase } =
    plan.budget;
  const currency = plan.input.currency;
  const pct = budgetCap > 0 ? Math.min(100, (estimatedTotal / budgetCap) * 100) : 0;
  const savingsSubs = plan.substitutions.filter(
    (sub) => !sub.applied && sub.costDelta < 0,
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-zinc-800">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-zinc-500">Estimated spend</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatMoney(estimatedTotal, currency)}
          </p>
        </div>
        <p className="text-right text-sm text-zinc-500">
          <span className={`font-semibold ${STATUS_TEXT[status]}`}>
            {budgetStatusLabel(status)}
          </span>
          <br />
          of {formatMoney(budgetCap, currency)} cap
        </p>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`meter-bar h-full rounded-full ${STATUS_BAR[status]}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {itemsNeedingPurchase} items to buy. Prices are estimates.
      </p>

      {status === "over" && savingsSubs.length > 0 && (
        <button
          type="button"
          onClick={() => onPlanChange(applyAllBudgetFixes(plan))}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
        >
          <Swap size={16} weight="bold" />
          Apply swaps to fit budget
        </button>
      )}
    </div>
  );
}

function MealCard({ meal }: { meal: DayPlan["meals"][number] }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-surface transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
      <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={`https://picsum.photos/seed/${encodeURIComponent(meal.imageSeed)}/800/450`}
          alt={meal.dishName}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 640px"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {MEAL_LABELS[meal.slot]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {meal.dishName}
        </h3>
        <div className="mt-1.5 flex items-center gap-4 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {meal.cookMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={14} />
            {meal.servings} servings
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {meal.whyToday}
        </p>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
          aria-expanded={open}
        >
          {open ? "Hide steps" : "Show steps"}
          <CaretDown
            size={14}
            weight="bold"
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ol className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {meal.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}

export function PlanResults({
  plan,
  onPlanChange,
  onRegenerate,
  isRegenerating,
}: PlanResultsProps) {
  const currency = plan.input.currency;

  const groupedGroceries = plan.groceries.reduce<
    Record<string, typeof plan.groceries>
  >((acc, item) => {
    if (!acc[item.aisle]) acc[item.aisle] = [];
    acc[item.aisle].push(item);
    return acc;
  }, {});

  const pendingSubs = plan.substitutions.filter((sub) => !sub.applied);
  const doneTodos = plan.todos.filter((todo) => todo.done).length;

  return (
    <div className="space-y-6">
      <div className="reveal" style={{ "--reveal-index": 0 } as React.CSSProperties}>
        <BudgetMeter plan={plan} onPlanChange={onPlanChange} />
      </div>

      <section
        className="reveal rounded-2xl border border-zinc-200 bg-surface p-5 dark:border-zinc-800"
        style={{ "--reveal-index": 1 } as React.CSSProperties}
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Today&apos;s checklist
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {doneTodos} of {plan.todos.length} done · {plan.input.people} people ·{" "}
              {ENERGY_LABELS[plan.input.energy]} day
            </p>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <ArrowsClockwise
              size={16}
              className={isRegenerating ? "animate-spin" : undefined}
            />
            Regenerate
          </button>
        </div>
        <ul className="space-y-1">
          {plan.todos.map((todo) => (
            <li key={todo.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => onPlanChange(toggleTodo(plan, todo.id))}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600 dark:border-zinc-600"
                />
                <span
                  className={`text-sm ${todo.done ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-200"}`}
                >
                  {todo.label}
                  {todo.timeHint ? (
                    <span className="ml-2 font-mono text-xs text-zinc-500">
                      {todo.timeHint}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="reveal space-y-4"
        style={{ "--reveal-index": 2 } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <ForkKnife size={18} className="text-zinc-500" />
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Meal plan
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {plan.meals.map((meal) => (
            <MealCard key={meal.slot} meal={meal} />
          ))}
        </div>
      </section>

      <section
        className="reveal rounded-2xl border border-zinc-200 bg-surface p-5 dark:border-zinc-800"
        style={{ "--reveal-index": 3 } as React.CSSProperties}
      >
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart size={18} className="text-zinc-500" />
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Grocery list
          </h2>
        </div>
        <div className="space-y-5">
          {Object.entries(groupedGroceries).map(([aisle, items]) => (
            <div key={aisle}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {AISLE_LABELS[aisle as keyof typeof AISLE_LABELS] ?? aisle}
              </h3>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {items.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-center justify-between gap-3 py-2.5">
                      <span className="flex min-w-0 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.alreadyHave}
                          onChange={() =>
                            onPlanChange(toggleGroceryHave(plan, item.id))
                          }
                          className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600 dark:border-zinc-600"
                        />
                        <span
                          className={`text-sm ${item.alreadyHave ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-200"}`}
                        >
                          {item.name}
                          <span className="ml-2 text-zinc-500">
                            {item.quantity}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`shrink-0 font-mono text-xs ${item.alreadyHave ? "text-emerald-700 dark:text-emerald-500" : "text-zinc-500"}`}
                      >
                        {item.alreadyHave
                          ? "have"
                          : formatMoney(item.estimatedPrice, currency)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {pendingSubs.length > 0 && (
        <section
          className="reveal rounded-2xl border border-zinc-200 bg-surface p-5 dark:border-zinc-800"
          style={{ "--reveal-index": 4 } as React.CSSProperties}
        >
          <div className="mb-4 flex items-center gap-2">
            <Swap size={18} className="text-zinc-500" />
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Substitutions
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pendingSubs.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-col rounded-xl border border-zinc-100 p-3.5 dark:border-zinc-800"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {REASON_LABELS[sub.reason]}
                  </span>
                  {sub.costDelta < 0 && (
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      saves {formatMoney(Math.abs(sub.costDelta), currency)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200">
                  <span className="text-zinc-500">{sub.originalName}</span>
                  {" → "}
                  <span className="font-medium">{sub.replacementName}</span>
                  <span className="text-zinc-500">
                    {" "}
                    ({sub.replacementQuantity})
                  </span>
                </p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">
                  {sub.caveat}
                </p>
                <button
                  type="button"
                  onClick={() => onPlanChange(applySubstitution(plan, sub.id))}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  <Check size={13} weight="bold" />
                  Apply swap
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
