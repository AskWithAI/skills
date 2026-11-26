import { test } from "node:test";
import assert from "node:assert/strict";
import { listSkills, readSkill, skillPath, skillsIndex, DEFAULT_BASE_URL } from "./index.js";

test("lists every skill with a description", () => {
  const skills = listSkills();
  assert.deepEqual(skills.map((s) => s.name), ["askwithai", "askwithai-setup"]);
  for (const s of skills) assert.ok(s.description.length > 20, s.name);
});

test("readSkill keeps the production address by default", () => {
  assert.ok(readSkill("askwithai-setup").includes(`${DEFAULT_BASE_URL}/api/mcp`));
});

test("readSkill points every address at another server", () => {
  const local = readSkill("askwithai-setup", { baseUrl: "http://localhost:3700/" });
  assert.ok(local.includes("http://localhost:3700/api/mcp"));
  assert.ok(!local.includes(DEFAULT_BASE_URL));
});

test("rejects names that are not skills", () => {
  assert.throws(() => skillPath("../index.js"), /Invalid skill name/);
  assert.throws(() => skillPath("missing"), /Unknown skill/);
});

test("skillsIndex matches the discovery format", () => {
  assert.deepEqual(skillsIndex(["askwithai-setup"]).skills.map((s) => [s.name, s.files]), [["askwithai-setup", ["SKILL.md"]]]);
});
