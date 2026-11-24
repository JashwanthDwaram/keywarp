"""
Session Logger Module for KeyWarp Desktop.
Handles saving completed test sessions to CSV and JSON,
retrieving past history, and using Tkinter for native file export dialogs.
"""

import os
import csv
import json
from typing import List, Dict, Any, Optional

DEFAULT_CSV_HEADERS = [
    "date", "mode", "difficulty", "net_wpm", "gross_wpm",
    "cpm", "accuracy", "time_seconds", "characters_typed",
    "correct_keystrokes", "total_errors", "mistyped_keys"
]


class SessionLogger:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir is None:
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)

        self.json_path = os.path.join(self.data_dir, "typing_history.json")
        self.csv_path = os.path.join(self.data_dir, "typing_history.csv")

    def log_session(self, summary: Dict[str, Any]) -> bool:
        """Appends a completed session summary to JSON and CSV history files."""
        try:
            # 1. Append to JSON
            history = self.get_history()
            history.append(summary)
            with open(self.json_path, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2)

            # 2. Append to CSV
            file_exists = os.path.exists(self.csv_path) and os.path.getsize(self.csv_path) > 0
            with open(self.csv_path, "a", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=DEFAULT_CSV_HEADERS, extrasaction="ignore")
                if not file_exists:
                    writer.writeheader()
                writer.writerow(summary)

            return True
        except Exception as e:
            print(f"[SessionLogger] Error saving session: {e}")
            return False

    def get_history(self) -> List[Dict[str, Any]]:
        """Reads and returns past sessions from JSON file."""
        if os.path.exists(self.json_path):
            try:
                with open(self.json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
            except Exception:
                pass
        return []

    def clear_history(self) -> bool:
        """Clears all logged history."""
        try:
            if os.path.exists(self.json_path):
                with open(self.json_path, "w", encoding="utf-8") as f:
                    json.dump([], f)
            if os.path.exists(self.csv_path):
                with open(self.csv_path, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=DEFAULT_CSV_HEADERS)
                    writer.writeheader()
            return True
        except Exception as e:
            print(f"[SessionLogger] Error clearing history: {e}")
            return False

    @staticmethod
    def export_history_dialog(records: List[Dict[str, Any]]) -> Optional[str]:
        """
        Tkinter Integration:
        Opens native Save File dialog to let the user export their test history
        to a chosen CSV or JSON file on their system.
        """
        if not records:
            return None

        try:
            import tkinter as tk
            from tkinter import filedialog
            root = tk.Tk()
            root.withdraw()
            root.attributes('-topmost', True)

            save_path = filedialog.asksaveasfilename(
                title="Export Typing History",
                defaultextension=".csv",
                filetypes=[
                    ("CSV File", "*.csv"),
                    ("JSON File", "*.json"),
                    ("All Files", "*.*")
                ]
            )
            root.destroy()

            if not save_path:
                return None

            if save_path.lower().endswith(".json"):
                with open(save_path, "w", encoding="utf-8") as f:
                    json.dump(records, f, indent=2)
            else:
                with open(save_path, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=DEFAULT_CSV_HEADERS, extrasaction="ignore")
                    writer.writeheader()
                    for r in records:
                        writer.writerow(r)

            return save_path
        except Exception as e:
            print(f"[SessionLogger] Tkinter Export error: {e}")
            return None
