# Release process (Sec-o-Simple)

Use SemVer tags in the format `vMAJOR.MINOR.PATCH` (for example `v1.2.0`).

## End-to-End Release Steps

1. Sync your local repository with `main`.
   ```bash
   git checkout main
   git pull origin main
   ```

2. Update dependencies and commit the result.
   ```bash
   npm update
   npm install
   ```
   This updates dependency versions where allowed by `package.json` and refreshes `package-lock.json`.

3. Check security issues and decide how to handle findings.
   ```bash
   npm audit
   ```
   If fixes are available and safe, apply them and re-test:
   ```bash
   npm audit fix
   ```

4. Run quality checks and fix all blocking issues before releasing.
   ```bash
   npm run lint
   npm test
   npm run build
   ```

5. Bump the version in `package.json` to the target release version.

6. Commit the release preparation changes (version bump, lockfile changes, and any fixes).
   ```bash
   git add package.json package-lock.json
   git commit -m "Prepare release vX.Y.Z"
   ```

7. Create and push an **annotated** tag.
   ```bash
   git tag -a vX.Y.Z -m "Sec-o-Simple vX.Y.Z: short summary"
   git push origin main
   git push origin vX.Y.Z
   ```

8. Wait for [release.yml](./.github/workflows/release.yml) to run.
   The workflow generates release notes and creates the GitHub release as a **draft**.

9. Open the draft release in GitHub and review everything manually.
   Check generated notes, included commits, and attached artifacts.

10. Publish the draft release manually when verification is complete.