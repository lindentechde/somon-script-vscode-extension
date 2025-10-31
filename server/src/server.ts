import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Hover,
  MarkupKind,
  DocumentFormattingParams,
  TextEdit,
  Location,
  ReferenceParams,
  WorkspaceEdit
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';

// Import SomonScript compiler
// The extension is installed in a parent directory, so we need to go up to find the dist folder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let compile: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let KEYWORDS: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Parser: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let TypeChecker: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Lexer: any;

try {
  // Try to load the compiled SomonScript compiler
  const compilerPath = path.resolve(__dirname, '../../../dist/compiler.js');
  const keywordPath = path.resolve(__dirname, '../../../dist/keyword-map.js');
  const parserPath = path.resolve(__dirname, '../../../dist/parser.js');
  const typeCheckerPath = path.resolve(__dirname, '../../../dist/type-checker.js');
  const lexerPath = path.resolve(__dirname, '../../../dist/lexer.js');

  compile = require(compilerPath).compile;
  KEYWORDS = require(keywordPath).KEYWORDS;
  Parser = require(parserPath).Parser;
  TypeChecker = require(typeCheckerPath).TypeChecker;
  Lexer = require(lexerPath).Lexer;
} catch (error) {
  console.error('Failed to load SomonScript compiler:', error);
}

// Create connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', 'т', 'а', 'ф', 'с', 'в', 'б', 'н']
      },
      hoverProvider: true,
      documentFormattingProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      renameProvider: {
        prepareProvider: false
      }
    }
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

interface SomonScriptSettings {
  maxNumberOfProblems: number;
}

const defaultSettings: SomonScriptSettings = { maxNumberOfProblems: 100 };
let globalSettings: SomonScriptSettings = defaultSettings;

const documentSettings: Map<string, Promise<SomonScriptSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    documentSettings.clear();
  } else {
    globalSettings = <SomonScriptSettings>(
      (change.settings.somonscript || defaultSettings)
    );
  }

  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Promise<SomonScriptSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'somonscript'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// Validate document using SomonScript compiler
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const settings = await getDocumentSettings(textDocument.uri);
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  if (compile) {
    try {
      // Use SomonScript compiler to get errors
      const result = compile(text);

      if (result.errors && result.errors.length > 0) {
        const problems = Math.min(result.errors.length, settings.maxNumberOfProblems);

        for (let i = 0; i < problems; i++) {
          const errorMsg = result.errors[i];
          const errorInfo = parseErrorMessage(errorMsg, text);

          const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
              start: { line: errorInfo.line, character: errorInfo.startChar },
              end: { line: errorInfo.line, character: errorInfo.endChar }
            },
            message: errorInfo.message,
            code: errorInfo.code,
            source: 'SomonScript'
          };

          diagnostics.push(diagnostic);
        }
      }

      // Add warnings if any
      if (result.warnings && result.warnings.length > 0) {
        for (const warning of result.warnings) {
          const warningInfo = parseErrorMessage(warning, text);

          const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: warningInfo.line, character: warningInfo.startChar },
              end: { line: warningInfo.line, character: warningInfo.endChar }
            },
            message: warningInfo.message,
            code: warningInfo.code,
            source: 'SomonScript'
          };

          diagnostics.push(diagnostic);
        }
      }
    } catch (error: unknown) {
      // If compilation throws an error, show it as a diagnostic
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: Number.MAX_VALUE }
        },
        message: (error instanceof Error ? error.message : String(error)) || 'Unknown compilation error',
        source: 'SomonScript'
      };
      diagnostics.push(diagnostic);
    }
  }

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Helper function to parse error messages and extract location information
interface ErrorInfo {
  line: number;
  startChar: number;
  endChar: number;
  message: string;
  code?: string;
}

