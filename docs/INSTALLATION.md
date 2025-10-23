# Installation Guide for SomonScript VS Code Extension

## Quick Start

### Prerequisites

1. **VS Code**: Version 1.75.0 or higher
2. **Node.js**: Version 18.x or higher
3. **SomonScript Compiler**: Must be built and available

### Step-by-Step Installation

#### 1. Build SomonScript Compiler

First, ensure the main SomonScript compiler is built:

```bash
cd /Users/bgaibull/Projects/Somon-Script
npm install
npm run build
```

Verify the build succeeded by checking that `dist/compiler.js` exists.

#### 2. Install Extension Dependencies

Navigate to the extension directory and install dependencies:

```bash
cd vscode-somonscript
npm install
```

This will automatically:
- Install root dependencies
- Install client dependencies (in `client/`)
- Install server dependencies (in `server/`)

#### 3. Compile the Extension

Compile the TypeScript code:

```bash
npm run compile
```

You should see TypeScript compile both the client and server with no errors.

#### 4. Test the Extension

You have two options:

**Option A: Run in Development Mode (Recommended for Testing)**

1. Open the `vscode-somonscript` folder in VS Code
2. Press `F5` to launch a new VS Code window with the extension loaded
3. In the new window, open or create a `.som` file
4. Start typing SomonScript code and observe:
   - Syntax highlighting
   - Autocompletion (press `Ctrl+Space`)
   - Hover information (hover over keywords)
   - Error diagnostics

**Option B: Package and Install**

1. Install the VS Code Extension Manager CLI:
   ```bash
   npm install -g @vscode/vsce
   ```

2. Package the extension:
   ```bash
   vsce package
   ```

   This creates a `.vsix` file (e.g., `somonscript-0.1.0.vsix`)

3. Install the extension:
   ```bash
   code --install-extension somonscript-0.1.0.vsix
   ```

4. Reload VS Code and open a `.som` file

### Verifying Installation

Create a test file `test.som`:

```somonscript
тағйирёбанда салом = "Салом, ҷаҳон!";

функсия ҳисоб(а: рақам, б: рақам): рақам {
    бозгашт а + б;
}

чоп.сабт(ҳисоб(5, 10));
```

You should see:
- ✅ Keywords highlighted in different colors
- ✅ Autocompletion suggestions when you type
- ✅ Hover tooltips showing keyword descriptions
- ✅ No red squiggly lines (syntax errors) if code is correct

### Troubleshooting

#### Extension Not Loading

**Problem**: Extension doesn't activate when opening `.som` files.

**Solutions**:
1. Check that the extension compiled successfully:
   ```bash
   ls -la client/out/extension.js server/out/server.js
   ```
   Both files should exist.

2. Check VS Code's Output panel:
   - View → Output
   - Select "SomonScript Language Server" from the dropdown
   - Look for error messages

#### No IntelliSense

**Problem**: Autocompletion and hover info don't work.

**Solutions**:
1. Verify the compiler is built:
   ```bash
   ls -la ../dist/compiler.js ../dist/keyword-map.js
   ```

2. Check the language server logs:
   - Open Output panel
   - Select "SomonScript Language Server"
   - Look for "Failed to load SomonScript compiler" error

3. If the compiler path is wrong, the extension looks for:
   ```
   vscode-somonscript/../dist/compiler.js
   ```

   Make sure the extension is in the correct location relative to the compiler.

#### Syntax Errors Not Showing

**Problem**: Code with errors doesn't show red squiggles.

**Solutions**:
1. Check that the file is recognized as SomonScript:
   - Look at the bottom-right corner of VS Code
   - It should say "SomonScript"
   - If not, click it and select "SomonScript" from the list

2. Force a re-validation:
   - Make a small edit (add a space)
   - Save the file

#### Compilation Errors

**Problem**: `npm run compile` fails.

**Solutions**:
1. Clean and rebuild:
   ```bash
   rm -rf node_modules client/node_modules server/node_modules
   rm -rf client/out server/out
   npm install
   npm run compile
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. Check for TypeScript errors:
   - Read the error messages carefully
   - Common issues:
     - Missing type definitions
     - Wrong import paths
     - Syntax errors in `.ts` files

### Development Workflow

For active development on the extension:

1. **Watch Mode**: Automatically recompile on file changes
   ```bash
   npm run watch
   ```

2. **Debugging**:
   - Set breakpoints in VS Code
   - Press `F5` to start debugging
   - Debug console will show server logs

3. **Testing Changes**:
   - After making changes, the watch mode will recompile
   - Press `Ctrl+R` (or `Cmd+R` on macOS) in the Extension Development Host window to reload

### Uninstalling

If you installed via `.vsix`:

```bash
code --uninstall-extension somonscript.somonscript
```

Or manually:
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Find "SomonScript"
4. Click the gear icon → Uninstall

### Next Steps

- Read [README.md](README.md) for usage instructions
- Check out [test-example.som](test-example.som) for a complete example
- Report issues at the SomonScript GitHub repository

### Support

If you encounter issues not covered here:
1. Check the VS Code developer console: Help → Toggle Developer Tools
2. Look for errors in the Console tab
3. Report bugs with:
   - VS Code version
   - Extension version
   - Error messages
   - Steps to reproduce
