# Mise

A single-page AI micro-app that builds a personal cooking to-do list for today: meals, groceries, substitutions, and a budget check, based on how your day actually looks.

## Features

- **Day context input** - people, energy (Quick / Normal / I'll cook), daily budget in INR, meals needed, pantry on hand, dietary constraints
- **Meal plan** - breakfast, lunch, and/or dinner with cook time, servings, steps, and dish images
- **Grocery list** - consolidated by aisle; items you already have are pre-checked
- **Substitutions** - cheaper, missing, or dietary swaps; apply one or auto-fit to budget
- **Budget meter** - estimated spend vs. cap with Under / Close / Over status (prices are estimates)
- **Checklist timeline** - shop, prep, and cook tasks you can tick off
- **Persistence** - last input and plan saved in `localStorage` (no account required)

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Google Gemini](https://ai.google.dev) via `@google/genai` (structured JSON output)
- [Phosphor Icons](https://phosphoricons.com)

## Getting started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) (or npm / yarn)
- A [Gemini API key](https://aistudio.google.com/apikey)

### Install and run

```bash
pnpm install
cp .env.example .env.local
```

Add your API key to `.env.local`, then:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Gemini API key |
| `GEMINI_MODEL_TIER` | No | `fast` (default, gemini-3.1-flash-lite, ~15 rpm) or `quality` (gemini-3.5-flash, ~5 rpm) |
| `GEMINI_MODEL` | No | Override model ID directly (e.g. `gemini-3.5-flash`) |

If you hit rate limits on the quality tier, switch to `GEMINI_MODEL_TIER=fast`.

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm start    # run production build
pnpm lint     # ESLint
```

## Project layout

```
app/
  api/plan/route.ts   # POST - Gemini structured plan generation
  page.tsx            # main page
components/
  mise-app.tsx        # app shell and phase state
  day-input-form.tsx  # input form
  plan-results.tsx    # results (meals, groceries, budget, swaps)
lib/
  types.ts            # shared types
  budget.ts           # budget math and INR formatting
  substitutions.ts    # apply swaps, toggle groceries/todos
  gemini.ts           # model config and JSON schema
  storage.ts          # localStorage helpers
```

## Notes

- Grocery prices are **LLM estimates** in INR (typical Indian retail), not live store data.
- Dietary tags are hard constraints in the prompt; swaps never violate them to hit budget.
- Default daily budget cap is **₹800**; currency is fixed to INR.
