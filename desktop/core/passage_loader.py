"""
Passage and word bank loader.
Handles random selection by difficulty and sprint mode stream generation.
"""

import json
import os
import random
from typing import List, Dict, Optional
from config.constants import PASSAGES_FILE_PATH, WORDS_FILE_PATH, DIFF_EASY, DIFF_MEDIUM, DIFF_HARD


class PassageLoader:
    def __init__(self, passages_path: str = PASSAGES_FILE_PATH, words_path: str = WORDS_FILE_PATH):
        self.passages_path = passages_path
        self.words_path = words_path
        self.passages: Dict[str, List[str]] = {}
        self.word_pool: List[str] = []
        self._load_data()

    def _load_data(self) -> None:
        # Load passages JSON
        if os.path.exists(self.passages_path):
            try:
                with open(self.passages_path, "r", encoding="utf-8") as f:
                    self.passages = json.load(f)
            except Exception as e:
                print(f"[PassageLoader] Error loading {self.passages_path}: {e}")
                self._fallback_passages()
        else:
            self._fallback_passages()

        # Load words for sprint mode
        if os.path.exists(self.words_path):
            try:
                with open(self.words_path, "r", encoding="utf-8") as f:
                    content = f.read().replace("\n", " ")
                    self.word_pool = [w.strip() for w in content.split() if w.strip()]
            except Exception as e:
                print(f"[PassageLoader] Error loading {self.words_path}: {e}")
                self._fallback_words()
        else:
            self._fallback_words()

    def _fallback_passages(self) -> None:
        self.passages = {
            DIFF_EASY: ["The quick brown fox jumps over the lazy dog."],
            DIFF_MEDIUM: ["Practice makes progress when you type with accuracy and rhythm."],
            DIFF_HARD: ["High-performance computing requires optimization and algorithm analysis."]
        }

    def _fallback_words(self) -> None:
        self.word_pool = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "typing", "speed", "test"]

    def get_passage(self, difficulty: str = DIFF_MEDIUM) -> str:
        """Returns a random passage for the given difficulty level."""
        category = self.passages.get(difficulty)
        if not category:
            # Try to get any category
            category = next(iter(self.passages.values()), ["Default typing passage."])
        return random.choice(category)

    def generate_sprint_stream(self, word_count: int = 120) -> str:
        """Generates a continuous space-separated string of randomized words for sprint mode."""
        if not self.word_pool:
            self._fallback_words()
        selected = [random.choice(self.word_pool) for _ in range(word_count)]
        return " ".join(selected)

    def get_categories(self) -> List[str]:
        return list(self.passages.keys())
