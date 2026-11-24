"""
Performance Visualizer Module for KeyWarp Desktop.
Renders graphical progression charts for typing history.
Supports direct Pygame surface rendering that scales smoothly with window resizing.
"""

from typing import List, Dict, Any, Optional
import pygame
from config.constants import (
    BG_CARD, BG_PANEL, TEXT_PRIMARY, TEXT_MUTED, ACCENT_CYAN,
    COLOR_CORRECT, COLOR_ERROR, BORDER_COLOR
)
from ui.components import FontManager


class PerformanceVisualizer:
    def __init__(self):
        pass

    def render_history_chart(self, records: List[Dict[str, Any]], width: int = 800, height: int = 240) -> pygame.Surface:
        """
        Renders a WPM trend line chart directly onto a Pygame Surface.
        Zero external dependencies required - works on pure Pygame.
        """
        surface = pygame.Surface((width, height))
        surface.fill(BG_PANEL)
        pygame.draw.rect(surface, BORDER_COLOR, (0, 0, width, height), width=1, border_radius=8)

        scale = max(0.9, min(width / 1150.0, height / 240.0))
        font = FontManager.get_font(max(10, int(12 * scale)))
        title_font = FontManager.get_font(max(12, int(15 * scale)), bold=True)

        # Title
        title_surf = title_font.render("WPM PROGRESSION OVER RECENT SESSIONS", True, TEXT_PRIMARY)
        surface.blit(title_surf, (int(20 * scale), int(14 * scale)))

        if not records:
            empty_surf = font.render("No test data recorded yet. Complete a test to see your speed graph!", True, TEXT_MUTED)
            surface.blit(empty_surf, empty_surf.get_rect(center=(width // 2, height // 2)))
            return surface

        # Use the last 15 records
        data_points = records[-15:]
        wpms = [float(r.get("net_wpm", 0.0)) for r in data_points]
        max_wpm = max(max(wpms), 60.0)

        # Chart area margins
        pad_left = int(60 * scale)
        pad_right = int(40 * scale)
        pad_top = int(50 * scale)
        pad_bottom = int(40 * scale)

        chart_w = width - pad_left - pad_right
        chart_h = height - pad_top - pad_bottom

        if chart_w <= 10 or chart_h <= 10:
            return surface

        # Draw grid lines & Y-axis labels
        grid_steps = 4
        for i in range(grid_steps + 1):
            y_val = int(max_wpm * (i / grid_steps))
            y_pos = int(pad_top + chart_h - (i / grid_steps) * chart_h)

            # Horizontal grid line
            pygame.draw.line(surface, BG_CARD, (pad_left, y_pos), (pad_left + chart_w, y_pos), 1)

            # Y-axis label
            lbl = font.render(f"{y_val}", True, TEXT_MUTED)
            surface.blit(lbl, (pad_left - lbl.get_width() - 8, y_pos - lbl.get_height() // 2))

        # Calculate points
        n = len(wpms)
        points = []
        for idx, wpm in enumerate(wpms):
            x = pad_left + (int(idx * (chart_w / (n - 1))) if n > 1 else chart_w // 2)
            y = int(pad_top + chart_h - (wpm / max_wpm) * chart_h)
            points.append((x, y))

        # Draw connecting lines
        line_w = max(2, int(3 * scale))
        if len(points) > 1:
            pygame.draw.lines(surface, ACCENT_CYAN, False, points, line_w)

        # Draw data point circles and values
        dot_r = max(3, int(5 * scale))
        for idx, (px, py) in enumerate(points):
            pygame.draw.circle(surface, BG_PANEL, (px, py), dot_r + 2)
            pygame.draw.circle(surface, ACCENT_CYAN, (px, py), dot_r)

            # Value label above point
            val_txt = f"{int(wpms[idx])}"
            val_surf = font.render(val_txt, True, TEXT_PRIMARY)
            surface.blit(val_surf, (px - val_surf.get_width() // 2, py - int(18 * scale)))

            # X-axis session label
            sess_lbl = font.render(f"#{idx + 1}", True, TEXT_MUTED)
            surface.blit(sess_lbl, (px - sess_lbl.get_width() // 2, pad_top + chart_h + 8))

        return surface
