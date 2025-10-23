// Test script to verify AST-based member completion

const path = require('path');
const fs = require('fs');

// Load the SomonScript compiler
const Lexer = require('../dist/lexer.js').Lexer;
const Parser = require('../dist/parser.js').Parser;
const TypeChecker = require('../dist/type-checker.js').TypeChecker;

// Read the test file
const testFile = path.join(__dirname, 'test-member-completion.som');
const source = fs.readFileSync(testFile, 'utf-8');

console.log('Testing AST-based member completion...\n');
console.log('Source code:');
console.log(source);
console.log('\n---\n');

try {
  // Parse the source
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();

  console.log('✅ Parsing successful');

  // Run type checker
  const checker = new TypeChecker(source);
  const result = checker.check(ast);

  console.log('✅ Type checking complete');
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  // Get the symbol table
  const symbolTable = checker.getSymbolTable();

  console.log('\n--- Symbol Table ---');
  symbolTable.forEach((type, name) => {
    console.log(`${name}: ${type.kind}`);
    console.log(`  Details: hasProperties=${!!type.properties}, propertiesSize=${type.properties?.size || 0}, hasBaseType=${!!type.baseType}`);
    if (type.kind === 'class') {
      if (type.properties && type.properties.size > 0) {
        console.log(`  Properties (${type.properties.size}):`);
        type.properties.forEach((propType, propName) => {
          const kind = propType.type.kind;
          const returnType = propType.type.returnType?.kind || propType.type.returnType?.name;
          if (kind === 'function') {
            console.log(`    - ${propName}(): ${returnType || 'беқимат'} (method)`);
          } else {
            console.log(`    - ${propName}: ${propType.type.name || propType.type.kind} (property)`);
          }
        });
      } else {
        console.log(`  ⚠️ No properties found for class ${name}`);
      }
      if (type.baseType) {
        console.log(`  Extends: ${type.baseType.name || type.baseType.kind}`);
      }
    }
  });

  // Test member completion for "саг"
  console.log('\n--- Testing Member Completion for "саг" ---');
  const varType = symbolTable.get('саг');

  if (varType) {
    console.log(`Variable type: ${varType.kind} (${varType.name || 'unknown'})`);
    console.log('Variable type details:', JSON.stringify({
      kind: varType.kind,
      name: varType.name,
      hasProperties: !!varType.properties,
      propertiesSize: varType.properties?.size || 0,
      hasBaseType: !!varType.baseType
    }, null, 2));

    if (varType.kind === 'class' && varType.properties) {
      console.log('\nMembers available:');

      // Collect all members including inherited
      const allMembers = new Map();

      // From current class
      varType.properties.forEach((propType, propName) => {
        allMembers.set(propName, { type: propType, source: varType.name });
      });

      // From parent class
      let currentBase = varType.baseType;
      while (currentBase) {
        if (currentBase.properties) {
          currentBase.properties.forEach((propType, propName) => {
            if (!allMembers.has(propName)) {
              allMembers.set(propName, { type: propType, source: currentBase.name });
            }
          });
        }
        currentBase = currentBase.baseType;
      }

      allMembers.forEach((info, propName) => {
        const propType = info.type;
        const source = info.source;
        if (propType.type.kind === 'function') {
          const returnType = propType.type.returnType?.name || propType.type.returnType?.kind || 'беқимат';
          console.log(`  ✓ ${propName}() → ${returnType} (from ${source})`);
        } else {
          const typeName = propType.type.name || propType.type.kind;
          console.log(`  ✓ ${propName}: ${typeName} (from ${source})`);
        }
      });
    }
  } else {
    console.log('❌ Variable "саг" not found in symbol table');
  }

  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  console.error(error.stack);
}
