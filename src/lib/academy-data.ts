/* ═══════════════════════════════════════════
   Skripted Academy — Curriculum Data Engine
   ═══════════════════════════════════════════ */

// ── Block Type System ──
export type BlockType = 'event' | 'action' | 'condition' | 'variable' | 'loop' | 'comment';

export interface CodeBlock {
  readonly id: string;
  readonly type: BlockType;
  readonly label: string;        // Display label (e.g., "on join:")
  readonly code: string;         // Actual Skript code this block represents
  readonly indent: number;       // Nesting level (0 = root, 1 = inside event, etc.)
  readonly acceptsChildren?: boolean;
}

export interface LessonHint {
  readonly text_tr: string;
  readonly text_en: string;
}

export type LessonPhase = 'blocks' | 'bridge' | 'code';

export interface Lesson {
  readonly id: string;
  readonly moduleId: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string;
  readonly description_en: string;
  readonly objective_tr: string;
  readonly objective_en: string;
  readonly phase: LessonPhase;
  readonly xpReward: number;
  readonly isBossLevel: boolean;
  readonly availableBlocks: readonly CodeBlock[];
  readonly solution: readonly string[];     // Ordered block IDs for correct answer
  readonly solutionCode: string;            // The final Skript code this builds
  readonly hints: readonly LessonHint[];
  readonly starterCode?: string;            // For Phase 3 (code) lessons
}

export interface Module {
  readonly id: string;
  readonly title_tr: string;
  readonly title_en: string;
  readonly description_tr: string;
  readonly description_en: string;
  readonly icon: string;           // Lucide icon name
  readonly color: string;          // Tailwind color (emerald, purple, amber, cyan)
  readonly requiredXp: number;     // XP needed to unlock this module
  readonly lessons: readonly Lesson[];
}

