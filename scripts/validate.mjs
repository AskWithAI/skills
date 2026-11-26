#!/usr/bin/env node
// Checks every skills/<name>/SKILL.md before it ships: front matter, size, and no secrets.
import { readFileSync } from "node:fs";
import { listSkills, parseFrontmatter } from "../index.js";

const SECRET = /(wai_[A-Za-z0-9]{12,}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|pu_tok_[A-Za-z0-9]{8,})/;
const errors = [];
const skills = listSkills();
if (skills.length === 0) errors.push("No skills found in skills/.");
for (const { name, path } of skills) {
  const text = readFileSync(`${path}/SKILL.md`, "utf8");
  const fm = parseFrontmatter(text);
  if (fm.name !== name) errors.push(`${name}: front matter name is "${fm.name ?? ""}", expected the folder name.`);
  if (!fm.description) errors.push(`${name}: description is missing.`);
  else if (fm.description.length > 1024) errors.push(`${name}: description is over 1024 characters.`);
  else if (!/\bUse (when|to)\b/.test(fm.description)) errors.push(`${name}: description should say when to use the skill ("Use when ...").`);
  if (text.split("\n").length > 500) errors.push(`${name}: over 500 lines; split detail into reference files.`);
  if (SECRET.test(text)) errors.push(`${name}: contains something that looks like a real key.`);
}
if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}
console.log(`ok: ${skills.length} skills (${skills.map((s) => s.name).join(", ")})`);
