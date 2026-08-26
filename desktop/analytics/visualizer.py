"""
Performance Visualizer module using Matplotlib.
Generates dark-themed multi-panel analytics charts and converts them directly to Pygame surfaces.
"""

import io
import threading
from typing import Optional
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-GUI backend for thread safety
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import pygame

from analytics.data_analyzer import DataAnalyzer


class PerformanceVisualizer:
    def __init__(self):
        # Configure dark theme aesthetics
        self.bg_dark = "#0F172A"       # Slate 900
        self.bg_panel = "#1E293B"      # Slate 800
        self.text_color = "#E2E8F0"    # Slate 200
        self.muted_color = "#94A3B8"   # Slate 400
        self.grid_color = "#334155"    # Slate 700
        self.color_primary = "#6366F1" # Indigo 500
        self.color_accent = "#38BDF8"  # Sky 400
        self.color_emerald = "#10B981" # Emerald 500
        self.color_rose = "#F43F5E"    # Rose 500

    def create_dashboard_figure(self, df: pd.DataFrame, width_in: float = 10.0, height_in: float = 6.0) -> plt.Figure:
        """Creates a modern 4-panel analytics dashboard figure."""
        fig = plt.figure(figsize=(width_in, height_in), facecolor=self.bg_dark)
        
        if df.empty or len(df) == 0:
            ax = fig.add_subplot(111, facecolor=self.bg_panel)
            ax.text(0.5, 0.5, "No typing session data available yet.\nComplete a few typing tests to unlock visual analytics!",
                    color=self.text_color, ha="center", va="center", fontsize=14, linespacing=1.6)
            ax.set_xticks([])
            ax.set_yticks([])
            for spine in ax.spines.values():
                spine.set_color(self.grid_color)
            fig.tight_layout(pad=2.0)
            return fig

        # 2x2 Subplots Grid
        gs = fig.add_gridspec(2, 2, hspace=0.35, wspace=0.25)
        
        # 1. WPM Progress Over Time (Top-Left)
        ax1 = fig.add_subplot(gs[0, 0], facecolor=self.bg_panel)
        self._plot_wpm_trend(ax1, df)

        # 2. Accuracy vs WPM Correlation (Top-Right)
        ax2 = fig.add_subplot(gs[0, 1], facecolor=self.bg_panel)
        self._plot_accuracy_wpm_scatter(ax2, df)

        # 3. Mistyped Character Frequency (Bottom-Left)
        ax3 = fig.add_subplot(gs[1, 0], facecolor=self.bg_panel)
        self._plot_error_frequency(ax3, df)

        # 4. Performance by Difficulty / Mode (Bottom-Right)
        ax4 = fig.add_subplot(gs[1, 1], facecolor=self.bg_panel)
        self._plot_difficulty_breakdown(ax4, df)

        fig.subplots_adjust(left=0.07, right=0.96, top=0.93, bottom=0.09)
        return fig

    def _style_axis(self, ax: plt.Axes, title: str, xlabel: str = "", ylabel: str = "") -> None:
        """Applies consistent dark-mode styling to an axis."""
        ax.set_title(title, color=self.text_color, fontsize=11, fontweight="bold", pad=8)
        if xlabel:
            ax.set_xlabel(xlabel, color=self.muted_color, fontsize=9)
        if ylabel:
            ax.set_ylabel(ylabel, color=self.muted_color, fontsize=9)
        ax.tick_params(colors=self.muted_color, labelsize=8)
        ax.grid(True, linestyle="--", alpha=0.35, color=self.grid_color)
        for spine in ax.spines.values():
            spine.set_color(self.grid_color)

    def _plot_wpm_trend(self, ax: plt.Axes, df: pd.DataFrame) -> None:
        sessions = np.arange(1, len(df) + 1)
        net_wpm = df["net_wpm"].values
        gross_wpm = df["gross_wpm"].values if "gross_wpm" in df.columns else net_wpm

        ax.plot(sessions, gross_wpm, label="Gross WPM", color=self.color_accent, linestyle=":", alpha=0.6, linewidth=1.5)
        ax.plot(sessions, net_wpm, label="Net WPM", color=self.color_primary, marker="o", markersize=4, linewidth=2)

        # Rolling 3-session moving average if enough points
        if len(df) >= 3:
            rolling_avg = pd.Series(net_wpm).rolling(window=3, min_periods=1).mean()
            ax.plot(sessions, rolling_avg, label="3-Test Trend", color=self.color_emerald, linestyle="--", linewidth=2)

        self._style_axis(ax, "WPM Progress Trend", "Session Number", "Words Per Minute")
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True))
        ax.legend(facecolor=self.bg_panel, edgecolor=self.grid_color, labelcolor=self.text_color, fontsize=8, loc="upper left")

    def _plot_accuracy_wpm_scatter(self, ax: plt.Axes, df: pd.DataFrame) -> None:
        acc = df["accuracy"].values
        wpm = df["net_wpm"].values
        
        scatter = ax.scatter(acc, wpm, c=wpm, cmap="viridis", alpha=0.85, edgecolors=self.color_accent, s=40)
        
        # Trendline if more than 2 points
        if len(df) >= 3:
            try:
                z = np.polyfit(acc, wpm, 1)
                p = np.poly1d(z)
                x_vals = np.linspace(min(acc), max(acc), 50)
                ax.plot(x_vals, p(x_vals), color=self.color_rose, linestyle="--", alpha=0.8, label="Correlation")
            except Exception:
                pass

        self._style_axis(ax, "Accuracy vs. Net WPM Correlation", "Accuracy (%)", "Net WPM")
        ax.set_xlim(max(0, min(acc) - 5), 102)

    def _plot_error_frequency(self, ax: plt.Axes, df: pd.DataFrame) -> None:
        analyzer = DataAnalyzer(None)  # type: ignore
        top_errors = analyzer.get_top_mistyped_keys(df, top_n=5)
        
        if not top_errors:
            ax.text(0.5, 0.5, "No error patterns recorded yet.", color=self.muted_color, ha="center", va="center", fontsize=9)
            self._style_axis(ax, "Most Mistyped Keys")
            return

        keys = [item[0] for item in top_errors][::-1]
        counts = [item[1] for item in top_errors][::-1]

        bars = ax.barh(keys, counts, color=self.color_rose, alpha=0.8, edgecolor="#FDA4AF", height=0.55)
        ax.bar_label(bars, color=self.text_color, fontsize=8, padding=3)
        self._style_axis(ax, "Top Mistyped Characters", "Error Count", "Key")
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True))

    def _plot_difficulty_breakdown(self, ax: plt.Axes, df: pd.DataFrame) -> None:
        if "difficulty" not in df.columns or df["difficulty"].nunique() == 0:
            ax.text(0.5, 0.5, "Insufficient category data.", color=self.muted_color, ha="center", va="center", fontsize=9)
            self._style_axis(ax, "Avg Net WPM by Difficulty")
            return

        grouped = df.groupby("difficulty")["net_wpm"].mean().reset_index()
        cats = grouped["difficulty"].tolist()
        wpms = grouped["net_wpm"].round(1).tolist()

        colors = [self.color_emerald, self.color_accent, self.color_primary, self.color_rose, "#A855F7"]
        bar_colors = colors[:len(cats)]

        bars = ax.bar(cats, wpms, color=bar_colors, alpha=0.85, width=0.5)
        ax.bar_label(bars, color=self.text_color, fontsize=8, padding=3)
        self._style_axis(ax, "Average WPM by Difficulty", "Category", "Avg WPM")

    def render_to_pygame_surface(self, df: pd.DataFrame, width: int = 1000, height: int = 500) -> pygame.Surface:
        """Renders the Matplotlib dashboard to a Pygame Surface."""
        dpi = 100
        fig = self.create_dashboard_figure(df, width_in=width / dpi, height_in=height / dpi)
        
        # Render to memory buffer
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=dpi, facecolor=self.bg_dark)
        plt.close(fig)
        buf.seek(0)
        
        # Load surface from buffer
        surface = pygame.image.load(buf)
        return surface

    def save_report_image(self, df: pd.DataFrame, output_path: str = "data/analytics_report.png") -> str:
        """Exports high-resolution report image to disk."""
        fig = self.create_dashboard_figure(df, width_in=12.0, height_in=7.5)
        fig.savefig(output_path, dpi=150, facecolor=self.bg_dark, bbox_inches="tight")
        plt.close(fig)
        return output_path
