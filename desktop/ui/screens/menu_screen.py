"""
Main Menu Screen for KeyWarp Desktop.
Provides mode and difficulty selection, overview metrics,
and Tkinter native file picker integration to load custom practice files.
Dynamically scales and centers all UI components with window resizing.
"""

from typing import Tuple, Callable, Dict, Any, List
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BORDER_COLOR, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_CYAN, ACCENT_PURPLE,
    DIFF_EASY, DIFF_MEDIUM, DIFF_HARD, DIFF_CODE, DIFF_QUOTES,
    COLOR_CORRECT, MODE_PASSAGE, MODE_SPRINT
)
from ui.components import Button, MetricCard, Badge, FontManager


class MenuScreen:
    def __init__(
        self,
        on_start_test: Callable[[str, str, str], None],
        on_load_custom_file: Callable[[], None],
        on_open_history: Callable[[], None],
        on_toggle_sound: Callable[[], bool],
        get_summary_stats: Callable[[], Dict[str, Any]],
        sound_enabled: bool = True
    ):
        self.on_start_test = on_start_test
        self.on_load_custom_file = on_load_custom_file
        self.on_open_history = on_open_history
        self.on_toggle_sound = on_toggle_sound
        self.get_summary_stats = get_summary_stats
        self.sound_enabled = sound_enabled

        self.selected_mode = MODE_PASSAGE
        self.selected_diff = DIFF_MEDIUM

        self.modes = [MODE_PASSAGE, MODE_SPRINT]
        self.difficulties = [DIFF_EASY, DIFF_MEDIUM, DIFF_HARD, DIFF_CODE, DIFF_QUOTES]

        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_start = Button((0, 0, 0, 0), "START TEST", variant="primary", font_size=16)
        self.btn_custom_file = Button((0, 0, 0, 0), "Load Custom File (Tkinter)", variant="secondary", font_size=13)
        self.btn_history = Button((0, 0, 0, 0), "View History & Stats", variant="secondary", font_size=13)
        self.btn_sound = Button((0, 0, 0, 0), "Sound: ON" if self.sound_enabled else "Sound: OFF", variant="ghost", font_size=12)

    def _get_scale(self, width: int, height: int) -> float:
        """Computes dynamic scale factor relative to reference 1150x750 resolution."""
        return max(0.9, min(width / 1150.0, height / 750.0))

    def _update_layout(self, width: int, height: int) -> None:
        scale = self._get_scale(width, height)
        cx = width // 2

        # Sound button (top right)
        sound_w = int(115 * scale)
        sound_h = int(36 * scale)
        self.btn_sound.rect = pygame.Rect(width - sound_w - 25, 24, sound_w, sound_h)
        self.btn_sound.font_size = max(11, int(12 * scale))

        # Main Start button (centered proportionally)
        start_w = int(280 * scale)
        start_h = int(54 * scale)
        start_y = int(height * 0.65)
        self.btn_start.rect = pygame.Rect(cx - start_w // 2, start_y, start_w, start_h)
        self.btn_start.font_size = max(14, int(17 * scale))

        # Sub Action buttons (centered below)
        sub_w = int(250 * scale)
        sub_h = int(46 * scale)
        gap = int(20 * scale)
        sub_y = start_y + start_h + int(14 * scale)
        self.btn_custom_file.rect = pygame.Rect(cx - sub_w - gap // 2, sub_y, sub_w, sub_h)
        self.btn_custom_file.font_size = max(12, int(13 * scale))
        self.btn_history.rect = pygame.Rect(cx + gap // 2, sub_y, sub_w, sub_h)
        self.btn_history.font_size = max(12, int(13 * scale))

    def _get_mode_rect(self, index: int, width: int, height: int) -> pygame.Rect:
        scale = self._get_scale(width, height)
        mode_w = int(180 * scale)
        mode_h = int(46 * scale)
        gap = int(20 * scale)
        total_w = len(self.modes) * mode_w + (len(self.modes) - 1) * gap
        start_x = (width - total_w) // 2
        mode_y = int(height * 0.33)
        return pygame.Rect(start_x + index * (mode_w + gap), mode_y, mode_w, mode_h)

    def _get_diff_rect(self, index: int, width: int, height: int) -> pygame.Rect:
        scale = self._get_scale(width, height)
        diff_w = int(135 * scale)
        diff_h = int(42 * scale)
        gap = int(14 * scale)
        total_w = len(self.difficulties) * diff_w + (len(self.difficulties) - 1) * gap
        start_x = (width - total_w) // 2
        diff_y = int(height * 0.49)
        return pygame.Rect(start_x + index * (diff_w + gap), diff_y, diff_w, diff_h)

    def handle_event(self, event: pygame.event.Event) -> None:
        surface = pygame.display.get_surface()
        if not surface:
            return
        w, h = surface.get_width(), surface.get_height()
        self._update_layout(w, h)

        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            mouse_pos = event.pos

            # Check Mode Selection Buttons
            for i, mode in enumerate(self.modes):
                if self._get_mode_rect(i, w, h).collidepoint(mouse_pos):
                    self.selected_mode = mode

            # Check Difficulty Selection Buttons
            if self.selected_mode == MODE_PASSAGE:
                for i, diff in enumerate(self.difficulties):
                    if self._get_diff_rect(i, w, h).collidepoint(mouse_pos):
                        self.selected_diff = diff

            # Check Main Action Buttons
            if self.btn_start.rect.collidepoint(mouse_pos):
                self.on_start_test(self.selected_mode, self.selected_diff, "")
            elif self.btn_custom_file.rect.collidepoint(mouse_pos):
                self.on_load_custom_file()
            elif self.btn_history.rect.collidepoint(mouse_pos):
                self.on_open_history()
            elif self.btn_sound.rect.collidepoint(mouse_pos):
                self.sound_enabled = self.on_toggle_sound()
                self.btn_sound.text = "Sound: ON" if self.sound_enabled else "Sound: OFF"

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN:
                self.on_start_test(self.selected_mode, self.selected_diff, "")

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())
        self.btn_start.update(mouse_pos)
        self.btn_custom_file.update(mouse_pos)
        self.btn_history.update(mouse_pos)
        self.btn_sound.update(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        width = surface.get_width()
        height = surface.get_height()
        scale = self._get_scale(width, height)
        self._update_layout(width, height)

        surface.fill(BG_MAIN)
        cx = width // 2

        # 1. Title Header & Subtitle
        title_font = FontManager.get_font(max(26, int(38 * scale)), bold=True)
        title_surf = title_font.render("KeyWarp Desktop", True, TEXT_PRIMARY)
        title_y = int(height * 0.04)
        surface.blit(title_surf, (cx - title_surf.get_width() // 2, title_y))

        Badge.draw(
            surface,
            cx + title_surf.get_width() // 2 + int(12 * scale),
            title_y + int(8 * scale),
            "Pygame + Tkinter",
            bg_color=ACCENT_CYAN,
            font_size=max(10, int(11 * scale)),
            scale=scale
        )

        subtitle_font = FontManager.get_font(max(11, int(13 * scale)), bold=False)
        sub_surf = subtitle_font.render("Interactive Typing Speed Test • Real-Time Analytics • Native File Dialogs", True, TEXT_MUTED)
        surface.blit(sub_surf, (cx - sub_surf.get_width() // 2, title_y + title_surf.get_height() + 4))

        # 2. Overview 4 Metric Cards (Scaled & Centered)
        stats = self.get_summary_stats()
        card_w = int(230 * scale)
        card_h = int(82 * scale)
        gap = int(16 * scale)
        total_w = 4 * card_w + 3 * gap
        start_x = (width - total_w) // 2
        cards_y = int(height * 0.16)

        MetricCard.draw(surface, (start_x, cards_y, card_w, card_h), "Total Tests", str(stats.get("total_sessions", 0)), "Completed runs", ACCENT_CYAN, scale=scale)
        MetricCard.draw(surface, (start_x + (card_w + gap), cards_y, card_w, card_h), "Best Speed", f"{stats.get('best_net_wpm', 0.0)} WPM", "Personal record", COLOR_CORRECT, scale=scale)
        MetricCard.draw(surface, (start_x + 2 * (card_w + gap), cards_y, card_w, card_h), "Avg Speed", f"{stats.get('avg_net_wpm', 0.0)} WPM", "Overall average", ACCENT_PURPLE, scale=scale)
        MetricCard.draw(surface, (start_x + 3 * (card_w + gap), cards_y, card_w, card_h), "Avg Accuracy", f"{stats.get('avg_accuracy', 0.0)}%", "Keystroke accuracy", (251, 191, 36), scale=scale)

        # 3. Mode Selection Header & Buttons
        mode_lbl = FontManager.get_font(max(11, int(13 * scale)), bold=True).render("CHOOSE TEST MODE", True, TEXT_MUTED)
        mode_lbl_y = int(height * 0.29)
        surface.blit(mode_lbl, (cx - mode_lbl.get_width() // 2, mode_lbl_y))

        for i, mode in enumerate(self.modes):
            rect = self._get_mode_rect(i, width, height)
            is_active = (self.selected_mode == mode)
            bg = (37, 99, 235) if is_active else BG_CARD
            border = ACCENT_CYAN if is_active else BORDER_COLOR
            pygame.draw.rect(surface, bg, rect, border_radius=max(6, int(8 * scale)))
            pygame.draw.rect(surface, border, rect, width=2 if is_active else 1, border_radius=max(6, int(8 * scale)))

            font = FontManager.get_font(max(12, int(14 * scale)), bold=True)
            txt_surf = font.render(mode, True, TEXT_PRIMARY if is_active else TEXT_MUTED)
            surface.blit(txt_surf, txt_surf.get_rect(center=rect.center))

        # 4. Difficulty Selection Header & Buttons
        diff_lbl_y = int(height * 0.44)
        if self.selected_mode == MODE_PASSAGE:
            diff_lbl = FontManager.get_font(max(11, int(13 * scale)), bold=True).render("SELECT DIFFICULTY CATEGORY", True, TEXT_MUTED)
            surface.blit(diff_lbl, (cx - diff_lbl.get_width() // 2, diff_lbl_y))

            for i, diff in enumerate(self.difficulties):
                rect = self._get_diff_rect(i, width, height)
                is_active = (self.selected_diff == diff)
                bg = (37, 99, 235) if is_active else BG_CARD
                border = ACCENT_CYAN if is_active else BORDER_COLOR
                pygame.draw.rect(surface, bg, rect, border_radius=max(6, int(8 * scale)))
                pygame.draw.rect(surface, border, rect, width=2 if is_active else 1, border_radius=max(6, int(8 * scale)))

                font = FontManager.get_font(max(11, int(13 * scale)), bold=True)
                txt_surf = font.render(diff, True, TEXT_PRIMARY if is_active else TEXT_MUTED)
                surface.blit(txt_surf, txt_surf.get_rect(center=rect.center))
        else:
            sprint_hint = FontManager.get_font(max(13, int(15 * scale)), bold=False).render(
                "Type as many words as possible within 60 seconds! Clock starts on your first keystroke.", True, ACCENT_CYAN
            )
            surface.blit(sprint_hint, sprint_hint.get_rect(center=(cx, int(height * 0.50))))

        # 5. Draw Action Buttons
        self.btn_start.draw(surface)
        self.btn_custom_file.draw(surface)
        self.btn_history.draw(surface)
        self.btn_sound.draw(surface)

        # 6. Footer Hint
        hint_font = FontManager.get_font(max(10, int(12 * scale)), bold=False)
        hint_surf = hint_font.render("Press Enter to Quick Start • Esc to Quit", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(cx, height - int(22 * scale))))
