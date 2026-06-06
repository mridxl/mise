"use client";

import {
  Check,
  Minus,
  Plus,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { DayInput, EnergyLevel, MealSlot } from "@/lib/types";
import {
  DEFAULT_INPUT,
  ENERGY_LABELS,
  MEAL_LABELS,
} from "@/lib/types";

const DIETARY_PRESETS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "halal",
];

interface DayInputFormProps {
  value: DayInput;
  onChange: (next: DayInput) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

function TagInput({
  label,
  placeholder,
  tags,
  onChange,
  presets,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  presets?: string[];
}) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const next = raw.trim().toLowerCase();
    if (!next || tags.includes(next)) return;
    onChange([...tags, next]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag(draft);
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-zinc-200 bg-surface px-3 py-2 text-sm text-zinc-900 outline-none ring-emerald-600/25 placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={() => addTag(draft)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Add
        </button>
      </div>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => addTag(preset)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-[0.98] ${
                tags.includes(preset)
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 py-1 pl-3 pr-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((entry) => entry !== tag))}
                className="rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} weight="bold" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DayInputForm({
  value,
  onChange,
  onSubmit,
  disabled,
}: DayInputFormProps) {
  const toggleMeal = (slot: MealSlot) => {
    const has = value.meals.includes(slot);
    const meals = has
      ? value.meals.filter((entry) => entry !== slot)
      : [...value.meals, slot];
    onChange({ ...value, meals: meals.length > 0 ? meals : value.meals });
  };

  const setEnergy = (energy: EnergyLevel) => onChange({ ...value, energy });

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            People to feed
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={value.people <= 1 || disabled}
              onClick={() =>
                onChange({ ...value, people: Math.max(1, value.people - 1) })
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Decrease people"
            >
              <Minus size={16} weight="bold" />
            </button>
            <span className="min-w-[2ch] text-center text-lg font-semibold tabular-nums">
              {value.people}
            </span>
            <button
              type="button"
              disabled={value.people >= 8 || disabled}
              onClick={() =>
                onChange({ ...value, people: Math.min(8, value.people + 1) })
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Increase people"
            >
              <Plus size={16} weight="bold" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="budget"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Daily food budget
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              ₹
            </span>
            <input
              id="budget"
              type="number"
              min={100}
              max={10000}
              step={50}
              value={value.budgetCap}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...value,
                  budgetCap: Number(event.target.value) || DEFAULT_INPUT.budgetCap,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-surface py-2 pl-7 pr-3 text-sm text-zinc-900 outline-none ring-emerald-600/25 focus:border-emerald-600 focus:ring-2 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>
          <p className="text-xs text-zinc-500">Estimated grocery spend for today.</p>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Time and energy today
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ENERGY_LABELS) as EnergyLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              disabled={disabled}
              onClick={() => setEnergy(level)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                value.energy === level
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {ENERGY_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Meals needed
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(MEAL_LABELS) as MealSlot[]).map((slot) => {
            const active = value.meals.includes(slot);
            return (
              <button
                key={slot}
                type="button"
                disabled={disabled}
                onClick={() => toggleMeal(slot)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                  active
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {active && <Check size={14} weight="bold" />}
                {MEAL_LABELS[slot]}
              </button>
            );
          })}
        </div>
      </div>

      <TagInput
        label="Pantry and fridge on hand"
        placeholder="e.g. eggs, rice, olive oil"
        tags={value.pantry}
        onChange={(pantry) => onChange({ ...value, pantry })}
      />

      <TagInput
        label="Diet and dislikes"
        placeholder="Add a constraint"
        tags={value.dietary}
        onChange={(dietary) => onChange({ ...value, dietary })}
        presets={DIETARY_PRESETS}
      />

      <button
        type="submit"
        disabled={disabled || value.meals.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkle size={18} weight="fill" />
        Plan my day
      </button>
    </form>
  );
}
