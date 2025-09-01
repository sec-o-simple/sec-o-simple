# Release process (Sec-o-Simple)

## Prerequisites
- Follow SemVer with `vMAJOR.MINOR.PATCH` tags (e.g., `v1.2.0`).
- Ensure your local `main` is up to date

## Process
Create an **annotated** tag locally:
   ```bash
   git tag -a vX.Y.Z -m "Sec-o-Simple vX.Y.Z: short summary"
   git push origin vX.Y.Z
   ```

## Release Notes
Release Notes are generated automatically by the [release.yml](./github/workflows/release.yml) workflow.