# Release process (Sec-o-Simple)

Use SemVer tags in the format `vMAJOR.MINOR.PATCH` (for example `v1.2.0`).

## End-to-End Release Steps

1. Sync your local repository with `main`.
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create a new branch for the release preparation.
   ```bash
   git checkout -b release/vX.Y.Z
   ```

3. Update dependencies
   ```bash
   npm update
   ```
   This updates dependency versions where allowed by `package.json` and refreshes `package-lock.json`.

4. Check security issues and decide how to handle findings.
   ```bash
   npm audit
   ```
   If fixes are available and safe, apply them and re-test:
   ```bash
   npm audit fix
   ```

5. Bump the version in `package.json` to the target release version. Also run `npm install` to update `package-lock.json`.
   ```bash
   npm install
   ```

6. Run quality checks and fix all blocking issues before releasing.
   ```bash
   npm run lint
   npm test
   npm run test:e2e
   npm run build
   ```
   You will need to modify the following test snapshots:
   - `tests/fixtures/expected-csaf-export-database-import.json`
   - `tests/fixtures/expected-csaf-export.json`
   - `tests/utils/csafExport/__snapshots__/csafExport.test.ts.snap`

7. Commit the release preparation changes (version bump, lockfile changes, and any fixes).
   ```bash
   git add -A
   git commit -m "Prepare release vX.Y.Z"
   ```

8. Push the release preparation branch and create a pull request to `main`.
   ```bash
   git push origin release/vX.Y.Z
   ```
   After the PR is approved and merged, pull the latest `main` to your local repository.
   ```bash
   git checkout main
   git pull origin main
   ```

9. Create and push an **annotated** tag.
   ```bash
   git tag -a vX.Y.Z -m "Sec-o-Simple vX.Y.Z: short summary"
   git push origin vX.Y.Z
   ```

10. Wait for [release.yml](./.github/workflows/release.yml) to run.
   The workflow generates release notes and creates the GitHub release as a **draft**.

11. Open the draft release in GitHub and review everything manually.
    Check generated notes, included commits, and attached artifacts.

12. Publish the draft release manually when verification is complete.