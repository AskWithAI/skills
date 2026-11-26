# AGENTS.md

This repository is the single source of AskWithAI's public agent skills. Everything else (the AskWithAI server's `/SKILL.md`, the docs site, the Hurdle agent evaluations, and apps such as PullUp, Theory and TapTrust) reads the skills from here. Never copy a skill's text into another repository; depend on `@askwithai/skills` instead.

- Each skill is `skills/<name>/SKILL.md`. The front matter `name` must equal the folder name, and the `description` must say when to use the skill.
- Write every address as `https://api.askwith.ai`. `readSkill(name, { baseUrl })` swaps it for other servers, so do not add other placeholders.
- This repository is public: no secrets, customer data, internal hostnames or local file paths.
- Run `npm run check` before committing. Keep the docs in `docs/` current with each change.
