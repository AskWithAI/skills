---
name: askwithai-setup
description: Adopt AskWithAI in this repository. Use when the user asks to set up AskWithAI, route an app's decision-model calls through AskWithAI, or move an agent's typed judgments (yes/no, pick one) onto a Decision Runtime with shadow mode, outcomes and reviews.
license: MIT
---

# Set up AskWithAI in this repository

You are helping a developer move their app's decisions onto AskWithAI, the Decision Runtime Platform (https://api.askwith.ai). Work in small steps, show each diff, run the app's tests after each step, and stop for the developer's approval before switching anything that changes answers in production (steps 5 and 6). Never print or commit an API key.

## 0. Before you start

1. Install the general AskWithAI skill if you have not already: `npx skills add AskWithAI/skills`.
2. Find where the app makes typed judgments today. Search for calls to a decision model (`/v1/systemone`, `typesafe`, `jev`, `generativelanguage.googleapis.com` with `/decisions`, `openrouter.ai/api/v1/systemone`) or for an LLM call whose answer is parsed into a fixed set of labels. List each judgment: its question, its labels, the input it reads, and what a wrong answer costs.
3. Ask the developer for an AskWithAI API key (Settings → API keys) and where they keep secrets. Use the environment variables `ASKWITHAI_API_KEY` and `ASKWITHAI_URL` (https://api.askwith.ai, or http://localhost:3700 for a local server). Keys go in a git-ignored env file, never in code.
4. Connect yourself: `claude mcp add --transport http askwithai https://api.askwith.ai/api/mcp --header "Authorization: Bearer $ASKWITHAI_API_KEY"` (Claude Code), or `codex mcp add askwithai --url https://api.askwith.ai/api/mcp --bearer-token-env-var ASKWITHAI_API_KEY` (Codex; check `codex mcp add --help`, as flag names vary by version). The MCP tools mirror the API; the steps below name the HTTP call and the tool.

## 1. Describe the decision as a package

Create `askwithai/runtime.yaml` (`apiVersion: withai/v1`, `kind: DecisionRuntime`, `metadata: { slug, name }`, `spec`) next to the code it serves, with:
- `inputSchema`: JSON Schema of the input; mark numeric or category fields used in costs `retainForRouting: true`.
- `questions`: each judgment as `binary` (two labels, the first means "true"), `pick_one`, or `score` (an ordered numbered scale: `levels` such as [0, 1, 2, 3, 4] with a `legend` per level, and `scoreCosts` with `underScorePerStep` and `overScorePerStep` instead of a full `costMatrix`) (up to 25 questions).
- `signals` and `combine` (recommended for multi-rule policies): fast decision models do not reason through long priority lists. Instead of cramming multi-step rules into `rubrics/fast.md`, define atomic yes/no `signals` (for example `is_blocked`, `is_down`, `is_broken`) and ordered plain-code `combine` rules that map them to the final `question` label. Attach `costMatrix` and outcomes to the final question.
- `costMatrix`: dollars for each wrong answer, as numbers or formulas over input fields (for example `amount * 1.25`). Ask the developer; do not invent costs.
- `tiers`: start with the provider the app already calls as the fast tier (`provider: jev`, `gemini` or `openrouter`), plus a reasoning tier.
- `rubrics/fast.md` and `rubrics/reasoning.md`: the domain instructions, moved out of the code.

Then `npx askwithai push --runtime <owner>/<slug>` (or the `push_package` tool) and `npx askwithai check --runtime <owner>/<slug>`. Set the serving mode to parity: `npx askwithai mode <owner>/<slug> parity` (tool `set_serving_mode`).

## 2. Swap the base address

Change only the provider client's base address and key:
- Jev or any System One client: base address `https://api.askwith.ai/v1/runtimes/<owner>/<slug>`.
- Gemini Decisions: base address `https://api.askwith.ai/v1/runtimes/<owner>/<slug>/gemini`, key as `x-goog-api-key`.
- OpenRouter Decisions: base address `https://api.askwith.ai`, model `<owner>/<slug>`.

In parity mode the answers are the provider's own. Run the app's tests; they should pass unchanged. Every response now has an `AskWithAI-Decision-Id` header.

## 3. Watch in shadow

`npx askwithai mode <owner>/<slug> shadow`. Answers stay the same; AskWithAI also records what routing would have answered. After some traffic, read `GET /v1/runtimes/<owner>/<slug>/stats` (tool `runtime_stats`) and `GET .../decisions?disagree=true` (tool `list_decisions` with `disagree: true`). Summarise agreement, cost and expected loss for the developer.

## 4. Move to the SDK

Install `@askwithai/sdk` (a vendored tarball until it is on npm). Replace the raw client with `createDecision(client, { runtime, schema: z.object({...enums}), escalateIf })`, call `await decision.verify()` at start-up, pass a `traceId`, and add `reportOutcome(decision.id, { labels })` where the app learns what really happened (or configure an outcome connector so a signed webhook reports it). Use `createFauxAskWithAI()` from `@askwithai/sdk/testing` in the app's tests. Keep the app's own policy code: it acts on the typed answers; AskWithAI never acts by itself.

## 5. Go active (ask first)

With the developer's approval: `npx askwithai mode <owner>/<slug> active`. Now some decisions return `pending_review` (a person decides; act on `provisionalDecision` only as the app's policy allows) or `input_required` (supply the fact with `POST /v1/decisions/{id}/input` or the `answer_input` tool when the app or you can find it in the repository). Settle escalations in the AskWithAI Platform (the runtime's Expert Review page) or with `settle_review`. To find where the rules are unclear before going live, use "Stress-test your rules" on the runtime's Edge cases page.

## 6. Improve

When a decision is misclassified, save it with its expected label into a test set (`POST /v1/decisions/{id}/test-case` or the `add_decision_to_test_set` tool), adjust a `combine` rule, atomic `signal`, or rubric, `npx askwithai push` (tool `push_package`), then `npx askwithai replay --runtime <owner>/<slug> --version <new> --since 7d` (tool `replay_version`) and show the changed cases. Check release gates with `check_release_gates` and promote only if the checks pass and the developer agrees.

## Rolling back

Set the serving mode back to `parity`, or point the base address back at the provider. Both are instant and keep every record already made.

## Common errors

- 401 or 403: the key is wrong or lacks a scope (decide, decisions:read, runtimes:write, outcomes:write, reviews).
- 422 `input_schema`: the input does not match `inputSchema`; the message names the field.
- 422 `unknown_question`: a compatible client's question must match a runtime question by key or by its exact instructions.
- `verify()` fails: the schema's enum labels differ from the runtime's labels.
- Replay found no cases: inputs were not retained (`retainInputs: false`); import test cases instead.