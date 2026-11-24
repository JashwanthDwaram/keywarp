# KeyWarp Desktop — Viva & Project Defense Guide

> **Quick Summary for Examiners:**  
> KeyWarp Desktop is an event-driven, 60 FPS touch-typing speed tester and performance telemetry application. It provides real-time character-by-character validation, live WPM and accuracy metrics, error diagnostic matrices, historical progression plotting, and native OS file dialogs for custom text practice and data export.

---

## 1. Project Architecture & File Breakdown

The application follows a clean, modular Model-View-Controller (MVC) separation of concerns:

```
desktop/
├── desktop_app.py           # Controller: App orchestrator & 60 FPS Pygame loop
├── config/
│   └── constants.py         # Model: Themes, palette, dimensions & state enums
├── core/
│   ├── typing_engine.py     # Model: Keystroke validation & metric formulas
│   ├── passage_loader.py    # Model: Built-in passages & Tkinter file picker
│   └── session_logger.py    # Model: JSON/CSV persistence & Tkinter export
├── analytics/
│   ├── data_analyzer.py     # Model: Aggregate analytics (Best WPM, averages)
│   └── visualizer.py        # View: Coordinate-mapped WPM trend line graph
├── ui/
│   ├── components.py        # View: Reusable UI widgets (Buttons, Cards, Badges)
│   ├── sound_fx.py          # View: Procedural audio synthesizer
│   └── screens/
│       ├── menu_screen.py   # View: Main menu & mode/difficulty selector
│       ├── typing_screen.py # View: 60 FPS arena with dynamic word wrapping
│       ├── results_screen.py# View: Scorecard & mistyped character breakdown
│       └── history_screen.py# View: Interactive history table & trend graph
└── tests/
    └── test_typing_logic.py # Automated unit test suite
```

---

## 2. File-by-File Code Walkthrough

### 1. `desktop/desktop_app.py` (Application Entry Point)
- **Role:** Central orchestrator and main game loop.
- **Windows High-DPI Fix:** Calls `ctypes.windll.shcore.SetProcessDpiAwareness(2)` before `pygame.init()` so Windows does not blur the canvas on high-resolution displays.
- **Dynamic Resizing:** Sets `pygame.display.set_mode((width, height), pygame.RESIZABLE)` and listens for `pygame.VIDEORESIZE` events to smoothly update canvas dimensions.
- **The Game Loop (`run()` method):**
  1. **Event Processing:** Traverses `pygame.event.get()` and routes inputs to the active screen.
  2. **Update Phase:** Updates hover states, blinking cursor timers, and countdowns.
  3. **Render Phase:** Draws the active screen to `self.screen` and flips display buffers with `pygame.display.flip()`.
  4. **Clock Tick:** Enforces a consistent 60 FPS using `self.clock.tick(FPS)`.

---

### 2. `desktop/core/typing_engine.py` (Business Logic & Math Engine)
- **Role:** Pure mathematical and logical engine. Has zero GUI dependencies so it can be 100% unit-tested.
- **State Tracked:**
  - `target_text`: The string to type.
  - `typed_chars`: List of characters the user has typed so far.
  - `total_keystrokes`: Total raw keystrokes pressed.
  - `correct_keystrokes`: Number of correct characters matching the target.
  - `incorrect_keystrokes`: Total errors made.
  - `mistake_map`: Dictionary mapping expected characters to their miss counts (e.g., `{'s': 3, 'r': 1}`).
  - `start_time`, `end_time`: High-resolution timestamps from `time.time()`.

#### The Core Formulas (Must-Know for Viva):
1. **Standard Word Length:**
   $$\text{Words} = \frac{\text{Characters}}{5}$$
   *(5 keystrokes is the international standard definition of a typing word).*

2. **Elapsed Time in Minutes:**
   $$\text{Minutes} = \frac{\text{current\_time} - \text{start\_time}}{60.0}$$

3. **Net WPM (Words Per Minute — Standard Metric):**
   $$\text{Net WPM} = \frac{\text{Correct Keystrokes} / 5}{\text{Minutes}}$$

4. **Gross WPM (Raw Speed before error deduction):**
   $$\text{Gross WPM} = \frac{\text{Total Keystrokes} / 5}{\text{Minutes}}$$

5. **Accuracy (%):**
   $$\text{Accuracy} = \left(\frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}}\right) \times 100$$

6. **CPM (Characters Per Minute):**
   $$\text{CPM} = \frac{\text{Correct Keystrokes}}{\text{Minutes}}$$

- **Backspace Handling (`handle_backspace()`):**
  Pops the last character from `typed_chars`. If that popped character was correct, decrements `correct_keystrokes`. Total keystrokes and error counts remain intact to preserve true accuracy telemetry.

