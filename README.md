# SomonScript - Visual Studio Code Extension

Comprehensive language support for SomonScript, the Tajik Cyrillic programming language that compiles to JavaScript.

## Features

### 🎨 Syntax Highlighting
- **Keywords**: All 100+ Tajik Cyrillic keywords with proper categorization
- **Type Annotations**: Complete support for type syntax (`: рақам`, `: сатр[]`, `: T | беқимат`)
- **Generics**: Full generic type parameter highlighting (`<T>`, `<T, U>`, `<T мерос рақам>`)
- **Advanced Operators**:
  - Optional chaining (`?.`)
  - Nullish coalescing (`??`)
  - Spread/Rest (`...`)
  - Arrow functions (`=>`)
  - Ternary operators (`? :`)
  - Type operators (`|`, `&`)
  - Increment/Decrement (`++`, `--`)
- **Advanced Types**: Union types, intersection types, tuple types, optional properties (`?`)
- **Literals**: Strings, template literals with `${}` interpolation, numbers (including BigInt with `n` suffix)
- **Comments**: Single-line (`//`) and multi-line (`/* */`)
- **Built-in Functions**: Special highlighting for чоп.сабт, математика, etc.
- **Identifiers**: Proper recognition of Cyrillic and Latin identifiers

### 🔍 IntelliSense
- **Autocompletion**: Smart suggestions for all SomonScript keywords
- **Member Completions**: Method and property suggestions after typing `.` (саг.овоз_додан)
- **Inheritance Support**: Shows inherited methods from parent classes
- **Type-Aware**: Infers types from variable declarations and class definitions
- **Hover Information**: View keyword documentation and JavaScript equivalents
- **Real-time Diagnostics**: Instant error and warning messages from the SomonScript compiler
- **Signature Help**: Parameter hints for functions

### 📝 Code Snippets
Over 30 production-ready snippets covering all TypeScript-equivalent features:

**Basic Constructs:**
- `тағйирёбанда` - Variable declaration
- `собит` - Constant declaration
- `функсия` - Function declaration
- `синф` - Class declaration
- `интерфейс` - Interface declaration
- `навъ` - Type alias

**Advanced Features:**
- `функсия<T>` - Generic function
- `синф<T>` - Generic class
- `интерфейс<T>` - Generic interface
- `навъ-ё` - Union type alias (`Type1 | Type2`)
- `навъ-ва` - Intersection type alias (`Type1 & Type2`)
- `ҷуфт` - Tuple type declaration

**Control Flow:**
- `агар` - If/else statement
- `интихоб` - Switch statement
- `барои` - For loop
- `то` - While loop
- `кардан-то` - Do-while loop
- `барои-дар` - For-in loop
- `барои-аз` - For-of loop
- `кӯшиш` - Try-catch-finally

**Async/Promises:**
- `ҳамзамон` - Async function
- `ҳамзамон-интизор` - Async function with await
- `ваъда` - Promise function

**Modern JavaScript:**
- `тир` - Arrow function (single expression)
- `тир-блок` - Arrow function with block
- `шартӣ` - Ternary operator
- `пахш` - Spread operator
- `остӣ` - Rest parameters
- `тарқиш-объект` - Object destructuring
- `тарқиш-массив` - Array destructuring
- `` `` `` - Template literal with interpolation

**Import/Export:**
- `ворид` - Import statement
- `содир` - Export statement

**And more!**

### 🔧 Language Features
- **Auto-closing**: Automatic closing of brackets, quotes, and braces
- **Bracket Matching**: Visual matching of paired brackets
- **Comment Toggling**: Quick comment/uncomment with keyboard shortcuts
- **Indentation**: Smart indentation rules
- **Folding**: Code folding support with region markers

## Installation

### From Source

1. **Prerequisites**: Ensure SomonScript is built:
   ```bash
   cd /path/to/Somon-Script
   npm install
   npm run build
   ```

2. **Install Extension Dependencies**:
   ```bash
   cd vscode-somonscript
   npm install
   ```

3. **Compile the Extension**:
   ```bash
   npm run compile
   ```

4. **Install in VS Code**:
   - Press `F5` to open a new VS Code window with the extension loaded (for development)
   - OR package and install:
     ```bash
     npm install -g @vscode/vsce
     vsce package
     code --install-extension somonscript-0.1.0.vsix
     ```

### From VS Code Marketplace
*(Coming soon)*

## Usage

1. Create a file with `.som` extension
2. Start writing SomonScript code
3. Enjoy syntax highlighting, IntelliSense, and error checking!

### Example

```somonscript
// Эълон кардани тағйирёбанда
тағйирёбанда салом = "Салом, ҷаҳон!";

// Функсия бо параметрҳо
функсия ҳисоб(а: рақам, б: рақам): рақам {
    бозгашт а + б;
}

// Синф
синф Корбар {
    хосусӣ ном: сатр;

    конструктор(ном: сатр) {
        ин.ном = ном;
    }

    салом() {
        чоп.сабт("Салом, " + ин.ном);
    }
}

// Истифодаи синф
тағйирёбанда корбар = нав Корбар("Аҳмад");
корбар.салом();
```

## Keyboard Shortcuts

