"""
Results Screen for KeyWarp Desktop.
Displays detailed post-test scorecards, performance grades,
mistyped keys analysis, and Tkinter file export.
Dynamically scales and centers all UI components with window resizing.
"""

from typing import Tuple, Callable, Dict, Any
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BORDER_COLOR,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_CYAN, ACCENT_PURPLE,
    COLOR_CORRECT, COLOR_ERROR
)
from ui.components import Button, MetricCard, Badge, FontManager


class ResultsScreen:
    def __init__(
        self,
        summary_data: Dict[str, Any],
        on_retry: Callable[[], None],
        on_new_test: Callable[[], None],
        on_export: Callable[[], None],
        on_menu: Callable[[], None]
    ):
        self.data = summary_data
        self.on_retry = on_retry
        self.on_new_test = on_new_test
        self.on_export = on_export
        self.on_menu = on_menu

        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_retry = Button((0, 0, 0, 0), "Retry", variant="secondary", font_size=15)
        self.btn_new = Button((0, 0, 0, 0), "Next Test", variant="primary", font_size=15)
        self.btn_export = Button((0, 0, 0, 0), "Export (Tkinter)", variant="secondary", font_size=15)
        self.btn_menu = Button((0, 0, 0, 0), "Menu", variant="ghost", font_size=15)

    def _get_scale(self, width: int, height: int) -> float:
        return max(0.9, min(width / 1150.0, height / 750.0))

    def _update_layout(self, width: int, height: int) -> None:
        scale = self._get_scale(width, height)
        btn_y = min(height - int(90 * scale), int(height * 0.84))
        b_w1 = int(150 * scale)
        b_w2 = int(160 * scale)
        b_w3 = int(180 * scale)
        b_w4 = int(140 * scale)
        gap = int(16 * scale)
        total_w = b_w1 + b_w2 + b_w3 + b_w4 + 3 * gap
        start_x = (width - total_w) // 2

        btn_h = int(48 * scale)
        f_size = max(12, int(15 * scale))

        self.btn_retry.rect = pygame.Rect(start_x, btn_y, b_w1, btn_h)
        self.btn_retry.font_size = f_size

        self.btn_new.rect = pygame.Rect(start_x + b_w1 + gap, btn_y, b_w2, btn_h)
        self.btn_new.font_size = f_size

        self.btn_export.rect = pygame.Rect(start_x + b_w1 + b_w2 + 2 * gap, btn_y, b_w3, btn_h)
        self.btn_export.font_size = f_size

        self.btn_menu.rect = pygame.Rect(start_x + b_w1 + b_w2 + b_w3 + 3 * gap, btn_y, b_w4, btn_h)
        self.btn_menu.font_size = f_size

    def _get_grade(self, net_wpm: float, acc: float) -> Tuple[str, Tuple[int, int, int]]:
        if net_wpm >= 80 and acc >= 95:
            return "EXPERT TYPIST (Top 5%)", ACCENT_PURPLE
        elif net_wpm >= 60 and acc >= 90:
            return "PROFICIENT (Top 20%)", COLOR_CORRECT
        elif net_wpm >= 40:
            return "INTERMEDIATE", ACCENT_CYAN
        elif net_wpm >= 25:
            return "DEVELOPING", (251, 191, 36)
        else:
            return "PRACTICE MAKES PERFECT", TEXT_MUTED

    def handle_event(self, event: pygame.event.Event) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())

        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = event.pos
            if self.btn_retry.rect.collidepoint(mouse_pos):
                self.on_retry()
            elif self.btn_new.rect.collidepoint(mouse_pos):
                self.on_new_test()
            elif self.btn_export.rect.collidepoint(mouse_pos):
                self.on_export()
            elif self.btn_menu.rect.collidepoint(mouse_pos):
                self.on_menu()

        elif event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                self.on_new_test()
            elif event.key == pygame.K_r:
                self.on_retry()
            elif event.key == pygame.K_ESCAPE:
                self.on_menu()

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())
        self.btn_retry.update(mouse_pos)
        self.btn_new.update(mouse_pos)
        self.btn_export.update(mouse_pos)
        self.btn_menu.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        width = surface.get_width()
        height = surface.get_height()
        scale = self._get_scale(width, height)
        self._update_layout(width, height)

        surface.fill(BG_MAIN)
        cx = width // 2

        net_wpm = self.data.get("net_wpm", 0.0)
        gross_wpm = self.data.get("gross_wpm", 0.0)
        accuracy = self.data.get("accuracy", 0.0)
        time_sec = self.data.get("time_seconds", 0.0)
        errors = self.data.get("total_errors", 0)
        chars = self.data.get("characters_typed", 0)
        mistyped_str = self.data.get("mistyped_keys", "None")

        # Header Title
        title_font = FontManager.get_font(max(24, int(34 * scale)), bold=True)
        title_surf = title_font.render("Test Results Completed!", True, TEXT_PRIMARY)
        title_y = int(height * 0.04)
        surface.blit(title_surf, (cx - title_surf.get_width() // 2, title_y))

        # Grade Badge
        grade_text, grade_color = self._get_grade(net_wpm, accuracy)
        badge_y = title_y + title_surf.get_height() + int(8 * scale)
        Badge.draw(surface, cx - int(100 * scale), badge_y, grade_text, bg_color=grade_color, font_size=max(11, int(13 * scale)), scale=scale)

        # 6 KPI Metric Cards Grid (2 rows of 3, scaled & centered)
        card_w = int(280 * scale)
        card_h = int(88 * scale)
        gap = int(20 * scale)
        total_w = 3 * card_w + 2 * gap
        start_x = (width - total_w) // 2

        row1_y = int(height * 0.17)
        row2_y = row1_y + card_h + int(14 * scale)

        # Row 1
        MetricCard.draw(surface, (start_x, row1_y, card_w, card_h), "Net Speed", f"{net_wpm} WPM", "Net words per minute", ACCENT_CYAN, scale=scale)
        MetricCard.draw(surface, (start_x + (card_w + gap), row1_y, card_w, card_h), "Accuracy", f"{accuracy}%", "Keystroke accuracy", COLOR_CORRECT if accuracy >= 95 else (251, 191, 36), scale=scale)
        MetricCard.draw(surface, (start_x + 2 * (card_w + gap), row1_y, card_w, card_h), "Gross Speed", f"{gross_wpm} WPM", "Raw unadjusted speed", ACCENT_PURPLE, scale=scale)

        # Row 2
        MetricCard.draw(surface, (start_x, row2_y, card_w, card_h), "Duration", f"{time_sec:.1f}s", "Total time spent", TEXT_MUTED, scale=scale)
        MetricCard.draw(surface, (start_x + (card_w + gap), row2_y, card_w, card_h), "Mistakes", f"{errors}", "Uncorrected errors", COLOR_ERROR if errors > 0 else COLOR_CORRECT, scale=scale)
        MetricCard.draw(surface, (start_x + 2 * (card_w + gap), row2_y, card_w, card_h), "Characters", f"{chars}", f"~{chars // 5} standard words", ACCENT_CYAN, scale=scale)

        # Mistyped Keys Breakdown Card (Scaled & Centered)
        box_y = row2_y + card_h + int(18 * scale)
        box_w = total_w
        box_h = int(160 * scale)
        pygame.draw.rect(surface, BG_CARD, (start_x, box_y, box_w, box_h), border_radius=max(8, int(12 * scale)))
        pygame.draw.rect(surface, BORDER_COLOR, (start_x, box_y, box_w, box_h), width=1, border_radius=max(8, int(12 * scale)))

        lbl_font = FontManager.get_font(max(11, int(13 * scale)), bold=True)
        lbl_surf = lbl_font.render("MISTYPED CHARACTERS BREAKDOWN", True, TEXT_MUTED)
        surface.blit(lbl_surf, (start_x + int(24 * scale), box_y + int(14 * scale)))

        if mistyped_str == "None" or not mistyped_str.strip():
            msg_font = FontManager.get_font(max(13, int(15 * scale)), bold=False)
            msg_surf = msg_font.render("Flawless run! Zero mistyped keys recorded in this session.", True, COLOR_CORRECT)
            surface.blit(msg_surf, (start_x + int(24 * scale), box_y + int(60 * scale)))
        else:
            def decode_key(raw_k: str) -> str:
                raw_k = raw_k.strip()
                if raw_k in ("[space]", " "):
                    return "Space"
                elif raw_k in ("[enter]", "\n"):
                    return "Enter"
                elif raw_k in ("[tab]", "\t"):
                    return "Tab"
                elif raw_k in ("[colon]", ":", ""):
                    return "Colon ':'"
                elif raw_k in ("[semicolon]", ";"):
                    return "Semicolon ';'"
                return f"'{raw_k}'"

            pairs = [p.strip() for p in mistyped_str.split(";") if p.strip()]
            item_x = start_x + int(24 * scale)
            pill_w = int(120 * scale)
            pill_h = int(46 * scale)
            rendered_count = 0

            for p in pairs:
                if ":" in p and rendered_count < 5:
                    try:
                        k, count = p.rsplit(":", 1)
                        disp_k = decode_key(k)
                    except Exception:
                        continue

                    pill_rect = pygame.Rect(item_x, box_y + int(48 * scale), pill_w, pill_h)
                    pygame.draw.rect(surface, (45, 20, 25), pill_rect, border_radius=max(6, int(8 * scale)))
                    pygame.draw.rect(surface, (153, 27, 27), pill_rect, width=1, border_radius=max(6, int(8 * scale)))

                    k_font = FontManager.get_font(max(12, int(15 * scale)), bold=True, mono=True)
                    k_surf = k_font.render(disp_k, True, (252, 165, 165))
                    c_font = FontManager.get_font(max(10, int(12 * scale)), bold=False)
                    c_surf = c_font.render(f"{count}x missed", True, TEXT_MUTED)

                    surface.blit(k_surf, (item_x + int(12 * scale), box_y + int(52 * scale)))
                    surface.blit(c_surf, (item_x + int(12 * scale), box_y + int(72 * scale)))
                    item_x += pill_w + int(14 * scale)
                    rendered_count += 1

            rec_font = FontManager.get_font(max(10, int(12 * scale)), bold=False)
            rec_surf = rec_font.render("Tip: Regular practice on missed keys builds tactile memory and eliminates bottlenecks.", True, TEXT_DIM)
            surface.blit(rec_surf, (start_x + int(24 * scale), box_y + box_h - int(24 * scale)))

        # Action Buttons
        self.btn_retry.draw(surface)
        self.btn_new.draw(surface)
        self.btn_export.draw(surface)
        self.btn_menu.draw(surface)

        # Footer Hint
        hint_font = FontManager.get_font(max(10, int(12 * scale)), bold=False)
        hint_surf = hint_font.render("Press Enter / Space for Next Test • R to Retry • Esc for Menu", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(cx, height - int(20 * scale))))
