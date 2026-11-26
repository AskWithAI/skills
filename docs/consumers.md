# How the skills reach each consumer

[Back to the overview](README.md)

| Consumer | How it gets the skills |
| --- | --- |
| Anyone with a coding agent | `npx skills add AskWithAI/skills` reads `skills/` from this repository on GitHub. |
| The docs site (docs.askwith.ai) | The **Sync skills to the docs site** workflow copies `skills/` into the docs repository's `.mintlify/skills/` through a pull request on every change. Mintlify then serves them for `npx skills add https://docs.askwith.ai`. Run it by hand with `npm run sync:docs -- <path-to-docs-checkout>`. |
| The AskWithAI server | Depends on `@askwithai/skills`. `/SKILL.md` returns `readSkill("askwithai-setup", { baseUrl })` with the server's own address, and `/.well-known/skills/index.json` lists the skills. |
| Hurdle agent evaluations (in the AskWithAI repository) | The "with-skill" condition loads `skillPath("askwithai")`, so evaluations measure the exact skill customers install. |
| Apps built on AskWithAI (PullUp, Theory, TapTrust, MeetWithAI) | Keep their own product skills in their own repositories. Each product skill points to `AskWithAI/skills` for AskWithAI itself instead of re-explaining it. Code that needs the text depends on `@askwithai/skills`. |

## Why one package rather than copies

Before this repository, the same skill text lived in four places and two different skills shared the name `askwithai`. Copies drift: a renamed page or a changed endpoint was fixed in one copy and not the others. Now a change lands once and reaches every consumer through the package version or the docs sync pull request.
