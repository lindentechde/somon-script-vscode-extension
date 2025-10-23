# Version Bumping Guide

This project includes both manual and automated version bumping capabilities.

## Manual Version Bumping

You can manually bump the version using the following npm scripts:

### Standard Releases

```bash
# Bump patch version (0.1.0 -> 0.1.1)
npm run version:patch

# Bump minor version (0.1.0 -> 0.2.0)
npm run version:minor

# Bump major version (0.1.0 -> 1.0.0)
npm run version:major
```

### Pre-releases

```bash
# Bump to prepatch (0.1.0 -> 0.1.1-0)
npm run version:prepatch

# Bump to preminor (0.1.0 -> 0.2.0-0)
npm run version:preminor

# Bump to premajor (0.1.0 -> 1.0.0-0)
npm run version:premajor

# Bump prerelease (0.1.1-0 -> 0.1.1-1)
npm run version:prerelease
```

## VSIX Package Generation

After bumping the version, you can create a VSIX package for distribution:

```bash
# Generate VSIX package (e.g., somonscript-0.3.1.vsix)
npm run package

# Generate pre-release VSIX package
npm run package:pre-release
```

The generated `.vsix` file can be:
- Published to the [VS Code Marketplace](https://marketplace.visualstudio.com/)
- Installed manually via `code --install-extension somonscript-X.Y.Z.vsix`
- Shared with users for testing

## Automated Version Bumping (GitHub Actions)

The project includes automated version bumping as part of the CI/CD pipeline. Version bumping happens **after all tests pass successfully**.

### How It Works

The version bump runs as the **final job** in the CI workflow, only after the `test` and `lint` jobs complete successfully. It determines the version bump type based on:

1. **PR Labels** (highest priority):
   - `major` label → major version bump
   - `minor` label → minor version bump
   - `patch` label → patch version bump

2. **Conventional Commit Prefixes** in PR title:
   - `feat!:` or `feature!:` → major version bump (breaking change)
   - `feat:` or `feature:` → minor version bump (new feature)
   - `fix:`, `bugfix:`, `perf:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:` → patch version bump

3. **Default**: If no label or conventional commit prefix is found, defaults to patch bump

### What the Workflow Does

When you open or update a PR targeting `main` or `master`, the CI pipeline:

1. Runs the `build` job
2. Runs the `lint` and `test` jobs in parallel
3. **Only if tests pass**, runs the `version-bump` job which:
   - Checks if version was already bumped (to avoid duplicates)
   - Bumps the version in `package.json`
   - Commits the version change to your PR branch: `chore: bump version to X.Y.Z [skip ci]`
   - Comments on the PR: "🎉 Version bumped to X.Y.Z after tests passed successfully!"

The version bump is **part of the PR** and only happens if all tests pass. No PAT or special permissions needed!

### Examples

**Using Labels:**
- PR with `minor` label → bumps from 0.1.0 to 0.2.0

**Using Conventional Commits:**
- PR title: `feat: Add new language feature` → bumps from 0.1.0 to 0.2.0
- PR title: `fix: Resolve syntax highlighting bug` → bumps from 0.1.0 to 0.1.1
- PR title: `feat!: Breaking API changes` → bumps from 0.1.0 to 1.0.0

### Permissions

The workflow requires:
- `contents: write` - to commit version changes to the PR branch
- `pull-requests: write` - to comment on the PR

No special setup needed! Works with protected branches since it pushes to the PR branch, not the protected branch.

## Best Practices

1. Add appropriate labels to your PRs or use conventional commit format in PR titles
2. Wait for all tests to pass before the version bump happens automatically
3. Review the automated version bump commit in your PR before merging
4. If tests fail, fix them and push - the version bump will run again after tests pass
5. For manual bumps, remember to commit and push the changes:
   ```bash
   npm run version:patch
   git add package.json
   git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
   git push
   ```

## Publishing Workflow

Recommended workflow for releases:

```bash
# 1. Bump version (or let CI do it automatically)
npm run version:minor

# 2. Commit the version change (if manual)
git add package.json
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
git push

# 3. After PR is merged, create the VSIX package
npm run package

# 4. Create a GitHub release and attach the .vsix file
# or publish to VS Code Marketplace using:
# vsce publish
```
