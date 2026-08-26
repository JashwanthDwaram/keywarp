# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons (with companion Python 3.13 / Pygame / Pandas / Matplotlib desktop engine).

## Users

Students, software developers, and knowledge professionals who want to measure, train, and accelerate their typing speed, rhythm, and accuracy with actionable feedback and long-term performance tracking.

## Product Purpose

TypePulse is a modern, self-contained typing trainer and analytics platform. It provides instantaneous character-by-character validation, real-time WPM/Accuracy metrics, and longitudinal tracking to help users pinpoint specific finger-reach weaknesses and steadily improve typing velocity.

## Positioning

Unlike conventional online typing tests that offer fleeting results, TypePulse combines offline-capable real-time typing with AI-native coaching primitives (Thinking states, tool execution telemetry, and human-in-the-loop adaptive drill approval cards) alongside persistent CSV/browser session analytics.

## Operating Context

Keyboard-driven desktop browser sessions (and desktop Pygame window), rapid iteration cycles, distraction-free dark environment, procedural audio cues for keystrokes and errors.

## Capabilities and Constraints

- **Passage Mode**: Multi-category typing tests (Easy, Medium, Hard, Quotes, Code snippets) with dynamic line wrapping.
- **60-Second Sprint Mode**: Fast-paced continuous word-stream sprint test with countdown timer.
- **Real-Time Live Validation**: Character-level color highlighting (Emerald correct, Red incorrect with background highlight, Slate pending, Glowing caret).
- **Accurate Metric Calculations**: Gross WPM, standard Net WPM (penalizing uncorrected errors), and keystroke accuracy percentage.
- **Mistake Matrix & Error Tracking**: Maps exact character mis-hits to aggregate frequently mistyped keys.
- **AI Typing Coach**: Leverages BeautifulUI primitives (Thinking State, Tool Chips, and Approval Cards) to synthesize adaptive muscle-memory drills.
- **Data Persistence**: CSV export and local history tracking across sessions.

## Brand Commitments

- **Name**: TypePulse
- **Aesthetic**: Modern dark slate palette (`#0B0F19`, `#0F172A`, `#1E293B`) with vibrant Indigo (`#6366F1`), Sky (`#38BDF8`), Emerald (`#10B981`), and Rose (`#F43F5E`) accents.
- **Typography**: Clean sans-serif (`Inter`) for UI shells, crisp monospace (`Fira Code`, `Consolas`) for typing passage canvases.
- **UI Kit**: Inspired by BeautifulUI AI-native primitives and Tailwind Dark.

## Evidence on Hand

- Passage repository: `data/passages.json` & `web/src/data/passages.ts`
- Word bank: `data/words.txt` & `SPRINT_WORDS`
- Persistent session storage: `data/typing_history.csv`
- Automated test suite: `tests/test_typing_logic.py`

## Product Principles

1. **Zero-Latency Clarity**: Feedback must be instant, unmistakable, and non-distracting during active keystroke flow.
2. **Standard & Honest Metrics**: Calculate standard Net WPM and keystroke accuracy without deceptive inflation.
3. **Actionable Remediation**: Diagnose specific key-pair/finger transition errors and provide targeted drills rather than blind repetition.
4. **Distraction-Free Immersion**: High-contrast, clean typography, smooth carets, and subtle procedural audio reinforcement.
