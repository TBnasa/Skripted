/* ═══════════════════════════════════════════
   Skripted — Monaco Skript Language Definition
   Premium syntax highlighting and IntelliSense
   ═══════════════════════════════════════════ */

import type { languages, editor } from 'monaco-editor';

export const SKRIPT_LANGUAGE_ID = 'skript' as const;

// Keywords for Monarch & Suggestions
const KEYWORDS = [
  'if', 'else', 'else if', 'loop', 'while', 'stop', 'return',
  'continue', 'exit', 'trigger', 'function', 'options', 'variables',
  'command', 'permission', 'usage', 'description', 'aliases',
  'cooldown', 'executable by', 'prefix', 'permission message',
  'arguments', 'arg', 'parameter', 'local', 'broadcast', 'message'
];

const EFFECTS = [
  'set', 'send', 'broadcast', 'message', 'teleport', 'kill',
  'give', 'remove', 'add', 'delete', 'clear', 'cancel event', 'wait',
  'execute', 'damage', 'heal', 'feed', 'spawn', 'drop', 'push',
  'launch', 'ban', 'unban', 'kick', 'enchant', 'strike lightning',
  'make', 'apply', 'open', 'close', 'play sound', 'log', 'charge',
  'ignite', 'extinguish', 'toggle', 'force', 'create a new gui',
  'set slot', 'format slot', 'unformat slot', 'load', 'unload'
];

const CONDITIONS = [
  'is', 'are', 'isn\'t', 'aren\'t', 'was', 'were', 'will',
  'can', 'cannot', 'has', 'have', 'doesn\'t have', 'contains',
  'does not contain', 'is set', 'is not set', 'exists',
  'is true', 'is false', 'is greater than', 'is less than',
  'is higher than', 'is lower than', 'is in', 'is between',
  'is wearing', 'is holding', 'is sneaking', 'is sprinting',
  'is flying', 'is swimming', 'is online', 'is op', 'has permission'
];

const TYPES = [
  'player', 'console', 'block', 'item', 'entity', 'world',
  'location', 'inventory', 'number', 'integer', 'text', 'string',
  'boolean', 'list', 'object', 'slot', 'vector', 'color',
  'potion', 'enchantment', 'biome', 'timespan', 'date',
  'offlineplayer', 'projectile', 'weather', 'game mode', 'difficulty',
  'damage cause', 'inventory type'
];

const EVENTS = [
  'on join', 'on quit', 'on break', 'on place', 'on click',
  'on rightclick', 'on leftclick', 'on death', 'on respawn',
  'on damage', 'on heal', 'on chat', 'on command', 'on move',
  'on sneak', 'on sprint', 'on jump', 'on fly', 'on swap hand',
  'on drop', 'on pickup', 'on craft', 'on consume', 'on shoot',
  'on projectile hit', 'on explode', 'on ignite', 'on grow',
  'on form', 'on spread', 'on fade', 'on burn', 'on spawn',
  'on tame', 'on breed', 'on egg throw', 'on fish',
  'on anvil prepare', 'on enchant', 'on inventory click',
  'on inventory close', 'on inventory open', 'on world load',
  'on world save', 'on world unload', 'on server start',
  'on server stop', 'on script load', 'on script unload',
  'every', 'at', 'on plugin load', 'on velocity change'
];

export const skriptTokensProvider: languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: true,
  keywords: KEYWORDS,
  effects: EFFECTS,
  conditions: CONDITIONS,
  types: TYPES,
  events: EVENTS,

  symbols: /[=><!~?:&|+\-*/^%]+/,

  tokenizer: {
    root: [
      // Comments
      [/#.*$/, 'comment'],

      // Strings
      [/"([^"\\]|\\.)*"/, 'string'],

      // Variables: {_local}, {global}, {list::*}
      [/\{_[^}]*\}/, 'variable.local'],
      [/\{[^}]*\}/, 'variable.global'],

      // Colored text codes: &a, &b, §c, etc.
      [/[&§][0-9a-fk-or]/i, 'string.escape'],

      // Numbers
      [/\b\d+(\.\d+)?\b/, 'number'],

      // Event triggers (lines starting with "on ...")
      [/^[ \t]*(on\s+[\w\s]+):/, 'keyword.event'],
      [/^[ \t]*(every\s+.+):/, 'keyword.event'],
      [/^[ \t]*(at\s+.+):/, 'keyword.event'],

      // Command definitions
      [/^[ \t]*(command\s+\/[\w]+):/, 'keyword.command'],

      // Function definitions
      [/^[ \t]*(function\s+\w+)\(/, 'keyword.function'],

      // Options / Variables sections
      [/^(options|variables):/, 'keyword.section'],

      // Identifiers & keywords
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@effects': 'keyword.effect',
          '@conditions': 'keyword.condition',
          '@types': 'type',
          '@default': 'identifier',
        },
      }],

      // Arrows and colons (important in Skript)
      [/->/, 'delimiter.arrow'],
      [/:$/, 'delimiter.colon'],
      [/@symbols/, 'operator'],

      // Whitespace
      [/[ \t\r\n]+/, 'white'],
    ],
  },
};

