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
  MarkupKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';

// Import SomonScript compiler
// The extension is installed in a parent directory, so we need to go up to find the dist folder
let compile: any;
let KEYWORDS: any;
let Parser: any;
let TypeChecker: any;
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
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', 'т', 'а', 'ф', 'с', 'в', 'б', 'н']
      },
      hoverProvider: true
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

const documentSettings: Map<string, Thenable<SomonScriptSettings>> = new Map();

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

function getDocumentSettings(resource: string): Thenable<SomonScriptSettings> {
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

          // Try to extract line and column info from error message
          const lineMatch = errorMsg.match(/line (\d+)/i);
          const line = lineMatch ? parseInt(lineMatch[1]) - 1 : 0;

          const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
              start: { line: line, character: 0 },
              end: { line: line, character: Number.MAX_VALUE }
            },
            message: errorMsg,
            source: 'SomonScript'
          };

          diagnostics.push(diagnostic);
        }
      }

      // Add warnings if any
      if (result.warnings && result.warnings.length > 0) {
        for (const warning of result.warnings) {
          const lineMatch = warning.match(/line (\d+)/i);
          const line = lineMatch ? parseInt(lineMatch[1]) - 1 : 0;

          const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Warning,
            range: {
              start: { line: line, character: 0 },
              end: { line: line, character: Number.MAX_VALUE }
            },
            message: warning,
            source: 'SomonScript'
          };

          diagnostics.push(diagnostic);
        }
      }
    } catch (error: any) {
      // If compilation throws an error, show it as a diagnostic
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: Number.MAX_VALUE }
        },
        message: error.message || 'Unknown compilation error',
        source: 'SomonScript'
      };
      diagnostics.push(diagnostic);
    }
  }

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
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
      const allProperties = new Map<string, any>();
      
      // Collect properties from the current class
      varType.properties.forEach((propType: any, propName: string) => {
        allProperties.set(propName, propType);
      });

      // Collect properties from base class (inheritance)
      let currentBase = varType.baseType;
      while (currentBase) {
        if (currentBase.properties) {
          currentBase.properties.forEach((propType: any, propName: string) => {
            if (!allProperties.has(propName)) {
              allProperties.set(propName, propType);
            }
          });
        }
        currentBase = currentBase.baseType;
      }

      // Convert to CompletionItems
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

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
