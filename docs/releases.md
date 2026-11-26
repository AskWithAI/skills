# Releases

[Back to the overview](README.md)

- `npx skills add AskWithAI/skills` always installs what is on `main`.
- Apps depend on a tagged version. To release: bump `version` in `package.json`, commit, then tag and push (`git tag v0.2.0 && git push origin v0.2.0`). Update each app's dependency to the new tag or npm version.
- The CI workflow publishes `@askwithai/skills` to npm on every `v*` tag through npm trusted publishing: the package's npm settings trust this repository's `ci.yml`, so no npm token is stored. To publish by hand instead, run `npm publish --access public` with npm 11 or later and approve it in the browser.
- The docs sync workflow needs a `DOCS_SYNC_TOKEN` secret: a fine-grained GitHub token with Contents and Pull requests write access to `AskWithAI/docs`. Without it the workflow skips with a warning.
