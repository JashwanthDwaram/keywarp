"""
Data Analyzer Module for KeyWarp Desktop.
Computes overall performance metrics (Best WPM, Average WPM, Average Accuracy)
from logged session history.
"""

from typing import Dict, Any, List


class DataAnalyzer:
    def __init__(self, session_logger):
        self.logger = session_logger

    def get_stats_summary(self) -> Dict[str, Any]:
        """
        Calculates aggregate statistics across all logged test sessions.
        Returns a dictionary with total_sessions, best_wpm, avg_wpm, avg_accuracy.
        """
        records: List[Dict[str, Any]] = self.logger.get_history()

        if not records:
            return {
                "total_sessions": 0,
                "best_net_wpm": 0.0,
                "avg_net_wpm": 0.0,
                "avg_accuracy": 0.0,
                "total_time_seconds": 0.0
            }

        wpms = [float(r.get("net_wpm", 0.0)) for r in records]
        accuracies = [float(r.get("accuracy", 0.0)) for r in records]
        times = [float(r.get("time_seconds", 0.0)) for r in records]

        return {
            "total_sessions": len(records),
            "best_net_wpm": round(max(wpms), 1),
            "avg_net_wpm": round(sum(wpms) / len(wpms), 1),
            "avg_accuracy": round(sum(accuracies) / len(accuracies), 1),
            "total_time_seconds": round(sum(times), 1)
        }
