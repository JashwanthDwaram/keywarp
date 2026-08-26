"""
Real-time Typing Screen.
Renders interactive character-by-character feedback, live metrics, caret animations, and audio cues.
"""

from typing import Tuple, Callable, Dict, Any, List
import pygame
from config.constants import (
    BG_MAIN, BG_PANEL, BG_CARD, BG_INPUT_BOX, BORDER_SUBTLE, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_INDIGO, ACCENT_SKY,
    CHAR_CORRECT, CHAR_INCORRECT, CHAR_INCORRECT_BG, CHAR_PENDING,
    CARET_COLOR, SUCCESS, WARNING, ERROR
)
from core.typing_engine import TypingEngine
from ui.components import Button, Card, Badge, FontManager, MetricCard, ProgressBar, BlinkingCaret
from ui.sound_fx import SoundManager


class TypingScreen:
    def __init__(
        self,
        engine: TypingEngine,
        sound_manager: SoundManager,
        on_finish: Callable[[Dict[str, Any]], None],
        on_back_to_menu: Callable[[], None],
        on_restart: Callable[[], None]
    ):
        self.engine = engine
        self.sound = sound_manager
        self.on_finish = on_finish
        self.on_back_to_menu = on_back_to_menu
        self.on_restart = on_restart
        
        self.caret = BlinkingCaret()
        self._init_buttons()

    def _init_buttons(self) -> None:
        self.btn_menu = Button((40, 24, 110, 36), "← Menu", variant="ghost", font_size=13)
        self.btn_restart = Button((160, 24, 110, 36), "🔄 Restart", variant="secondary", font_size=13)

    def handle_event(self, event: pygame.event.Event) -> None:
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
                # Tab quick restart
                self.on_restart()
                return
            elif event.key == pygame.K_BACKSPACE:
                self.engine.handle_backspace()
            elif event.unicode and len(event.unicode) == 1 and ord(event.unicode) >= 32:
                # Handle typed character
                char = event.unicode
                curr_idx = len(self.engine.typed_chars)
                is_correct = (curr_idx < len(self.engine.target_text) and char == self.engine.target_text[curr_idx])
                
                self.engine.handle_input(char)
                
                # Audio feedback
                if is_correct:
                    self.sound.play_click()
                else:
                    self.sound.play_error()

                # Check if finished
                if self.engine.is_finished:
                    self.sound.play_complete()
                    self.on_finish(self.engine.get_summary())

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.btn_menu.update(mouse_pos)
        self.btn_restart.update(mouse_pos)
        
        # Check sprint countdown expiration
        if self.engine.mode == "Sprint":
            expired = self.engine.update_sprint_timer()
            if expired:
                self.sound.play_complete()
                self.on_finish(self.engine.get_summary())

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(BG_MAIN)

        # Header Buttons & Badges
        self.btn_menu.draw(surface)
        self.btn_restart.draw(surface)

        # Mode Badges (Top Center)
        mode_str = f"MODE: {self.engine.mode.upper()}"
        Badge.draw(surface, surface.get_width() // 2 - 120, 26, mode_str, bg_color=ACCENT_INDIGO)
        diff_str = f"{self.engine.difficulty.upper()}"
        Badge.draw(surface, surface.get_width() // 2 + 10, 26, diff_str, bg_color=BG_PANEL, text_color=ACCENT_SKY)

        # Live Metrics Banner (4 Cards across top)
        card_y = 80
        card_w = 230
        gap = 20
        start_x = (surface.get_width() - (4 * card_w + 3 * gap)) // 2

        live_wpm = self.engine.get_net_wpm()
        live_acc = self.engine.get_accuracy()
        
        if self.engine.mode == "Sprint":
            time_display = f"{int(self.engine.get_remaining_sprint_seconds())}s"
            time_label = "TIME LEFT"
            time_accent = WARNING if self.engine.get_remaining_sprint_seconds() < 10 else ACCENT_SKY
        else:
            time_display = f"{self.engine.get_elapsed_seconds():.1f}s"
            time_label = "ELAPSED TIME"
            time_accent = ACCENT_SKY

        MetricCard((start_x, card_y, card_w, 82), "Live Speed", f"{live_wpm} WPM", "Net words / min", ACCENT_INDIGO).draw(surface)
        MetricCard((start_x + (card_w + gap), card_y, card_w, 82), "Live Accuracy", f"{live_acc}%", "Keystroke precision", SUCCESS).draw(surface)
        MetricCard((start_x + 2 * (card_w + gap), card_y, card_w, 82), time_label, time_display, "Real-time clock", time_accent).draw(surface)
        MetricCard((start_x + 3 * (card_w + gap), card_y, card_w, 82), "Errors Made", f"{self.engine.incorrect_keystrokes}", "Total mistakes", ERROR if self.engine.incorrect_keystrokes > 0 else TEXT_MUTED).draw(surface)

        # Progress Bar
        progress_val = len(self.engine.typed_chars) / max(1, len(self.engine.target_text))
        ProgressBar.draw(surface, (start_x, 180, 4 * card_w + 3 * gap, 6), progress_val, fill_color=ACCENT_SKY)

        # Main Typing Container Box
        box_x = 60
        box_y = 210
        box_w = surface.get_width() - 120
        box_h = 420
        Card.draw(surface, (box_x, box_y, box_w, box_h), bg_color=BG_CARD, border_color=BORDER_ACTIVE if self.engine.is_started else BORDER_SUBTLE, border_radius=14, border_width=2 if self.engine.is_started else 1)

        # Render Passage Text with Dynamic Word-Wrapping
        self._render_passage_text(surface, box_x + 35, box_y + 35, box_w - 70, box_h - 70)

        # Bottom Helper Hints
        hint_font = FontManager.get_font(12, bold=False)
        hint_surf = hint_font.render("Tab to Quick Restart • Esc to Return to Menu", True, TEXT_DIM)
        surface.blit(hint_surf, hint_surf.get_rect(center=(surface.get_width() // 2, 665)))

    def _render_passage_text(self, surface: pygame.Surface, start_x: int, start_y: int, max_w: int, max_h: int) -> None:
        """Renders the text character by character with word-wrapping and caret positioning."""
        font = FontManager.get_font(22, bold=False, mono=True)
        line_height = 42
        
        target = self.engine.target_text
        typed = self.engine.typed_chars
        current_idx = len(typed)

        # Split passage into words to calculate line wrapping positions
        words = target.split(" ")
        lines: List[List[Tuple[int, str]]] = []  # List of lines, each is list of (char_index, char)
        current_line: List[Tuple[int, str]] = []
        current_line_width = 0
        
        char_idx = 0
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
                
        if current_line:
            lines.append(current_line)

        # Calculate which lines to show if passage exceeds height (scroll view)
        active_line_idx = 0
        for l_idx, line in enumerate(lines):
            for c_idx, _ in line:
                if c_idx == current_idx:
                    active_line_idx = l_idx
                    break

        visible_lines_count = max_h // line_height
        start_line_idx = 0
        if active_line_idx >= visible_lines_count - 1:
            start_line_idx = active_line_idx - (visible_lines_count - 2)

        # Render visible lines
        y = start_y
        for l_idx in range(start_line_idx, min(len(lines), start_line_idx + visible_lines_count)):
            line = lines[l_idx]
            x = start_x
            
            for c_idx, char in line:
                char_w, char_h = font.size(char)
                
                # Determine state and colors
                if c_idx < current_idx:
                    # Character already typed
                    if typed[c_idx] == char:
                        color = CHAR_CORRECT
                    else:
                        color = CHAR_INCORRECT
                        # Draw subtle background red box for mistyped character
                        err_rect = pygame.Rect(x, y - 2, max(char_w, 10), line_height - 6)
                        pygame.draw.rect(surface, (127, 29, 29), err_rect, border_radius=4)
                elif c_idx == current_idx:
                    # Caret position
                    self.caret.draw(surface, x - 1, y, line_height - 10, CARET_COLOR)
                    color = TEXT_PRIMARY
                else:
                    color = CHAR_PENDING

                # Render character glyph
                render_char = char if char != "\n" else " "
                char_surf = font.render(render_char, True, color)
                surface.blit(char_surf, (x, y))
                x += char_w
                
            y += line_height
