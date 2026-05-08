---
title: "Master Map: Skripted Architecture"
created: 2026-05-08
type: moc
tags: [index, moc, architecture]
---

# 🗺️ Master Map: Skripted Architecture

This is the central Map of Content (MOC) for the Skripted project. It connects all the granular, atomic notes into a cohesive mental model.

## 🏗️ Core Infrastructure

*   **[[Skripted Platform]] (Project Brief)**: The high-level goals, tech stack, and pillars of the application.
*   **[[Database Implementation Details]]**: How data is actually stored in Supabase, including granular chat history and RLS.
*   **[[Supabase Auth Swap Mechanism]]**: The security bridge connecting Clerk authentication to Supabase RLS.

## 🧠 AI & Engine

*   **[[System Prompt Design]]**: The strict rules and tier-based protections defining the "Skripted Engine" persona.
*   **[[Pinecone Vector Search (RAG)]]**: How the system pulls relevant Skript examples to feed context to the AI before it answers.
*   **[[AI Integration]]**: General OpenRouter setup and best practices.

## 💻 Frontend & IDE

*   **[[Chat Interface Architecture]]**: The main workspace connecting the Monaco editor, chat history, and feedback systems.
*   **[[Frontend State Management]]**: The Zustand stores (`useStore`, `useAcademyStore`) that keep the UI in sync across page reloads.
*   **[[Skript Linter Architecture]]**: The custom Monaco linter providing real-time feedback for Skript syntax.

## 🎓 The Academy

*   **[[Academy Content Structure]]**: The hardcoded curriculum, block types, and phase progression logic. (Powered by the Academy Store in State Management).
*   **[[Skript Language]]**: Language specifications and capabilities.

---
*Tip: When asking me to brainstorm or fix a bug, you can reference these links directly!*
