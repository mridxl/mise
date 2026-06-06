import { NextResponse } from "next/server";
import { computeBudget } from "@/lib/budget";
import {
  getGeminiClient,
  getGeminiModel,
  planResponseSchema,
} from "@/lib/gemini";
import { buildPlanPrompt } from "@/lib/prompt";
import type { DayInput, DayPlan } from "@/lib/types";

interface RawPlanPayload {
  meals: DayPlan["meals"];
  groceries: Array<
    Omit<DayPlan["groceries"][number], "alreadyHave"> & {
      alreadyHave?: boolean;
    }
  >;
  substitutions: Omit<DayPlan["substitutions"][number], "applied">[];
  todos: Omit<DayPlan["todos"][number], "done">[];
}

function isValidInput(body: unknown): body is DayInput {
  if (!body || typeof body !== "object") return false;
  const input = body as DayInput;
  return (
    typeof input.people === "number" &&
    input.people >= 1 &&
    input.people <= 8 &&
    ["quick", "normal", "cook"].includes(input.energy) &&
    typeof input.budgetCap === "number" &&
    input.budgetCap > 0 &&
    Array.isArray(input.meals) &&
    input.meals.length > 0 &&
    Array.isArray(input.pantry) &&
    Array.isArray(input.dietary)
  );
}

function markPantryMatches(
  groceries: DayPlan["groceries"],
  pantry: string[],
): DayPlan["groceries"] {
  const normalizedPantry = pantry.map((item) => item.trim().toLowerCase());
  return groceries.map((item) => {
    const name = item.name.toLowerCase();
    const matched = normalizedPantry.some(
      (pantryItem) =>
        pantryItem.length > 0 &&
        (name.includes(pantryItem) || pantryItem.includes(name)),
    );
    return { ...item, alreadyHave: item.alreadyHave || matched };
  });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isValidInput(body)) {
      return NextResponse.json(
        { error: "Invalid input. Check people, budget, and meals." },
        { status: 400 },
      );
    }

    const input = body;
    const ai = getGeminiClient();
    const model = getGeminiModel();

    const response = await ai.models.generateContent({
      model,
      contents: buildPlanPrompt(input),
      config: {
        responseMimeType: "application/json",
        responseSchema: planResponseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "Model returned an empty response." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(text) as RawPlanPayload;
    const groceries = markPantryMatches(
      parsed.groceries.map((item) => ({
        ...item,
        estimatedPrice: Number(item.estimatedPrice) || 0,
      })),
      input.pantry,
    );

    const plan: DayPlan = {
      id: crypto.randomUUID(),
      input,
      meals: parsed.meals,
      groceries,
      substitutions: parsed.substitutions.map((sub) => ({
        ...sub,
        costDelta: Number(sub.costDelta) || 0,
        applied: false,
      })),
      todos: parsed.todos.map((todo) => ({ ...todo, done: false })),
      budget: computeBudget(groceries, input.budgetCap),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ plan, model });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate plan.";
    const status = message.includes("GEMINI_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
