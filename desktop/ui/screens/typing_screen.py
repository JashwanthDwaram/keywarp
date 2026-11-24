"""
Typing Arena Screen for KeyWarp Desktop.
Renders real-time character-by-character feedback, animated blinking cursor,
live WPM/accuracy telemetry cards, and audio feedback.
Dynamically scales and expands with window resizing and maximizing.
"""

import time
from typing import Tuple, Callable, Dict, Any, List
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BG_INPUT, BORDER_COLOR, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_CYAN, ACCENT_PURPLE,
    COLOR_CORRECT, COLOR_ERROR, COLOR_ERROR_BG, COLOR_ERROR_LINE, MODE_SPRINT
)
from core.typing_engine import TypingEngine
from ui.components import Button, MetricCard, ProgressBar, Badge, FontManager
from ui.sound_fx import SoundEngine


class TypingScreen:
    def __init__(
        self,
        engine: TypingEngine,
        sound_engine: SoundEngine,
        on_finish: Callable[[Dict[str, Any]], None],
        on_back_to_menu: Callable[[], None],
        on_restart: Callable[[], None]
    ):
        self.engine = engine
        self.sound = sound_engine
        self.on_finish = on_finish
        self.on_back_to_menu = on_back_to_menu
        self.on_restart = on_restart

        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_menu = Button((0, 0, 0, 0), "Menu", variant="ghost", font_size=13)
        self.btn_restart = Button((0, 0, 0, 0), "Restart", variant="secondary", font_size=13)

    def _get_scale(self, width: int, height: int) -> float:
        return max(0.9, min(width / 1150.0, height / 750.0))

    def _update_layout(self, width: int, height: int) -> None:
        scale = self._get_scale(width, height)
        btn_w = int(110 * scale)
        btn_h = int(36 * scale)
        self.btn_menu.rect = pygame.Rect(int(40 * scale), int(22 * scale), btn_w, btn_h)
        self.btn_menu.font_size = max(11, int(13 * scale))
        self.btn_restart.rect = pygame.Rect(int(40 * scale) + btn_w + 12, int(22 * scale), btn_w, btn_h)
        self.btn_restart.font_size = max(11, int(13 * scale))

    def handle_event(self, event: pygame.event.Event) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())

        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.btn_menu.rect.collidepoint(event.pos):
                self.on_back_to_menu()
            elif self.btn_restart.rect.collidepoint(event.pos):
                self.on_restart()

        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.on_back_to_menu()
                return
            elif event.key == pygame.K_TAB:
                curr_idx = len(self.engine.typed_chars)
                expected = self.engine.target_text[curr_idx] if curr_idx < len(self.engine.target_text) else ""
                if expected == "\t":
                    self._process_char("\t")
                    return
                elif expected == " " and self.engine.target_text[curr_idx:curr_idx + 4] == "    ":
                    # Smart Tab: expand 4 spaces for code indentation
                    for _ in range(4):
                        self._process_char(" ")
                    return
                # Tab acts as quick restart when not indenting
                self.on_restart()
                return
            elif event.key == pygame.K_BACKSPACE:
                self.engine.handle_backspace()
            elif event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
                curr_idx = len(self.engine.typed_chars)
                expected = self.engine.target_text[curr_idx] if curr_idx < len(self.engine.target_text) else ""
                self._process_char("\n")
            elif event.unicode and len(event.unicode) == 1:
                char = event.unicode
                curr_idx = len(self.engine.typed_chars)
                expected = self.engine.target_text[curr_idx] if curr_idx < len(self.engine.target_text) else ""
                # If target expects '\n' and user presses space, accept newline smoothly
                if expected == "\n" and char == " ":
                    self._process_char("\n")
                elif ord(char) >= 32:
                    self._process_char(char)

    def _process_char(self, char: str) -> None:
        """Processes a single keystroke character with audio feedback and finish check."""
        curr_idx = len(self.engine.typed_chars)
        is_correct = (curr_idx < len(self.engine.target_text) and char == self.engine.target_text[curr_idx])

        self.engine.handle_input(char)

        # Sound feedback
        if is_correct:
            self.sound.play_click()
        else:
            self.sound.play_error()

        # Check if finished
        if self.engine.is_finished:
            self.sound.play_complete()
            self.on_finish(self.engine.get_summary())

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        surface = pygame.display.get_surface()
        if surface:
            self._update_layout(surface.get_width(), surface.get_height())
        self.btn_menu.update(mouse_pos)
        self.btn_restart.update(mouse_pos)

        # Check sprint timer
        if self.engine.mode == MODE_SPRINT:
            remaining = self.engine.get_remaining_sprint_seconds()
            if remaining <= 0:
                self.sound.play_complete()
                self.on_finish(self.engine.get_summary())

    def draw(self, surface: pygame.Surface) -> None:
        width = surface.get_width()
        height = surface.get_height()
        scale = self._get_scale(width, height)
        self._update_layout(width, height)

        surface.fill(BG_MAIN)
        cx = width // 2

        # Header Buttons
        self.btn_menu.draw(surface)
        self.btn_restart.draw(surface)

        # Header Badges (Centered)
        mode_str = f"MODE: {self.engine.mode}"
        Badge.draw(surface, cx - int(135 * scale), int(24 * scale), mode_str, bg_color=(37, 99, 235), font_size=max(11, int(12 * scale)), scale=scale)
        Badge.draw(surface, cx + int(10 * scale), int(24 * scale), self.engine.difficulty, bg_color=BG_CARD, font_size=max(11, int(12 * scale)), scale=scale)

        # Live Metric Cards (Top Banner, scaled)
        card_y = int(72 * scale)
        card_w = int(230 * scale)
        card_h = int(78 * scale)
        gap = int(16 * scale)
        start_x = (width - (4 * card_w + 3 * gap)) // 2

        live_wpm = self.engine.get_net_wpm()
        live_acc = self.engine.get_accuracy()

        if self.engine.mode == MODE_SPRINT:
            time_str = f"{int(self.engine.get_remaining_sprint_seconds())}s"
            time_lbl = "TIME LEFT"
            time_color = (251, 191, 36) if self.engine.get_remaining_sprint_seconds() < 10 else ACCENT_CYAN
        else:
            time_str = f"{self.engine.get_elapsed_seconds():.1f}s"
            time_lbl = "ELAPSED TIME"
            time_color = ACCENT_CYAN

        MetricCard.draw(surface, (start_x, card_y, card_w, card_h), "Live Speed", f"{live_wpm} WPM", "Net words / min", ACCENT_CYAN, scale=scale)
        MetricCard.draw(surface, (start_x + (card_w + gap), card_y, card_w, card_h), "Live Accuracy", f"{live_acc}%", "Precision score", COLOR_CORRECT, scale=scale)
        MetricCard.draw(surface, (start_x + 2 * (card_w + gap), card_y, card_w, card_h), time_lbl, time_str, "Real-time clock", time_color, scale=scale)
        MetricCard.draw(surface, (start_x + 3 * (card_w + gap), card_y, card_w, card_h), "Errors", f"{self.engine.incorrect_keystrokes}", "Total mistakes", COLOR_ERROR if self.engine.incorrect_keystrokes > 0 else TEXT_MUTED, scale=scale)

        # Progress Bar
        progress = len(self.engine.typed_chars) / max(1, len(self.engine.target_text))
        ProgressBar.draw(surface, (start_x, card_y + card_h + int(12 * scale), 4 * card_w + 3 * gap, max(4, int(6 * scale))), progress, fill_color=ACCENT_CYAN)

        # Main Typing Container Card (Expands dynamically to window dimensions!)
        box_x = max(30, int(50 * scale))
        box_y = card_y + card_h + int(28 * scale)
        box_w = width - 2 * box_x
        box_h = max(340, height - box_y - int(45 * scale))
        pygame.draw.rect(surface, BG_CARD, (box_x, box_y, box_w, box_h), border_radius=max(8, int(12 * scale)))
        border_col = BORDER_ACTIVE if self.engine.is_started else BORDER_COLOR
        pygame.draw.rect(surface, border_col, (box_x, box_y, box_w, box_h), width=2 if self.engine.is_started else 1, border_radius=max(8, int(12 * scale)))

        # Render Passage Text with Dynamic Word-Wrapping
        pad = int(32 * scale)
        self._render_text(surface, box_x + pad, box_y + pad, box_w - 2 * pad, box_h - 2 * pad, scale)

        # Footer Hint
        hint_font = FontManager.get_font(max(10, int(12 * scale)), bold=False)
        hint_surf = hint_font.render("Tab to Quick Restart • Esc to Return to Menu", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(cx, height - int(18 * scale))))

    def _render_text(self, surface: pygame.Surface, start_x: int, start_y: int, max_w: int, max_h: int, scale: float) -> None:
        """Renders character by character with word-wrapping, colors, seamless error highlights, and blinking caret."""
        font_size = max(19, int(24 * scale))
        line_height = max(34, int(42 * scale))
        font = FontManager.get_font(font_size, bold=False, mono=True)
        char_h = font.get_height()

        target = self.engine.target_text
        typed = self.engine.typed_chars
        current_idx = len(typed)

        # Word-wrap and newline calculation
        lines: List[List[Tuple[int, str]]] = []
        current_line: List[Tuple[int, str]] = []
        current_line_width = 0

        char_idx = 0
        paragraphs = target.split("\n")
        for p_idx, para in enumerate(paragraphs):
            words = para.split(" ")
            for w_idx, word in enumerate(words):
                word_str = word + (" " if w_idx < len(words) - 1 else "")
                word_width = sum(font.size(c)[0] for c in word_str)

                if current_line_width + word_width > max_w and current_line:
                    lines.append(current_line)
                    current_line = []
                    current_line_width = 0

                for c in word_str:
                    current_line.append((char_idx, c))
                    current_line_width += font.size(c)[0]
                    char_idx += 1

            if p_idx < len(paragraphs) - 1:
                # Add newline token to end of line
                current_line.append((char_idx, "\n"))
                char_idx += 1
                lines.append(current_line)
                current_line = []
                current_line_width = 0

        if current_line:
            lines.append(current_line)

        # Calculate visible lines (scroll to keep cursor visible)
        active_line_idx = 0
        for l_idx, line in enumerate(lines):
            for c_idx, _ in line:
                if c_idx == current_idx:
                    active_line_idx = l_idx
                    break

        visible_count = max_h // line_height
        start_line_idx = 0
        if active_line_idx >= visible_count - 1:
            start_line_idx = active_line_idx - (visible_count - 2)

        # Blinking Caret (blink every 0.5s)
        show_caret = int(time.time() * 2) % 2 == 0

        # Render lines
        y = start_y
        for l_idx in range(start_line_idx, min(len(lines), start_line_idx + visible_count)):
            line = lines[l_idx]
            box_y = y + (line_height - char_h) // 2

            # Step 1: Detect contiguous mistyped sequences on this line to draw a single seamless background pill
            curr_x = start_x
            err_start_x = None
            err_width = 0

            for c_idx, char in line:
                char_w = font.size(char)[0]
                is_err = (c_idx < current_idx and typed[c_idx] != char)
                if is_err:
                    if err_start_x is None:
                        err_start_x = curr_x
                        err_width = char_w
                    else:
                        err_width += char_w
                else:
                    if err_start_x is not None:
                        pill_rect = pygame.Rect(err_start_x - 1, box_y - 2, err_width + 2, char_h + 4)
                        pygame.draw.rect(surface, COLOR_ERROR_BG, pill_rect, border_radius=4)
                        err_start_x = None
                        err_width = 0
                curr_x += char_w

            if err_start_x is not None:
                pill_rect = pygame.Rect(err_start_x - 1, box_y - 2, err_width + 2, char_h + 4)
                pygame.draw.rect(surface, COLOR_ERROR_BG, pill_rect, border_radius=4)

            # Step 2: Render character glyphs, error underlines, and animated cursor
            x = start_x
            for c_idx, char in line:
                char_w, _ = font.size(char)

                if c_idx < current_idx:
                    # Character typed
                    if typed[c_idx] == char:
                        color = COLOR_CORRECT
                    else:
                        color = COLOR_ERROR
                        # Sleek underline directly beneath mistyped character
                        underline_y = box_y + char_h + 1
                        line_thick = max(2, int(2 * scale))
                        pygame.draw.line(surface, COLOR_ERROR_LINE, (x, underline_y), (x + char_w, underline_y), line_thick)
                elif c_idx == current_idx:
                    # Current character cursor
                    if show_caret:
                        caret_h = char_h + 4
                        caret_y = box_y - 2
                        caret_w = max(2, int(2 * scale))
                        caret_rect = pygame.Rect(x - 1, caret_y, caret_w, caret_h)
                        pygame.draw.rect(surface, ACCENT_CYAN, caret_rect, border_radius=1)
                    color = TEXT_PRIMARY
                else:
                    # Pending character
                    color = TEXT_DIM

                display_char = char
                if char == "\n":
                    display_char = "↵"
                    if c_idx >= current_idx:
                        color = ACCENT_CYAN if c_idx == current_idx else TEXT_DIM

                char_surf = font.render(display_char, True, color)
                surface.blit(char_surf, (x, box_y))
                x += char_w

            y += line_height