---

### 3. `desktop/core/passage_loader.py` (Text Management & Tkinter Open Dialog)
- **Role:** Supplies practice passages across categories (`Easy`, `Medium`, `Hard`, `Code`, `Quotes`) and sprint word streams.
- **Passage Storage:** Reads `desktop/data/passages.json` and `desktop/data/coding_presets.json`. If files are missing, seamlessly falls back to embedded defaults.
- **Tkinter Open File Integration (`load_custom_file_dialog()`):**
  ```python
  import tkinter as tk
  from tkinter import filedialog
  root = tk.Tk()
  root.withdraw() # Hides unwanted empty Tk root window
  root.attributes('-topmost', True) # Brings file chooser above Pygame
  filepath = filedialog.askopenfilename(
      title="Select Custom Practice File",
      filetypes=[("Text Files", "*.txt"), ("Code Files", "*.py;*.js;*.*")]
  )
  root.destroy()
  ```
  Opens a native Windows Open File dialog, reads the user's selected file, sanitizes tabs into spaces, and supplies the custom practice passage.

---

### 4. `desktop/core/session_logger.py` (Persistence & Tkinter Save Dialog)
- **Role:** Dual-storage logging in JSON (`typing_history.json`) and CSV (`typing_history.csv`).
- **Atomic Persistence:** Each completed test appends a structured dictionary containing `net_wpm`, `gross_wpm`, `accuracy`, `time_seconds`, `total_errors`, `mistyped_keys`, and ISO timestamp.
- **Tkinter Save File Integration (`export_history_dialog()`):**
  Uses `filedialog.asksaveasfilename(defaultextension=".csv")` to allow users to export their typing test telemetry to CSV or JSON on their file system.

---

### 5. `desktop/analytics/visualizer.py` (Progression Plotting)
- **Role:** Renders a clean line chart showing WPM progression over the last 15 sessions directly onto a Pygame surface without needing heavy third-party plotting libraries.
- **How It Works (Coordinate Geometry Math):**
  1. Finds the maximum WPM in recent history: `max_wpm = max(wpms, 60.0)`.
  2. Maps each session index $i$ to screen $X$:
     $$X_i = \text{pad\_left} + i \times \left(\frac{\text{chart\_width}}{n - 1}\right)$$
  3. Maps each WPM score to screen $Y$ (inverted since $Y=0$ is top of screen):
     $$Y_i = \text{pad\_top} + \text{chart\_height} - \left(\frac{\text{wpm}_i}{\text{max\_wpm}}\right) \times \text{chart\_height}$$
  4. Draws connecting line vectors using `pygame.draw.lines()` and circular data points using `pygame.draw.circle()`.

---

### 6. `desktop/ui/sound_fx.py` (Procedural Audio Engine)
- **Role:** Synthesizes audio feedback for typing clicks, errors, and test completion in real-time.
- **How It Works:** Does not require external `.mp3` or `.wav` files. Uses Python standard library `math.sin()` and `struct.pack("<h", sample)` to generate 16-bit 44.1kHz PCM sine-wave buffers with exponential fade-out envelopes to prevent speaker clicks.
- **Graceful Degradation:** If the host system has no audio card or drivers, catches exceptions and operates silently without crashing.

---

### 7. `desktop/ui/screens/typing_screen.py` (Typing Arena & Word Wrapping)
- **Word-Wrapping Algorithm:**
  1. Splits target text by spaces into words.
  2. Measures pixel width of each word using `font.size(word)`.
  3. Accumulates words into a line until `current_line_width + word_width > max_w`.
  4. Moves to a new line, ensuring words are never awkwardly split in half across line boundaries.
- **Seamless Error Highlighting:**
  - Analyzes the line for contiguous mistyped character runs.
  - Draws a single, unified rounded pill (`(65, 20, 25)`) behind the entire misspelled sequence (instead of separate bumpy overlapping boxes).
  - Draws a crisp coral-red underline (`#ef4444`) beneath the text at the font baseline.
  - Correct characters are rendered in vibrant green (`#22c55e`), pending characters in muted grey.
- **Caret Tracking & Scrolling:**
  - Calculates line index of current cursor position.
  - Automatically scrolls the view vertically if the passage extends beyond visible container height.

---

## 3. Top 15 Viva Questions & Model Answers

### Q1: What is the difference between Net WPM and Gross WPM?
> **Answer:** Gross WPM is raw speed: total keystrokes divided by 5, divided by minutes. Net WPM deducts errors: it only counts correct keystrokes divided by 5, divided by minutes. Net WPM is the true industry benchmark because typing fast with high errors is penalized.

