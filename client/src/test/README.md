# Extension Tests

This directory contains integration tests for the SomonScript VS Code extension.

## Structure

```
test/
├── runTest.ts          # Test runner that launches VS Code
├── suite/
│   ├── index.ts        # Mocha test suite configuration
│   └── extension.test.ts  # Extension integration tests
└── README.md           # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Compile and watch tests during development
```bash
npm run test:watch
```

### Run tests manually
```bash
# Compile first
npm run compile

# Run tests
node ./client/out/test/runTest.js
```

## Test Categories

### Extension Tests (`extension.test.ts`)
- **Extension Presence**: Verifies the extension is installed
- **Extension Activation**: Tests that the extension activates correctly
- **Language Registration**: Checks that 'somonscript' language is registered
- **Document Opening**: Tests opening .som files
- **Syntax Highlighting**: Basic verification of language features

## Adding New Tests

1. Create a new test file in `suite/` directory:
   ```typescript
   import * as assert from 'assert';
   import * as vscode from 'vscode';

   suite('My New Test Suite', () => {
     test('My test', () => {
       assert.ok(true);
     });
   });
   ```

2. The test will be automatically discovered by `suite/index.ts`

3. Run tests with `npm test`

## Test Framework

- **Test Runner**: @vscode/test-electron
- **Test Framework**: Mocha (TDD style)
- **Assertion Library**: Node.js built-in assert, Chai available

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Every push to `main` or `develop`
- Every pull request

The tests run in a headless VS Code environment using Xvfb on Linux.

## Troubleshooting

### Tests fail locally
- Ensure VS Code is closed before running tests
- Make sure dependencies are installed: `npm install`
- Compile the extension: `npm run compile`

### Tests timeout
- Increase timeout in test: `this.timeout(10000);`
- Check if extension is activating properly

### Extension not found
- Verify publisher name matches in package.json
- Check extension ID: `LindenTechITConsulting.somonscript`
