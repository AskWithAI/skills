---
name: askwithai
description: Build, integrate, test, and operate AskWithAI Decision Runtimes using @askwithai/sdk, the askwithai CLI, the Decision API, and the AskWithAI MCP server. Use when adding AskWithAI decision routing to an app or agent, defining mistake costs, switching serving modes (parity, shadow, active), reporting real outcomes, or inspecting receipts.
license: MIT
compatibility: Node.js 22+ for @askwithai/sdk and the askwithai CLI. Works with any HTTP client via the Decision API.
metadata:
  author: AskWithAI
  website: https://docs.askwith.ai
  source: https://github.com/AskWithAI/skills
---

# AskWithAI — Decision Runtime Platform

AskWithAI helps agents and applications make repeated decisions that are accurate, fast, and always improving. Each **Decision Runtime** pairs a fast, calibrated decision model with a plain-code **control plane** that escalates to a reasoning model, a council of diverse models, or human **Expert Review** only when the expected cost of a mistake is higher than the cost of a second opinion.

## Core concepts

- **Decision Runtime**: One repeated decision (for example, `acme/payment-refund`) with its questions, rules, mistake costs, models, versions, and history.
- **Decision API**: `POST /v1/decide/{owner}/{runtime}` — returns typed answers and a plain-language **receipt** (who answered, why, time, and cost).
- **Control plane**: Plain code (never an LLM) that compares expected mistake cost (`chance of being wrong × mistake cost`) against the price of a second opinion.
- **Serving modes**: Adopt safely in three steps — `parity` (return the fast model's answer unchanged), `shadow` (return parity while running routing in the background), and `active` (serve routed answers).
- **Outcomes**: Report what really happened via `POST /v1/decisions/{id}/outcome` or `client.reportOutcome(...)` so future versions learn from real results and pass release checks before going live.

## Install and call with `@askwithai/sdk`

```bash
pnpm add @askwithai/sdk
```

```ts
import { AskWithAI, createDecision, formatReceipt } from "@askwithai/sdk";
import { z } from "zod";

const askwithai = new AskWithAI({
  apiKey: process.env.ASKWITHAI_API_KEY!,
});

const checkRefund = createDecision(askwithai, {
  runtime: "acme/payment-refund",
  schema: z.object({ approve_refund: z.enum(["approve", "deny"]) }),
});

const { answers, decision } = await checkRefund(
  {
    order_id: "ord-10",
    amount: 240,
    item: "27-inch 4K monitor",
    days_since_purchase: 34,
    reason: "Factory defect under 1-year warranty.",
  },
  { idempotencyKey: "ord-10" }
);

console.log(answers.approve_refund);
console.log(formatReceipt(decision).join("\n"));
```

## Common CLI workflows (`askwithai`)

```bash
npx askwithai init
npx askwithai push ./payment-refund --runtime acme/payment-refund
npx askwithai mode acme/payment-refund shadow
npx askwithai mode acme/payment-refund active
npx askwithai decide acme/payment-refund --input '{"order_id":"ord-10","amount":240}'
npx askwithai status acme/payment-refund
npx askwithai outcome <decisionId> --labels '{"approve_refund":"approve"}'
npx askwithai replay --runtime acme/payment-refund --version 2 --against live --since 24h
```

## Decision API (HTTP)

- Make a decision: `POST https://api.askwith.ai/v1/decide/{owner}/{runtime}` with `Authorization: Bearer $ASKWITHAI_API_KEY` and JSON body `{"input": {...}}`.
- Report a real outcome: `POST https://api.askwith.ai/v1/decisions/{id}/outcome` with JSON body `{"labels": {"approve_refund": "approve"}}`.
- MCP server: `https://api.askwith.ai/api/mcp` (Streamable HTTP with `Authorization: Bearer $ASKWITHAI_API_KEY`).

## Decision statuses

- `decided` and `failed` answer 200. Act on `decisions.<question>.answer`.
- `running` (a slower tier is still working), `pending_review` (a person is choosing; treat `provisionalDecision` as provisional), `input_required` (a fact is missing; supply it with `POST /v1/decisions/{id}/input` or the MCP tool `answer_input`) and `paused` answer 202. Poll `GET /v1/decisions/{id}` or wait for the webhook.
- Provider-compatible endpoints (`/v1/systemone`, Gemini Decisions) never wait for a person.

## Connect the MCP server

- Claude Code: `claude mcp add --transport http askwithai https://api.askwith.ai/api/mcp --header "Authorization: Bearer $ASKWITHAI_API_KEY"`
- Codex: `codex mcp add askwithai --url https://api.askwith.ai/api/mcp --bearer-token-env-var ASKWITHAI_API_KEY` (check `codex mcp add --help`; flag names vary by version).
- Tools include list_runtimes, decide, get_decision, list_decisions, runtime_stats, list_reviews, settle_review, answer_input, report_outcome, set_serving_mode, push_package, add_decision_to_test_set, replay_version and check_release_gates.
- Each runtime also serves its own skill: `GET https://api.askwith.ai/v1/runtimes/{owner}/{runtime}/skill.md`.

## Related skill

To move an existing app's decisions onto AskWithAI step by step, use the `askwithai-setup` skill from the same package (`npx skills add AskWithAI/skills`).

## Constraints and best practices

- Never ask a model whether to escalate; routing and release checks are always plain code.
- Only a person's ruling or a real outcome may become a test label — model disagreement is a lead, not a label.
- Keep `ASKWITHAI_API_KEY` on the server; never expose it in client-side browser code or commit it to Git.
- Start in `parity` or `shadow` mode before switching a production runtime to `active`.
- Do not decide these questions yourself when a runtime exists for them: call the runtime and act on its answer.
- Demo-mode answers are marked `synthetic: true` and are never measurements.