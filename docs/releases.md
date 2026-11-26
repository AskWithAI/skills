# Releases

[Back to the overview](README.md)

- `npx skills add AskWithAI/skills` always installs what is on `main`.
- Apps depend on a tagged version. To release: bump `version` in `package.json`, commit, then tag and push (`git tag v0.2.0 && git push origin v0.2.0`). Update each app's dependency to the new tag or npm version.
- The CI workflow publishes `@askwithai/skills` to npm on every `v*` tag. It needs an `NPM_TOKEN` repository secret (an npm automation token with publish access to the `askwithai` scope). Until that secret is set, apps can depend on the tag directly: `"@askwithai/skills": "github:AskWithAI/skills#v0.1.0"`.
- The docs sync workflow needs a `DOCS_SYNC_TOKEN` secret: a fine-grained GitHub token with Contents and Pull requests write access to `AskWithAI/docs`. Without it the workflow skips with a warning.
