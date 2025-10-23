# Quick Start Guide - 5 Minutes to Testing

## Fastest Way to Test the Extension

### Step 1: Open the Extension (30 seconds)
```bash
cd /Users/bgaibull/Projects/Somon-Script/vscode-somonscript
code .
```

### Step 2: Launch Extension Development Host (10 seconds)
In VS Code, press `F5`

A new VS Code window will open with the extension loaded.

### Step 3: Open Test File (10 seconds)
In the new window:
1. Press `Ctrl+O` (or `Cmd+O` on macOS)
2. Navigate to: `/Users/bgaibull/Projects/Somon-Script/vscode-somonscript/test-example.som`
3. Open it

### Step 4: Test Features (2 minutes)

#### Test 1: Syntax Highlighting ✨
**Expected**: Keywords should be colored:
- `тағйирёбанда`, `собит` (declarations) - one color
- `функсия`, `бозгашт` (function keywords) - another color
- `агар`, `вагарна` (control flow) - another color
- Strings in quotes - string color
- Comments starting with `//` - comment color

**Action**: Just look at the file - it should be colorful!

#### Test 2: Autocompletion 🎯
**Action**:
1. Go to the end of the file (press `Ctrl+End`)
2. Press `Enter` to create a new line
3. Type: `тағ`
4. Press `Ctrl+Space`

**Expected**: A dropdown menu appears showing:
- `тағйирёбанда` with description "Эълон кардани тағйирёбанда (let)"

#### Test 3: Hover Information 📖
**Action**:
1. Find the word `функсия` on line 8
2. Hover your mouse over it (or press `Ctrl+K Ctrl+I`)

**Expected**: A tooltip appears showing:
```
функсия

Эълон кардани функсия

JavaScript: function
```

#### Test 4: Snippets 📝
**Action**:
1. Go to end of file
2. Type: `синф` and press `Tab`

**Expected**: A class template appears:
```somonscript
синф НомиСинф {
    конструктор(параметрҳо) {

    }
}
```

#### Test 5: Error Detection 🔍
**Action**:
1. Go to line 9 (the `бозгашт` line)
2. Delete the semicolon at the end
3. Wait 1 second

**Expected**: A red squiggle appears showing a syntax error

**To fix**: Add the semicolon back

#### Test 6: Comments 💬
**Action**:
1. Go to any line with code
2. Press `Ctrl+/` (or `Cmd+/` on macOS)

**Expected**: The line becomes commented with `//`

Press again to uncomment.

#### Test 7: Auto-Closing Brackets 🎪
**Action**:
1. Type: `функсия тест(`

**Expected**: The closing `)` appears automatically

## Common Issues & Quick Fixes

### Issue: "No syntax highlighting"
**Fix**: Look at the bottom-right corner of VS Code. It should say "SomonScript". If it says "Plain Text", click it and select "SomonScript".

### Issue: "No autocomplete"
**Fix**:
1. Check the Output panel (View → Output)
2. Select "SomonScript Language Server" from dropdown
3. Look for errors
4. If you see "Failed to load SomonScript compiler", run:
   ```bash
   cd /Users/bgaibull/Projects/Somon-Script
   npm run build
   ```

### Issue: "Extension won't activate"
**Fix**: Check that these files exist:
```bash
ls -la client/out/extension.js server/out/server.js
```
If they don't exist, run:
```bash
npm run compile
```

## What to Try Next

### Create Your Own File
1. In the Extension Development Host window
2. Create a new file: `my-test.som`
3. Start typing SomonScript code
4. Enjoy full language support!

### Try These Code Samples

**Simple Function**:
```somonscript
функсия салом(ном: сатр) {
    чоп.сабт("Салом, " + ном + "!");
}

салом("Аҳмад");
```

**Class Example**:
```somonscript
синф Китоб {
    хосусӣ номи: сатр;

    конструктор(номи: сатр) {
        ин.номи = номи;
    }

    нишон_додан() {
        чоп.сабт("Китоб: " + ин.номи);
    }
}
```

**Async Example**:
```somonscript
ҳамзамон функсия гирифтан_маълумот() {
    тағйирёбанда маълумот = интизор fetch("https://api.example.com");
    бозгашт маълумот;
}
```

## Keyboard Shortcuts Cheat Sheet

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Autocomplete | `Ctrl+Space` | `Ctrl+Space` |
| Hover Info | `Ctrl+K Ctrl+I` | `Cmd+K Cmd+I` |
| Comment Line | `Ctrl+/` | `Cmd+/` |
| Format Document | `Shift+Alt+F` | `Shift+Opt+F` |
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Go to File | `Ctrl+P` | `Cmd+P` |

## Screenshot Checklist

When everything works, you should see:

✅ **Syntax Highlighting**: Different colors for keywords, strings, comments
✅ **IntelliSense Dropdown**: Appears when typing keywords
✅ **Hover Tooltips**: Shows documentation when hovering
✅ **Error Squiggles**: Red underlines for syntax errors
✅ **Auto-closing**: Brackets and quotes close automatically
✅ **Status Bar**: Shows "SomonScript" language indicator

## Next Steps

1. **Read full docs**: See [README.md](README.md)
2. **Installation guide**: See [INSTALLATION.md](INSTALLATION.md)
3. **Technical details**: See [SUMMARY.md](SUMMARY.md)

## That's It! 🎉

You now have a fully functional SomonScript extension for VS Code!

**Бо забони тоҷикӣ барномарезӣ кунед!**
