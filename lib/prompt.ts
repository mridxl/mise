import type { DayInput, EnergyLevel, MealSlot } from "./types";

function energyGuidance(energy: EnergyLevel): string {
  switch (energy) {
    case "quick":
      return "Prioritize minimal prep, shortcuts, and meals under 25 minutes.";
    case "normal":
      return "Balanced meals with moderate prep, roughly 25-45 minutes.";
    case "cook":
      return "Allow longer cooks and more involved recipes when they fit the day.";
  }
}

export function buildPlanPrompt(input: DayInput): string {
  const mealList =
    input.meals.length > 0
      ? input.meals.join(", ")
      : "breakfast, lunch, dinner";
  const pantryList =
    input.pantry.length > 0 ? input.pantry.join(", ") : "none listed";
  const dietaryList =
    input.dietary.length > 0 ? input.dietary.join(", ") : "none";

  return `You are a practical home-cooking planner. Build a single-day food plan as strict JSON matching the provided schema.

Context:
- People to feed: ${input.people}
- Time/energy today: ${input.energy} (${energyGuidance(input.energy)})
- Daily grocery budget cap: ${input.budgetCap} ${input.currency} (estimated prices only)
- Meals needed: ${mealList}
- Already on hand: ${pantryList}
- Dietary constraints (hard rules, never violate): ${dietaryList}

Requirements:
1. Return exactly one meal per requested slot (${mealList}).
2. Consolidate groceries across all meals. Mark items as alreadyHave=true when they clearly match pantry items (case-insensitive partial match is fine).
3. estimatedPrice is a rough unit/total line estimate in ${input.currency} using typical Indian retail/grocery prices. Items with alreadyHave=true should still include a price but they will be excluded from totals client-side.
4. Provide 2-6 substitutions only when useful: missing item swaps, dietary-safe swaps, or cheaper alternatives. costDelta is negative when the replacement saves money.
5. todos should be a short actionable timeline like shop, prep, and cook tasks with optional timeHint (e.g. "12:30").
6. Keep whyToday under 18 words. Steps should be concise and numbered implicitly as plain strings.
7. imageSeed should be a short kebab-case phrase describing the dish for placeholder photography.
8. Use unique stable ids (g1, g2, sub1, todo1, etc.).
9. Aim to keep purchasable groceries at or below ${input.budgetCap} ${input.currency}. If slightly over, include cheaper substitutions.
10. Do not include markdown, commentary, or extra keys. JSON only.`;
}

export function normalizeMeals(
  requested: MealSlot[],
  generated: MealSlot[],
): boolean {
  return requested.every((slot) => generated.includes(slot));
}
