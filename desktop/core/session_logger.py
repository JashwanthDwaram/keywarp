"""
Session Logger module.
Manages persistent CSV storage for typing sessions and provides history retrieval.
"""

import os
import csv
from datetime import datetime
from typing import List, Dict, Optional
import pandas as pd
from config.constants import CSV_FILE_PATH

CSV_HEADERS = [
    "timestamp",
    "mode",
    "difficulty",
    "passage_length",
    "characters_typed",
    "time_seconds",
    "gross_wpm",
    "net_wpm",
    "accuracy",
    "total_errors",
    "mistyped_keys"
]


class SessionLogger:
    def __init__(self, filepath: str = CSV_FILE_PATH):
        self.filepath = filepath
        self._ensure_csv_file()

    def _ensure_csv_file(self) -> None:
        """Ensures directory and CSV file with headers exist."""
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath) or os.path.getsize(self.filepath) == 0:
            with open(self.filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(CSV_HEADERS)

    def log_session(self, summary: Dict) -> bool:
        """Appends a session summary to the CSV file."""
        try:
            self._ensure_csv_file()
            row = [
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                summary.get("mode", "Passage"),
                summary.get("difficulty", "Medium"),
                summary.get("passage_length", 0),
                summary.get("characters_typed", 0),
                summary.get("time_seconds", 0.0),
                summary.get("gross_wpm", 0.0),
                summary.get("net_wpm", 0.0),
                summary.get("accuracy", 0.0),
                summary.get("total_errors", 0),
                summary.get("mistyped_keys", "None")
            ]
            with open(self.filepath, "a", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(row)
            return True
        except Exception as e:
            print(f"[SessionLogger] Failed to log session: {e}")
            return False

    def load_dataframe(self) -> pd.DataFrame:
        """Loads session history into a Pandas DataFrame."""
        if not os.path.exists(self.filepath) or os.path.getsize(self.filepath) == 0:
            return pd.DataFrame(columns=CSV_HEADERS)
        try:
            df = pd.read_csv(self.filepath)
            if not df.empty and "timestamp" in df.columns:
                df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
            return df
        except Exception as e:
            print(f"[SessionLogger] Error reading CSV: {e}")
            return pd.DataFrame(columns=CSV_HEADERS)

    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        """Returns the most recent N sessions as dictionaries."""
        df = self.load_dataframe()
        if df.empty:
            return []
        recent = df.tail(limit).iloc[::-1]  # reverse to get newest first
        # Format timestamps nicely
        records = recent.to_dict("records")
        for r in records:
            if isinstance(r.get("timestamp"), pd.Timestamp):
                r["timestamp_str"] = r["timestamp"].strftime("%b %d, %H:%M")
            else:
                r["timestamp_str"] = str(r.get("timestamp", ""))
        return records

    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Returns the top N sessions ranked by Net WPM and Accuracy."""
        df = self.load_dataframe()
        if df.empty:
            return []
        top_df = df.sort_values(by=["net_wpm", "accuracy"], ascending=[False, False]).head(limit)
        records = top_df.to_dict("records")
        for r in records:
            if isinstance(r.get("timestamp"), pd.Timestamp):
                r["timestamp_str"] = r["timestamp"].strftime("%b %d, %H:%M")
            else:
                r["timestamp_str"] = str(r.get("timestamp", ""))
        return records
