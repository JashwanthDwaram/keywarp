"""
Reusable UI Components for Pygame.
Modern slate / indigo design system with rounded corners, hover states, and smooth typography.
"""

import math
import time
from typing import Tuple, Optional, Callable, Dict, Any
import pygame
from config.constants import (
    BG_CARD, BG_CARD_HOVER, BG_PANEL, BORDER_SUBTLE, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_INDIGO, ACCENT_INDIGO_HOVER,
    ACCENT_SKY, SUCCESS, ERROR, WARNING, CARET_COLOR
)


class FontManager:
    _fonts: Dict[str, pygame.font.Font] = {}

    @classmethod
    def get_font(cls, size: int = 16, bold: bool = False, mono: bool = False) -> pygame.font.Font:
        key = f"{size}_{bold}_{mono}"
        if key not in cls._fonts:
            if mono:
                font_name = "Consolas, Courier New, monospace"
            else:
                font_name = "Segoe UI, Helvetica, Arial, sans-serif"
            cls._fonts[key] = pygame.font.SysFont(font_name, size, bold=bold)
        return cls._fonts[key]


class Button:
    def __init__(
        self,
        rect: Tuple[int, int, int, int],
        text: str,
        variant: str = "primary",
        font_size: int = 16,
        icon: str = "",
        callback: Optional[Callable[[], None]] = None,
        tooltip: str = ""
    ):
        self.rect = pygame.Rect(rect)
        self.text = text
        self.variant = variant
        self.font_size = font_size
        self.icon = icon
        self.callback = callback
        self.tooltip = tooltip
        self.is_hovered = False
        self.border_radius = 8

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.is_hovered = self.rect.collidepoint(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        # Determine colors based on variant and hover
        if self.variant == "primary":
            bg_color = ACCENT_INDIGO_HOVER if self.is_hovered else ACCENT_INDIGO
            border_color = ACCENT_SKY if self.is_hovered else BORDER_ACTIVE
            text_color = TEXT_PRIMARY
        elif self.variant == "secondary":
            bg_color = BG_CARD_HOVER if self.is_hovered else BG_CARD
            border_color = BORDER_ACTIVE if self.is_hovered else BORDER_SUBTLE
            text_color = TEXT_PRIMARY if self.is_hovered else TEXT_MUTED
        elif self.variant == "success":
            bg_color = (20, 184, 120) if self.is_hovered else SUCCESS
            border_color = (52, 211, 153)
            text_color = TEXT_PRIMARY
        elif self.variant == "danger":
            bg_color = (244, 63, 94) if self.is_hovered else ERROR
            border_color = (251, 113, 133)
            text_color = TEXT_PRIMARY
        elif self.variant == "ghost":
            bg_color = (40, 53, 75) if self.is_hovered else (0, 0, 0, 0)
            border_color = BORDER_SUBTLE if self.is_hovered else (0, 0, 0, 0)
            text_color = TEXT_PRIMARY if self.is_hovered else TEXT_MUTED
        else:
            bg_color = BG_CARD
            border_color = BORDER_SUBTLE
            text_color = TEXT_PRIMARY

        # Draw button background
        pygame.draw.rect(surface, bg_color, self.rect, border_radius=self.border_radius)
        if border_color != (0, 0, 0, 0):
            pygame.draw.rect(surface, border_color, self.rect, width=1, border_radius=self.border_radius)

        # Draw label
        font = FontManager.get_font(self.font_size, bold=True)
        display_text = f"{self.icon} {self.text}".strip() if self.icon else self.text
        text_surf = font.render(display_text, True, text_color)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)

    def handle_event(self, event: pygame.event.Event) -> bool:
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.rect.collidepoint(event.pos):
                if self.callback:
                    self.callback()
                return True
        return False


class Card:
    @staticmethod
    def draw(
        surface: pygame.Surface,
        rect: Tuple[int, int, int, int],
        bg_color: Tuple[int, int, int] = BG_CARD,
        border_color: Tuple[int, int, int] = BORDER_SUBTLE,
        border_radius: int = 12,
        border_width: int = 1
    ) -> None:
        card_rect = pygame.Rect(rect)
        pygame.draw.rect(surface, bg_color, card_rect, border_radius=border_radius)
        if border_width > 0:
            pygame.draw.rect(surface, border_color, card_rect, width=border_width, border_radius=border_radius)


