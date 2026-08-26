"""
Analytics Screen.
Integrates Matplotlib charts directly onto Pygame canvas with stats overview and export capabilities.
"""

from typing import Tuple, Callable, Dict, Any, Optional
import time
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BORDER_SUBTLE, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_INDIGO, ACCENT_SKY,
    SUCCESS, WARNING, ERROR
)
from core.session_logger import SessionLogger
from analytics.data_analyzer import DataAnalyzer
from analytics.visualizer import PerformanceVisualizer
from ui.components import Button, Card, Badge, FontManager, MetricCard


class AnalyticsScreen:
    def __init__(
        self,
        session_logger: SessionLogger,
        analyzer: DataAnalyzer,
        visualizer: PerformanceVisualizer,
        on_menu: Callable[[], None]
    ):
        self.logger = session_logger
        self.analyzer = analyzer
        self.visualizer = visualizer
        self.on_menu = on_menu

        self.chart_surface: Optional[pygame.Surface] = None
        self.export_toast_msg = ""
        self.export_toast_time = 0.0

        self._init_buttons()
        self.refresh_data()

    def _init_buttons(self) -> None:
        self.btn_menu = Button((40, 24, 110, 36), "← Menu", variant="ghost", font_size=13)
        self.btn_export = Button((900, 24, 160, 36), "📸 Export PNG", variant="primary", font_size=13)

    def refresh_data(self) -> None:
        """Regenerates Matplotlib surface from current CSV data."""
        df = self.logger.load_dataframe()
        self.chart_surface = self.visualizer.render_to_pygame_surface(df, width=1020, height=480)

    def _export_report(self) -> None:
        df = self.logger.load_dataframe()
        out_path = self.visualizer.save_report_image(df, "data/analytics_report.png")
        self.export_toast_msg = f"Saved report to {out_path}!"
        self.export_toast_time = time.time()

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = event.pos
            if self.btn_menu.rect.collidepoint(mouse_pos):
                self.on_menu()
            elif self.btn_export.rect.collidepoint(mouse_pos):
                self._export_report()

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.on_menu()

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.btn_menu.update(mouse_pos)
        self.btn_export.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(BG_MAIN)

        self.btn_menu.draw(surface)
        self.btn_export.draw(surface)

        # Header Title
        title_font = FontManager.get_font(28, bold=True)
        title_surf = title_font.render("Performance Analytics Dashboard", True, TEXT_PRIMARY)
        surface.blit(title_surf, (surface.get_width() // 2 - title_surf.get_width() // 2, 26))

        # Top 4 Metric Cards Banner
        stats = self.analyzer.get_stats_summary()
        card_y = 75
        card_w = 235
        gap = 20
        start_x = (surface.get_width() - (4 * card_w + 3 * gap)) // 2

        MetricCard((start_x, card_y, card_w, 75), "Total Sessions", str(stats.get("total_sessions", 0)), f"{stats.get('total_words_typed', 0)} total words", ACCENT_INDIGO).draw(surface)
        MetricCard((start_x + (card_w + gap), card_y, card_w, 75), "Personal Record", f"{stats.get('best_net_wpm', 0.0)} WPM", "Highest net speed", SUCCESS).draw(surface)
        MetricCard((start_x + 2 * (card_w + gap), card_y, card_w, 75), "Average Speed", f"{stats.get('avg_net_wpm', 0.0)} WPM", f"{stats.get('avg_accuracy', 0.0)}% accuracy", ACCENT_SKY).draw(surface)
        
        imp = stats.get("improvement_wpm", 0.0)
        imp_str = f"+{imp} WPM" if imp >= 0 else f"{imp} WPM"
        MetricCard((start_x + 3 * (card_w + gap), card_y, card_w, 75), "Progress Delta", imp_str, "Recent 3 vs First 3", SUCCESS if imp >= 0 else ERROR).draw(surface)

        # Draw Matplotlib Embedded Chart Surface
        if self.chart_surface:
            chart_x = (surface.get_width() - self.chart_surface.get_width()) // 2
            chart_y = 168
            surface.blit(self.chart_surface, (chart_x, chart_y))

        # Toast Message for Export
        if self.export_toast_msg and time.time() - self.export_toast_time < 4.0:
            toast_w = 340
            toast_h = 40
            toast_rect = pygame.Rect(surface.get_width() // 2 - toast_w // 2, surface.get_height() - 55, toast_w, toast_h)
            pygame.draw.rect(surface, (16, 185, 129), toast_rect, border_radius=8)
            t_font = FontManager.get_font(13, bold=True)
            t_surf = t_font.render(self.export_toast_msg, True, (255, 255, 255))
            surface.blit(t_surf, t_surf.get_rect(center=toast_rect.center))
