import { computeBudget, roundMoney } from "./budget";
import type { DayPlan, GroceryItem, Substitution } from "./types";

function updateGroceryItem(
  item: GroceryItem,
  sub: Substitution,
): GroceryItem {
  if (item.id !== sub.originalItemId || sub.applied) return item;

  return {
    ...item,
    name: sub.replacementName,
    quantity: sub.replacementQuantity,
    estimatedPrice: roundMoney(Math.max(0, item.estimatedPrice + sub.costDelta)),
  };
}

export function applySubstitution(plan: DayPlan, subId: string): DayPlan {
  const sub = plan.substitutions.find((entry) => entry.id === subId);
  if (!sub || sub.applied) return plan;

  const groceries = plan.groceries.map((item) => updateGroceryItem(item, sub));
  const substitutions = plan.substitutions.map((entry) =>
    entry.id === subId ? { ...entry, applied: true } : entry,
  );

  return {
    ...plan,
    groceries,
    substitutions,
    budget: computeBudget(groceries, plan.input.budgetCap),
  };
}

export function applyAllBudgetFixes(plan: DayPlan): DayPlan {
  const candidates = plan.substitutions
    .filter((sub) => !sub.applied && sub.costDelta < 0)
    .sort((a, b) => a.costDelta - b.costDelta);

  let next = plan;
  for (const sub of candidates) {
    if (next.budget.status !== "over") break;
    next = applySubstitution(next, sub.id);
  }

  return next;
}

export function toggleGroceryHave(plan: DayPlan, itemId: string): DayPlan {
  const groceries = plan.groceries.map((item) =>
    item.id === itemId ? { ...item, alreadyHave: !item.alreadyHave } : item,
  );

  return {
    ...plan,
    groceries,
    budget: computeBudget(groceries, plan.input.budgetCap),
  };
}

export function toggleTodo(plan: DayPlan, todoId: string): DayPlan {
  return {
    ...plan,
    todos: plan.todos.map((todo) =>
      todo.id === todoId ? { ...todo, done: !todo.done } : todo,
    ),
  };
}
