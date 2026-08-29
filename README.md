<div align="center">

# KeyWarp

**A high-velocity touch-typing engine with adaptive AI kinesiology coaching and real-time biomechanical telemetry.**

[![Live Demo](https://img.shields.io/badge/Live_App-keywarp-e5a93b?style=for-the-badge&logo=vercel&logoColor=white)](https://keywarp.vercel.app)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_3.6_Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://aistudio.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br />

[**Try Live App**](https://keywarp.vercel.app) • [**Report an Issue**](https://github.com/JashwanthDwaram/keywarp/issues)

<br />

```
  ██╗  ██╗███████╗██╗   ██╗██╗    ██╗ █████╗ ██████╗ ██████╗ 
  ██║ ██╔╝██╔════╝╚██╗ ██╔╝██║    ██║██╔══██╗██╔══██╗██╔══██╗
  █████╔╝ █████╗   ╚████╔╝ ██║ █╗ ██║███████║██████╔╝██████╔╝
  ██╔═██╗ ██╔══╝    ╚██╔╝  ██║███╗██║██╔══██║██╔══██╗██╔═══╝ 
  ██║  ██╗███████╗   ██║   ╚███╔███╔╝██║  ██║██║  ██║██║     
  ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     
```

</div>

---

## What is KeyWarp?

Most typing trainers only calculate a raw WPM score. KeyWarp tracks where your fingers slow down and helps you fix those hesitation points.

While you type, it records your inter-key latency and mistake patterns. It then sends your telemetry to **Gemini 3.6 Flash** to generate short, targeted practice drills for the specific key transitions holding your speed back.

---

## Key Features

### 1. Adaptive AI Coach
* **Hesitation Detection**: Analyzes keystroke intervals to find the specific transitions where your typing cadence stutters.
* **Custom Remediation Drills**: Generates cohesive 45-second practice workouts centered around your weak keys.
* **One-Click Practice**: Click Launch Module to send the AI drill straight to the Arena.

### 2. Telemetry Hub & Performance Graphs
* **Rhythm Sparkbar Horizon**: Interactive bar chart displaying your recent test speed and accuracy with hover inspect.
* **Latency & Digraph Matrix**: Measures inter-key speed in milliseconds, highlighting your fastest flow pairs versus pause bottlenecks.
* **Biomechanical Hand Balance**: Tracks physical workload distribution between your left and right hands.
* **Mistake & Reach Matrix**: Visual error breakdown organized by finger reach zones.

### 3. Practice Modes
* **Time Sprints**: 15s, 30s, 60s, and 120s countdown sprints.
* **Word Targets**: 10, 25, 50, or 100 word sessions.
* **Quotes**: Famous philosophy, science, and literature quotes with clean author attributions.
* **Code Practice**: Practice typing real JavaScript, TypeScript, Python, and Rust snippets.
* **Custom Text**: Paste your own articles, study notes, or practice material.

### 4. Training Modalities & Controls
* **Ghost Racer**: Race against your previous run speed in real time.
* **Sudden Death Mode**: High-stakes accuracy training where a single typo fails the test.
* **Blind Mode**: Hides typed characters to test pure touch-typing muscle memory while keeping your streak counter visible.
* **Mechanical Sound Engine**: Realistic switch audio including Thock, Clicky, Topre, Bubble, and Silent modes.
* **Metronome Pacer**: Audio beat pacer to help establish an even typing rhythm.

### 5. Mobile & Preferences
* **Mobile Optimized**: Automatically detects phone and tablet screens, defaulting to 10-word sprints with dual-thumb training insights.
* **Preference Memory**: Remembers your preferred mode, word count, timer length, sound profile, and theme across sessions.
* **Private & Local-First**: All typing history stays in your browser. Includes full JSON export and import.

---

## Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
* **AI Model**: Google Gemini 3.6 Flash via `@google/generative-ai`
* **Typography**: SF Pro Display and JetBrains Mono
* **Backend**: Vercel Serverless Functions

---

## Getting Started

### Prerequisites
* Node.js 18 or higher
* npm, pnpm, or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/JashwanthDwaram/typepulse.git
   cd typepulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. (Optional) Add your Gemini API key in a `.env` file:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Tab</kbd> | Restart test / Load next text |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | Repeat test with Ghost Racer |
| <kbd>Ctrl</kbd> + <kbd>Backspace</kbd> | Clear current word |
| <kbd>Esc</kbd> | Toggle Zen focus mode |

---

## Author

Crafted by **Jashwanth Dwaram**

* **GitHub**: [@JashwanthDwaram](https://github.com/JashwanthDwaram)
* **Repository**: [JashwanthDwaram/keywarp](https://github.com/JashwanthDwaram/keywarp)
* **Live App**: [keywarp.vercel.app](https://keywarp.vercel.app)

---

## License

MIT License. See [LICENSE](LICENSE) for details.
