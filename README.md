# AskWithAI agent skills

Agent skills for [AskWithAI](https://askwith.ai), the Decision Runtime Platform. They teach coding agents (Claude Code, Codex, Cursor, Windsurf and others) to call AskWithAI Decision Runtimes and to move an app's decisions onto AskWithAI safely.

## Install

```bash
npx skills add AskWithAI/skills
```

The [skills](https://skills.sh) command finds the agents you have installed and lets you choose which ones get the skills. `npx skills add https://docs.askwith.ai` installs the same skills from the docs site.

## Skills

| Skill | Use it to |
| --- | --- |
| [`askwithai`](skills/askwithai/SKILL.md) | Call Decision Runtimes with `@askwithai/sdk`, the `askwithai` command, the Decision API or the MCP server; switch serving modes; report outcomes. |
| [`askwithai-setup`](skills/askwithai-setup/SKILL.md) | Move an existing app's decision-model calls onto AskWithAI, step by step, from parity to shadow to active. |

## Use the skills from code

Apps built on AskWithAI read the skills from the `@askwithai/skills` package instead of keeping copies:

```ts
import { readSkill, skillsIndex } from "@askwithai/skills";

readSkill("askwithai-setup", { baseUrl: "http://localhost:3700" }); // SKILL.md text for another server
```

See [docs/README.md](docs/README.md) for how the skills reach each app, how to change a skill, and how releases work.

## License

MIT
