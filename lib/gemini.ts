import { GoogleGenAI, Type } from "@google/genai";

export const GEMINI_MODELS = {
  quality: "gemini-3.5-flash",
  fast: "gemini-3.1-flash-lite",
} as const;

export type GeminiTier = keyof typeof GEMINI_MODELS;

export function getGeminiModel(): string {
  const tier = process.env.GEMINI_MODEL_TIER as GeminiTier | undefined;
  if (tier && tier in GEMINI_MODELS) {
    return GEMINI_MODELS[tier];
  }
  return process.env.GEMINI_MODEL ?? GEMINI_MODELS.fast;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export const planResponseSchema = {
  type: Type.OBJECT,
  properties: {
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          slot: { type: Type.STRING, enum: ["breakfast", "lunch", "dinner"] },
          dishName: { type: Type.STRING },
          cookMinutes: { type: Type.NUMBER },
          servings: { type: Type.NUMBER },
          whyToday: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          imageSeed: { type: Type.STRING },
        },
        required: [
          "slot",
          "dishName",
          "cookMinutes",
          "servings",
          "whyToday",
          "steps",
          "imageSeed",
        ],
      },
    },
    groceries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          aisle: {
            type: Type.STRING,
            enum: ["produce", "protein", "pantry", "dairy", "other"],
          },
          estimatedPrice: { type: Type.NUMBER },
          alreadyHave: { type: Type.BOOLEAN },
          mealSlots: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              enum: ["breakfast", "lunch", "dinner"],
            },
          },
        },
        required: [
          "id",
          "name",
          "quantity",
          "aisle",
          "estimatedPrice",
          "alreadyHave",
          "mealSlots",
        ],
      },
    },
    substitutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          originalItemId: { type: Type.STRING },
          originalName: { type: Type.STRING },
          replacementName: { type: Type.STRING },
          replacementQuantity: { type: Type.STRING },
          reason: {
            type: Type.STRING,
            enum: ["missing", "dietary", "cheaper"],
          },
          costDelta: { type: Type.NUMBER },
          caveat: { type: Type.STRING },
        },
        required: [
          "id",
          "originalItemId",
          "originalName",
          "replacementName",
          "replacementQuantity",
          "reason",
          "costDelta",
          "caveat",
        ],
      },
    },
    todos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          timeHint: { type: Type.STRING },
        },
        required: ["id", "label"],
      },
    },
  },
  required: ["meals", "groceries", "substitutions", "todos"],
};