function parseErrorMessage(errorMsg: string, text: string): ErrorInfo {
  // Try to match: "Type error [CODE] at line L, column C: message" format
  const fullMatch = errorMsg.match(/at line (\d+),\s*column (\d+):\s*(.*)/i);
  if (fullMatch) {
    const line = parseInt(fullMatch[1]) - 1; // Convert to 0-indexed
    const column = parseInt(fullMatch[2]) - 1; // Convert to 0-indexed
    const message = fullMatch[3];

    // Extract error code if present
    const codeMatch = errorMsg.match(/\[([A-Z_0-9]+)\]/);
    const code = codeMatch ? codeMatch[1] : undefined;

    // Find the word at the error position and highlight it
    const lines = text.split('\n');
    if (line >= 0 && line < lines.length) {
      const errorLine = lines[line];
      const wordMatch = errorLine.substring(column).match(/[а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z_][а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z0-9_]*/);
      const endChar = wordMatch ? column + wordMatch[0].length : column + 1;

      return {
        line,
        startChar: Math.max(0, column),
        endChar: Math.min(errorLine.length, endChar),
        message,
        code
      };
    }

    return {
      line,
      startChar: Math.max(0, column),
      endChar: Math.max(0, column) + 1,
      message,
      code
    };
  }

  // Try to match: "line L" format (fallback)
  const lineMatch = errorMsg.match(/line (\d+)/i);
  const line = lineMatch ? parseInt(lineMatch[1]) - 1 : 0;

  // Try to match "column C" format
  const columnMatch = errorMsg.match(/column (\d+)/i);
  const column = columnMatch ? parseInt(columnMatch[1]) - 1 : 0;

  return {
    line: Math.max(0, line),
    startChar: Math.max(0, column),
    endChar: Math.max(0, column) + 1,
    message: errorMsg
  };
}