// ── Block Color Map ──
export const BLOCK_COLORS: Record<BlockType, { bg: string; border: string; text: string; glow: string }> = {
  event:     { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  action:    { bg: 'bg-blue-500/15',    border: 'border-blue-500/40',    text: 'text-blue-400',    glow: 'shadow-blue-500/20' },
  condition: { bg: 'bg-amber-500/15',   border: 'border-amber-500/40',   text: 'text-amber-400',   glow: 'shadow-amber-500/20' },
  variable:  { bg: 'bg-purple-500/15',  border: 'border-purple-500/40',  text: 'text-purple-400',  glow: 'shadow-purple-500/20' },
  loop:      { bg: 'bg-red-500/15',     border: 'border-red-500/40',     text: 'text-red-400',     glow: 'shadow-red-500/20' },
  comment:   { bg: 'bg-zinc-500/15',    border: 'border-zinc-500/40',    text: 'text-zinc-400',    glow: 'shadow-zinc-500/20' },
} as const;

// ── Rank System ──
export const RANKS = [
  { minXp: 0,    title_tr: 'Çaylak',      title_en: 'Novice',       emoji: '🌱' },
  { minXp: 100,  title_tr: 'Çırak',       title_en: 'Apprentice',   emoji: '⚡' },
  { minXp: 300,  title_tr: 'Geliştirici', title_en: 'Developer',    emoji: '💻' },
  { minXp: 600,  title_tr: 'Mimar',       title_en: 'Architect',    emoji: '🏗️' },
  { minXp: 1000, title_tr: 'Üstat',       title_en: 'Grandmaster',  emoji: '👑' },
] as const;

export function getRank(xp: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(xp: number) {
  for (const rank of RANKS) {
    if (xp < rank.minXp) return rank;
  }
  return null; // Already max rank
}

// ── Phase Transition Thresholds ──
export const PHASE_THRESHOLDS = {
  blocks: 0,    // Always available
  bridge: 5,    // Unlocked at level 5 (after completing ~5 lessons)
  code: 10,     // Unlocked at level 10
} as const;

export function getLevelFromXp(xp: number): number {
  return Math.floor(xp / 50) + 1;
}

export function getPhaseForLevel(level: number): LessonPhase {
  if (level >= PHASE_THRESHOLDS.code) return 'code';
  if (level >= PHASE_THRESHOLDS.bridge) return 'bridge';
  return 'blocks';
}

// ══════════════════════════════════════
//  MODULE 1: BASICS (Temel Yapılar)
// ══════════════════════════════════════

const MODULE_BASICS_LESSONS: readonly Lesson[] = [
  {
    id: 'basics-1-hello',
    moduleId: 'basics',
    title_tr: 'İlk Mesajın',
    title_en: 'Your First Message',
    description_tr: 'Bir oyuncu sunucuya katıldığında onlara bir karşılama mesajı gönder.',
    description_en: 'Send a welcome message when a player joins the server.',
    objective_tr: '"on join" olayını kullanarak bir mesaj gönder.',
    objective_en: 'Use the "on join" event to send a message.',
    phase: 'blocks',
    xpReward: 25,
    isBossLevel: false,
    availableBlocks: [
      { id: 'b1-event-join', type: 'event', label: 'on join:', code: 'on join:', indent: 0, acceptsChildren: true },
      { id: 'b1-action-send', type: 'action', label: 'send "Hoşgeldin!" to player', code: '\tsend "Hoşgeldin!" to player', indent: 1 },
      { id: 'b1-distractor-1', type: 'action', label: 'broadcast "Test"', code: '\tbroadcast "Test"', indent: 1 },
      { id: 'b1-distractor-2', type: 'event', label: 'on break:', code: 'on break:', indent: 0, acceptsChildren: true },
    ],
    solution: ['b1-event-join', 'b1-action-send'],
    solutionCode: 'on join:\n\tsend "Hoşgeldin!" to player',
    hints: [
      { text_tr: 'Bir olayı dinlemen lazım. Oyuncu sunucuya ne yapıyor?', text_en: 'You need to listen for an event. What does a player do when they connect?' },
      { text_tr: '"on join:" bloğu ile başla, sonra bir aksiyon ekle.', text_en: 'Start with the "on join:" block, then add an action.' },
      { text_tr: 'Cevap: on join: → send "Hoşgeldin!" to player', text_en: 'Answer: on join: → send "Hoşgeldin!" to player' },
    ],
  },
  {
    id: 'basics-2-broadcast',
    moduleId: 'basics',
    title_tr: 'Herkese Duyur',
    title_en: 'Broadcast to All',
    description_tr: 'Bir oyuncu katıldığında tüm sunucuya duyuru yap.',
    description_en: 'Broadcast a message to the entire server when a player joins.',
    objective_tr: '"broadcast" komutunu kullanarak tüm oyunculara mesaj gönder.',
    objective_en: 'Use the "broadcast" command to send a message to all players.',
    phase: 'blocks',
    xpReward: 25,
    isBossLevel: false,
    availableBlocks: [
      { id: 'b2-event-join', type: 'event', label: 'on join:', code: 'on join:', indent: 0, acceptsChildren: true },
      { id: 'b2-action-broadcast', type: 'action', label: 'broadcast "%player% katıldı!"', code: '\tbroadcast "%player% katıldı!"', indent: 1 },
      { id: 'b2-action-send', type: 'action', label: 'send "Merhaba" to player', code: '\tsend "Merhaba" to player', indent: 1 },
      { id: 'b2-distractor-1', type: 'event', label: 'on quit:', code: 'on quit:', indent: 0, acceptsChildren: true },
    ],
    solution: ['b2-event-join', 'b2-action-broadcast'],
    solutionCode: 'on join:\n\tbroadcast "%player% katıldı!"',
    hints: [
      { text_tr: '"send" sadece bir kişiye gönderir. Herkese gönderecek komutu düşün.', text_en: '"send" only sends to one person. Think of the command that sends to everyone.' },
      { text_tr: '"broadcast" komutu tüm sunucuya mesaj gönderir.', text_en: 'The "broadcast" command sends a message to the entire server.' },
      { text_tr: 'Cevap: on join: → broadcast "%player% katıldı!"', text_en: 'Answer: on join: → broadcast "%player% katıldı!"' },
    ],
  },
  {
    id: 'basics-3-command',
    moduleId: 'basics',
    title_tr: 'İlk Komutun',
    title_en: 'Your First Command',
    description_tr: 'Özel bir /selamla komutu oluştur.',
    description_en: 'Create a custom /greet command.',
    objective_tr: 'Bir komut tanımla ve kullanıcıya mesaj gönder.',
    objective_en: 'Define a command and send a message to the user.',
    phase: 'blocks',
    xpReward: 30,
    isBossLevel: false,
    availableBlocks: [
      { id: 'b3-event-cmd', type: 'event', label: 'command /selamla:', code: 'command /selamla:', indent: 0, acceptsChildren: true },
      { id: 'b3-trigger', type: 'action', label: 'trigger:', code: '\ttrigger:', indent: 1, acceptsChildren: true },
      { id: 'b3-action-send', type: 'action', label: 'send "Merhaba %player%!" to player', code: '\t\tsend "Merhaba %player%!" to player', indent: 2 },
      { id: 'b3-distractor-1', type: 'action', label: 'kill player', code: '\t\tkill player', indent: 2 },
      { id: 'b3-distractor-2', type: 'event', label: 'on break:', code: 'on break:', indent: 0, acceptsChildren: true },
    ],
    solution: ['b3-event-cmd', 'b3-trigger', 'b3-action-send'],
    solutionCode: 'command /selamla:\n\ttrigger:\n\t\tsend "Merhaba %player%!" to player',
    hints: [
      { text_tr: 'Komutlar "command /isim:" ile tanımlanır.', text_en: 'Commands are defined with "command /name:".' },
      { text_tr: 'Komutun içeriği "trigger:" bloğunun altında olmalı.', text_en: 'The command content should be under the "trigger:" block.' },
      { text_tr: 'Cevap: command /selamla: → trigger: → send "Merhaba %player%!"', text_en: 'Answer: command /selamla: → trigger: → send "Merhaba %player%!"' },
    ],
  },
  {
    id: 'basics-boss',
    moduleId: 'basics',
    title_tr: '🏆 Boss: Karşılama Sistemi',
    title_en: '🏆 Boss: Welcome System',
    description_tr: 'Katılma olayı, broadcast ve özel komutları birleştir.',
    description_en: 'Combine join event, broadcast, and custom commands.',
    objective_tr: 'Bir karşılama sistemi kur: katılmada broadcast + özel /bilgi komutu.',
    objective_en: 'Build a welcome system: broadcast on join + custom /info command.',
    phase: 'blocks',
    xpReward: 75,
    isBossLevel: true,
    availableBlocks: [
      { id: 'bb-event-join', type: 'event', label: 'on join:', code: 'on join:', indent: 0, acceptsChildren: true },
      { id: 'bb-action-broadcast', type: 'action', label: 'broadcast "&a%player% &7sunucuya katıldı!"', code: '\tbroadcast "&a%player% &7sunucuya katıldı!"', indent: 1 },
      { id: 'bb-event-cmd', type: 'event', label: 'command /bilgi:', code: 'command /bilgi:', indent: 0, acceptsChildren: true },
      { id: 'bb-trigger', type: 'action', label: 'trigger:', code: '\ttrigger:', indent: 1, acceptsChildren: true },
      { id: 'bb-action-send', type: 'action', label: 'send "&6Sunucu Bilgisi &7- Sürüm 1.21" to player', code: '\t\tsend "&6Sunucu Bilgisi &7- Sürüm 1.21" to player', indent: 2 },
      { id: 'bb-distractor-1', type: 'action', label: 'kill player', code: '\t\tkill player', indent: 2 },
      { id: 'bb-distractor-2', type: 'event', label: 'on death:', code: 'on death:', indent: 0, acceptsChildren: true },
      { id: 'bb-distractor-3', type: 'action', label: 'set gamemode of player to creative', code: '\tset gamemode of player to creative', indent: 1 },
    ],
    solution: ['bb-event-join', 'bb-action-broadcast', 'bb-event-cmd', 'bb-trigger', 'bb-action-send'],
    solutionCode: 'on join:\n\tbroadcast "&a%player% &7sunucuya katıldı!"\n\ncommand /bilgi:\n\ttrigger:\n\t\tsend "&6Sunucu Bilgisi &7- Sürüm 1.21" to player',
    hints: [
      { text_tr: 'İki farklı yapıyı bir arada kur: bir event + bir command.', text_en: 'Build two structures together: one event + one command.' },
      { text_tr: 'Önce "on join:" ve broadcast, sonra "command /bilgi:" ve trigger+send.', text_en: 'First "on join:" with broadcast, then "command /bilgi:" with trigger+send.' },
      { text_tr: 'Bu Boss level! İpucu almadan yapmaya çalış ama: join→broadcast, command→trigger→send', text_en: 'This is a Boss level! Try without hints but: join→broadcast, command→trigger→send' },
    ],
  },
];

// ══════════════════════════════════════
//  MODULE 2: VARIABLES & EVENTS
// ══════════════════════════════════════

const MODULE_VARIABLES_LESSONS: readonly Lesson[] = [
  {
    id: 'vars-1-set',
    moduleId: 'variables',
    title_tr: 'Değişken Tanımla',
    title_en: 'Define a Variable',
    description_tr: 'Bir değişken oluştur ve değer ata.',
    description_en: 'Create a variable and assign a value.',
    objective_tr: 'Bir lokal değişken oluşturup kullan.',
    objective_en: 'Create and use a local variable.',
    phase: 'blocks',
    xpReward: 30,
    isBossLevel: false,
    availableBlocks: [
      { id: 'v1-event-join', type: 'event', label: 'on join:', code: 'on join:', indent: 0, acceptsChildren: true },
      { id: 'v1-var-set', type: 'variable', label: 'set {_msg} to "Hoşgeldin!"', code: '\tset {_msg} to "Hoşgeldin!"', indent: 1 },
      { id: 'v1-action-send', type: 'action', label: 'send {_msg} to player', code: '\tsend {_msg} to player', indent: 1 },
      { id: 'v1-distractor-1', type: 'variable', label: 'set {_msg} to 42', code: '\tset {_msg} to 42', indent: 1 },
    ],
    solution: ['v1-event-join', 'v1-var-set', 'v1-action-send'],
    solutionCode: 'on join:\n\tset {_msg} to "Hoşgeldin!"\n\tsend {_msg} to player',
    hints: [
      { text_tr: 'Değişkenler {_isim} ile tanımlanır. _ ile başlayanlar lokal!', text_en: 'Variables are defined with {_name}. Those starting with _ are local!' },
      { text_tr: 'Önce değişkeni tanımla (set), sonra kullan (send).', text_en: 'First define the variable (set), then use it (send).' },
      { text_tr: 'Cevap: on join: → set {_msg} → send {_msg}', text_en: 'Answer: on join: → set {_msg} → send {_msg}' },
    ],
  },
  {
    id: 'vars-2-events',
    moduleId: 'variables',
    title_tr: 'Olay Dinleyiciler',
    title_en: 'Event Listeners',
    description_tr: 'Farklı olayları yakalayarak tepki ver.',
    description_en: 'React to different game events.',
    objective_tr: 'Blok kırma olayında oyuncuya mesaj gönder.',
    objective_en: 'Send a message when a player breaks a block.',
    phase: 'blocks',
    xpReward: 30,
    isBossLevel: false,
    availableBlocks: [
      { id: 'v2-event-break', type: 'event', label: 'on break:', code: 'on break:', indent: 0, acceptsChildren: true },
      { id: 'v2-action-send', type: 'action', label: 'send "Bir blok kırdın!" to player', code: '\tsend "Bir blok kırdın!" to player', indent: 1 },
      { id: 'v2-distractor-1', type: 'event', label: 'on place:', code: 'on place:', indent: 0, acceptsChildren: true },
      { id: 'v2-distractor-2', type: 'action', label: 'cancel event', code: '\tcancel event', indent: 1 },
    ],
    solution: ['v2-event-break', 'v2-action-send'],
    solutionCode: 'on break:\n\tsend "Bir blok kırdın!" to player',
    hints: [
      { text_tr: 'Blok kırma olayı hangisi? "on break:" veya "on place:"?', text_en: 'Which is the block breaking event? "on break:" or "on place:"?' },
      { text_tr: '"on break:" doğru olay. Altına mesaj gönder.', text_en: '"on break:" is the correct event. Add a send action below.' },
      { text_tr: 'Cevap: on break: → send "Bir blok kırdın!" to player', text_en: 'Answer: on break: → send "Bir blok kırdın!" to player' },
    ],
  },
  {
    id: 'vars-3-global',
    moduleId: 'variables',
    title_tr: 'Global Değişkenler',
    title_en: 'Global Variables',
    description_tr: 'Global değişken ile bir sayaç oluştur.',
    description_en: 'Create a counter with global variables.',
    objective_tr: 'Her katılmada global sayacı 1 artır.',
    objective_en: 'Increment a global counter on every join.',
    phase: 'bridge',
    xpReward: 40,
    isBossLevel: false,
    availableBlocks: [
      { id: 'v3-event-join', type: 'event', label: 'on join:', code: 'on join:', indent: 0, acceptsChildren: true },
      { id: 'v3-var-add', type: 'variable', label: 'add 1 to {join.count}', code: '\tadd 1 to {join.count}', indent: 1 },
      { id: 'v3-action-send', type: 'action', label: 'send "Toplam giriş: %{join.count}%" to player', code: '\tsend "Toplam giriş: %{join.count}%" to player', indent: 1 },
      { id: 'v3-distractor-1', type: 'variable', label: 'set {join.count} to 0', code: '\tset {join.count} to 0', indent: 1 },
    ],
    solution: ['v3-event-join', 'v3-var-add', 'v3-action-send'],
    solutionCode: 'on join:\n\tadd 1 to {join.count}\n\tsend "Toplam giriş: %{join.count}%" to player',
    hints: [
      { text_tr: 'Global değişkenler {isim} ile tanımlanır (_ yok!). Her seferinde sıfırlamak yerine 1 ekle.', text_en: 'Global variables are defined with {name} (no _!). Add 1 each time instead of resetting.' },
      { text_tr: '"add 1 to {join.count}" mevcut değere 1 ekler.', text_en: '"add 1 to {join.count}" adds 1 to the existing value.' },
      { text_tr: 'Cevap: on join: → add 1 to {join.count} → send mesaj', text_en: 'Answer: on join: → add 1 to {join.count} → send message' },
    ],
  },
  {
    id: 'vars-boss',
    moduleId: 'variables',
    title_tr: '🏆 Boss: Değişken Ustası',
    title_en: '🏆 Boss: Variable Master',
    description_tr: 'Lokal ve global değişkenleri birleştir.',
    description_en: 'Combine local and global variables.',
    objective_tr: 'Katılmada global sayacı artır, lokal değişkenle mesaj gönder.',
    objective_en: 'Increment global counter on join, send message with local variable.',
    phase: 'bridge',
    xpReward: 80,
    isBossLevel: true,
    availableBlocks: [
      { id: 'vb-event-join', type: 'event', label: 'on join:', code: 'on join:', indent: 0, acceptsChildren: true },
      { id: 'vb-var-add', type: 'variable', label: 'add 1 to {join.count}', code: '\tadd 1 to {join.count}', indent: 1 },
      { id: 'vb-var-set', type: 'variable', label: 'set {_welcome} to "&aHoş geldin! &7Sen %{join.count}%. oyuncusun!"', code: '\tset {_welcome} to "&aHoş geldin! &7Sen %{join.count}%. oyuncusun!"', indent: 1 },
      { id: 'vb-action-send', type: 'action', label: 'send {_welcome} to player', code: '\tsend {_welcome} to player', indent: 1 },
      { id: 'vb-distractor-1', type: 'action', label: 'kick player', code: '\tkick player', indent: 1 },
      { id: 'vb-distractor-2', type: 'variable', label: 'delete {join.count}', code: '\tdelete {join.count}', indent: 1 },
    ],
    solution: ['vb-event-join', 'vb-var-add', 'vb-var-set', 'vb-action-send'],
    solutionCode: 'on join:\n\tadd 1 to {join.count}\n\tset {_welcome} to "&aHoş geldin! &7Sen %{join.count}%. oyuncusun!"\n\tsend {_welcome} to player',
    hints: [
      { text_tr: 'Önce sayacı artır, sonra lokal değişkende mesajı hazırla, en son gönder.', text_en: 'First increment counter, then prepare message in local var, finally send.' },
      { text_tr: 'Sıra: add → set {_welcome} → send {_welcome}', text_en: 'Order: add → set {_welcome} → send {_welcome}' },
      { text_tr: 'Boss: join → add 1 → set {_welcome} → send {_welcome}', text_en: 'Boss: join → add 1 → set {_welcome} → send {_welcome}' },
    ],
  },
];

// ══════════════════════════════════════
//  MODULE 3: CONDITIONS & LOOPS
// ══════════════════════════════════════

const MODULE_CONDITIONS_LESSONS: readonly Lesson[] = [
  {
    id: 'cond-1-if',
    moduleId: 'conditions',
    title_tr: 'Koşullu Mantık',
    title_en: 'Conditional Logic',
    description_tr: 'if-else yapısını öğren.',
    description_en: 'Learn the if-else structure.',
    objective_tr: 'Oyuncunun creative modda olup olmadığını kontrol et.',
    objective_en: 'Check if the player is in creative mode.',
    phase: 'bridge',
    xpReward: 35,
    isBossLevel: false,
    availableBlocks: [
      { id: 'c1-event-cmd', type: 'event', label: 'command /modcheck:', code: 'command /modcheck:', indent: 0, acceptsChildren: true },
      { id: 'c1-trigger', type: 'action', label: 'trigger:', code: '\ttrigger:', indent: 1, acceptsChildren: true },
      { id: 'c1-cond-if', type: 'condition', label: 'if gamemode of player is creative:', code: '\t\tif gamemode of player is creative:', indent: 2, acceptsChildren: true },
      { id: 'c1-action-yes', type: 'action', label: 'send "&aCreative moddasın!"', code: '\t\t\tsend "&aCreative moddasın!"', indent: 3 },
      { id: 'c1-cond-else', type: 'condition', label: 'else:', code: '\t\telse:', indent: 2, acceptsChildren: true },
      { id: 'c1-action-no', type: 'action', label: 'send "&cCreative modda değilsin."', code: '\t\t\tsend "&cCreative modda değilsin."', indent: 3 },
      { id: 'c1-distractor-1', type: 'action', label: 'set gamemode of player to creative', code: '\t\t\tset gamemode of player to creative', indent: 3 },
    ],
    solution: ['c1-event-cmd', 'c1-trigger', 'c1-cond-if', 'c1-action-yes', 'c1-cond-else', 'c1-action-no'],
    solutionCode: 'command /modcheck:\n\ttrigger:\n\t\tif gamemode of player is creative:\n\t\t\tsend "&aCreative moddasın!"\n\t\telse:\n\t\t\tsend "&cCreative modda değilsin."',
    hints: [
      { text_tr: 'Koşullar "if ... :" ile başlar, alternatif "else:" ile belirtilir.', text_en: 'Conditions start with "if ... :", alternative is specified with "else:".' },
      { text_tr: 'Sıra: command → trigger → if → mesaj → else → mesaj', text_en: 'Order: command → trigger → if → message → else → message' },
      { text_tr: 'Cevap: cmd → trigger → if creative → send evet → else → send hayır', text_en: 'Answer: cmd → trigger → if creative → send yes → else → send no' },
    ],
  },
  {
    id: 'cond-2-loop',
    moduleId: 'conditions',
    title_tr: 'Döngüler',
    title_en: 'Loops',
    description_tr: 'Tüm oyunculara döngüyle mesaj gönder.',
    description_en: 'Send a message to all players using a loop.',
    objective_tr: '"loop all players:" döngüsünü kullan.',
    objective_en: 'Use the "loop all players:" loop.',
    phase: 'bridge',
    xpReward: 40,
    isBossLevel: false,
    availableBlocks: [
      { id: 'c2-event-cmd', type: 'event', label: 'command /duyuru:', code: 'command /duyuru:', indent: 0, acceptsChildren: true },
      { id: 'c2-trigger', type: 'action', label: 'trigger:', code: '\ttrigger:', indent: 1, acceptsChildren: true },
      { id: 'c2-loop', type: 'loop', label: 'loop all players:', code: '\t\tloop all players:', indent: 2, acceptsChildren: true },
      { id: 'c2-action-send', type: 'action', label: 'send "&6[DUYURU] &fMerhaba!" to loop-player', code: '\t\t\tsend "&6[DUYURU] &fMerhaba!" to loop-player', indent: 3 },
      { id: 'c2-distractor-1', type: 'action', label: 'kill loop-player', code: '\t\t\tkill loop-player', indent: 3 },
    ],
    solution: ['c2-event-cmd', 'c2-trigger', 'c2-loop', 'c2-action-send'],
    solutionCode: 'command /duyuru:\n\ttrigger:\n\t\tloop all players:\n\t\t\tsend "&6[DUYURU] &fMerhaba!" to loop-player',
    hints: [
      { text_tr: '"loop all players:" tüm oyuncuları döngüye alır. Döngü içindeki oyuncuya "loop-player" ile erişirsin.', text_en: '"loop all players:" loops through all players. Access the current player with "loop-player".' },
      { text_tr: 'Komut → trigger → loop → send', text_en: 'Command → trigger → loop → send' },
      { text_tr: 'Cevap: command → trigger → loop all players → send to loop-player', text_en: 'Answer: command → trigger → loop all players → send to loop-player' },
    ],
  },
  {
    id: 'cond-3-permission',
    moduleId: 'conditions',
    title_tr: 'Yetki Kontrolü',
    title_en: 'Permission Check',
    description_tr: 'Komut çalıştırmadan önce yetki kontrolü yap.',
    description_en: 'Check permissions before executing a command.',
    objective_tr: 'Oyuncunun "admin" yetkisi yoksa komutu engelle.',
    objective_en: 'Block the command if the player doesn\'t have "admin" permission.',
    phase: 'code',
    xpReward: 50,
    isBossLevel: false,
    availableBlocks: [],
    solution: [],
    solutionCode: 'command /admin:\n\ttrigger:\n\t\tif player has permission "skript.admin":\n\t\t\tsend "&aAdmin paneline hoş geldin!"\n\t\telse:\n\t\t\tsend "&cBu komutu kullanma yetkiniz yok."',
    starterCode: 'command /admin:\n\ttrigger:\n\t\t# TODO: Oyuncunun "skript.admin" yetkisini kontrol et\n\t\t# TODO: Yetkisi varsa hoş geldin mesajı gönder\n\t\t# TODO: Yetkisi yoksa uyarı mesajı gönder',
    hints: [
      { text_tr: '"if player has permission \"yetki\":" ile yetki kontrolü yapılır.', text_en: '"if player has permission \"perm\":" is used to check permissions.' },
      { text_tr: 'if-else yapısını kullan. Yetkisi varsa mesaj, yoksa uyarı.', text_en: 'Use if-else structure. If they have permission, message. If not, warning.' },
      { text_tr: 'Cevap: if player has permission "skript.admin": → send → else: → send', text_en: 'Answer: if player has permission "skript.admin": → send → else: → send' },
    ],
  },
  {
    id: 'cond-boss',
    moduleId: 'conditions',
    title_tr: '🏆 Boss: Akıllı Duyuru Sistemi',
    title_en: '🏆 Boss: Smart Announcement System',
    description_tr: 'Yetkili oyuncuların kullanabileceği, tüm sunucuya döngüyle duyuru yapan bir sistem.',
    description_en: 'A system where authorized players can make announcements to the whole server.',
    objective_tr: 'Yetki kontrolü + döngü + değişken kullanarak bir duyuru sistemi yaz.',
    objective_en: 'Write an announcement system using permission check + loop + variables.',
    phase: 'code',
    xpReward: 100,
    isBossLevel: true,
    availableBlocks: [],
    solution: [],
    solutionCode: 'command /duyuru [<text>]:\n\ttrigger:\n\t\tif player has permission "skript.announce":\n\t\t\tset {_msg} to arg-1\n\t\t\tloop all players:\n\t\t\t\tsend "&6[DUYURU] &f%{_msg}%" to loop-player\n\t\telse:\n\t\t\tsend "&cBu komutu kullanma yetkiniz yok."',
    starterCode: '# Görev: /duyuru <mesaj> komutu yaz\n# 1. Yetki kontrolü yap ("skript.announce")\n# 2. Argümanı bir değişkene ata\n# 3. Tüm oyunculara döngüyle gönder\n# 4. Yetkisi yoksa uyarı ver\n\ncommand /duyuru [<text>]:\n\ttrigger:\n\t\t# Kodunu buraya yaz...',
    hints: [
      { text_tr: 'arg-1 ile komutun argümanını alabilirsin. Bunu bir {_msg} değişkenine ata.', text_en: 'You can get the command argument with arg-1. Assign it to a {_msg} variable.' },
      { text_tr: 'if permission → set {_msg} → loop all players → send → else → uyarı', text_en: 'if permission → set {_msg} → loop all players → send → else → warning' },
      { text_tr: 'Boss modası! Komut argümanı: [<text>], yetki: "skript.announce"', text_en: 'Boss mode! Command argument: [<text>], permission: "skript.announce"' },
    ],
  },
];

// ══════════════════════════════════════
//  MODULE 4: GUI & ADVANCED
// ══════════════════════════════════════

const MODULE_GUI_LESSONS: readonly Lesson[] = [
  {
    id: 'gui-1-teleport',
    moduleId: 'gui',
    title_tr: 'Teleport Sistemi',
    title_en: 'Teleport System',
    description_tr: '/warp komutuyla oyuncuyu belirli bir konuma ışınla.',
    description_en: 'Teleport a player to a specific location with /warp.',
    objective_tr: 'Warp kaydetme ve ışınlanma sistemi yaz.',
    objective_en: 'Write a warp save and teleport system.',
    phase: 'code',
    xpReward: 50,
    isBossLevel: false,
    availableBlocks: [],
    solution: [],
    solutionCode: 'command /setwarp <text>:\n\ttrigger:\n\t\tset {warp.%arg-1%} to location of player\n\t\tsend "&aWarp &e%arg-1% &akaydedildi!" to player\n\ncommand /warp <text>:\n\ttrigger:\n\t\tif {warp.%arg-1%} is set:\n\t\t\tteleport player to {warp.%arg-1%}\n\t\telse:\n\t\t\tsend "&cBu warp bulunamadı!" to player',
    starterCode: '# Görev: Warp sistemi yaz\n# 1. /setwarp <isim> - Oyuncunun konumunu kaydet\n# 2. /warp <isim> - Oyuncuyu o konuma ışınla\n# Değişken formatı: {warp.%arg-1%}\n\n# Kodunu buraya yaz...',
    hints: [
      { text_tr: 'Konum kaydetmek için: set {warp.%arg-1%} to location of player', text_en: 'To save location: set {warp.%arg-1%} to location of player' },
      { text_tr: 'Işınlanmak için: teleport player to {warp.%arg-1%}', text_en: 'To teleport: teleport player to {warp.%arg-1%}' },
      { text_tr: 'Warp var mı kontrol et: if {warp.%arg-1%} is set:', text_en: 'Check if warp exists: if {warp.%arg-1%} is set:' },
    ],
  },
  {
    id: 'gui-2-cooldown',
    moduleId: 'gui',
    title_tr: 'Cooldown Mekanizması',
    title_en: 'Cooldown Mechanism',
    description_tr: 'Bir komutu belirli süre boyunca tekrar kullanılamaz yap.',
    description_en: 'Prevent a command from being used again for a certain duration.',
    objective_tr: '30 saniyelik cooldown sistemi yaz.',
    objective_en: 'Write a 30-second cooldown system.',
    phase: 'code',
    xpReward: 55,
    isBossLevel: false,
    availableBlocks: [],
    solution: [],
    solutionCode: 'command /yetenek:\n\ttrigger:\n\t\tif {cooldown.%player%} is set:\n\t\t\tsend "&c30 saniye beklemelisin!"\n\t\telse:\n\t\t\tsend "&aYetenek kullanıldı!"\n\t\t\tset {cooldown.%player%} to true\n\t\t\twait 30 seconds\n\t\t\tdelete {cooldown.%player%}',
    starterCode: '# Görev: /yetenek komutuna 30 saniyelik cooldown ekle\n# 1. Cooldown değişkeni varsa uyarı ver\n# 2. Yoksa yeteneği kullan\n# 3. Cooldown değişkenini ayarla\n# 4. 30 saniye bekle\n# 5. Cooldown değişkenini sil\n\ncommand /yetenek:\n\ttrigger:\n\t\t# Kodunu buraya yaz...',
    hints: [
      { text_tr: 'Cooldown için oyuncuya özel bir değişken: {cooldown.%player%}', text_en: 'Player-specific cooldown variable: {cooldown.%player%}' },
      { text_tr: '"wait 30 seconds" ile 30 saniye bekle, sonra "delete" ile sıfırla.', text_en: '"wait 30 seconds" to wait, then "delete" to reset.' },
      { text_tr: 'if {cooldown.%player%} is set → uyarı, else → yeteneği kullan, set, wait, delete', text_en: 'if {cooldown.%player%} is set → warn, else → use ability, set, wait, delete' },
    ],
  },
  {
    id: 'gui-3-scoreboard',
    moduleId: 'gui',
    title_tr: 'Scoreboard',
    title_en: 'Scoreboard',
    description_tr: 'Oyuncunun öldürme sayısını takip eden bir scoreboard yaz.',
    description_en: 'Write a scoreboard that tracks player kills.',
    objective_tr: 'Öldürme sayacı ve scoreboard sistemi.',
    objective_en: 'Kill counter and scoreboard system.',
    phase: 'code',
    xpReward: 60,
    isBossLevel: false,
    availableBlocks: [],
    solution: [],
    solutionCode: 'on death of player:\n\tattacker is a player\n\tadd 1 to {kills.%attacker%}\n\tsend "&a+1 Kill! &7Toplam: &e%{kills.%attacker%}%"  to attacker\n\ncommand /kills:\n\ttrigger:\n\t\tsend "&6Toplam Kills: &e%{kills.%player%} ? 0%"',
    starterCode: '# Görev: Kill sayacı sistemi\n# 1. Oyuncu öldürüldüğünde saldırganın kill sayısını artır\n# 2. /kills komutuyla kendi kill sayını göster\n# İpucu: "attacker" ile saldırganı, % ? 0% ile null kontrolü yapabilirsin\n\n# Kodunu buraya yaz...',
    hints: [
      { text_tr: '"on death of player:" olayında "attacker" ile saldırgana ulaşılır.', text_en: '"on death of player:" event uses "attacker" to access the killer.' },
      { text_tr: '"attacker is a player" ile saldırganın oyuncu olduğunu doğrula.', text_en: '"attacker is a player" verifies the attacker is a player.' },
      { text_tr: 'Null check: %{kills.%player%} ? 0% — değişken yoksa 0 gösterir.', text_en: 'Null check: %{kills.%player%} ? 0% — shows 0 if variable doesn\'t exist.' },
    ],
  },
  {
    id: 'gui-boss',
    moduleId: 'gui',
    title_tr: '🏆 Final Boss: RPG Yetenek Sistemi',
    title_en: '🏆 Final Boss: RPG Ability System',
    description_tr: 'Cooldown\'lu, yetkili, kill takipli bir tam RPG yetenek sistemi.',
    description_en: 'A full RPG ability system with cooldowns, permissions, and kill tracking.',
    objective_tr: 'Öğrendiğin herşeyi birleştir: koşullar, döngüler, değişkenler, cooldown.',
    objective_en: 'Combine everything: conditions, loops, variables, cooldowns.',
    phase: 'code',
    xpReward: 150,
    isBossLevel: true,
    availableBlocks: [],
    solution: [],
    solutionCode: 'command /fireball:\n\tpermission: skript.fireball\n\ttrigger:\n\t\tif {cooldown.fireball.%player%} is set:\n\t\t\tsend "&cBu yetenek bekleme süresinde! 10 saniye bekle."\n\t\telse:\n\t\t\tshoot a fireball from player at speed 2\n\t\t\tsend "&6🔥 Fireball fırlatıldı!"\n\t\t\tset {cooldown.fireball.%player%} to true\n\t\t\twait 10 seconds\n\t\t\tdelete {cooldown.fireball.%player%}\n\t\t\tsend "&aBireball tekrar hazır!"',
    starterCode: '# 🏆 FINAL BOSS: RPG Fireball Yeteneği\n# Gereksinimler:\n# 1. /fireball komutu oluştur\n# 2. "skript.fireball" yetkisi gereksin\n# 3. 10 saniyelik cooldown ekle\n# 4. Fireball fırlat: shoot a fireball from player at speed 2\n# 5. Uygun mesajlar gönder\n\n# Tüm gücünü buraya yaz...',
    hints: [
      { text_tr: 'Komut tanımında "permission: skript.fireball" satırını ekle.', text_en: 'Add "permission: skript.fireball" in the command definition.' },
      { text_tr: 'Cooldown: if set → uyarı, else → shoot + set + wait + delete', text_en: 'Cooldown: if set → warn, else → shoot + set + wait + delete' },
      { text_tr: 'Son ipucu: command → permission → trigger → if cooldown → else → shoot → set → wait → delete', text_en: 'Final hint: command → permission → trigger → if cooldown → else → shoot → set → wait → delete' },
    ],
  },
];

// ══════════════════════════════════════
//  MODULES COLLECTION
// ══════════════════════════════════════

export const ACADEMY_MODULES: readonly Module[] = [
  {
    id: 'basics',
    title_tr: 'Temel Yapılar',
    title_en: 'Basics',
    description_tr: 'Olaylar, komutlar ve mesaj gönderme.',
    description_en: 'Events, commands, and sending messages.',
    icon: 'BookOpen',
    color: 'emerald',
    requiredXp: 0,
    lessons: MODULE_BASICS_LESSONS,
  },
  {
    id: 'variables',
    title_tr: 'Değişkenler & Olaylar',
    title_en: 'Variables & Events',
    description_tr: 'Lokal/global değişkenler ve olay dinleyiciler.',
    description_en: 'Local/global variables and event listeners.',
    icon: 'Variable',
    color: 'purple',
    requiredXp: 100,
    lessons: MODULE_VARIABLES_LESSONS,
  },
  {
    id: 'conditions',
    title_tr: 'Koşullar & Döngüler',
    title_en: 'Conditions & Loops',
    description_tr: 'If-else yapıları, döngüler ve yetki kontrolleri.',
    description_en: 'If-else structures, loops, and permission checks.',
    icon: 'GitBranch',
    color: 'amber',
    requiredXp: 250,
    lessons: MODULE_CONDITIONS_LESSONS,
  },
  {
    id: 'gui',
    title_tr: 'GUI & İleri Seviye',
    title_en: 'GUI & Advanced',
    description_tr: 'Teleport, cooldown, scoreboard ve RPG sistemleri.',
    description_en: 'Teleport, cooldown, scoreboard, and RPG systems.',
    icon: 'Layout',
    color: 'cyan',
    requiredXp: 500,
    lessons: MODULE_GUI_LESSONS,
  },
] as const;

// ── Helper: Get lesson by ID ──
export function getLessonById(lessonId: string): Lesson | undefined {
  for (const mod of ACADEMY_MODULES) {
    const lesson = mod.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

// ── Helper: Get module by ID ──
export function getModuleById(moduleId: string): Module | undefined {
  return ACADEMY_MODULES.find(m => m.id === moduleId);
}

// ── Helper: Get next lesson ──
export function getNextLesson(currentLessonId: string): Lesson | undefined {
  const allLessons = ACADEMY_MODULES.flatMap(m => m.lessons);
  const idx = allLessons.findIndex(l => l.id === currentLessonId);
  if (idx === -1 || idx >= allLessons.length - 1) return undefined;
  return allLessons[idx + 1];
}

// ── Helper: Get all lessons flat ──
export function getAllLessons(): readonly Lesson[] {
  return ACADEMY_MODULES.flatMap(m => m.lessons);
}
