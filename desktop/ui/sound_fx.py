"""
Procedural sound effects generator for typing and results.
Uses synthesized waveform buffers with pygame.mixer.
"""

import math
import numpy as np
import pygame


class SoundManager:
    def __init__(self, enabled: bool = True):
        self.enabled = enabled
        self._key_click_sound = None
        self._error_sound = None
        self._complete_sound = None
        self._init_sounds()

    def _init_sounds(self) -> None:
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)
            
            # Procedurally synthesize click sound
            sample_rate = 44100
            
            # 1. Subtle mechanical key click (20ms burst)
            click_duration = 0.02
            click_samples = int(sample_rate * click_duration)
            click_t = np.linspace(0, click_duration, click_samples, False)
            click_wave = np.sin(2 * np.pi * 1200 * click_t) * np.exp(-click_t * 200)
            click_audio = (click_wave * 0.15 * 32767).astype(np.int16)
            click_stereo = np.column_stack((click_audio, click_audio))
            self._key_click_sound = pygame.sndarray.make_sound(click_stereo)

            # 2. Soft error beep (40ms)
            err_duration = 0.05
            err_samples = int(sample_rate * err_duration)
            err_t = np.linspace(0, err_duration, err_samples, False)
            err_wave = np.sin(2 * np.pi * 220 * err_t) * np.exp(-err_t * 60)
            err_audio = (err_wave * 0.25 * 32767).astype(np.int16)
            err_stereo = np.column_stack((err_audio, err_audio))
            self._error_sound = pygame.sndarray.make_sound(err_stereo)

            # 3. Completion chime (150ms)
            comp_duration = 0.25
            comp_samples = int(sample_rate * comp_duration)
            comp_t = np.linspace(0, comp_duration, comp_samples, False)
            comp_wave = (np.sin(2 * np.pi * 587.33 * comp_t) + np.sin(2 * np.pi * 880.0 * comp_t)) * np.exp(-comp_t * 12)
            comp_audio = (comp_wave * 0.2 * 32767).astype(np.int16)
            comp_stereo = np.column_stack((comp_audio, comp_audio))
            self._complete_sound = pygame.sndarray.make_sound(comp_stereo)
        except Exception as e:
            # Sound initialization optional
            self.enabled = False

    def toggle(self) -> bool:
        self.enabled = not self.enabled
        return self.enabled

    def play_click(self) -> None:
        if self.enabled and self._key_click_sound:
            try:
                self._key_click_sound.play()
            except Exception:
                pass

    def play_error(self) -> None:
        if self.enabled and self._error_sound:
            try:
                self._error_sound.play()
            except Exception:
                pass

    def play_complete(self) -> None:
        if self.enabled and self._complete_sound:
            try:
                self._complete_sound.play()
            except Exception:
                pass
