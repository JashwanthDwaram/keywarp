"""
Main Menu Screen.
Allows mode selection, difficulty level picking, and navigating to typing, analytics, or leaderboard.
"""

from typing import Tuple, Callable, Dict, Any
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BORDER_SUBTLE, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_INDIGO, ACCENT_SKY,
    DIFF_EASY, DIFF_MEDIUM, DIFF_HARD, DIFF_CODE, DIFF_QUOTES,
    SUCCESS, WARNING, ERROR
)
from ui.components import Button, Card, Badge, FontManager, MetricCard


class MenuScreen:
    def __init__(
        self,
        on_start_test: Callable[[str, str], None],
        on_open_analytics: Callable[[], None],
        on_open_history: Callable[[], None],
        on_toggle_sound: Callable[[], bool],
        get_summary_stats: Callable[[], Dict[str, Any]],
        sound_enabled: bool = True
    ):
        self.on_start_test = on_start_test
        self.on_open_analytics = on_open_analytics
        self.on_open_history = on_open_history
        self.on_toggle_sound = on_toggle_sound
        self.get_summary_stats = get_summary_stats
        self.sound_enabled = sound_enabled

        self.selected_mode = "Passage"  # "Passage" or "Sprint"
        self.selected_diff = DIFF_MEDIUM

        self.modes = ["Passage", "Sprint"]
        self.difficulties = [DIFF_EASY, DIFF_MEDIUM, DIFF_HARD, DIFF_QUOTES, DIFF_CODE]

        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_start = Button((430, 520, 240, 52), "START TEST 🚀", variant="primary", font_size=18)
        self.btn_analytics = Button((330, 600, 200, 42), "📊 Analytics", variant="secondary", font_size=14)
        self.btn_history = Button((570, 600, 200, 42), "🏆 Leaderboard", variant="secondary", font_size=14)
        self.btn_sound = Button((960, 24, 110, 36), "🔊 Sound" if self.sound_enabled else "🔇 Muted", variant="ghost", font_size=12)

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = event.pos

            # Check mode buttons
            for i, mode in enumerate(self.modes):
                btn_rect = pygame.Rect(380 + i * 180, 250, 160, 45)
                if btn_rect.collidepoint(mouse_pos):
                    self.selected_mode = mode

            # Check difficulty buttons (if in Passage mode)
            if self.selected_mode == "Passage":
                for i, diff in enumerate(self.difficulties):
                    btn_rect = pygame.Rect(230 + i * 130, 375, 115, 42)
                    if btn_rect.collidepoint(mouse_pos):
                        self.selected_diff = diff

            # Actions
            if self.btn_start.rect.collidepoint(mouse_pos):
                self.on_start_test(self.selected_mode, self.selected_diff)
            elif self.btn_analytics.rect.collidepoint(mouse_pos):
                self.on_open_analytics()
            elif self.btn_history.rect.collidepoint(mouse_pos):
                self.on_open_history()
            elif self.btn_sound.rect.collidepoint(mouse_pos):
                self.sound_enabled = self.on_toggle_sound()
                self.btn_sound.text = "🔊 Sound" if self.sound_enabled else "🔇 Muted"

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.btn_start.update(mouse_pos)
        self.btn_analytics.update(mouse_pos)
        self.btn_history.update(mouse_pos)
        self.btn_sound.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(BG_MAIN)

        # Header Title
        title_font = FontManager.get_font(38, bold=True)
        title_surf = title_font.render("TypePulse", True, TEXT_PRIMARY)
        surface.blit(title_surf, (surface.get_width() // 2 - title_surf.get_width() // 2 - 40, 45))

        badge_font = FontManager.get_font(12, bold=True)
        Badge.draw(surface, surface.get_width() // 2 + title_surf.get_width() // 2 - 25, 52, "PRO v2.0", bg_color=ACCENT_INDIGO)

        subtitle_font = FontManager.get_font(14, bold=False)
        sub_surf = subtitle_font.render("Real-Time Typing Speed Test & Longitudinal Analytics", True, TEXT_MUTED)
        surface.blit(sub_surf, (surface.get_width() // 2 - sub_surf.get_width() // 2, 95))

        # Top Quick Stats Banner
        stats = self.get_summary_stats()
        stats_y = 135
        card_w = 175
        total_w = 4 * card_w + 3 * 16
        start_x = (surface.get_width() - total_w) // 2

        MetricCard((start_x, stats_y, card_w, 75), "Total Tests", str(stats.get("total_sessions", 0)), "Sessions logged", ACCENT_INDIGO).draw(surface)
        MetricCard((start_x + (card_w + 16), stats_y, card_w, 75), "Best Speed", f"{stats.get('best_net_wpm', 0.0)} WPM", "Personal record", SUCCESS).draw(surface)
        MetricCard((start_x + 2 * (card_w + 16), stats_y, card_w, 75), "Avg Speed", f"{stats.get('avg_net_wpm', 0.0)} WPM", "Overall average", ACCENT_SKY).draw(surface)
        MetricCard((start_x + 3 * (card_w + 16), stats_y, card_w, 75), "Avg Accuracy", f"{stats.get('avg_accuracy', 0.0)}%", "Precision score", WARNING).draw(surface)

        # Mode Selection Header
        mode_lbl = FontManager.get_font(13, bold=True).render("SELECT TEST MODE", True, TEXT_MUTED)
        surface.blit(mode_lbl, (surface.get_width() // 2 - mode_lbl.get_width() // 2, 226))

        for i, mode in enumerate(self.modes):
            rect = pygame.Rect(380 + i * 180, 250, 160, 45)
            is_active = (self.selected_mode == mode)
            bg = ACCENT_INDIGO if is_active else BG_CARD
            border = ACCENT_SKY if is_active else BORDER_SUBTLE
            pygame.draw.rect(surface, bg, rect, border_radius=8)
            pygame.draw.rect(surface, border, rect, width=1 if not is_active else 2, border_radius=8)

            txt = "📝 Passage Test" if mode == "Passage" else "⚡ 60s Sprint"
            font_btn = FontManager.get_font(14, bold=True)
            txt_surf = font_btn.render(txt, True, TEXT_PRIMARY if is_active else TEXT_MUTED)
            surface.blit(txt_surf, txt_surf.get_rect(center=rect.center))

        # Difficulty Selection Header (Only in passage mode)
        if self.selected_mode == "Passage":
            diff_lbl = FontManager.get_font(13, bold=True).render("SELECT PASSAGE CATEGORY", True, TEXT_MUTED)
            surface.blit(diff_lbl, (surface.get_width() // 2 - diff_lbl.get_width() // 2, 345))

            for i, diff in enumerate(self.difficulties):
                rect = pygame.Rect(230 + i * 130, 375, 115, 42)
                is_active = (self.selected_diff == diff)
                bg = ACCENT_INDIGO if is_active else BG_CARD
                border = ACCENT_SKY if is_active else BORDER_SUBTLE
                pygame.draw.rect(surface, bg, rect, border_radius=8)
                pygame.draw.rect(surface, border, rect, width=1 if not is_active else 2, border_radius=8)

                font_btn = FontManager.get_font(13, bold=True)
                txt_surf = font_btn.render(diff, True, TEXT_PRIMARY if is_active else TEXT_MUTED)
                surface.blit(txt_surf, txt_surf.get_rect(center=rect.center))
        else:
            sprint_info = FontManager.get_font(14, bold=False).render("Type as many words as you can in 60 seconds. Accuracy counts towards final score!", True, ACCENT_SKY)
            surface.blit(sprint_info, sprint_info.get_rect(center=(surface.get_width() // 2, 395)))

        # Draw Buttons
        self.btn_start.draw(surface)
        self.btn_analytics.draw(surface)
        self.btn_history.draw(surface)
        self.btn_sound.draw(surface)

        # Footer Hint
        hint_font = FontManager.get_font(12, bold=False)
        hint_surf = hint_font.render("Press Enter to Quick Start • Esc to Quit", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(surface.get_width() // 2, 680)))
