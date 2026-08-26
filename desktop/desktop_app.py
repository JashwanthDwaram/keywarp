"""
Main Application Launcher for TypePulse - Typing Speed Test & Analytics Game.
CSM216 Project - Event-driven Pygame application with Pandas/Matplotlib analytics.
"""

import sys
import os
import pygame

# Add project root to python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from config.constants import (
    WINDOW_WIDTH, WINDOW_HEIGHT, FPS, WINDOW_TITLE,
    STATE_MENU, STATE_TYPING, STATE_RESULTS, STATE_HISTORY, STATE_ANALYTICS,
    DIFF_MEDIUM
)
from core.passage_loader import PassageLoader
from core.typing_engine import TypingEngine
from core.session_logger import SessionLogger
from analytics.data_analyzer import DataAnalyzer
from analytics.visualizer import PerformanceVisualizer
from ui.sound_fx import SoundManager
from ui.screens.menu_screen import MenuScreen
from ui.screens.typing_screen import TypingScreen
from ui.screens.results_screen import ResultsScreen
from ui.screens.history_screen import HistoryScreen
from ui.screens.analytics_screen import AnalyticsScreen


class TypePulseApp:
    def __init__(self):
        pygame.init()
        pygame.display.set_caption(WINDOW_TITLE)
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        self.clock = pygame.time.Clock()
        self.running = True

        # Core Services
        self.passage_loader = PassageLoader()
        self.session_logger = SessionLogger()
        self.analyzer = DataAnalyzer(self.session_logger)
        self.visualizer = PerformanceVisualizer()
        self.sound_manager = SoundManager(enabled=True)

        # State Management
        self.state = STATE_MENU
        self.last_mode = "Passage"
        self.last_diff = DIFF_MEDIUM
        self.current_engine = None
        self.last_summary = {}

        # Screen Instances
        self.menu_screen = MenuScreen(
            on_start_test=self.start_test,
            on_open_analytics=self.open_analytics,
            on_open_history=self.open_history,
            on_toggle_sound=self.sound_manager.toggle,
            get_summary_stats=self.analyzer.get_stats_summary,
            sound_enabled=self.sound_manager.enabled
        )
        self.history_screen = HistoryScreen(
            session_logger=self.session_logger,
            on_menu=self.open_menu,
            on_analytics=self.open_analytics
        )
        self.analytics_screen = AnalyticsScreen(
            session_logger=self.session_logger,
            analyzer=self.analyzer,
            visualizer=self.visualizer,
            on_menu=self.open_menu
        )
        self.typing_screen = None
        self.results_screen = None

    def start_test(self, mode: str = "Passage", difficulty: str = DIFF_MEDIUM) -> None:
        self.last_mode = mode
        self.last_diff = difficulty

        if mode == "Sprint":
            target_text = self.passage_loader.generate_sprint_stream(word_count=130)
            duration = 60.0
        else:
            target_text = self.passage_loader.get_passage(difficulty=difficulty)
            duration = 999.0

        self.current_engine = TypingEngine(
            target_text=target_text,
            mode=mode,
            difficulty=difficulty,
            sprint_duration=duration
        )

        self.typing_screen = TypingScreen(
            engine=self.current_engine,
            sound_manager=self.sound_manager,
            on_finish=self.on_test_completed,
            on_back_to_menu=self.open_menu,
            on_restart=self.restart_test
        )
        self.state = STATE_TYPING

    def restart_test(self) -> None:
        self.start_test(self.last_mode, self.last_diff)

    def on_test_completed(self, summary: dict) -> None:
        # Save to CSV history
        self.session_logger.log_session(summary)
        self.last_summary = summary

        # Prepare Results Screen
        self.results_screen = ResultsScreen(
            summary_data=summary,
            on_retry=lambda: self.retry_same_passage(summary.get("passage_length", 0)),
            on_new_test=lambda: self.start_test(self.last_mode, self.last_diff),
            on_view_analytics=self.open_analytics,
            on_menu=self.open_menu
        )
        self.state = STATE_RESULTS

    def retry_same_passage(self, length: int) -> None:
        if self.current_engine:
            target = self.current_engine.target_text
            self.current_engine = TypingEngine(
                target_text=target,
                mode=self.last_mode,
                difficulty=self.last_diff,
                sprint_duration=60.0 if self.last_mode == "Sprint" else 999.0
            )
            self.typing_screen = TypingScreen(
                engine=self.current_engine,
                sound_manager=self.sound_manager,
                on_finish=self.on_test_completed,
                on_back_to_menu=self.open_menu,
                on_restart=self.restart_test
            )
            self.state = STATE_TYPING
        else:
            self.start_test(self.last_mode, self.last_diff)

    def open_menu(self) -> None:
        self.state = STATE_MENU

    def open_analytics(self) -> None:
        self.analytics_screen.refresh_data()
        self.state = STATE_ANALYTICS

    def open_history(self) -> None:
        self.state = STATE_HISTORY

    def run(self) -> None:
        while self.running:
            mouse_pos = pygame.mouse.get_pos()

            # Event Handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    break

                if self.state == STATE_MENU:
                    self.menu_screen.handle_event(event)
                elif self.state == STATE_TYPING and self.typing_screen:
                    self.typing_screen.handle_event(event)
                elif self.state == STATE_RESULTS and self.results_screen:
                    self.results_screen.handle_event(event)
                elif self.state == STATE_HISTORY:
                    self.history_screen.handle_event(event)
                elif self.state == STATE_ANALYTICS:
                    self.analytics_screen.handle_event(event)

            if not self.running:
                break

            # Updates
            if self.state == STATE_MENU:
                self.menu_screen.update(mouse_pos)
            elif self.state == STATE_TYPING and self.typing_screen:
                self.typing_screen.update(mouse_pos)
            elif self.state == STATE_RESULTS and self.results_screen:
                self.results_screen.update(mouse_pos)
            elif self.state == STATE_HISTORY:
                self.history_screen.update(mouse_pos)
            elif self.state == STATE_ANALYTICS:
                self.analytics_screen.update(mouse_pos)

            # Drawing
            if self.state == STATE_MENU:
                self.menu_screen.draw(self.screen)
            elif self.state == STATE_TYPING and self.typing_screen:
                self.typing_screen.draw(self.screen)
            elif self.state == STATE_RESULTS and self.results_screen:
                self.results_screen.draw(self.screen)
            elif self.state == STATE_HISTORY:
                self.history_screen.draw(self.screen)
            elif self.state == STATE_ANALYTICS:
                self.analytics_screen.draw(self.screen)

            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()


if __name__ == "__main__":
    app = TypePulseApp()
    app.run()