export const skriptTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'string.escape', foreground: 'ffb86c' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
    { token: 'keyword.event', foreground: '50fa7b', fontStyle: 'bold' },
    { token: 'keyword.command', foreground: 'ff5555', fontStyle: 'bold' },
    { token: 'keyword.function', foreground: '8be9fd', fontStyle: 'bold' },
    { token: 'keyword.section', foreground: '50fa7b', fontStyle: 'bold' },
    { token: 'keyword.effect', foreground: '8be9fd' },
    { token: 'keyword.condition', foreground: 'ff79c6' },
    { token: 'type', foreground: '8be9fd' },
    { token: 'variable.local', foreground: '50fa7b' },
    { token: 'variable.global', foreground: 'ffb86c' },
    { token: 'operator', foreground: 'ff79c6' },
    { token: 'delimiter.arrow', foreground: 'ff79c6' },
    { token: 'delimiter.colon', foreground: 'f8f8f2' },
    { token: 'identifier', foreground: 'f8f8f2' },
  ],
  colors: {
    'editor.background': '#1e1f29',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#282a36',
    'editor.selectionBackground': '#44475a',
    'editorCursor.foreground': '#f8f8f2',
    'editorLineNumber.foreground': '#6272a4',
    'editorLineNumber.activeForeground': '#f8f8f2',
    'editor.selectionHighlightBackground': '#44475a80',
    'editor.wordHighlightBackground': '#44475a80',
    'editor.wordHighlightStrongBackground': '#44475a',
  },
};

/**
 * Register everything for Skript language in a single call
 */
export function registerSkriptLanguage(monaco: any) {
  // 1. Register language if not exists
  if (!monaco.languages.getLanguages().some((lang: any) => lang.id === SKRIPT_LANGUAGE_ID)) {
    monaco.languages.register({ id: SKRIPT_LANGUAGE_ID });
    
    // 2. Token Provider
    monaco.languages.setMonarchTokensProvider(SKRIPT_LANGUAGE_ID, skriptTokensProvider);
    
    // 3. Theme
    monaco.editor.defineTheme('skripted-dark', skriptTheme);

    // 4. Completion Provider (IntelliSense)
    monaco.languages.registerCompletionItemProvider(SKRIPT_LANGUAGE_ID, {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // Keywords
          ...KEYWORDS.map(k => ({
            label: k,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: k,
            range
          })),
          // Effects
          ...EFFECTS.map(e => ({
            label: e,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: e,
            range
          })),
          // Types
          ...TYPES.map(t => ({
            label: t,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: t,
            range
          })),
          // Events
          ...EVENTS.map(ev => ({
            label: ev,
            kind: monaco.languages.CompletionItemKind.Event,
            insertText: ev + ':',
            range
          })),
          
          // SNIPPETS
          {
            label: 'command',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'command /${1:name}:',
              '\tpermission: ${2:admin}',
              '\ttrigger:',
              '\t\t${3:send "Hello!" to player}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Base Skript command structure',
            range
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'function ${1:funcName}(${2:p: player}):',
              '\ttrigger:',
              '\t\t$0'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Base Skript function structure',
            range
          },
          {
              label: 'gui',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: [
                'create a new gui with id "${1:menu}" with 3 rows named "${2:Menu}":',
                '\tset slot ${3:0} with ${4:diamond} named "${5:Item}" to run:',
                '\t\t${6:send "Clicked!" to player}',
                'open gui "${1:menu}" to player'
              ].join('\n'),
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Create a GUI (Requires SkBee or SkQuery)',
              range
          },
          {
            label: 'if-else',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'if ${1:condition}:',
              '\t$2',
              'else:',
              '\t$3'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Basic if-else statement',
            range
          }
        ];

        return { suggestions };
      }
    });
  }
}