// Keyword documentation mapping
const keywordDocs: Record<string, { description: string; jsEquivalent: string }> = {
  'тағйирёбанда': { description: 'Эълон кардани тағйирёбанда', jsEquivalent: 'let' },
  'собит': { description: 'Эълон кардани собит', jsEquivalent: 'const' },
  'функсия': { description: 'Эълон кардани функсия', jsEquivalent: 'function' },
  'функция': { description: 'Эълон кардани функсия', jsEquivalent: 'function' },
  'агар': { description: 'Изҳороти шартӣ', jsEquivalent: 'if' },
  'вагарна': { description: 'Шарти дигар', jsEquivalent: 'else' },
  'барои': { description: 'Давраи барои', jsEquivalent: 'for' },
  'то': { description: 'То', jsEquivalent: 'to' },
  'бозгашт': { description: 'Бозгашт аз функсия', jsEquivalent: 'return' },
  'синф': { description: 'Эълони синф', jsEquivalent: 'class' },
  'нав': { description: 'Сохтани объекти нав', jsEquivalent: 'new' },
  'ин': { description: 'Истинод ба объекти ҷорӣ', jsEquivalent: 'this' },
  'дуруст': { description: 'Қимати дуруст', jsEquivalent: 'true' },
  'нодуруст': { description: 'Қимати нодуруст', jsEquivalent: 'false' },
  'холӣ': { description: 'Қимати холӣ', jsEquivalent: 'null' },
  'беқимат': { description: 'Беқимат', jsEquivalent: 'undefined' },
  'ворид': { description: 'Воридоти модул', jsEquivalent: 'import' },
  'содир': { description: 'Содироти модул', jsEquivalent: 'export' },
  'аз': { description: 'Аз (барои воридот)', jsEquivalent: 'from' },
  'дар': { description: 'Дар', jsEquivalent: 'in' },
  'пешфарз': { description: 'Пешфарз', jsEquivalent: 'default' },
  'чун': { description: 'Чун', jsEquivalent: 'as' },
  'чоп': { description: 'Чопи паём', jsEquivalent: 'console' },
  'сабт': { description: 'Сабт кардани паём', jsEquivalent: 'log' },
  'хато': { description: 'Паёми хато', jsEquivalent: 'error' },
  'огоҳӣ': { description: 'Паёми огоҳӣ', jsEquivalent: 'warn' },
  'маълумот': { description: 'Маълумот', jsEquivalent: 'info' },
  'шикастан': { description: 'Шикастани давра', jsEquivalent: 'break' },
  'давом': { description: 'Давом додани давра', jsEquivalent: 'continue' },
  'интихоб': { description: 'Изҳороти интихоб', jsEquivalent: 'switch' },
  'ҳолат': { description: 'Ҳолати интихоб', jsEquivalent: 'case' },
  'кӯшиш': { description: 'Кӯшиш кардан', jsEquivalent: 'try' },
  'гирифтан': { description: 'Гирифтани хато', jsEquivalent: 'catch' },
  'ниҳоят': { description: 'Блоки ниҳоӣ', jsEquivalent: 'finally' },
  'партофтан': { description: 'Партофтани хато', jsEquivalent: 'throw' },
  'ҳамзамон': { description: 'Функсияи асинхронӣ', jsEquivalent: 'async' },
  'интизор': { description: 'Интизории натиҷа', jsEquivalent: 'await' },
  'ваъда': { description: 'Ваъда', jsEquivalent: 'Promise' },
  'сатр': { description: 'Навъи сатр', jsEquivalent: 'string' },
  'рақам': { description: 'Навъи рақам', jsEquivalent: 'number' },
  'мантиқӣ': { description: 'Навъи мантиқӣ', jsEquivalent: 'boolean' },
  'интерфейс': { description: 'Эълони интерфейс', jsEquivalent: 'interface' },
  'навъ': { description: 'Таъриф додани навъ', jsEquivalent: 'type' },
  'мерос': { description: 'Мерос бурдан', jsEquivalent: 'extends' },
  'татбиқ': { description: 'Татбиқ кардан', jsEquivalent: 'implements' },
  'супер': { description: 'Истинод ба синфи падар', jsEquivalent: 'super' },
  'конструктор': { description: 'Конструктори синф', jsEquivalent: 'constructor' },
  'хосусӣ': { description: 'Хосияти хосусӣ', jsEquivalent: 'private' },
  'муҳофизатшуда': { description: 'Хосияти муҳофизатшуда', jsEquivalent: 'protected' },
  'ҷамъиятӣ': { description: 'Хосияти ҷамъиятӣ', jsEquivalent: 'public' },
  'статикӣ': { description: 'Хосияти статикӣ', jsEquivalent: 'static' },
  'мавҳум': { description: 'Синфи мавҳум', jsEquivalent: 'abstract' },
  'номфазо': { description: 'Номфазо', jsEquivalent: 'namespace' }
};

