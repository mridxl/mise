import type { BudgetStatus, BudgetSummary, GroceryItem } from "./types";

export function computeBudget(
  groceries: GroceryItem[],
  budgetCap: number,
): BudgetSummary {
  const needed = groceries.filter((item) => !item.alreadyHave);
  const estimatedTotal = needed.reduce(
    (sum, item) => sum + item.estimatedPrice,
    0,
  );

  const ratio = budgetCap > 0 ? estimatedTotal / budgetCap : 0;
  let status: BudgetStatus = "under";
  if (ratio > 1) status = "over";
  else if (ratio > 0.9) status = "close";

  return {
    estimatedTotal: roundMoney(estimatedTotal),
    budgetCap,
    status,
    itemsNeedingPurchase: needed.length,
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMoney(value: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function budgetStatusLabel(status: BudgetStatus): string {
  switch (status) {
    case "under":
      return "Under budget";
    case "close":
      return "Close to cap";
    case "over":
      return "Over budget";
  }
}