- **Toggle Comment**: `Ctrl+/` (Windows/Linux) or `Cmd+/` (macOS)
- **Format Document**: `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (macOS)
- **Go to Definition**: `F12`
- **Find All References**: `Shift+F12`
- **Rename Symbol**: `F2`
- **Show Hover**: `Ctrl+K Ctrl+I` (Windows/Linux) or `Cmd+K Cmd+I` (macOS)

## Configuration

Configure the extension in your VS Code settings:

```json
{
  "somonscript.maxNumberOfProblems": 100,
  "somonscript.trace.server": "off"
}
```

### Settings

- `somonscript.maxNumberOfProblems`: Maximum number of problems to report (default: 100)
- `somonscript.trace.server`: Trace communication between VS Code and the language server
  - `off`: No tracing
  - `messages`: Trace messages only
  - `verbose`: Verbose tracing

## Language Reference

### Keywords (Калидҳо)

#### Variable Declarations
- `тағйирёбанда` → `let` (variable)
- `собит` → `const` (constant)

#### Functions
- `функсия` / `функция` → `function`
- `бозгашт` → `return`
- `ҳамзамон` → `async`
- `интизор` → `await`

#### Control Flow
- `агар` → `if`
- `вагарна` → `else`
- `барои` → `for`
- `то` → `to`
- `шикастан` → `break`
- `давом` → `continue`
- `интихоб` → `switch`
- `ҳолат` → `case`

#### Object-Oriented Programming
- `синф` → `class`
- `интерфейс` → `interface`
- `нав` → `new`
- `ин` → `this`
- `супер` → `super`
- `мерос` → `extends`
- `татбиқ` → `implements`
- `конструктор` → `constructor`

#### Visibility Modifiers
- `хосусӣ` → `private`
- `муҳофизатшуда` → `protected`
- `ҷамъиятӣ` → `public`
- `статикӣ` → `static`

#### Types
- `сатр` → `string`
- `рақам` → `number`
- `мантиқӣ` → `boolean`
- `навъ` → `type`

#### Constants
- `дуруст` → `true`
- `нодуруст` → `false`
- `холӣ` → `null`
- `беқимат` → `undefined`

#### Modules
- `ворид` → `import`
- `содир` → `export`
- `аз` → `from`
- `дар` → `in`
- `пешфарз` → `default`
- `чун` → `as`

#### Error Handling
- `кӯшиш` → `try`
- `гирифтан` → `catch`
- `ниҳоят` → `finally`
- `партофтан` → `throw`

#### Built-in Functions
- `чоп.сабт` → `console.log`
- `чоп.хато` → `console.error`
- `чоп.огоҳӣ` → `console.warn`

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Run linter
npm run lint
```

### Debugging

1. Open the extension in VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with the extension loaded
4. Open a `.som` file to test the extension

### Project Structure

```
vscode-somonscript/
├── client/               # Language client
│   ├── src/
│   │   └── extension.ts  # Extension activation
│   └── package.json
├── server/               # Language server
│   ├── src/
│   │   └── server.ts     # LSP implementation
│   └── package.json
├── syntaxes/
│   └── somonscript.tmLanguage.json  # TextMate grammar
├── snippets/
│   └── somonscript.json  # Code snippets
├── language-configuration.json      # Language config
├── package.json          # Extension manifest
└── README.md
```

## Known Issues

- Language server requires the SomonScript compiler to be built in the parent directory
- Error locations may not be precise if the compiler doesn't provide line/column information

## TypeScript Feature Coverage

This extension provides **complete coverage** for TypeScript-equivalent features:

✅ **Primitives**: number, string, boolean, null, undefined, bigint
✅ **Complex Types**: object, arrays, tuples, unions, intersections
✅ **Functions**: Regular, arrow, async, generic, with type annotations
✅ **Classes**: Inheritance, modifiers (private, public, protected, static), abstract, constructors
✅ **Interfaces**: Basic, generic, with inheritance
✅ **Type System**: Annotations, generics, union/intersection types, tuple types, optional properties
✅ **Operators**: All arithmetic, logical, bitwise, comparison, ternary, optional chaining, nullish coalescing, spread/rest
✅ **Control Flow**: if/else, switch/case, for, while, do-while, for-in, for-of, break, continue
✅ **Error Handling**: try/catch/finally, throw
✅ **Async**: async/await, Promise
✅ **Modules**: import/export with named, default, and namespace patterns
✅ **Modern JS**: Template literals, destructuring, spread/rest, arrow functions

## Roadmap

- [x] Complete TypeScript-equivalent syntax highlighting
- [x] Comprehensive snippet library (30+ snippets)
- [x] Generic types support
- [x] Advanced operators (optional chaining, nullish coalescing)
- [x] Template literal interpolation
- [ ] Publish to VS Code Marketplace
- [ ] Add code formatting support
- [ ] Implement go-to-definition
- [ ] Add find-all-references
- [ ] Improve error location precision
- [ ] Add support for multi-root workspaces
- [ ] Add debugging support
- [ ] Create extension icon

## Contributing

Contributions are welcome! Please see the main SomonScript repository for contribution guidelines.

## License

MIT License - see the LICENSE file in the SomonScript repository.

## Credits

Created for the SomonScript project - bringing programming to the Tajik language.

**Бо забони тоҷикӣ барномарезӣ кунед!**
