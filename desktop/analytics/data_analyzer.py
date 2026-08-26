"""
Data Analyzer module using Pandas.
Aggregates historical session data, calculates metrics, rolling trends, and error statistics.
"""

from typing import Dict, Any, List
import pandas as pd
from core.session_logger import SessionLogger


class DataAnalyzer:
    def __init__(self, logger: SessionLogger):
        self.logger = logger

    def get_stats_summary(self) -> Dict[str, Any]:
        """Calculates comprehensive summary statistics across all logged sessions."""
        df = self.logger.load_dataframe()
        
        if df.empty or len(df) == 0:
            return {
                "total_sessions": 0,
                "best_net_wpm": 0.0,
                "avg_net_wpm": 0.0,
                "avg_accuracy": 0.0,
                "total_words_typed": 0,
                "total_time_min": 0.0,
                "improvement_wpm": 0.0,
                "top_mistyped_keys": []
            }

        # Calculate metrics safely
        total_sessions = len(df)
        best_net_wpm = float(df["net_wpm"].max()) if "net_wpm" in df.columns else 0.0
        avg_net_wpm = float(df["net_wpm"].mean()) if "net_wpm" in df.columns else 0.0
        avg_accuracy = float(df["accuracy"].mean()) if "accuracy" in df.columns else 0.0
        
        # Words typed estimate (characters / 5)
        total_chars = int(df["characters_typed"].sum()) if "characters_typed" in df.columns else 0
        total_words = total_chars // 5
        
        total_time_sec = float(df["time_seconds"].sum()) if "time_seconds" in df.columns else 0.0
        total_time_min = round(total_time_sec / 60.0, 1)

        # Improvement calculation: compare first 3 tests avg with last 3 tests avg
        improvement_wpm = 0.0
        if total_sessions >= 4:
            first_wpm = df.head(3)["net_wpm"].mean()
            last_wpm = df.tail(3)["net_wpm"].mean()
            improvement_wpm = round(float(last_wpm - first_wpm), 1)

        # Mistyped keys aggregation
        top_keys = self.get_top_mistyped_keys(df, top_n=6)

        return {
            "total_sessions": total_sessions,
            "best_net_wpm": round(best_net_wpm, 1),
            "avg_net_wpm": round(avg_net_wpm, 1),
            "avg_accuracy": round(avg_accuracy, 1),
            "total_words_typed": total_words,
            "total_time_min": total_time_min,
            "improvement_wpm": improvement_wpm,
            "top_mistyped_keys": top_keys
        }

    def get_top_mistyped_keys(self, df: pd.DataFrame, top_n: int = 6) -> List[tuple]:
        """Parses mistyped_keys column from CSV and aggregates error frequencies."""
        if df.empty or "mistyped_keys" not in df.columns:
            return []
        
        counts: Dict[str, int] = {}
        for entry in df["mistyped_keys"].dropna():
            if not isinstance(entry, str) or entry == "None" or not entry.strip():
                continue
            pairs = entry.split(";")
            for p in pairs:
                if ":" in p:
                    parts = p.split(":")
                    k = parts[0]
                    try:
                        v = int(parts[1])
                        counts[k] = counts.get(k, 0) + v
                    except ValueError:
                        pass
        sorted_keys = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        return sorted_keys[:top_n]
