# AskWithAI skills: overview

This repository holds AskWithAI's public agent skills. A skill is a `SKILL.md` file that a coding agent loads when a task matches its description. The idea that matters: **each skill exists once, here**, and every other place reads it from here.

There are two skills today:

- `askwithai`: what AskWithAI is and how to call it (SDK, command, HTTP API, MCP server, statuses, outcomes).
- `askwithai-setup`: a step-by-step runbook for moving an existing app onto AskWithAI.

| Doc | What it covers |
| --- | --- |
| [How the skills reach each consumer](consumers.md) | `npx skills add`, the docs site sync, the AskWithAI server, evaluations, and apps built on AskWithAI |
| [Changing or adding a skill](changing-skills.md) | Writing rules, local checks, and testing an install |
| [Releases](releases.md) | Version tags, npm publishing, and the secrets the workflows need |