// Provide completion items
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    const completionItems: CompletionItem[] = [];

    // Get the document
    const document = documents.get(textDocumentPosition.textDocument.uri);
    if (!document) {
      return completionItems;
    }

    // Get the text and cursor position
    const text = document.getText();
    const offset = document.offsetAt(textDocumentPosition.position);

    // Check if we're completing after a dot (member access)
    const textBeforeCursor = text.substring(Math.max(0, offset - 50), offset);
    const memberAccessMatch = textBeforeCursor.match(/([а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z_][а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z0-9_]*)\.\s*$/);

    if (memberAccessMatch) {
      // We're completing after a dot - provide member completions
      const objectName = memberAccessMatch[1];

      // Try to infer the type of the object
      const memberCompletions = getMemberCompletions(text, objectName);

      if (memberCompletions.length > 0) {
        return memberCompletions;
      }

      // If we couldn't determine the type, provide common method names
      return getCommonMemberCompletions();
    }

    // Check if we're completing after 'чоп.'
    if (textBeforeCursor.match(/чоп\.\s*$/)) {
      return [
        {
          label: 'сабт',
          kind: CompletionItemKind.Method,
          insertText: 'сабт($1)',
          detail: 'console.log',
          documentation: 'Чопи паём / Console log'
        },
        {
          label: 'хато',
          kind: CompletionItemKind.Method,
          insertText: 'хато($1)',
          detail: 'console.error',
          documentation: 'Паёми хато / Error message'
        },
        {
          label: 'огоҳӣ',
          kind: CompletionItemKind.Method,
          insertText: 'огоҳӣ($1)',
          detail: 'console.warn',
          documentation: 'Паёми огоҳӣ / Warning message'
        },
        {
          label: 'маълумот',
          kind: CompletionItemKind.Method,
          insertText: 'маълумот($1)',
          detail: 'console.info',
          documentation: 'Маълумот / Info message'
        }
      ];
    }

    // Add all keywords as completion items
    if (KEYWORDS) {
      const keywords = Array.from(KEYWORDS.keys());
      keywords.forEach((keyword, index) => {
        const doc = keywordDocs[keyword as string];
        completionItems.push({
          label: keyword as string,
          kind: CompletionItemKind.Keyword,
          data: index,
          detail: doc ? `${doc.description} (${doc.jsEquivalent})` : keyword as string,
          documentation: doc ? `JavaScript: ${doc.jsEquivalent}` : undefined
        });
      });
    }

    // Add commonly used snippets as completions
    const snippets = [
      {
        label: 'чоп.сабт',
        kind: CompletionItemKind.Snippet,
        insertText: 'чоп.сабт($1);',
        detail: 'Чопи паём / Console log',
        documentation: 'JavaScript: console.log()'
      },
      {
        label: 'функсия',
        kind: CompletionItemKind.Snippet,
        insertText: 'функсия ${1:номи_функсия}(${2:параметрҳо}) {\n\t$0\n}',
        detail: 'Эълон кардани функсия',
        documentation: 'JavaScript: function'
      },
      {
        label: 'синф',
        kind: CompletionItemKind.Snippet,
        insertText: 'синф ${1:НомиСинф} {\n\tконструктор(${2:параметрҳо}) {\n\t\t$0\n\t}\n}',
        detail: 'Эълони синф',
        documentation: 'JavaScript: class'
      }
    ];

    return [...completionItems, ...snippets];
  }
);

// Helper function to get member completions based on type inference
function getMemberCompletions(text: string, objectName: string): CompletionItem[] {
  const completions: CompletionItem[] = [];

  // If Parser, TypeChecker, or Lexer aren't loaded, fall back to empty completions
  if (!Parser || !TypeChecker || !Lexer) {
    return completions;
  }

  try {
    // Parse the document into an AST
    const lexer = new Lexer(text);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Run type checker to build symbol table
    const checker = new TypeChecker(text);
    checker.check(ast);
    const symbolTable = checker.getSymbolTable();

    // Look up the variable in the symbol table
    const varType = symbolTable.get(objectName);
    
    if (varType && varType.kind === 'class' && varType.properties) {
      // Get all class members including inherited ones
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allProperties = new Map<string, any>();
      
      // Collect properties from the current class
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      varType.properties.forEach((propType: any, propName: string) => {
        allProperties.set(propName, propType);
      });

      // Collect properties from base class (inheritance)
      let currentBase = varType.baseType;
      while (currentBase) {
        if (currentBase.properties) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentBase.properties.forEach((propType: any, propName: string) => {
            if (!allProperties.has(propName)) {
              allProperties.set(propName, propType);
            }
          });
        }
        currentBase = currentBase.baseType;
      }

      // Convert to CompletionItems
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allProperties.forEach((propType: any, propName: string) => {
        if (propType.type.kind === 'function') {
          // It's a method
          const returnTypeName = propType.type.returnType?.name || propType.type.returnType?.kind || 'беқимат';
          completions.push({
            label: propName,
            kind: CompletionItemKind.Method,
            insertText: `${propName}($1)`,
            detail: `Метод (бозмегардонад ${returnTypeName})`,
            documentation: `Метод аз синфи ${varType.name || objectName}`
          });
        } else {
          // It's a property
          const typeName = propType.type.name || propType.type.kind;
          completions.push({
            label: propName,
            kind: CompletionItemKind.Property,
            detail: `Хосият: ${typeName}`,
            documentation: `Хосият аз синфи ${varType.name || objectName}`
          });
        }
      });
    }
  } catch (error) {
    // If parsing fails, return empty completions
    console.error('Error getting member completions:', error);
  }

  return completions;
}

