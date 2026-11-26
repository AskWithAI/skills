export declare const DEFAULT_BASE_URL: "https://api.askwith.ai";
export type SkillInfo = { name: string; description: string; path: string };
export declare function parseFrontmatter(markdown: string): { name?: string; description?: string };
export declare function skillPath(name: string): string;
export declare function listSkills(): SkillInfo[];
export declare function readSkill(name: string, options?: { baseUrl?: string }): string;
export declare function skillsIndex(names?: string[]): { skills: Array<{ name: string; description: string; files: string[] }> };
