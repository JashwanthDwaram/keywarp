"""
History & Analytics Screen for KeyWarp Desktop.
Renders past session logs in a clean table and plots WPM progression.
Provides Tkinter export and history clearing functionality.
Dynamically scales and centers all UI components with window resizing.
"""

from typing import Tuple, Callable, Dict, Any, List
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BORDER_COLOR,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_CYAN,
    COLOR_CORRECT, COLOR_ERROR
)
from ui.components import Button, Badge, FontManager
from analytics.visualizer import PerformanceVisualizer


class HistoryScreen:
    def __init__(
        self,
        session_logger,
        on_menu: Callable[[], None],
        on_export: Callable[[], None],
        on_clear: Callable[[], None]
    ):
        self.logger = session_logger
        self.on_menu = on_menu
        self.on_export = on_export
        self.on_clear = on_clear
        self.visualizer = PerformanceVisualizer()

        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_menu = Button((0, 0, 0, 0), "Menu", variant="ghost", font_size=13)
        self.btn_export = Button((0, 0, 0, 0), "Export CSV (Tkinter)", variant="secondary", font_size=13)
        self.btn_clear = Button((0, 0, 0, 0), "Clear History", variant="secondary", font_size=13)

    def _get_scale(self, width: int, height: int) -> float:
        return max(0.9, min(width / 1150.0, height / 750.0))

    def _update_layout(self, width: int, height: int) -> None:
        scale = self._get_scale(width, height)
        btn_h = int(36 * scale)
        menu_w = int(105 * scale)
        clear_w = int(130 * scale)
        export_w = int(175 * scale)
        f_size = max(11, int(13 * scale))

        self.btn_menu.rect = pygame.Rect(int(40 * scale), int(22 * scale), menu_w, btn_h)
        self.btn_menu.font_size = f_size

        self.btn_clear.rect = pygame.Rect(width - clear_w - int(30 * scale), int(22 * scale), clear_w, btn_h)
        self.btn_clear.font_size = f_size

        self.btn_export.rect = pygame.Rect(width - clear_w - export_w - int(45 * scale), int(22 * scale), export_w, btn_h)
        self.btn_export.font_size = f_size

    def handle_event(self, event: pygame.event.Event) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())

        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.btn_menu.rect.collidepoint(event.pos):
                self.on_menu()
            elif self.btn_export.rect.collidepoint(event.pos):
                self.on_export()
            elif self.btn_clear.rect.collidepoint(event.pos):
                self.on_clear()
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            self.on_menu()

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())
        self.btn_menu.update(mouse_pos)
        self.btn_export.update(mouse_pos)
        self.btn_clear.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        width = surface.get_width()
        height = surface.get_height()
        scale = self._get_scale(width, height)
        self._update_layout(width, height)

        surface.fill(BG_MAIN)
        cx = width // 2

        # Header Buttons
        self.btn_menu.draw(surface)
        self.btn_export.draw(surface)
        self.btn_clear.draw(surface)

        # Title
        title_font = FontManager.get_font(max(20, int(28 * scale)), bold=True)
        title_surf = title_font.render("Session History & Progression", True, TEXT_PRIMARY)
        surface.blit(title_surf, (cx - title_surf.get_width() // 2, int(22 * scale)))

        records: List[Dict[str, Any]] = self.logger.get_history()

        # Layout widths (centered)
        content_w = min(1200, width - int(80 * scale))
        content_x = (width - content_w) // 2

        # 1. Progression Chart (Scaled)
        chart_h = int(220 * scale)
        chart_surf = self.visualizer.render_history_chart(records, width=content_w, height=chart_h)
        chart_y = int(72 * scale)
        surface.blit(chart_surf, (content_x, chart_y))

        # 2. History Table (Expands to bottom)
        table_y = chart_y + chart_h + int(18 * scale)
        table_w = content_w
        table_h = max(260, height - table_y - int(45 * scale))
        pygame.draw.rect(surface, BG_CARD, (content_x, table_y, table_w, table_h), border_radius=max(6, int(10 * scale)))
        pygame.draw.rect(surface, BORDER_COLOR, (content_x, table_y, table_w, table_h), width=1, border_radius=max(6, int(10 * scale)))

        # Table Headers
        hdr_font = FontManager.get_font(max(10, int(12 * scale)), bold=True)
        step = content_w // 6
        headers = [
            ("DATE & TIME", content_x + 20),
            ("MODE", content_x + int(step * 1.8)),
            ("DIFFICULTY", content_x + int(step * 2.8)),
            ("NET WPM", content_x + int(step * 3.8)),
            ("ACCURACY", content_x + int(step * 4.7)),
            ("TIME", content_x + int(step * 5.4))
        ]
        for title, x_pos in headers:
            h_surf = hdr_font.render(title, True, TEXT_MUTED)
            surface.blit(h_surf, (x_pos, table_y + int(14 * scale)))

        pygame.draw.line(surface, BORDER_COLOR, (content_x, table_y + int(36 * scale)), (content_x + table_w, table_y + int(36 * scale)), 1)

        # Table Rows (show recent records, scaling row heights)
        row_font = FontManager.get_font(max(11, int(13 * scale)), bold=False)
        mono_font = FontManager.get_font(max(11, int(13 * scale)), bold=True, mono=True)
        row_height = max(28, int(36 * scale))

        if not records:
            empty_msg = row_font.render("No test records found. Take a test to start tracking your history!", True, TEXT_DIM)
            surface.blit(empty_msg, empty_msg.get_rect(center=(cx, table_y + table_h // 2)))
        else:
            max_rows = max(3, (table_h - int(45 * scale)) // row_height)
            display_records = list(reversed(records))[:max_rows]
            row_y = table_y + int(44 * scale)
            for idx, r in enumerate(display_records):
                if idx % 2 == 1:
                    pygame.draw.rect(surface, (40, 52, 68), (content_x + 2, row_y - 2, table_w - 4, row_height - 2))

                date_str = str(r.get("date", "N/A"))[:16]
                mode_str = str(r.get("mode", "Passage"))
                diff_str = str(r.get("difficulty", "Medium"))
                wpm_val = f"{r.get('net_wpm', 0.0)} WPM"
                acc_val = f"{r.get('accuracy', 0.0)}%"
                time_val = f"{r.get('time_seconds', 0.0)}s"

                surface.blit(row_font.render(date_str, True, TEXT_DIM), (content_x + 20, row_y + 3))
                surface.blit(row_font.render(mode_str, True, TEXT_PRIMARY), (content_x + int(step * 1.8), row_y + 3))
                surface.blit(row_font.render(diff_str, True, ACCENT_CYAN), (content_x + int(step * 2.8), row_y + 3))
                surface.blit(mono_font.render(wpm_val, True, COLOR_CORRECT), (content_x + int(step * 3.8), row_y + 3))
                surface.blit(mono_font.render(acc_val, True, (251, 191, 36)), (content_x + int(step * 4.7), row_y + 3))
                surface.blit(row_font.render(time_val, True, TEXT_MUTED), (content_x + int(step * 5.4), row_y + 3))

                row_y += row_height

        # Footer Hint
        hint_font = FontManager.get_font(max(10, int(12 * scale)), bold=False)
        hint_surf = hint_font.render("Press Esc to Return to Menu", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(cx, height - int(16 * scale))))