class Badge:
    @staticmethod
    def draw(
        surface: pygame.Surface,
        x: int,
        y: int,
        text: str,
        bg_color: Tuple[int, int, int] = ACCENT_INDIGO,
        text_color: Tuple[int, int, int] = TEXT_PRIMARY,
        font_size: int = 12
    ) -> int:
        """Draws a pill badge and returns badge width."""
        font = FontManager.get_font(font_size, bold=True)
        text_surf = font.render(text, True, text_color)
        padding_x = 10
        padding_y = 4
        w = text_surf.get_width() + padding_x * 2
        h = text_surf.get_height() + padding_y * 2
        rect = pygame.Rect(x, y, w, h)
        pygame.draw.rect(surface, bg_color, rect, border_radius=12)
        surface.blit(text_surf, (x + padding_x, y + padding_y))
        return w


class MetricCard:
    def __init__(
        self,
        rect: Tuple[int, int, int, int],
        title: str,
        value: str,
        subtitle: str = "",
        accent_color: Tuple[int, int, int] = ACCENT_SKY
    ):
        self.rect = pygame.Rect(rect)
        self.title = title
        self.value = value
        self.subtitle = subtitle
        self.accent_color = accent_color

    def draw(self, surface: pygame.Surface) -> None:
        # Card body
        Card.draw(surface, self.rect, bg_color=BG_CARD, border_color=BORDER_SUBTLE, border_radius=10)
        
        # Subtle top accent bar
        accent_bar_rect = pygame.Rect(self.rect.x, self.rect.y, self.rect.width, 3)
        pygame.draw.rect(surface, self.accent_color, accent_bar_rect, border_top_left_radius=10, border_top_right_radius=10)

        # Title
        font_title = FontManager.get_font(12, bold=True)
        surf_title = font_title.render(self.title.upper(), True, TEXT_MUTED)
        surface.blit(surf_title, (self.rect.x + 16, self.rect.y + 12))

        # Value
        font_val = FontManager.get_font(28, bold=True)
        surf_val = font_val.render(self.value, True, TEXT_PRIMARY)
        surface.blit(surf_val, (self.rect.x + 16, self.rect.y + 30))

        # Subtitle
        if self.subtitle:
            font_sub = FontManager.get_font(11, bold=False)
            surf_sub = font_sub.render(self.subtitle, True, TEXT_DIM)
            surface.blit(surf_sub, (self.rect.x + 16, self.rect.y + 68))


class ProgressBar:
    @staticmethod
    def draw(
        surface: pygame.Surface,
        rect: Tuple[int, int, int, int],
        progress: float,
        fill_color: Tuple[int, int, int] = ACCENT_SKY,
        bg_color: Tuple[int, int, int] = BG_PANEL
    ) -> None:
        """Draws rounded progress bar (progress: 0.0 to 1.0)."""
        bar_rect = pygame.Rect(rect)
        pygame.draw.rect(surface, bg_color, bar_rect, border_radius=rect[3] // 2)
        
        clamped_p = max(0.0, min(1.0, progress))
        if clamped_p > 0:
            fill_w = max(rect[3], int(rect[2] * clamped_p))
            fill_rect = pygame.Rect(rect[0], rect[1], fill_w, rect[3])
            pygame.draw.rect(surface, fill_color, fill_rect, border_radius=rect[3] // 2)


class BlinkingCaret:
    def __init__(self, blink_rate: float = 0.53):
        self.blink_rate = blink_rate

    def is_visible(self) -> bool:
        return (time.time() % (self.blink_rate * 2)) < self.blink_rate

    def draw(self, surface: pygame.Surface, x: int, y: int, height: int, color: Tuple[int, int, int] = CARET_COLOR) -> None:
        if self.is_visible():
            caret_rect = pygame.Rect(x, y, 2, height)
            pygame.draw.rect(surface, color, caret_rect, border_radius=1)
