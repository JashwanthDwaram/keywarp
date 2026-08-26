"""
History & Leaderboard Screen.
Displays table of top personal records and recent session logs.
"""

from typing import Tuple, Callable, Dict, Any, List
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_PANEL_ALT, BG_CARD, BORDER_SUBTLE, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_INDIGO, ACCENT_SKY,
    SUCCESS, WARNING, ERROR
)
from core.session_logger import SessionLogger
from ui.components import Button, Card, Badge, FontManager


class HistoryScreen:
    def __init__(
        self,
        session_logger: SessionLogger,
        on_menu: Callable[[], None],
        on_analytics: Callable[[], None]
    ):
        self.logger = session_logger
        self.on_menu = on_menu
        self.on_analytics = on_analytics

        self.current_tab = "leaderboard"  # "leaderboard" or "recent"
        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_menu = Button((40, 24, 110, 36), "← Menu", variant="ghost", font_size=13)
        self.btn_analytics = Button((160, 24, 130, 36), "📊 View Charts", variant="secondary", font_size=13)

        self.btn_tab_leaderboard = Button((380, 85, 170, 40), "🏆 Leaderboard", variant="primary", font_size=14)
        self.btn_tab_recent = Button((560, 85, 170, 40), "🕒 Recent History", variant="secondary", font_size=14)

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = event.pos
            if self.btn_menu.rect.collidepoint(mouse_pos):
                self.on_menu()
            elif self.btn_analytics.rect.collidepoint(mouse_pos):
                self.on_analytics()
            elif self.btn_tab_leaderboard.rect.collidepoint(mouse_pos):
                self.current_tab = "leaderboard"
                self.btn_tab_leaderboard.variant = "primary"
                self.btn_tab_recent.variant = "secondary"
            elif self.btn_tab_recent.rect.collidepoint(mouse_pos):
                self.current_tab = "recent"
                self.btn_tab_leaderboard.variant = "secondary"
                self.btn_tab_recent.variant = "primary"

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.on_menu()

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.btn_menu.update(mouse_pos)
        self.btn_analytics.update(mouse_pos)
        self.btn_tab_leaderboard.update(mouse_pos)
        self.btn_tab_recent.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(BG_MAIN)

        self.btn_menu.draw(surface)
        self.btn_analytics.draw(surface)

        # Header Title
        title_font = FontManager.get_font(28, bold=True)
        title_surf = title_font.render("Session History & Leaderboard", True, TEXT_PRIMARY)
        surface.blit(title_surf, (surface.get_width() // 2 - title_surf.get_width() // 2, 28))

        # Tabs
        self.btn_tab_leaderboard.draw(surface)
        self.btn_tab_recent.draw(surface)

        # Data Container Card
        table_x = 50
        table_y = 145
        table_w = surface.get_width() - 100
        table_h = 520
        Card.draw(surface, (table_x, table_y, table_w, table_h), bg_color=BG_CARD, border_color=BORDER_SUBTLE, border_radius=12)

        # Fetch Data
        if self.current_tab == "leaderboard":
            records = self.logger.get_leaderboard(limit=10)
        else:
            records = self.logger.get_recent_sessions(limit=10)

        # Draw Table Headers
        headers = [
            ("#", 45),
            ("DATE & TIME", 160),
            ("MODE", 110),
            ("DIFFICULTY", 120),
            ("NET WPM", 110),
            ("ACCURACY", 100),
            ("TIME", 90),
            ("ERRORS", 80),
        ]
        
        hx = table_x + 24
        hy = table_y + 16
        h_font = FontManager.get_font(12, bold=True)
        
        # Table Header Background Bar
        pygame.draw.rect(surface, BG_PANEL_ALT, (table_x + 8, hy - 6, table_w - 16, 32), border_radius=6)
        
        for name, width in headers:
            h_surf = h_font.render(name, True, TEXT_MUTED)
            surface.blit(h_surf, (hx, hy))
            hx += width

        # Render Rows
        if not records:
            empty_font = FontManager.get_font(16, bold=False)
            empty_surf = empty_font.render("No session history recorded yet. Complete a test to see your rankings!", True, TEXT_MUTED)
            surface.blit(empty_surf, empty_surf.get_rect(center=(surface.get_width() // 2, table_y + 200)))
            return

        row_y = table_y + 52
        row_height = 42
        r_font = FontManager.get_font(13, bold=False)
        r_bold = FontManager.get_font(13, bold=True)

        for i, row in enumerate(records):
            rx = table_x + 24
            
            # Row alternating background
            if i % 2 == 0:
                pygame.draw.rect(surface, (24, 33, 47), (table_x + 8, row_y - 4, table_w - 16, row_height - 2), border_radius=6)

            # Rank / Number
            rank_str = f"#{i + 1}"
            rank_color = (250, 204, 21) if i == 0 else ((203, 213, 225) if i == 1 else ((217, 119, 6) if i == 2 else TEXT_MUTED))
            surface.blit(r_bold.render(rank_str, True, rank_color), (rx, row_y + 6))
            rx += 45

            # Date
            date_str = str(row.get("timestamp_str", ""))
            surface.blit(r_font.render(date_str, True, TEXT_PRIMARY), (rx, row_y + 6))
            rx += 160

            # Mode
            mode_str = str(row.get("mode", "Passage"))
            surface.blit(r_font.render(mode_str, True, ACCENT_SKY), (rx, row_y + 6))
            rx += 110

            # Difficulty
            diff_str = str(row.get("difficulty", "Medium"))
            surface.blit(r_font.render(diff_str, True, TEXT_SECONDARY), (rx, row_y + 6))
            rx += 120

            # Net WPM
            wpm_val = float(row.get("net_wpm", 0.0))
            surface.blit(r_bold.render(f"{wpm_val:.1f} WPM", True, SUCCESS if wpm_val >= 60 else ACCENT_INDIGO), (rx, row_y + 6))
            rx += 110

            # Accuracy
            acc_val = float(row.get("accuracy", 0.0))
            surface.blit(r_font.render(f"{acc_val:.1f}%", True, SUCCESS if acc_val >= 95 else WARNING), (rx, row_y + 6))
            rx += 100

            # Time
            time_val = float(row.get("time_seconds", 0.0))
            surface.blit(r_font.render(f"{time_val:.1f}s", True, TEXT_MUTED), (rx, row_y + 6))
            rx += 90

            # Errors
            err_val = int(row.get("total_errors", 0))
            surface.blit(r_font.render(str(err_val), True, ERROR if err_val > 0 else TEXT_MUTED), (rx, row_y + 6))

            row_y += row_height
