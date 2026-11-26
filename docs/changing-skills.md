# Changing or adding a skill

[Back to the overview](README.md)

1. Edit `skills/<name>/SKILL.md`, or add a new folder with a `SKILL.md`. Longer reference material can go in extra files in the same folder; link to them from `SKILL.md`.
2. Front matter needs `name` (equal to the folder name, lowercase with hyphens) and `description` (what the skill does and "Use when ..."). Agents decide whether to load a skill from the description alone.
3. Write addresses as `https://api.askwith.ai`. Do not invent other placeholders: `readSkill` only replaces that one.
4. Run `npm run check`. It validates every skill (front matter, size under 500 lines, no key-shaped strings) and runs the unit tests.
5. Test a real install from your checkout: `npx skills add ./` in a scratch folder, then ask an agent to list its skills.
6. When you add a skill, add it to the table in the root `README.md` and update the expected list in `index.test.js`.

The AskWithAI server has a test that checks the page names the setup skill mentions (for example "Expert Review" and "Edge cases") still match the app's screens. If you rename a page there, update the skill here too.
