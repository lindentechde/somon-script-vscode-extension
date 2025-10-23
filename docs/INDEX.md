# SomonScript VS Code Extension - Documentation Index

## 📚 Documentation Overview

This extension provides complete Visual Studio Code support for SomonScript. Choose the guide that fits your needs:

### 🚀 [QUICKSTART.md](QUICKSTART.md)
**⏱️ 5 minutes** - Fast testing guide
- Launch in 30 seconds
- Test all features in 2 minutes
- Common issues & fixes
- Perfect for: First-time testing

### 📦 [INSTALLATION.md](INSTALLATION.md)
**⏱️ 10 minutes** - Complete installation guide
- Prerequisites and dependencies
- Step-by-step installation
- Development workflow
- Troubleshooting section
- Perfect for: Setting up for real use

### 📖 [README.md](README.md)
**⏱️ 15 minutes** - User documentation
- Feature descriptions
- Usage examples
- Keyboard shortcuts
- Language reference (all 100 keywords)
- Configuration options
- Perfect for: Learning to use the extension

### 🔬 [SUMMARY.md](SUMMARY.md)
**⏱️ 20 minutes** - Technical deep dive
- Architecture overview
- Implementation details
- File structure
- Performance characteristics
- Development roadmap
- Perfect for: Contributing or understanding internals

## ⚡ Quick Reference

### File Extensions
- `.som` - SomonScript source files

### Key Features
- ✅ Syntax highlighting (100+ keywords)
- ✅ IntelliSense (autocomplete, hover)
- ✅ Real-time diagnostics (errors & warnings)
- ✅ 15 code snippets
- ✅ Auto-closing brackets
- ✅ Comment toggling

### Keyboard Shortcuts
- `Ctrl+Space` - Autocomplete
- `Ctrl+/` - Toggle comment
- `F12` - Go to definition (planned)
- `Shift+Alt+F` - Format document (planned)

### Project Structure
```
vscode-somonscript/
├── 📄 Documentation
│   ├── INDEX.md          ← You are here
│   ├── QUICKSTART.md     ← Start here!
│   ├── INSTALLATION.md   ← Setup guide
│   ├── README.md         ← User docs
│   └── SUMMARY.md        ← Technical details
│
├── 🎨 Extension Assets
│   ├── syntaxes/         ← Syntax highlighting
│   ├── snippets/         ← Code snippets
│   └── language-configuration.json
│
├── 💻 Source Code
│   ├── client/           ← Extension activation
│   ├── server/           ← Language server (LSP)
│   └── package.json      ← Extension manifest
│
├── 🧪 Testing
│   └── test-example.som  ← Example file
│
└── 🔧 Configuration
    ├── .vscode/          ← Debug configs
    └── tsconfig.json     ← TypeScript config
```

## 🎯 Getting Started Path

### New Users (Just Testing)
1. Read: [QUICKSTART.md](QUICKSTART.md)
2. Action: Press `F5` in VS Code
3. Result: Extension running in 30 seconds!

### Regular Users (Installing for Use)
1. Read: [INSTALLATION.md](INSTALLATION.md)
2. Action: `npm install && npm run compile`
3. Result: Extension installed permanently

### Power Users (Learning All Features)
1. Read: [README.md](README.md)
2. Explore: All keyboard shortcuts and configuration
3. Result: Master all 100+ keywords and features

### Contributors (Understanding Internals)
1. Read: [SUMMARY.md](SUMMARY.md)
2. Explore: Source code in `client/` and `server/`
3. Result: Ready to contribute improvements

## 📊 Extension Stats

| Metric | Value |
|--------|-------|
| **Keywords Supported** | 100+ |
| **Code Snippets** | 15 |
| **Languages** | Tajik Cyrillic → JavaScript |
| **File Extension** | .som |
| **VS Code Version** | 1.75.0+ |
| **Total Lines of Code** | ~650 |
| **Compiled Size** | ~20 KB |
| **Dependencies** | 3 (vscode-languageserver, vscode-languageclient, vscode-languageserver-textdocument) |

## 🎨 Feature Highlights

### Syntax Highlighting
```somonscript
// Keywords in different colors
тағйирёбанда салом = "Салом, ҷаҳон!";
функсия ҳисоб(а: рақам, б: рақам): рақам {
    бозгашт а + б;
}
```

### IntelliSense
- Type `тағ` → See `тағйирёбанда` with description
- Hover over `функсия` → See "JavaScript: function"
- Press `.` after `чоп` → See all methods (сабт, хато, огоҳӣ)

### Error Detection
```somonscript
// Missing semicolon - red squiggle appears!
тағйирёбанда х = 5
```

## 🐛 Troubleshooting Quick Links

| Issue | Solution | Guide |
|-------|----------|-------|
| Extension won't activate | Check compilation | [INSTALLATION.md](INSTALLATION.md#troubleshooting) |
| No syntax highlighting | Select "SomonScript" language | [QUICKSTART.md](QUICKSTART.md#common-issues--quick-fixes) |
| No IntelliSense | Build SomonScript compiler | [INSTALLATION.md](INSTALLATION.md#no-intellisense) |
| Errors not showing | Check file extension is `.som` | [QUICKSTART.md](QUICKSTART.md#issue-no-syntax-highlighting) |

## 🗺️ Roadmap

### ✅ v0.1.0 (Current)
- Syntax highlighting
- IntelliSense
- Diagnostics
- Snippets
- Language configuration

### 🚧 v0.2.0 (Next)
- Go-to-definition
- Find all references
- Extension icon
- Better error locations

### 🔮 v1.0.0 (Future)
- Code formatting
- Debugging support
- Marketplace publish
- Refactoring tools

## 📞 Support

### Reporting Issues
Include in your report:
- VS Code version (`Help → About`)
- Extension version (see `package.json`)
- Sample `.som` file
- Output panel logs (`View → Output → SomonScript Language Server`)

### Community
- GitHub: [SomonScript Repository](https://github.com/your-org/somon-script)
- Issues: Report bugs and feature requests
- Pull Requests: Contributions welcome!

## 📄 License

MIT License - See main SomonScript repository for details

## 🙏 Acknowledgments

Built with:
- VS Code Extension API
- Language Server Protocol (LSP)
- TypeScript
- TextMate Grammar

## 🎓 Learning Resources

### VS Code Extension Development
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [TextMate Grammars](https://macromates.com/manual/en/language_grammars)

### SomonScript Language
- Main repository documentation
- [CLAUDE.md](../CLAUDE.md) - Project overview
- [examples/](../examples/) - Code examples

---

**Version**: 0.1.0
**Status**: ✅ Complete and functional
**Last Updated**: October 22, 2025

**Бо забони тоҷикӣ барномарезӣ кунед!**
*Program in the Tajik language!*
