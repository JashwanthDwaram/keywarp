"""
Main Application Launcher for KeyWarp Desktop.
A modular, high-performance typing speed test and analytics application
combining Pygame (for real-time 60 FPS graphics, caret animations, and input processing)
with Tkinter (for native OS file dialogs to load custom text files and export results).

Designed for modularity, clean architecture, and high-performance typing telemetry.
"""

import sys
import os

# Enable Windows Per-Monitor High-DPI Awareness BEFORE pygame initializes
if sys.platform == "win32":
    try:
        import ctypes
        # SetProcessDpiAwareness(2) = Per-Monitor DPI Aware v2
        ctypes.windll.shcore.SetProcessDpiAwareness(2)
    except Exception:
        try:
            import ctypes
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:
            pass

import pygame

# Ensure desktop root directory is in Python sys.path for relative imports
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from config.constants import (
    WINDOW_WIDTH, WINDOW_HEIGHT, MIN_WIDTH, MIN_HEIGHT, FPS, WINDOW_TITLE,
    STATE_MENU, STATE_TYPING, STATE_RESULTS, STATE_HISTORY,
    MODE_PASSAGE, MODE_SPRINT, DIFF_MEDIUM
)
from core.passage_loader import PassageLoader
from core.session_logger import SessionLogger
from core.typing_engine import TypingEngine
from analytics.data_analyzer import DataAnalyzer
from ui.sound_fx import SoundEngine
from ui.screens.menu_screen import MenuScreen
from ui.screens.typing_screen import TypingScreen
from ui.screens.results_screen import ResultsScreen
from ui.screens.history_screen import HistoryScreen