### Q2: Why is a word considered 5 characters in your formula?
> **Answer:** In standardized typing tests (dating back to mechanical typewriters), words vary in length. Standardizing 1 word = 5 keystrokes (including spaces and punctuation) normalizes typing speed so tests with longer words can be fairly compared against tests with shorter words.

### Q3: Why did you combine Pygame and Tkinter?
> **Answer:** Pygame provides high-performance hardware-accelerated 60 FPS graphics, low-latency keyboard polling, and custom rendering. Tkinter provides native operating system desktop widgets (like `askopenfilename` and `asksaveasfilename`) which match the native OS look-and-feel and avoid having to code an entire OS file explorer from scratch in Pygame.

### Q4: How does your event loop prevent UI freezing?
> **Answer:** The application runs an iterative event loop capped at 60 FPS using `clock.tick(60)`. Every frame polls all pending OS events via `pygame.event.get()`, updates object states, and redraws the canvas. Because there are no blocking `time.sleep()` calls, the interface remains smooth and responsive.

### Q5: How do you handle High-DPI scaling on modern Windows laptops?
> **Answer:** Windows by default applies 125%–150% bilinear bitmap scaling to non-DPI-aware apps, making fonts and borders blurry. We invoke `ctypes.windll.shcore.SetProcessDpiAwareness(2)` before initializing Pygame, enabling per-monitor DPI awareness and rendering at 1:1 native physical monitor pixels.

### Q6: How does the application resize dynamically without distorting?
> **Answer:** We compute a dynamic scale factor relative to a reference resolution:
> `scale = max(0.9, min(width / 1150.0, height / 750.0))`.
> Fonts, card dimensions, button paddings, and vertical percentage anchors adapt dynamically whenever a `VIDEORESIZE` event occurs or the window is maximized.

### Q7: How does your text wrapping work when the user resizes the window?
> **Answer:** In `_render_text()`, we split the passage into words, measure each word's pixel width with `font.size()`, and group them into lines that fit within `box_w - padding`. When the window widens, lines recalculate and fit more words per line automatically.

### Q8: How does Backspace work in your engine?
> **Answer:** `handle_backspace()` pops the last typed character from our `typed_chars` list. If the popped character was correct, we decrement `correct_keystrokes`. Total keystrokes and mistake maps are not decremented, ensuring historical accuracy records accurately reflect corrections.

### Q9: How do you track mistyped characters?
> **Answer:** When a user types a wrong key, `TypingEngine` records the expected character into `mistake_map[expected] += 1`. On the Results screen, we sort this dictionary by frequency and display the top 5 missed keys (e.g., `'s': 3x missed`, `'Space': 1x missed`), giving actionable feedback on muscle memory weaknesses.

### Q10: How does the audio engine generate clicks without audio asset files?
> **Answer:** `SoundEngine` calculates synthetic PCM audio buffers using sine wave functions ($A \cdot \sin(2\pi f t)$) with short durations (25ms–120ms) and exponential volume fade-out envelopes to prevent audio pops. The raw buffer is passed to `pygame.mixer.Sound(buffer=bytes)`.

### Q11: How do you persist user session history?
> **Answer:** In `SessionLogger`, completed test summaries are dual-written: appended as a structured dictionary into `typing_history.json` and as a row via `csv.DictWriter` into `typing_history.csv`.

### Q12: How did you implement the progression chart without Matplotlib?
> **Answer:** `PerformanceVisualizer` uses coordinate geometry on a Pygame `Surface`. It normalizes historical WPM scores between $0$ and $\max(\text{wpm})$, maps indices to $X$-coordinates and scores to inverted $Y$-coordinates, and calls `pygame.draw.lines()` and `pygame.draw.circle()`.

### Q13: How is the caret (cursor) animated?
> **Answer:** In `typing_screen.py`, we sample `time.time() * 2`. Checking `int(time.time() * 2) % 2 == 0` toggles cursor visibility every 0.5 seconds, producing a standard operating-system-style blinking caret.

### Q14: How do you verify the correctness of your code?
> **Answer:** We created an automated unit test suite in `tests/test_typing_logic.py` using Python's `unittest` module. It tests:
> 1. Passage and word loader bounds.
> 2. Perfect typing runs (100% accuracy, positive WPM).
> 3. Mistake handling, backspacing, and accuracy calculations.
> 4. Session logging and aggregate analyzer metrics.

### Q15: How can this project be extended in the future?
> **Answer:** Future additions could include:
> - Multi-player network racing via WebSockets / socket programming.
> - Custom audio theme packs (e.g. Cherry MX Blue, Topre, Typewriter).
> - SQLite database integration for multi-user profiles.
