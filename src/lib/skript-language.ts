/* ═══════════════════════════════════════════
   Skripted — Monaco Monarch Tokenizer for Skript
   Custom syntax highlighting for Minecraft Skript
   ═══════════════════════════════════════════ */

import type { languages } from 'monaco-editor';

export const SKRIPT_LANGUAGE_ID = 'skript' as const;

export const skriptTokensProvider: languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: true,

  keywords: [
    'if', 'else', 'else if', 'loop', 'while', 'stop', 'return',
    'continue', 'exit', 'trigger', 'function', 'options', 'variables',
    'command', 'permission', 'usage', 'description', 'aliases',
    'cooldown', 'executable by', 'prefix',
  ],

  effects: [
    'set', 'send', 'broadcast', 'message', 'teleport', 'kill',
    'give', 'remove', 'add', 'delete', 'clear', 'cancel', 'wait',
    'execute', 'damage', 'heal', 'feed', 'spawn', 'drop', 'push',
    'launch', 'ban', 'unban', 'kick', 'enchant', 'strike',
    'make', 'apply', 'open', 'close', 'play', 'log', 'charge',
  ],

  conditions: [
    'is', 'are', 'isn't', 'aren't', 'was', 'were', 'will',
    'can', 'cannot', 'has', 'have', 'doesn't have', 'contains',
    'does not contain', 'is set', 'is not set', 'exists',
  ],

  types: [
    'player', 'console', 'block', 'item', 'entity', 'world',
    'location', 'inventory', 'number', 'integer', 'text', 'string',
    'boolean', 'list', 'object', 'slot', 'vector', 'color',
    'potion', 'enchantment', 'biome', 'timespan', 'date',
    'offlineplayer', 'projectile', 'weather',
  ],

  events: [
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
    'every', 'at',
  ],

  symbols: /[=><!~?:&|+\-*/^%]+/,

  tokenizer: {
    root: [
      // Comments
      [/#.*$/, 'comment'],

      // Strings
      [/"([^"\]|\.)*"/, 'string'],

      // Variables: {_local}, {global}, {list::*}
      [/\{_[^}]*\}/, 'variable.local'],
      [/\{[^}]*\}/, 'variable.global'],

      // Colored text codes: &a, &b, §c, etc.
      [/[&§][0-9a-fk-or]/i, 'string.escape'],

      // Numbers
      [/\b\d+(\.\d+)?\b/, 'number'],

      // Event triggers (lines starting with "on ...")
      [/^[ 	]*(on\s+[\w\s]+):/, 'keyword.event'],
      [/^[ 	]*(every\s+.+):/, 'keyword.event'],
      [/^[ 	]*(at\s+.+):/, 'keyword.event'],

      // Command definitions
      [/^[ 	]*(command\s+\/[\w]+):/, 'keyword.command'],

      // Function definitions
      [/^[ 	]*(function\s+\w+)\(/, 'keyword.function'],

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
      [/[ 	
]+/, 'white'],
    ],
  },
};

export const skriptTheme: languages.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' }, // Dracula: Comment
    { token: 'string', foreground: 'f1fa8c' }, // Dracula: String
    { token: 'string.escape', foreground: 'ffb86c' }, // Dracula: Orange
    { token: 'number', foreground: 'bd93f9' }, // Dracula: Purple
    { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' }, // Dracula: Pink
    { token: 'keyword.event', foreground: '50fa7b', fontStyle: 'bold' }, // Dracula: Green
    { token: 'keyword.command', foreground: 'ff5555', fontStyle: 'bold' }, // Dracula: Red
    { token: 'keyword.function', foreground: '8be9fd', fontStyle: 'bold' }, // Dracula: Cyan
    { token: 'keyword.section', foreground: '50fa7b', fontStyle: 'bold' }, // Dracula: Green
    { token: 'keyword.effect', foreground: '8be9fd' }, // Dracula: Cyan
    { token: 'keyword.condition', foreground: 'ff79c6' }, // Dracula: Pink
    { token: 'type', foreground: '8be9fd' }, // Dracula: Cyan
    { token: 'variable.local', foreground: '50fa7b' }, // Dracula: Green
    { token: 'variable.global', foreground: 'ffb86c' }, // Dracula: Orange
    { token: 'operator', foreground: 'ff79c6' }, // Dracula: Pink
    { token: 'delimiter.arrow', foreground: 'ff79c6' }, // Dracula: Pink
    { token: 'delimiter.colon', foreground: 'f8f8f2' }, // Dracula: Foreground
    { token: 'identifier', foreground: 'f8f8f2' }, // Dracula: Foreground
  ],
  colors: {
    'editor.background': '#1e1f29', // Slightly different from globals for focus
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#282a36', // Dracula: Background
    'editor.selectionBackground': '#44475a', // Dracula: Selection
    'editorCursor.foreground': '#f8f8f2',
    'editorLineNumber.foreground': '#6272a4',
    'editorLineNumber.activeForeground': '#f8f8f2',
    'editor.selectionHighlightBackground': '#44475a80',
    'editor.wordHighlightBackground': '#44475a80',
    'editor.wordHighlightStrongBackground': '#44475a',
  },
};
