"""
Sound Engine Module for KeyWarp Desktop.
Provides procedural acoustic feedback for key clicks, mistakes, and completions.
Gracefully handles missing audio hardware without crashing.
"""

import math
import struct
import pygame


class SoundEngine:
    _instance = None

    def __init__(self, enabled: bool = True):
        self.enabled = enabled
        self.initialized = False
        self.click_sound = None
        self.error_sound = None
        self.success_sound = None

        self._init_mixer()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = SoundEngine()
        return cls._instance

    def _init_mixer(self) -> None:
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=44100, size=-16, channels=1, buffer=512)
            self._generate_sounds()
            self.initialized = True
        except Exception as e:
            # Running on a system without audio drivers; continue silently
            self.initialized = False

    def _generate_sine_sound(self, freq: float, duration_ms: int, volume: float = 0.2) -> pygame.mixer.Sound:
        sample_rate = 44100
        n_samples = int(sample_rate * (duration_ms / 1000.0))
        buf = bytearray()
        for i in range(n_samples):
            # Apply quick envelope fade-out to prevent audio pops
            envelope = 1.0 - (i / n_samples)
            sample = int(32767 * volume * envelope * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            buf.extend(struct.pack("<h", sample))
        return pygame.mixer.Sound(buffer=bytes(buf))

    def _generate_sounds(self) -> None:
        try:
            self.click_sound = self._generate_sine_sound(880, 25, volume=0.15)
            self.error_sound = self._generate_sine_sound(220, 60, volume=0.25)
            self.success_sound = self._generate_sine_sound(1200, 120, volume=0.2)
        except Exception:
            pass

    def play_click(self) -> None:
        if self.enabled and self.initialized and self.click_sound:
            try:
                self.click_sound.play()
            except Exception:
                pass

    def play_error(self) -> None:
        if self.enabled and self.initialized and self.error_sound:
            try:
                self.error_sound.play()
            except Exception:
                pass

    def play_complete(self) -> None:
        if self.enabled and self.initialized and self.success_sound:
            try:
                self.success_sound.play()
            except Exception:
                pass

    def toggle(self) -> bool:
        self.enabled = not self.enabled
        return self.enabled
