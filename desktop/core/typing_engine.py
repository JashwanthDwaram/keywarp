"""
Core Typing Engine for KeyWarp Desktop.
Handles keystroke processing, real-time calculations (WPM, CPM, Accuracy),
error tracking, and session completion checks.

- Standard Word Length = 5 characters.
- Elapsed Time (minutes) = (current_time - start_time) / 60.0
- Gross WPM = (Total Keystrokes / 5) / Elapsed Minutes
- Net WPM   = (Correct Characters / 5) / Elapsed Minutes
- Accuracy  = (Correct Characters / Total Keystrokes) * 100%
- CPM       = Correct Characters / Elapsed Minutes
"""

import time
from typing import Dict, Any


class TypingEngine:
    def __init__(self, target_text: str, mode: str = "Passage", difficulty: str = "Medium", sprint_duration: float = 60.0):
        self.target_text = target_text
        self.mode = mode
        self.difficulty = difficulty
        self.sprint_duration = sprint_duration

        # Keystroke state
        self.typed_chars: list[str] = []
        self.total_keystrokes: int = 0
        self.correct_keystrokes: int = 0
        self.incorrect_keystrokes: int = 0
        self.mistake_map: Dict[str, int] = {}  # Tracks which characters were missed and how often

        # Timing state
        self.start_time: float = 0.0
        self.end_time: float = 0.0
        self.is_started: bool = False
        self.is_finished: bool = False

    def handle_input(self, char: str) -> None:
        """Processes a single typed character from Pygame event loop."""
        if self.is_finished:
            return

        # Start clock on the very first keystroke
        if not self.is_started:
            self.start_time = time.time()
            self.is_started = True

        current_idx = len(self.typed_chars)
        self.total_keystrokes += 1

        # Check correctness against expected character
        if current_idx < len(self.target_text):
            expected = self.target_text[current_idx]
            if char == expected:
                self.correct_keystrokes += 1
            else:
                self.incorrect_keystrokes += 1
                self.mistake_map[expected] = self.mistake_map.get(expected, 0) + 1

        self.typed_chars.append(char)

        # Check passage completion
        if len(self.typed_chars) >= len(self.target_text):
            self.finish()

    def handle_backspace(self) -> None:
        """Allows deleting the last character typed."""
        if self.is_finished or not self.typed_chars:
            return

        last_char = self.typed_chars.pop()
        current_idx = len(self.typed_chars)

        # If the deleted character was correct, adjust count
        if current_idx < len(self.target_text) and last_char == self.target_text[current_idx]:
            self.correct_keystrokes = max(0, self.correct_keystrokes - 1)

    def finish(self) -> None:
        """Marks the typing test as finished and locks end time."""
        if not self.is_finished:
            self.end_time = time.time()
            self.is_finished = True

    def get_elapsed_seconds(self) -> float:
        """Returns elapsed time in seconds."""
        if not self.is_started:
            return 0.0
        if self.is_finished:
            return max(0.1, self.end_time - self.start_time)
        return max(0.1, time.time() - self.start_time)

    def get_remaining_sprint_seconds(self) -> float:
        """For Sprint mode: returns seconds left on the countdown timer."""
        if not self.is_started:
            return self.sprint_duration
        elapsed = time.time() - self.start_time
        remaining = self.sprint_duration - elapsed
        if remaining <= 0:
            self.finish()
            return 0.0
        return remaining

    def get_net_wpm(self) -> float:
        """
        Net Words Per Minute (Standard Typing Test Metric).
        Net WPM = (Correct Characters / 5) / Elapsed Minutes
        """
        elapsed_sec = self.get_elapsed_seconds()
        if elapsed_sec <= 0:
            return 0.0
        minutes = elapsed_sec / 60.0
        words = self.correct_keystrokes / 5.0
        return round(words / minutes, 1)

    def get_gross_wpm(self) -> float:
        """
        Gross Words Per Minute (Raw Speed without error deduction).
        Gross WPM = (Total Keystrokes / 5) / Elapsed Minutes
        """
        elapsed_sec = self.get_elapsed_seconds()
        if elapsed_sec <= 0:
            return 0.0
        minutes = elapsed_sec / 60.0
        words = self.total_keystrokes / 5.0
        return round(words / minutes, 1)

    def get_accuracy(self) -> float:
        """
        Accuracy Percentage = (Correct Keystrokes / Total Keystrokes) * 100
        """
        if self.total_keystrokes == 0:
            return 100.0
        acc = (self.correct_keystrokes / self.total_keystrokes) * 100.0
        return round(max(0.0, min(100.0, acc)), 1)

    def get_cpm(self) -> float:
        """Characters Per Minute = Correct Characters / Elapsed Minutes"""
        elapsed_sec = self.get_elapsed_seconds()
        if elapsed_sec <= 0:
            return 0.0
        minutes = elapsed_sec / 60.0
        return round(self.correct_keystrokes / minutes, 1)

    def get_summary(self) -> Dict[str, Any]:
        """Compiles final test statistics into a summary dictionary."""
        def encode_char(c: str) -> str:
            if c == " ":
                return "[space]"
            elif c == "\n":
                return "[enter]"
            elif c == "\t":
                return "[tab]"
            elif c == ":":
                return "[colon]"
            elif c == ";":
                return "[semicolon]"
            return c

        # Top mistyped characters string formatted as 'char:count;char:count'
        sorted_mistakes = sorted(self.mistake_map.items(), key=lambda x: x[1], reverse=True)
        mistake_str = ";".join(f"{encode_char(k)}:{v}" for k, v in sorted_mistakes[:5]) if sorted_mistakes else "None"

        return {
            "mode": self.mode,
            "difficulty": self.difficulty,
            "net_wpm": self.get_net_wpm(),
            "gross_wpm": self.get_gross_wpm(),
            "cpm": self.get_cpm(),
            "accuracy": self.get_accuracy(),
            "time_seconds": round(self.get_elapsed_seconds(), 1),
            "characters_typed": len(self.typed_chars),
            "correct_keystrokes": self.correct_keystrokes,
            "total_errors": self.incorrect_keystrokes,
            "mistyped_keys": mistake_str,
            "date": time.strftime("%Y-%m-%d %H:%M:%S")
        }
