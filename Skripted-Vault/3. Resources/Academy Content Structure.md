---
title: "Academy Content Structure"
created: 2026-05-08
type: resource
tags: [academy, data, curriculum]
---

# Academy Content Structure

File: `src/lib/academy-data.ts`

This file acts as the "database" for the gamified learning modules. It defines the exact progression, lessons, and visual elements of the Academy.

## Block Type System
Lessons in early phases use visual blocks.
- Types: `event`, `action`, `condition`, `variable`, `loop`, `comment`.
- Visuals: Each block has associated Tailwind classes (`bg`, `border`, `text`, `glow`) in the `BLOCK_COLORS` map.

## Progression Mechanics
The Academy is divided into **Phases** based on the user's XP (Level):
1. **Blocks Phase** (Levels 1-5): Users drag and drop pre-defined `availableBlocks`.
2. **Bridge Phase** (Levels 6-10): Transitioning from blocks to raw code.
3. **Code Phase** (Levels 11+): Users write raw Skript code (`starterCode`).

## Lesson Anatomy (`Lesson` interface)
- Bilingual Support: `title_tr`, `title_en`, `description_tr`, etc.
- `xpReward`: How much XP is granted upon completion.
- `isBossLevel`: Marks major milestones.
- `solution`: Array of block IDs (for block phase) representing the correct answer.
- `solutionCode`: The raw text representation of the solution.
- `hints`: Bilingual hints available to the user.

## Connection
This data is consumed and its progress is tracked by the [[Frontend State Management]] (`useAcademyStore`).
