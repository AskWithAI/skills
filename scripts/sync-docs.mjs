#!/usr/bin/env node
// Copies every skill into a checkout of the docs site (AskWithAI/docs) at
// .mintlify/skills/<name>/, the folder Mintlify serves for
// `npx skills add https://docs.askwith.ai`. Removes copies of skills that no
// longer exist here. Usage: node scripts/sync-docs.mjs <path-to-docs-checkout>
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { listSkills } from "../index.js";

const docsDir = process.argv[2];
if (!docsDir || !existsSync(join(docsDir, "docs.json"))) {
  console.error("Usage: node scripts/sync-docs.mjs <path-to-docs-checkout> (the folder with docs.json)");
  process.exit(1);
}
const target = resolve(docsDir, ".mintlify/skills");
mkdirSync(target, { recursive: true });
const skills = listSkills();
const names = new Set(skills.map((s) => s.name));
for (const entry of readdirSync(target, { withFileTypes: true })) {
  if (entry.isDirectory() && !names.has(entry.name)) rmSync(join(target, entry.name), { recursive: true });
}
for (const { name, path } of skills) {
  rmSync(join(target, name), { recursive: true, force: true });
  cpSync(path, join(target, name), { recursive: true });
}
console.log(`synced ${skills.length} skills into ${target}`);
