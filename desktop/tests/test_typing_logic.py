"""
Unit Tests for KeyWarp Desktop Core Logic.
Validates TypingEngine calculations (WPM, Accuracy, CPM),
error tracking, passage loading, and session analytics.

Run with:
    python -m unittest desktop/tests/test_typing_logic.py
"""

import os
import unittest
import tempfile
import time
import sys

# Add desktop directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

from core.typing_engine import TypingEngine
from core.passage_loader import PassageLoader
from core.session_logger import SessionLogger
from analytics.data_analyzer import DataAnalyzer


class TestTypingLogic(unittest.TestCase):
    def test_passage_loader(self):
        loader = PassageLoader()
        passage = loader.get_passage("Easy")
        self.assertIsInstance(passage, str)
        self.assertGreater(len(passage), 5)

        sprint_stream = loader.generate_sprint_stream(word_count=20)
        self.assertIsInstance(sprint_stream, str)
        words = sprint_stream.split()
        self.assertEqual(len(words), 20)

    def test_code_mode_python_snippets(self):
        loader = PassageLoader()
        for _ in range(15):
            code_passage = loader.get_passage("Code")
            self.assertIsInstance(code_passage, str)
            # Ensure no confusing return type arrows or impossible characters
            self.assertNotIn("->", code_passage)
            self.assertNotIn("=>", code_passage)
            self.assertTrue(code_passage.startswith("def ") or code_passage.startswith("class "))

    def test_typing_engine_multiline_code(self):
        target = "def square(n):\n    return n * n"
        engine = TypingEngine(target_text=target, mode="Passage", difficulty="Code")
        for ch in target:
            engine.handle_input(ch)
        self.assertTrue(engine.is_finished)
        self.assertEqual(engine.correct_keystrokes, len(target))
        self.assertEqual(engine.incorrect_keystrokes, 0)
        self.assertEqual(engine.get_accuracy(), 100.0)

    def test_typing_engine_perfect_run(self):
        target = "hello world"
        engine = TypingEngine(target_text=target, mode="Passage", difficulty="Easy")

        # Type the passage perfectly
        for ch in target:
            engine.handle_input(ch)

        self.assertTrue(engine.is_finished)
        self.assertEqual(engine.correct_keystrokes, len(target))
        self.assertEqual(engine.incorrect_keystrokes, 0)
        self.assertEqual(engine.get_accuracy(), 100.0)
        self.assertGreater(engine.get_gross_wpm(), 0.0)
        self.assertGreater(engine.get_net_wpm(), 0.0)

    def test_typing_engine_errors_and_backspace(self):
        target = "apple"
        engine = TypingEngine(target_text=target)

        # Type 'a', then incorrect 'x' (expected 'p'), then backspace, then 'p'
        engine.handle_input("a")
        engine.handle_input("x")  # wrong
        self.assertEqual(engine.incorrect_keystrokes, 1)
        self.assertEqual(engine.mistake_map.get("p"), 1)

        engine.handle_backspace()
        engine.handle_input("p")
        engine.handle_input("p")
        engine.handle_input("l")
        engine.handle_input("e")

        self.assertTrue(engine.is_finished)
        self.assertEqual(engine.total_keystrokes, 6)
        self.assertEqual(engine.correct_keystrokes, 5)
        # Accuracy = (5 / 6) * 100 = 83.3%
        self.assertAlmostEqual(engine.get_accuracy(), 83.3, delta=0.5)

    def test_session_logger_and_analyzer(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            logger = SessionLogger(data_dir=temp_dir)
            session1 = {
                "mode": "Passage",
                "difficulty": "Easy",
                "net_wpm": 40.0,
                "gross_wpm": 42.0,
                "cpm": 200.0,
                "accuracy": 95.0,
                "time_seconds": 15.0,
                "characters_typed": 50,
                "total_errors": 2,
                "mistyped_keys": "e:1;a:1"
            }
            session2 = {
                "mode": "Passage",
                "difficulty": "Hard",
                "net_wpm": 60.0,
                "gross_wpm": 62.0,
                "cpm": 300.0,
                "accuracy": 98.0,
                "time_seconds": 20.0,
                "characters_typed": 100,
                "total_errors": 1,
                "mistyped_keys": "t:1"
            }

            self.assertTrue(logger.log_session(session1))
            self.assertTrue(logger.log_session(session2))

            history = logger.get_history()
            self.assertEqual(len(history), 2)

            analyzer = DataAnalyzer(logger)
            stats = analyzer.get_stats_summary()
            self.assertEqual(stats["total_sessions"], 2)
            self.assertEqual(stats["best_net_wpm"], 60.0)
            self.assertEqual(stats["avg_net_wpm"], 50.0)
            self.assertAlmostEqual(stats["avg_accuracy"], 96.5, places=1)

    @unittest.skipUnless(PYGAME_AVAILABLE, "pygame is not installed")
    def test_results_screen_with_colon_mistakes(self):
        import pygame
        pygame.init()
        from ui.screens.results_screen import ResultsScreen

        # Simulate a typing session where user missed colons and semicolons
        engine = TypingEngine(target_text="def test(): pass")
        engine.mistake_map[":"] = 3
        engine.mistake_map[";"] = 1
        engine.mistake_map[" "] = 2
        engine.mistake_map["\n"] = 1
        summary = engine.get_summary()

        screen = ResultsScreen(
            summary_data=summary,
            on_retry=lambda: None,
            on_new_test=lambda: None,
            on_export=lambda: None,
            on_menu=lambda: None
        )
        surf = pygame.Surface((1200, 800))
        # This draw call previously crashed with ValueError: too many values to unpack
        screen.draw(surf)

        # Also test legacy string format: "::3"
        legacy_summary = dict(summary)
        legacy_summary["mistyped_keys"] = "::3;:1; :2"
        legacy_screen = ResultsScreen(
            summary_data=legacy_summary,
            on_retry=lambda: None,
            on_new_test=lambda: None,
            on_export=lambda: None,
            on_menu=lambda: None
        )
        legacy_screen.draw(surf)


if __name__ == "__main__":
    unittest.main()
