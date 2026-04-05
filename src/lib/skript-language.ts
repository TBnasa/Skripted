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
    'is', 'are', 'isn\'t', 'aren\'t', 'was', 'were', 'will',
    'can', 'cannot', 'has', 'have', 'doesn\'t have', 'contains',
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

export const skriptTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
    { token: 'string', foreground: '98c379' },
    { token: 'string.escape', foreground: 'd19a66' },
    { token: 'number', foreground: 'd19a66' },
    { token: 'keyword', foreground: 'c678dd', fontStyle: 'bold' },
    { token: 'keyword.event', foreground: 'e5c07b', fontStyle: 'bold' },
    { token: 'keyword.command', foreground: 'e06c75', fontStyle: 'bold' },
    { token: 'keyword.function', foreground: '61afef', fontStyle: 'bold' },
    { token: 'keyword.section', foreground: 'e5c07b', fontStyle: 'bold' },
    { token: 'keyword.effect', foreground: '61afef' },
    { token: 'keyword.condition', foreground: 'c678dd' },
    { token: 'type', foreground: 'e5c07b' },
    { token: 'variable.local', foreground: '56b6c2' },
    { token: 'variable.global', foreground: 'e06c75' },
    { token: 'operator', foreground: '56b6c2' },
    { token: 'delimiter.arrow', foreground: 'c678dd' },
    { token: 'delimiter.colon', foreground: 'abb2bf' },
    { token: 'identifier', foreground: 'abb2bf' },
  ],
  colors: {
    'editor.background': '#0d0d14',
    'editor.foreground': '#abb2bf',
    'editor.lineHighlightBackground': '#1a1a2e',
    'editor.selectionBackground': '#3e4451',
    'editorCursor.foreground': '#6c5ce7',
    'editorLineNumber.foreground': '#3a3a5c',
    'editorLineNumber.activeForeground': '#6c5ce7',
    'editor.selectionHighlightBackground': '#3e445180',
  },
};
