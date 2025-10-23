# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Available Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Status:** ✅ Active

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Build
- **Matrix Strategy:** Tests on Node.js 18.x and 20.x
- **Steps:**
  1. Checkout code
  2. Setup Node.js with dependency caching
  3. Install dependencies (root, client, server)
  4. Compile TypeScript
  5. Upload build artifacts

#### Lint
- **Dependencies:** Requires build job to complete
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Run ESLint on client and server source files

#### Test
- **Dependencies:** Requires build job to complete
- **Status:** ✅ Active (placeholder script)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Compile TypeScript
  5. Run tests (placeholder script exits successfully)

**Note:** The `scripts/e2e.sh` script currently serves as a placeholder that exits successfully. Implement actual tests by editing this script to include real test logic using @vscode/test-electron or your preferred testing framework.

### 2. Test Suite (`test.yml`)

**Status:** 🔒 Manual trigger only

**Triggers:**
- `workflow_dispatch` (manual trigger only)

**Purpose:** Comprehensive test suite template ready for when E2E tests are implemented.

**Jobs:**

#### E2E Tests
- **Matrix Strategy:** Tests on Ubuntu, Windows, and macOS with Node.js 18.x and 20.x
- **Status:** ⚠️ Requires `scripts/e2e.sh` to be created first

#### Unit Tests
- **Platform:** Ubuntu only
- **Status:** ⚠️ Requires unit test scripts to be added

**To Enable:** Change the `on:` trigger from `workflow_dispatch` to include `push` and `pull_request` once tests are ready.

## Setup Instructions

### 1. Verify Workflows

After committing these workflows, verify they appear in your repository:
- Navigate to **Actions** tab in GitHub
- Check that "CI/CD Pipeline" workflow is listed
- Check that "Test Suite" workflow is listed (manual trigger only)

### 2. View Workflow Runs

- Go to **Actions** tab
- Click on a workflow to see its runs
- Click on a specific run to see job details

### 3. Adding Status Badges

Add these badges to your main README.md:

```markdown
![CI/CD Pipeline](https://github.com/lindentechde/Somon-Script/workflows/CI%2FCD%20Pipeline/badge.svg)
```

## Implementing Tests

The test infrastructure is ready with a placeholder script. To add real tests:

### Step 1: Edit the E2E Test Script

The file `scripts/e2e.sh` already exists as a placeholder. Edit it to add real tests:

```bash
#!/bin/bash

# Example E2E test script with real tests
set -e

echo "Running E2E tests..."

# Install test dependencies if needed
# npm install --save-dev @vscode/test-electron mocha

# Run VS Code extension tests
# For example:
# node ./out/test/runTest.js

# Or use vscode-test directly:
# vscode-test --extensionDevelopmentPath=. --extensionTestsPath=./out/test

echo "Tests completed successfully"
```

### Step 2: Add Test Dependencies (Optional)

Add testing libraries to `package.json`:

```bash
npm install --save-dev @vscode/test-electron mocha @types/mocha
```

### Step 3: Create Test Files

Create test files in `client/src/test/` or `server/src/test/` directories with your test logic.

### Step 4: Enable Full Test Suite (Optional)

To run comprehensive tests on multiple platforms, update `test.yml` triggers:

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**Note:** The main CI pipeline (`ci.yml`) already runs tests on every push/PR with the placeholder script.

## Caching

All workflows use npm caching via `actions/setup-node@v4` with `cache: 'npm'`. This significantly speeds up builds by caching `node_modules`.

## Artifact Retention

- **Build artifacts:** 7 days
- **Test results:** 30 days (when implemented)

## Node.js Versions

The project is tested against:
- Node.js 18.x (LTS)
- Node.js 20.x (Current)

Update the matrix in workflows if you need to support different versions.

## Troubleshooting

### Build Fails on Dependency Installation

If `npm ci` fails:
1. Verify `package-lock.json` is committed
2. Check for version conflicts
3. Try `npm install` locally to regenerate lock file

### Lint Errors

If linting fails:
- Run `npm run lint` locally to see errors
- Fix issues or update ESLint configuration
- Consider using `npm run lint -- --fix` for auto-fixable issues

### Cache Issues

If caching causes problems:
- Clear cache in GitHub Actions settings
- Check if `package-lock.json` changes frequently

## Future Enhancements

Potential additions:
- [ ] Release workflow for publishing to VS Code Marketplace
- [ ] Code coverage reporting
- [ ] Automated semantic versioning
- [ ] Dependency update automation (Dependabot/Renovate)
- [ ] Performance benchmarking
- [ ] Security scanning (CodeQL)

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Node.js CI/CD Guide](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