// Helper function to provide common member completions when type can't be inferred
function getCommonMemberCompletions(): CompletionItem[] {
  return [
    {
      label: 'дарозӣ',
      kind: CompletionItemKind.Property,
      detail: 'length (хосияти массив)',
      documentation: 'Дарозии массив'
    },
    {
      label: 'илова',
      kind: CompletionItemKind.Method,
      insertText: 'илова($1)',
      detail: 'push (методи массив)',
      documentation: 'Илова кардани элемент ба массив'
    },
    {
      label: 'баровардан',
      kind: CompletionItemKind.Method,
      insertText: 'баровардан()',
      detail: 'pop (методи массив)',
      documentation: 'Баровардани элементи охирин'
    },
    {
      label: 'харита',
      kind: CompletionItemKind.Method,
      insertText: 'харита($1)',
      detail: 'map (методи массив)',
      documentation: 'Табдил додани ҳар як элемент'
    },
    {
      label: 'филтр',
      kind: CompletionItemKind.Method,
      insertText: 'филтр($1)',
      detail: 'filter (методи массив)',
      documentation: 'Филтр кардани элементҳо'
    },
    {
      label: 'кофтан',
      kind: CompletionItemKind.Method,
      insertText: 'кофтан($1)',
      detail: 'indexOf (методи массив)',
      documentation: 'Ёфтани индекси элемент'
    }
  ];
}

// Resolve additional information for completion items
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    const keyword = item.label;
    const doc = keywordDocs[keyword];

    if (doc) {
      item.detail = `${doc.description} (${doc.jsEquivalent})`;
      item.documentation = {
        kind: MarkupKind.Markdown,
        value: [
          `**SomonScript:** \`${keyword}\``,
          `**JavaScript:** \`${doc.jsEquivalent}\``,
          '',
          doc.description
        ].join('\n')
      };
    }

    return item;
  }
);

// Provide hover information
connection.onHover(
  (params: TextDocumentPositionParams): Hover | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    const text = document.getText();
    const offset = document.offsetAt(params.position);

    // Find the word at the cursor position
    let start = offset;
    let end = offset;

    while (start > 0 && /[а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z_]/.test(text[start - 1])) {
      start--;
    }

    while (end < text.length && /[а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z0-9_]/.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end);
    const doc = keywordDocs[word];

    if (doc) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: [
            `**${word}**`,
            '',
            `*${doc.description}*`,
            '',
            `JavaScript: \`${doc.jsEquivalent}\``
          ].join('\n')
        }
      };
    }

    return null;
  }
);

// Format document
connection.onDocumentFormatting(
  (params: DocumentFormattingParams): TextEdit[] => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }

    const text = document.getText();
    const formatted = formatDocument(text, params.options);

    return [
      TextEdit.replace(
        {
          start: { line: 0, character: 0 },
          end: { line: document.lineCount - 1, character: document.getText().split('\n')[document.lineCount - 1].length }
        },
        formatted
      )
    ];
  }
);

// Helper function to format the document
function formatDocument(text: string, options: { tabSize: number; insertSpaces: boolean }): string {
  const lines = text.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;
  const indentStr = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      formatted.push('');
      continue;
    }

    // Decrease indent for closing braces
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add the formatted line with proper indentation
    const indentedLine = indentStr.repeat(indentLevel) + trimmed;
    formatted.push(indentedLine);

    // Increase indent for opening braces
    const openBraces = (trimmed.match(/[{(\[]/g) || []).length;
    const closeBraces = (trimmed.match(/[})\\]]/g) || []).length;
    indentLevel += openBraces - closeBraces;
  }

  return formatted.join('\n');
}

// Provide definition information
connection.onDefinition(
  (params: TextDocumentPositionParams): Location | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    const text = document.getText();
    const offset = document.offsetAt(params.position);
    const symbol = getSymbolAtPosition(text, offset);

    if (!symbol) {
      return null;
    }

    const definitions = findSymbolDefinitions(text, symbol);
    if (definitions.length > 0) {
      const def = definitions[0];
      return Location.create(params.textDocument.uri, def.range);
    }

    return null;
  }
);

