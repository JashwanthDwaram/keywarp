"""
Core Typing Engine.
Handles real-time keystroke processing, live WPM/Accuracy metrics,
mistake tracking, and performance statistics calculation.
"""

import time
from typing import List, Dict, Tuple, Optional


class TypingEngine:
    def __init__(self, target_text: str, mode: str = "Passage", difficulty: str = "Medium", sprint_duration: float = 60.0):
        self.target_text = target_text
        self.mode = mode
        self.difficulty = difficulty
        self.sprint_duration = sprint_duration

        self.typed_chars: List[str] = []
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        
        self.total_keystrokes: int = 0
        self.correct_keystrokes: int = 0
        self.incorrect_keystrokes: int = 0
        self.mistyped_char_map: Dict[str, int] = {}  # maps expected char -> error count
        
        self.is_started: bool = False
        self.is_finished: bool = False

    def reset(self, new_target: Optional[str] = None) -> None:
        """Resets the engine for a new session."""
        if new_target is not None:
            self.target_text = new_target
        self.typed_chars.clear()
        self.start_time = None
        self.end_time = None
        self.total_keystrokes = 0
        self.correct_keystrokes = 0
        self.incorrect_keystrokes = 0
        self.mistyped_char_map.clear()
        self.is_started = False
        self.is_finished = False

    def handle_input(self, char: str) -> None:
        """Processes a single typed character."""
        if self.is_finished:
            return

        current_time = time.time()
        if not self.is_started:
            self.start_time = current_time
            self.is_started = True

        idx = len(self.typed_chars)
        if idx >= len(self.target_text):
            return

        expected_char = self.target_text[idx]
        self.typed_chars.append(char)
        self.total_keystrokes += 1

        if char == expected_char:
            self.correct_keystrokes += 1
        else:
            self.incorrect_keystrokes += 1
            # Track which expected character was mistyped
            char_key = expected_char if expected_char != " " else "[space]"
            self.mistyped_char_map[char_key] = self.mistyped_char_map.get(char_key, 0) + 1

        # Check completion in passage mode
        if len(self.typed_chars) >= len(self.target_text):
            self.finish()

    def handle_backspace(self) -> None:
        """Handles backspace key press."""
        if self.is_finished or not self.typed_chars:
            return
        self.typed_chars.pop()

    def finish(self) -> None:
        """Marks the session as completed."""
        if not self.is_finished:
            self.is_finished = True
            self.end_time = time.time() if self.start_time else time.time()

    def update_sprint_timer(self) -> bool:
        """Updates sprint timer. Returns True if sprint expired."""
        if self.mode == "Sprint" and self.is_started and not self.is_finished:
            elapsed = time.time() - (self.start_time or time.time())
            if elapsed >= self.sprint_duration:
                self.finish()
                return True
        return False

    def get_elapsed_seconds(self) -> float:
        """Returns elapsed time in seconds."""
        if not self.is_started:
            return 0.0
        if self.is_finished and self.end_time and self.start_time:
            return max(0.001, self.end_time - self.start_time)
        if self.start_time:
            return max(0.001, time.time() - self.start_time)
        return 0.0

    def get_remaining_sprint_seconds(self) -> float:
        """For sprint mode: returns remaining countdown seconds."""
        if not self.is_started:
            return self.sprint_duration
        elapsed = self.get_elapsed_seconds()
        return max(0.0, self.sprint_duration - elapsed)

    def get_gross_wpm(self) -> float:
        """Gross WPM = (Total Typed Characters / 5) / (Time in minutes)"""
        elapsed_sec = self.get_elapsed_seconds()
        if elapsed_sec <= 0 or len(self.typed_chars) == 0:
            return 0.0
        minutes = elapsed_sec / 60.0
        return round((len(self.typed_chars) / 5.0) / minutes, 1)

    def get_net_wpm(self) -> float:
        """
        Net WPM = ((Correct Characters / 5) - Uncorrected Errors) / (Time in minutes)
        Standard touch-typing benchmark formula.
        """
        elapsed_sec = self.get_elapsed_seconds()
        if elapsed_sec <= 0 or len(self.typed_chars) == 0:
            return 0.0
        
        # Count currently uncorrected errors in typed stream
        uncorrected_errors = 0
        for i, typed_ch in enumerate(self.typed_chars):
            if i < len(self.target_text) and typed_ch != self.target_text[i]:
                uncorrected_errors += 1

        correct_chars_typed = len(self.typed_chars) - uncorrected_errors
        minutes = elapsed_sec / 60.0
        
        net_words = (correct_chars_typed / 5.0) - uncorrected_errors
        net_wpm = net_words / minutes
        return max(0.0, round(net_wpm, 1))

    def get_accuracy(self) -> float:
        """Accuracy = (Correct Keystrokes / Total Keystrokes) * 100%"""
        if self.total_keystrokes == 0:
            return 100.0
        acc = (self.correct_keystrokes / self.total_keystrokes) * 100.0
        return round(max(0.0, min(100.0, acc)), 1)

    def get_current_index(self) -> int:
        return len(self.typed_chars)

    def get_char_render_info(self) -> List[Tuple[str, str]]:
        """
        Returns list of (char, status) for rendering.
        Statuses: 'CORRECT', 'INCORRECT', 'CURRENT', 'PENDING'
        """
        result = []
        curr_idx = len(self.typed_chars)
        for i, expected in enumerate(self.target_text):
            if i < curr_idx:
                status = "CORRECT" if self.typed_chars[i] == expected else "INCORRECT"
            elif i == curr_idx:
                status = "CURRENT"
            else:
                status = "PENDING"
            result.append((expected, status))
        return result

    def get_summary(self) -> Dict:
        """Returns comprehensive session metrics summary."""
        # Top 3 mistyped keys
        sorted_errors = sorted(self.mistyped_char_map.items(), key=lambda x: x[1], reverse=True)
        top_errors_str = ";".join([f"{k}:{v}" for k, v in sorted_errors[:5]]) if sorted_errors else "None"

        return {
            "mode": self.mode,
            "difficulty": self.difficulty,
            "passage_length": len(self.target_text),
            "characters_typed": len(self.typed_chars),
            "time_seconds": round(self.get_elapsed_seconds(), 2),
            "gross_wpm": self.get_gross_wpm(),
            "net_wpm": self.get_net_wpm(),
            "accuracy": self.get_accuracy(),
            "total_errors": self.incorrect_keystrokes,
            "mistyped_keys": top_errors_str
        }
