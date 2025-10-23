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
- **Status:** ⚠️ Placeholder (waiting for test implementation)
- **Steps:**
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Compile TypeScript
  5. Run tests (currently disabled - see note below)

**Note:** The test job is currently a placeholder because the `scripts/e2e.sh` file referenced in `package.json` doesn't exist yet. Uncomment the test step in `ci.yml` once tests are implemented.

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

To enable the test functionality:

### Step 1: Create E2E Test Script

Create `scripts/e2e.sh`:

```bash
#!/bin/bash

# Example E2E test script
set -e

echo "Running E2E tests..."

# Add your test commands here
# For VS Code extensions, you might use:
# - vscode-test for integration tests
# - npm test with appropriate test runner

echo "Tests completed successfully"
```

Make it executable:
```bash
chmod +x scripts/e2e.sh
```

### Step 2: Update package.json

Add test scripts:

```json
{
  "scripts": {
    "test": "node ./scripts/e2e.sh",
    "test:unit": "jest",
    "test:integration": "vscode-test"
  }
}
```

### Step 3: Enable Test Workflows

1. Uncomment the test step in `ci.yml`:
   ```yaml
   - name: Run tests
     run: npm test
   ```

2. Update `test.yml` triggers:
   ```yaml
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]
   ```

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
