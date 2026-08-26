"""
Results Screen.
Displays in-depth post-test evaluation metrics, accuracy grades, mistyped keys breakdown, and navigation buttons.
"""

from typing import Tuple, Callable, Dict, Any
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BORDER_SUBTLE, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_INDIGO, ACCENT_SKY,
    SUCCESS, WARNING, ERROR
)
from ui.components import Button, Card, Badge, FontManager, MetricCard


class ResultsScreen:
    def __init__(
        self,
        summary_data: Dict[str, Any],
        on_retry: Callable[[], None],
        on_new_test: Callable[[], None],
        on_view_analytics: Callable[[], None],
        on_menu: Callable[[], None]
    ):
        self.data = summary_data
        self.on_retry = on_retry
        self.on_new_test = on_new_test
        self.on_view_analytics = on_view_analytics
        self.on_menu = on_menu

        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_retry = Button((180, 580, 170, 48), "🔁 Retry", variant="secondary", font_size=15)
        self.btn_new = Button((370, 580, 180, 48), "🚀 Next Test", variant="primary", font_size=15)
        self.btn_analytics = Button((570, 580, 180, 48), "📊 View Charts", variant="secondary", font_size=15)
        self.btn_menu = Button((770, 580, 150, 48), "🏠 Menu", variant="ghost", font_size=15)

    def _get_grade(self, net_wpm: float, acc: float) -> Tuple[str, Tuple[int, int, int]]:
        if net_wpm >= 90 and acc >= 95:
            return "GODSPEED ⚡ (Top 1%)", (168, 85, 247)
        elif net_wpm >= 70 and acc >= 93:
            return "PRO TYPIST 🌟 (Top 10%)", SUCCESS
        elif net_wpm >= 50 and acc >= 90:
            return "INTERMEDIATE 🎯", ACCENT_SKY
        elif net_wpm >= 30:
            return "DEVELOPING ⌨️", WARNING
        else:
            return "PRACTICE MAKES PERFECT 💡", TEXT_MUTED

    def handle_event(self, event: pygame.event.Event) -> None:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = event.pos
            if self.btn_retry.rect.collidepoint(mouse_pos):
                self.on_retry()
            elif self.btn_new.rect.collidepoint(mouse_pos):
                self.on_new_test()
            elif self.btn_analytics.rect.collidepoint(mouse_pos):
                self.on_view_analytics()
            elif self.btn_menu.rect.collidepoint(mouse_pos):
                self.on_menu()

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN or event.key == pygame.K_SPACE:
                self.on_new_test()
            elif event.key == pygame.K_r:
                self.on_retry()
            elif event.key == pygame.K_ESCAPE:
                self.on_menu()

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.btn_retry.update(mouse_pos)
        self.btn_new.update(mouse_pos)
        self.btn_analytics.update(mouse_pos)
        self.btn_menu.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(BG_MAIN)

        net_wpm = self.data.get("net_wpm", 0.0)
        gross_wpm = self.data.get("gross_wpm", 0.0)
        accuracy = self.data.get("accuracy", 0.0)
        time_sec = self.data.get("time_seconds", 0.0)
        errors = self.data.get("total_errors", 0)
        chars = self.data.get("characters_typed", 0)
        mistyped_str = self.data.get("mistyped_keys", "None")

        # Header Title
        title_font = FontManager.get_font(34, bold=True)
        title_surf = title_font.render("Test Results Completed!", True, TEXT_PRIMARY)
        surface.blit(title_surf, (surface.get_width() // 2 - title_surf.get_width() // 2, 40))

        # Performance Grade Badge
        grade_text, grade_color = self._get_grade(net_wpm, accuracy)
        badge_w = Badge.draw(surface, surface.get_width() // 2 - 110, 95, grade_text, bg_color=grade_color, font_size=13)

        # Primary 6-Metric Cards Grid (2 rows of 3)
        row1_y = 150
        row2_y = 260
        card_w = 260
        card_h = 95
        gap = 25
        start_x = (surface.get_width() - (3 * card_w + 2 * gap)) // 2

        # Row 1
        MetricCard((start_x, row1_y, card_w, card_h), "Net Speed", f"{net_wpm} WPM", "Standard typing score", ACCENT_INDIGO).draw(surface)
        MetricCard((start_x + (card_w + gap), row1_y, card_w, card_h), "Accuracy", f"{accuracy}%", "Keystroke accuracy", SUCCESS if accuracy >= 95 else WARNING).draw(surface)
        MetricCard((start_x + 2 * (card_w + gap), row1_y, card_w, card_h), "Gross Speed", f"{gross_wpm} WPM", "Raw unadjusted speed", ACCENT_SKY).draw(surface)

        # Row 2
        MetricCard((start_x, row2_y, card_w, card_h), "Duration", f"{time_sec:.1f}s", "Total time spent", TEXT_MUTED).draw(surface)
        MetricCard((start_x + (card_w + gap), row2_y, card_w, card_h), "Mistakes", f"{errors}", "Uncorrected errors", ERROR if errors > 0 else SUCCESS).draw(surface)
        MetricCard((start_x + 2 * (card_w + gap), row2_y, card_w, card_h), "Characters", f"{chars}", f"~{chars // 5} words typed", ACCENT_SKY).draw(surface)

        # Mistyped Keys Analysis Card
        weak_y = 385
        weak_w = 3 * card_w + 2 * gap
        weak_h = 150
        Card.draw(surface, (start_x, weak_y, weak_w, weak_h), bg_color=BG_CARD, border_color=BORDER_SUBTLE, border_radius=12)

        lbl_font = FontManager.get_font(13, bold=True)
        lbl_surf = lbl_font.render("🎯 MISTYPED CHARACTERS BREAKDOWN", True, TEXT_MUTED)
        surface.blit(lbl_surf, (start_x + 20, weak_y + 16))

        if mistyped_str == "None" or not mistyped_str.strip():
            msg_font = FontManager.get_font(15, bold=False)
            msg_surf = msg_font.render("Flawless run! Zero mistyped keys recorded in this session. 🔥", True, SUCCESS)
            surface.blit(msg_surf, (start_x + 20, weak_y + 60))
        else:
            pairs = mistyped_str.split(";")
            item_x = start_x + 20
            for p in pairs[:6]:
                if ":" in p:
                    k, count = p.split(":")
                    pill_w = 110
                    pill_rect = pygame.Rect(item_x, weak_y + 55, pill_w, 42)
                    pygame.draw.rect(surface, (45, 20, 25), pill_rect, border_radius=8)
                    pygame.draw.rect(surface, (153, 27, 27), pill_rect, width=1, border_radius=8)

                    k_font = FontManager.get_font(14, bold=True, mono=True)
                    k_surf = k_font.render(f"'{k}'", True, (252, 165, 165))
                    c_font = FontManager.get_font(12, bold=False)
                    c_surf = c_font.render(f"{count}x miss", True, TEXT_MUTED)

                    surface.blit(k_surf, (item_x + 12, weak_y + 60))
                    surface.blit(c_surf, (item_x + 12, weak_y + 78))
                    item_x += pill_w + 14

            rec_font = FontManager.get_font(12, bold=False)
            rec_surf = rec_font.render("💡 Tip: Focus on finger placement for frequently missed keys to build muscle memory.", True, TEXT_DIM)
            surface.blit(rec_surf, (start_x + 20, weak_y + 115))

        # Action Buttons
        self.btn_retry.draw(surface)
        self.btn_new.draw(surface)
        self.btn_analytics.draw(surface)
        self.btn_menu.draw(surface)

        # Footer Hint
        hint_font = FontManager.get_font(12, bold=False)
        hint_surf = hint_font.render("Press Enter / Space for Next Test • R to Retry • Esc for Menu", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(surface.get_width() // 2, 665)))
