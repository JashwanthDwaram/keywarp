"""
Passage Loader Module for KeyWarp Desktop.
Handles loading built-in passages, generating random sprint words,
and integrating Tkinter for native file browsing of custom practice text.
"""

import os
import json
import random
from typing import Dict, List, Optional

# Default fallback passages across difficulty levels
DEFAULT_PASSAGES: Dict[str, List[str]] = {
    "Easy": [
        "The quick brown fox jumps over the lazy dog every morning.",
        "A small cup of warm tea can brighten any rainy afternoon.",
        "Sunlight filtered gently through the green leaves in the park.",
        "Music filled the quiet room as the children began to dance.",
        "She loved to read books by the warm fire during cold winter nights.",
        "The gentle sound of falling rain brings peace to a busy day.",
        "Walking through the quiet forest, they found a clear blue lake.",
        "Fresh bread from the local bakery smelled delicious in the morning air.",
        "Stars twinkled brightly in the dark night sky above the sleepy town.",
        "A faithful friend is a strong shelter in times of stormy weather."
    ],
    "Medium": [
        "Typing is a fundamental computer skill that bridges human thought and digital creation.",
        "Building muscle memory requires consistency, patience, and attention to proper finger placement.",
        "Software development demands precision in punctuation, indentation, and variable naming."
    ],
    "Hard": [
        "Asynchronous paradigms, concurrent goroutines, and polymorphism dictate resilient architecture.",
        "Sophisticated cryptographic algorithms guarantee end-to-end data integrity across distributed nodes.",
        "Algorithmic complexity, big-O notation, and memoization optimize resource-constrained execution."
    ],
    "Code": [
        "def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    return [x for x in arr if x < pivot] + [x for x in arr if x == pivot] + [x for x in arr if x > pivot]",
        "def calculate_wpm(characters, seconds):\n    if seconds <= 0:\n        return 0.0\n    return round((characters / 5.0) / (seconds / 60.0), 2)"
    ],
    "Quotes": [
        "The only way to do great work is to love what you do. Stay hungry, stay foolish.",
        "Simplicity is the soul of efficiency. First solve the problem, then write the code."
    ]
}

COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other"
]


class PassageLoader:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.data_dir = data_dir
        self._recent_history: Dict[str, List[str]] = {}
        self.passages: Dict[str, List[str]] = self._load_passages()
        self.words: List[str] = self._load_words()

    def _load_passages(self) -> Dict[str, List[str]]:
        """Loads passages from JSON file (passages.json or passage.json) if available; otherwise uses defaults."""
        search_dirs = [
            self.data_dir,
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"),
            os.path.abspath("desktop/data"),
            os.path.abspath("data"),
            os.path.abspath(".")
        ]
        candidates = ["passages.json", "passage.json"]

        for d in search_dirs:
            for fname in candidates:
                json_path = os.path.normpath(os.path.join(d, fname))
                if os.path.exists(json_path):
                    try:
                        with open(json_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            if isinstance(data, dict) and any(k in data for k in ["Easy", "Medium", "Hard"]):
                                easy_count = len(data.get("Easy", []))
                                print(f"[PassageLoader] Loaded passages from '{json_path}' ({easy_count} Easy passages).")
                                return data
                    except Exception as e:
                        print(f"[PassageLoader] Failed parsing '{json_path}': {e}")

        print("[PassageLoader] Notice: passages.json/passage.json not found or unreadable; using DEFAULT_PASSAGES.")
        return DEFAULT_PASSAGES

    def _load_words(self) -> List[str]:
        """Loads word list from words.txt or uses built-in common words."""
        search_dirs = [
            self.data_dir,
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"),
            os.path.abspath("desktop/data"),
            os.path.abspath("data"),
            os.path.abspath(".")
        ]
        for d in search_dirs:
            words_path = os.path.normpath(os.path.join(d, "words.txt"))
            if os.path.exists(words_path):
                try:
                    with open(words_path, "r", encoding="utf-8") as f:
                        words = [w.strip() for w in f.read().split() if w.strip()]
                        if words:
                            return words
                except Exception:
                    pass
        return COMMON_WORDS

    def get_passage(self, difficulty: str = "Medium") -> str:
        """Returns a random passage for the chosen difficulty category without immediate repeats."""
        category = difficulty if difficulty in self.passages else "Medium"

        # For Code category: prioritize clean, doable Python snippets
        if category == "Code":
            code_options = list(self.passages.get("Code", []))
            presets_path = os.path.join(self.data_dir, "coding_presets.json")
            if os.path.exists(presets_path):
                try:
                    with open(presets_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        presets = data.get("code_presets", {})
                        if "python" in presets:
                            for snip in presets["python"]:
                                if snip not in code_options:
                                    code_options.append(snip)
                except Exception:
                    pass

            if code_options:
                options = code_options
            else:
                options = self.passages.get("Code", ["def hello():\n    return 'Hello, World!'"])
        else:
            options = self.passages.get(category, self.passages.get("Medium", ["Typing test fallback text."]))
        if not options:
            return "Typing test fallback text."

        recent = self._recent_history.get(category, [])
        unseen = [p for p in options if p not in recent]
        chosen = random.choice(unseen) if unseen else random.choice(options)

        if category not in self._recent_history:
            self._recent_history[category] = []
        self._recent_history[category].append(chosen)

        # Avoid repeating the last N passages (up to 10 or half the pool)
        max_history = max(1, min(len(options) - 1, 10))
        if len(self._recent_history[category]) > max_history:
            self._recent_history[category].pop(0)

        return chosen

    def generate_sprint_stream(self, word_count: int = 50) -> str:
        """Generates a randomized stream of words for timed sprint mode."""
        chosen = [random.choice(self.words) for _ in range(word_count)]
        return " ".join(chosen)

    @staticmethod
    def load_custom_file_dialog() -> Optional[str]:
        """
        Tkinter Integration:
        Opens a native OS file chooser to let the user select any custom text file
        to use as practice text.
        """
        try:
            import tkinter as tk
            from tkinter import filedialog
            root = tk.Tk()
            root.withdraw()           # Hide root Tkinter main window
            root.attributes('-topmost', True)  # Bring file picker dialog to foreground

            file_path = filedialog.askopenfilename(
                title="Select Custom Practice File",
                filetypes=[
                    ("Text Files", "*.txt"),
                    ("Source Code", "*.py;*.js;*.ts;*.html;*.css;*.json"),
                    ("All Files", "*.*")
                ]
            )
            root.destroy()

            if file_path and os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read().strip()
                    # Sanitize tabs into 4 spaces and normalize line endings
                    content = content.replace("\t", "    ").replace("\r\n", "\n")
                    # Limit to ~400 characters if very long for a practical session
                    if len(content) > 400:
                        content = content[:400]
                    return content if content else None
        except Exception as e:
            print(f"[PassageLoader] Tkinter file dialog error: {e}")
        return None
