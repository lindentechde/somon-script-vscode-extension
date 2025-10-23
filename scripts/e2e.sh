#!/bin/bash

# E2E Test Script for SomonScript VS Code Extension

set -e

echo "================================================"
echo "SomonScript Extension - E2E Tests"
echo "================================================"
echo ""

# Ensure the extension is compiled
echo "📦 Compiling extension..."
npm run compile

echo ""
echo "🧪 Running VS Code extension tests..."
echo ""

# Run the tests using the compiled test runner
node ./client/out/test/runTest.js

echo ""
echo "✅ All tests passed!"
echo ""

exit 0
