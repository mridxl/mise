export type EnergyLevel = "quick" | "normal" | "cook";
export type MealSlot = "breakfast" | "lunch" | "dinner";
export type BudgetStatus = "under" | "close" | "over";
export type SubstitutionReason = "missing" | "dietary" | "cheaper";
export type Aisle = "produce" | "protein" | "pantry" | "dairy" | "other";

export interface DayInput {
  people: number;
  energy: EnergyLevel;
  budgetCap: number;
  currency: string;
  meals: MealSlot[];
  pantry: string[];
  dietary: string[];
}

export interface MealPlan {
  slot: MealSlot;
  dishName: string;
  cookMinutes: number;
  servings: number;
  whyToday: string;
  steps: string[];
  imageSeed: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  aisle: Aisle;
  estimatedPrice: number;
  alreadyHave: boolean;
  mealSlots: MealSlot[];
}

export interface Substitution {
  id: string;
  originalItemId: string;
  originalName: string;
  replacementName: string;
  replacementQuantity: string;
  reason: SubstitutionReason;
  costDelta: number;
  caveat: string;
  applied: boolean;
}

export interface TodoTask {
  id: string;
  label: string;
  timeHint?: string;
  done: boolean;
}

export interface BudgetSummary {
  estimatedTotal: number;
  budgetCap: number;
  status: BudgetStatus;
  itemsNeedingPurchase: number;
}

export interface DayPlan {
  id: string;
  input: DayInput;
  meals: MealPlan[];
  groceries: GroceryItem[];
  substitutions: Substitution[];
  todos: TodoTask[];
  budget: BudgetSummary;
  generatedAt: string;
}

export type AppPhase = "input" | "generating" | "result";

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  quick: "Quick",
  normal: "Normal",
  cook: "I'll cook",
};

export const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export const AISLE_LABELS: Record<Aisle, string> = {
  produce: "Produce",
  protein: "Protein",
  pantry: "Pantry",
  dairy: "Dairy",
  other: "Other",
};

export const REASON_LABELS: Record<SubstitutionReason, string> = {
  missing: "Missing",
  dietary: "Dietary",
  cheaper: "Cheaper",
};

export const DEFAULT_INPUT: DayInput = {
  people: 2,
  energy: "normal",
  budgetCap: 800,
  currency: "INR",
  meals: ["breakfast", "lunch", "dinner"],
  pantry: [],
  dietary: [],
};