class KeyWarpDesktopApp:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption(WINDOW_TITLE)

        # Set custom crisp app icon (replacing default pygame icon)
        try:
            icon_surface = pygame.Surface((32, 32), pygame.SRCALPHA)
            pygame.draw.rect(icon_surface, (37, 99, 235), (0, 0, 32, 32), border_radius=6)
            pygame.draw.rect(icon_surface, (56, 189, 248), (0, 0, 32, 32), width=2, border_radius=6)
            icon_font = pygame.font.SysFont("segoeui,arial", 18, bold=True)
            k_surf = icon_font.render("K", True, (255, 255, 255))
            icon_surface.blit(k_surf, k_surf.get_rect(center=(16, 16)))
            pygame.display.set_icon(icon_surface)
        except Exception:
            pass

        self.width = WINDOW_WIDTH
        self.height = WINDOW_HEIGHT
        self.screen = pygame.display.set_mode((self.width, self.height), pygame.RESIZABLE)
        self.clock = pygame.time.Clock()
        self.running = True

        # Core Services
        self.passage_loader = PassageLoader()
        self.session_logger = SessionLogger()
        self.analyzer = DataAnalyzer(self.session_logger)
        self.sound = SoundEngine.get_instance()

        # State Variables
        self.state = STATE_MENU
        self.last_mode = MODE_PASSAGE
        self.last_diff = DIFF_MEDIUM
        self.last_custom_text = ""
        self.current_engine = None
        self.last_summary = {}

        # Screen Instances
        self.menu_screen = MenuScreen(
            on_start_test=self.start_test,
            on_load_custom_file=self.load_custom_file_dialog,
            on_open_history=self.open_history,
            on_toggle_sound=self.sound.toggle,
            get_summary_stats=self.analyzer.get_stats_summary,
            sound_enabled=self.sound.enabled
        )
        self.history_screen = HistoryScreen(
            session_logger=self.session_logger,
            on_menu=self.open_menu,
            on_export=self.export_history_dialog,
            on_clear=self.clear_history
        )
        self.typing_screen = None
        self.results_screen = None

    def start_test(self, mode: str = MODE_PASSAGE, difficulty: str = DIFF_MEDIUM, custom_text: str = "") -> None:
        """Starts a new typing test session."""
        self.last_mode = mode
        self.last_diff = difficulty
        self.last_custom_text = custom_text

        # Determine target text and duration
        if custom_text:
            target_text = custom_text
            diff_label = "Custom File"
            duration = 999.0
        elif mode == MODE_SPRINT:
            target_text = self.passage_loader.generate_sprint_stream(word_count=60)
            diff_label = "Sprint"
            duration = 60.0
        else:
            target_text = self.passage_loader.get_passage(difficulty=difficulty)
            diff_label = difficulty
            duration = 999.0

        # Initialize engine and typing view
        self.current_engine = TypingEngine(
            target_text=target_text,
            mode=mode,
            difficulty=diff_label,
            sprint_duration=duration
        )

        self.typing_screen = TypingScreen(
            engine=self.current_engine,
            sound_engine=self.sound,
            on_finish=self.on_test_completed,
            on_back_to_menu=self.open_menu,
            on_restart=self.restart_test
        )
        self.state = STATE_TYPING

    def restart_test(self) -> None:
        """Restarts the test with current settings."""
        self.start_test(self.last_mode, self.last_diff, self.last_custom_text)

    def load_custom_file_dialog(self) -> None:
        """
        Tkinter Integration:
        Opens native file chooser dialog, loads text file content,
        and launches typing test with that practice text.
        """
        content = self.passage_loader.load_custom_file_dialog()
        if content:
            self.start_test(mode=MODE_PASSAGE, difficulty="Custom", custom_text=content)

    def export_history_dialog(self) -> None:
        """
        Tkinter Integration:
        Opens native Save File dialog to export session history to CSV/JSON.
        """
        records = self.session_logger.get_history()
        self.session_logger.export_history_dialog(records)

    def clear_history(self) -> None:
        """Clears all session history logs."""
        self.session_logger.clear_history()

    def on_test_completed(self, summary: dict) -> None:
        """Handles completion of typing test: logs data and displays Results."""
        self.session_logger.log_session(summary)
        self.last_summary = summary

        self.results_screen = ResultsScreen(
            summary_data=summary,
            on_retry=self.restart_test,
            on_new_test=lambda: self.start_test(self.last_mode, self.last_diff),
            on_export=self.export_history_dialog,
            on_menu=self.open_menu
        )
        self.state = STATE_RESULTS

    def open_menu(self) -> None:
        self.state = STATE_MENU

    def open_history(self) -> None:
        self.state = STATE_HISTORY

    def run(self) -> None:
        """Main game loop running at 60 frames per second."""
        while self.running:
            mouse_pos = pygame.mouse.get_pos()

            # 1. Event Handling Phase
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    break

                # Handle window resizing / maximizing
                if event.type == pygame.VIDEORESIZE:
                    self.width = max(MIN_WIDTH, event.w)
                    self.height = max(MIN_HEIGHT, event.h)
                    self.screen = pygame.display.set_mode((self.width, self.height), pygame.RESIZABLE)
                    continue

                if self.state == STATE_MENU:
                    self.menu_screen.handle_event(event)
                elif self.state == STATE_TYPING and self.typing_screen:
                    self.typing_screen.handle_event(event)
                elif self.state == STATE_RESULTS and self.results_screen:
                    self.results_screen.handle_event(event)
                elif self.state == STATE_HISTORY:
                    self.history_screen.handle_event(event)

            if not self.running:
                break

            # 2. State Update Phase
            if self.state == STATE_MENU:
                self.menu_screen.update(mouse_pos)
            elif self.state == STATE_TYPING and self.typing_screen:
                self.typing_screen.update(mouse_pos)
            elif self.state == STATE_RESULTS and self.results_screen:
                self.results_screen.update(mouse_pos)
            elif self.state == STATE_HISTORY:
                self.history_screen.update(mouse_pos)

            # 3. Screen Rendering Phase
            try:
                if self.state == STATE_MENU:
                    self.menu_screen.draw(self.screen)
                elif self.state == STATE_TYPING and self.typing_screen:
                    self.typing_screen.draw(self.screen)
                elif self.state == STATE_RESULTS and self.results_screen:
                    self.results_screen.draw(self.screen)
                elif self.state == STATE_HISTORY:
                    self.history_screen.draw(self.screen)
            except Exception as e:
                print(f"[KeyWarpApp] Render error on state '{self.state}': {e}")

            # 4. Flip Buffers & Maintain Target Frame Rate
            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()


if __name__ == "__main__":
    app = KeyWarpDesktopApp()
    app.run()
