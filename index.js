import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** The address written into every skill file. readSkill() swaps it for another server's address. */
export const DEFAULT_BASE_URL = "https://api.askwith.ai";

const SKILLS_DIR = fileURLToPath(new URL("./skills/", import.meta.url));
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Read the name and description lines from a SKILL.md front matter block. */
export function parseFrontmatter(markdown) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (kv && (kv[1] === "name" || kv[1] === "description")) fields[kv[1]] = kv[2].trim();
  }
  return fields;
}

/** Absolute path of a skill's folder. Throws for a name that is not a skill in this package. */
export function skillPath(name) {
  if (!NAME.test(name)) throw new Error(`Invalid skill name: ${name}`);
  const dir = join(SKILLS_DIR, name);
  if (!existsSync(join(dir, "SKILL.md"))) throw new Error(`Unknown skill: ${name}`);
  return dir;
}

/** Every skill in this package, sorted by name. */
export function listSkills() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(SKILLS_DIR, entry.name, "SKILL.md")))
    .map((entry) => {
      const { description = "" } = parseFrontmatter(readFileSync(join(SKILLS_DIR, entry.name, "SKILL.md"), "utf8"));
      return { name: entry.name, description, path: join(SKILLS_DIR, entry.name) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * A skill's SKILL.md text. Pass baseUrl (for example http://localhost:3700) to point
 * every API and MCP address in it at another AskWithAI server.
 */
export function readSkill(name, options = {}) {
  const text = readFileSync(join(skillPath(name), "SKILL.md"), "utf8");
  const baseUrl = options.baseUrl?.replace(/\/+$/, "");
  return baseUrl && baseUrl !== DEFAULT_BASE_URL ? text.split(DEFAULT_BASE_URL).join(baseUrl) : text;
}

/** The discovery index served at /.well-known/skills/index.json for `npx skills add <url>`. */
export function skillsIndex(names) {
  const wanted = names ? listSkills().filter((s) => names.includes(s.name)) : listSkills();
  return { skills: wanted.map(({ name, description }) => ({ name, description, files: ["SKILL.md"] })) };
}
