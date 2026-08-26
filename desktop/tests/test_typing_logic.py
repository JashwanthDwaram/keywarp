"""
Unit tests for Typing Engine, Session Logger, and Analytics calculations.
"""

import os
import unittest
import tempfile
import time
from core.typing_engine import TypingEngine
from core.passage_loader import PassageLoader
from core.session_logger import SessionLogger
from analytics.data_analyzer import DataAnalyzer


class TestTypingLogic(unittest.TestCase):
    def test_passage_loader(self):
        loader = PassageLoader()
        passage = loader.get_passage("Easy")
        self.assertIsInstance(passage, str)
        self.assertGreater(len(passage), 10)

        sprint_stream = loader.generate_sprint_stream(word_count=20)
        self.assertIsInstance(sprint_stream, str)
        words = sprint_stream.split()
        self.assertEqual(len(words), 20)

    def test_typing_engine_perfect_run(self):
        target = "hello world"
        engine = TypingEngine(target_text=target, mode="Passage", difficulty="Easy")
        
        # Type perfect run
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

        # Type 'a', then wrong 'x', then backspace, then 'p'
        engine.handle_input("a")
        engine.handle_input("x")  # wrong (expected 'p')
        self.assertEqual(engine.incorrect_keystrokes, 1)
        self.assertEqual(engine.mistyped_char_map.get("p"), 1)

        engine.handle_backspace()
        engine.handle_input("p")
        engine.handle_input("p")
        engine.handle_input("l")
        engine.handle_input("e")

        self.assertTrue(engine.is_finished)
        self.assertEqual(engine.total_keystrokes, 6)
        self.assertEqual(engine.correct_keystrokes, 5)
        # Accuracy: 5/6 * 100 = 83.3%
        self.assertAlmostEqual(engine.get_accuracy(), 83.3, delta=0.5)

    def test_session_logger_and_analyzer(self):
        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tf:
            temp_csv = tf.name

        try:
            logger = SessionLogger(filepath=temp_csv)
            summary1 = {
                "mode": "Passage",
                "difficulty": "Easy",
                "passage_length": 50,
                "characters_typed": 50,
                "time_seconds": 15.0,
                "gross_wpm": 40.0,
                "net_wpm": 38.0,
                "accuracy": 95.0,
                "total_errors": 2,
                "mistyped_keys": "e:1;a:1"
            }
            summary2 = {
                "mode": "Passage",
                "difficulty": "Hard",
                "passage_length": 100,
                "characters_typed": 100,
                "time_seconds": 20.0,
                "gross_wpm": 60.0,
                "net_wpm": 58.0,
                "accuracy": 98.0,
                "total_errors": 1,
                "mistyped_keys": "t:1"
            }

            self.assertTrue(logger.log_session(summary1))
            self.assertTrue(logger.log_session(summary2))

            df = logger.load_dataframe()
            self.assertEqual(len(df), 2)

            # Leaderboard sort check
            leaderboard = logger.get_leaderboard()
            self.assertEqual(len(leaderboard), 2)
            self.assertEqual(leaderboard[0]["net_wpm"], 58.0)

            # Analyzer stats
            analyzer = DataAnalyzer(logger)
            stats = analyzer.get_stats_summary()
            self.assertEqual(stats["total_sessions"], 2)
            self.assertEqual(stats["best_net_wpm"], 58.0)
            self.assertEqual(stats["avg_net_wpm"], 48.0)
            self.assertAlmostEqual(stats["avg_accuracy"], 96.5, places=1)

        finally:
            if os.path.exists(temp_csv):
                os.remove(temp_csv)


if __name__ == "__main__":
    unittest.main()
