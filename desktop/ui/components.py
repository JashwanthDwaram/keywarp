"""
UI Components Module for KeyWarp Desktop.
Provides reusable Button, MetricCard, ProgressBar, Badge, and FontManager components.
Supports dynamic scaling factors for responsive window resizing.
"""

from typing import Tuple, Optional, Dict
import pygame
from config.constants import (
    BG_CARD, BG_PANEL, BORDER_COLOR, BORDER_ACTIVE,
    TEXT_PRIMARY, TEXT_MUTED, TEXT_DIM, ACCENT_CYAN,
    COLOR_CORRECT, COLOR_ERROR
)


class FontManager:
    """Caches fonts by size and type to optimize rendering performance."""
    _cache: Dict[str, pygame.font.Font] = {}

    @classmethod
    def get_font(cls, size: int, bold: bool = False, mono: bool = False) -> pygame.font.Font:
        # Clamp font size to sane bounds
        size = max(9, min(72, size))
        key = f"{size}_{bold}_{mono}"
        if key not in cls._cache:
            font_candidates = "consolas,cascadiacode,couriernew" if mono else "segoeui,arial,helvetica"
            cls._cache[key] = pygame.font.SysFont(font_candidates, size, bold=bold)
        return cls._cache[key]


class Button:
    """Interactive button with hover states and custom variants."""
    def __init__(
        self,
        rect: Tuple[int, int, int, int],
        text: str,
        variant: str = "primary",
        font_size: int = 14
    ):
        self.rect = pygame.Rect(rect)
        self.text = text
        self.variant = variant
        self.font_size = font_size
        self.is_hovered = False

    def update(self, mouse_pos: Tuple[int, int]) -> None:
        self.is_hovered = self.rect.collidepoint(mouse_pos)

    def draw(self, surface: pygame.Surface) -> None:
        # Determine colors based on variant and hover state
        if self.variant == "primary":
            bg_color = (37, 99, 235) if not self.is_hovered else (59, 130, 246)
            border_color = ACCENT_CYAN
            text_color = (255, 255, 255)
        elif self.variant == "secondary":
            bg_color = BG_CARD if not self.is_hovered else (71, 85, 105)
            border_color = BORDER_ACTIVE if self.is_hovered else BORDER_COLOR
            text_color = TEXT_PRIMARY
        elif self.variant == "ghost":
            bg_color = (0, 0, 0, 0) if not self.is_hovered else BG_CARD
            border_color = BORDER_COLOR if self.is_hovered else (0, 0, 0, 0)
            text_color = TEXT_MUTED if not self.is_hovered else TEXT_PRIMARY
        else:
            bg_color = BG_CARD
            border_color = BORDER_COLOR
            text_color = TEXT_PRIMARY

        # Draw background and border
        border_radius = max(6, int(self.rect.height * 0.18))
        if bg_color != (0, 0, 0, 0):
            pygame.draw.rect(surface, bg_color, self.rect, border_radius=border_radius)
        if border_color != (0, 0, 0, 0):
            pygame.draw.rect(surface, border_color, self.rect, width=1, border_radius=border_radius)

        # Draw button label
        font = FontManager.get_font(self.font_size, bold=True)
        text_surf = font.render(self.text, True, text_color)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)


class MetricCard:
    """Card displaying a single KPI metric (e.g., WPM, Accuracy, Time)."""
    @staticmethod
    def draw(
        surface: pygame.Surface,
        rect: Tuple[int, int, int, int],
        title: str,
        value: str,
        subtitle: str = "",
        accent_color: Tuple[int, int, int] = ACCENT_CYAN,
        scale: float = 1.0
    ) -> None:
        card_rect = pygame.Rect(rect)
        border_radius = max(6, int(10 * scale))
        pygame.draw.rect(surface, BG_CARD, card_rect, border_radius=border_radius)
        pygame.draw.rect(surface, BORDER_COLOR, card_rect, width=1, border_radius=border_radius)

        pad_x = int(16 * scale)
        # Title Label
        title_font = FontManager.get_font(max(10, int(11 * scale)), bold=True)
        title_surf = title_font.render(title.upper(), True, TEXT_MUTED)
        surface.blit(title_surf, (card_rect.x + pad_x, card_rect.y + int(10 * scale)))

        # Main Value
        val_font = FontManager.get_font(max(18, int(26 * scale)), bold=True)
        val_surf = val_font.render(value, True, accent_color)
        surface.blit(val_surf, (card_rect.x + pad_x, card_rect.y + int(28 * scale)))

        # Subtitle Helper
        if subtitle:
            sub_font = FontManager.get_font(max(9, int(11 * scale)), bold=False)
            sub_surf = sub_font.render(subtitle, True, TEXT_DIM)
            surface.blit(sub_surf, (card_rect.x + pad_x, card_rect.y + card_rect.height - int(20 * scale)))


class ProgressBar:
    """Horizontal progress bar indicating test completion percentage."""
    @staticmethod
    def draw(
        surface: pygame.Surface,
        rect: Tuple[int, int, int, int],
        progress: float,
        fill_color: Tuple[int, int, int] = ACCENT_CYAN
    ) -> None:
        bar_rect = pygame.Rect(rect)
        pygame.draw.rect(surface, (30, 41, 59), bar_rect, border_radius=4)

        clamped_progress = max(0.0, min(1.0, progress))
        fill_w = int(bar_rect.width * clamped_progress)
        if fill_w > 0:
            fill_rect = pygame.Rect(bar_rect.x, bar_rect.y, fill_w, bar_rect.height)
            pygame.draw.rect(surface, fill_color, fill_rect, border_radius=4)


class Badge:
    """Small pill badge for mode, grade, or version indicators."""
    @staticmethod
    def draw(
        surface: pygame.Surface,
        x: int,
        y: int,
        text: str,
        bg_color: Tuple[int, int, int] = ACCENT_CYAN,
        text_color: Tuple[int, int, int] = (255, 255, 255),
        font_size: int = 12,
        scale: float = 1.0
    ) -> int:
        font = FontManager.get_font(font_size, bold=True)
        text_surf = font.render(text, True, text_color)
        padding_x = max(8, int(10 * scale))
        padding_y = max(3, int(4 * scale))
        w = text_surf.get_width() + 2 * padding_x
        h = text_surf.get_height() + 2 * padding_y

        pill_rect = pygame.Rect(x, y, w, h)
        pygame.draw.rect(surface, bg_color, pill_rect, border_radius=h // 2)
        surface.blit(text_surf, (x + padding_x, y + padding_y))
        return w