// Provide references
connection.onReferences(
  (params: ReferenceParams): Location[] => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return [];
    }

    const text = document.getText();
    const offset = document.offsetAt(params.position);
    const symbol = getSymbolAtPosition(text, offset);

    if (!symbol) {
      return [];
    }

    const references = findSymbolReferences(text, symbol, params.textDocument.uri, params.context.includeDeclaration);
    return references;
  }
);

// Provide rename functionality
// eslint-disable-next-line @typescript-eslint/no-explicit-any
connection.onRenameRequest(
  (params: any): WorkspaceEdit | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    const text = document.getText();
    const offset = document.offsetAt(params.position);
    const symbol = getSymbolAtPosition(text, offset);

    if (!symbol || !params.newName) {
      return null;
    }

    return renameSymbol(text, symbol, params.newName, params.textDocument.uri);
  }
);

// Helper function to extract the symbol at a given position
function getSymbolAtPosition(text: string, offset: number): string | null {
  const identifierPattern = /[а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z_][а-яА-ЯёЁӣӢқҚғҒҳҲҷҶa-zA-Z0-9_]*/g;
  let match;

  while ((match = identifierPattern.exec(text)) !== null) {
    if (match.index <= offset && offset <= match.index + match[0].length) {
      return match[0];
    }
  }

  return null;
}

// Helper function to find where a symbol is defined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findSymbolDefinitions(text: string, symbol: string): any[] {
  const definitions: any[] = [];
  const lines = text.split('\n');

  // Pattern to find definitions: var/const/let/function/class declarations
  const defPatterns = [
    new RegExp(`^\\s*(тағйирёбанда|собит|функсия|функция|синф|интерфейс|навъ)\\s+${symbol}\\s*[(:=]`),
    new RegExp(`^\\s*${symbol}\\s*\\(.*\\)\\s*[:{]`),
    new RegExp(`^\\s*${symbol}\\s*[:=]`)
  ];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    for (const pattern of defPatterns) {
      if (pattern.test(line)) {
        const charPos = line.indexOf(symbol);
        if (charPos !== -1) {
          definitions.push({
            range: {
              start: { line: lineNum, character: charPos },
              end: { line: lineNum, character: charPos + symbol.length }
            }
          });
          break;
        }
      }
    }
  }

  return definitions;
}

// Helper function to find all references to a symbol
function findSymbolReferences(text: string, symbol: string, uri: string, includeDeclaration: boolean): Location[] {
  const references: Location[] = [];
  const lines = text.split('\n');
  const symbolRegex = new RegExp(`\\b${symbol}\\b`, 'g');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let match;

    while ((match = symbolRegex.exec(line)) !== null) {
      // Check if this is a definition or a reference
      const isDefinition = /^\\s*(тағйирёбанда|собит|функсия|функция|синф|интерфейс|навъ)\s+/.test(line);

      if (includeDeclaration || !isDefinition) {
        references.push(
          Location.create(uri, {
            start: { line: lineNum, character: match.index },
            end: { line: lineNum, character: match.index + symbol.length }
          })
        );
      }
    }
  }

  return references;
}

// Helper function to rename a symbol throughout the document
function renameSymbol(text: string, oldName: string, newName: string, uri: string): WorkspaceEdit {
  const edits: TextEdit[] = [];
  const lines = text.split('\n');
  const symbolRegex = new RegExp(`\\b${oldName}\\b`, 'g');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let match;

    while ((match = symbolRegex.exec(line)) !== null) {
      edits.push(
        TextEdit.replace(
          {
            start: { line: lineNum, character: match.index },
            end: { line: lineNum, character: match.index + oldName.length }
          },
          newName
        )
      );
    }
  }

  const workspaceEdit: WorkspaceEdit = {
    changes: {
      [uri]: edits
    }
  };

  return workspaceEdit;
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
