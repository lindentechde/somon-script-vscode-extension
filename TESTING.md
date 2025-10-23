# Testing Guide for SomonScript VS Code Extension

## Overview

This extension includes automated integration tests that run in a real VS Code environment using `@vscode/test-electron`.

## Test Infrastructure

### Dependencies
- **@vscode/test-electron**: Runs tests in VS Code Electron environment
- **Mocha**: Test framework (TDD style)
- **Chai**: Assertion library
- **Node.js Assert**: Built-in assertions

### Test Structure
```
client/src/test/
├── runTest.ts              # Main test runner
├── suite/
│   ├── index.ts            # Mocha configuration
│   └── extension.test.ts   # Extension integration tests
└── README.md               # Test documentation
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Clean, compile, and test
npm run clean && npm run compile && npm test

# Watch mode (compile only)
npm run test:watch
```

### Manual Execution

```bash
# Compile the extension
npm run compile

# Run tests directly
node ./client/out/test/runTest.js
```

## Current Test Coverage

### Extension Tests (`extension.test.ts`)

1. **Extension Presence Test**
   - Verifies the extension is installed in VS Code
   - Extension ID: `LindenTechITConsulting.somonscript`

2. **Extension Activation Test**
   - Tests that the extension activates properly
   - Verifies `isActive` flag is set
   - Timeout: 10 seconds

3. **Language Registration Test**
   - Checks that `somonscript` language is registered
   - Verifies VS Code recognizes the language ID

4. **Document Opening Test**
   - Creates a document with SomonScript code
   - Tests that `.som` files open with correct language ID
   - Sample code: `тағйирёбанда салом = "Салом, ҷаҳон!";`

5. **Syntax Highlighting Test**
   - Creates a document with function syntax
   - Verifies content includes SomonScript keywords
   - Tests: `функсия`, `чоп.сабт`

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Platform-Specific Execution

**Linux (GitHub Actions)**:
```bash
xvfb-run -a npm test
```
Uses Xvfb (X virtual framebuffer) for headless execution.

**Windows/macOS**:
```bash
npm test
```
Runs tests in normal environment.

## Test Configuration

### Mocha Settings
```typescript
{
  ui: 'tdd',           // Test-Driven Development style
  color: true,         // Colored output
  timeout: 10000       // 10 second timeout
}
```

### VS Code Test Settings
```typescript
{
  extensionDevelopmentPath: '<root>',
  extensionTestsPath: '<root>/client/out/test/suite/index',
  launchArgs: ['--disable-extensions']  // Isolate extension testing
}
```

## Adding New Tests

### Create a New Test File

```typescript
// client/src/test/suite/myfeature.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('My Feature Test Suite', () => {
  test('Should do something', async () => {
    // Your test logic here
    assert.ok(true);
  });

  test('Should handle edge cases', async function() {
    this.timeout(5000); // Custom timeout
    // Test implementation
  });
});
```

### Test Best Practices

1. **Use descriptive test names**
   ```typescript
   test('Should provide completion items after typing "чоп."', () => {
     // ...
   });
   ```

2. **Set appropriate timeouts**
   ```typescript
   test('Async operation', async function() {
     this.timeout(10000); // 10 seconds for slow operations
   });
   ```

3. **Clean up resources**
   ```typescript
   teardown(() => {
     // Close documents, dispose resources
   });
   ```

4. **Test real scenarios**
   ```typescript
   test('Should provide hover info for keywords', async () => {
     const doc = await vscode.workspace.openTextDocument({
       content: 'функсия',
       language: 'somonscript'
     });
     // Test hover provider
   });
   ```

## Test Categories to Implement

### Current ✅
- Extension activation
- Language registration
- Basic document handling

### Planned 🔄
- **Language Server**
  - Diagnostics (error reporting)
  - Hover information
  - Code completion
  - Go to definition
  
- **Syntax**
  - TextMate grammar validation
  - Bracket matching
  - Comment toggling
  
- **Snippets**
  - Snippet expansion
  - Placeholder navigation
  
- **Configuration**
  - Settings validation
  - Default values

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
```
Solution: Increase timeout with this.timeout(15000)
```

**Issue**: Extension not found
```
Solution: Verify extension ID in package.json matches test
Publisher: LindenTechITConsulting
Name: somonscript
ID: LindenTechITConsulting.somonscript
```

**Issue**: VS Code won't close
```
Solution: Ensure no breakpoints are set, kill VS Code processes
```

**Issue**: Tests fail on CI but pass locally
```
Solution: Check xvfb is available on Linux runners
Verify Node.js version matches across environments
```

### Debug Mode

Run tests with VS Code debugger:

1. Open VS Code in the extension directory
2. Press `F5` to launch Extension Development Host
3. Run tests from the Debug Console

## Performance

- **Average test suite runtime**: ~10-15 seconds
- **Per test average**: ~2-3 seconds
- **Extension activation**: ~1-2 seconds

## Coverage Goals

- **Current Coverage**: ~30% (basic extension functionality)
- **Target Coverage**: 70%+ (including language server features)

## Resources

- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Mocha Documentation](https://mochajs.org/)
- [@vscode/test-electron](https://github.com/microsoft/vscode-test)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
