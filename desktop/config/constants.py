"""
Application Constants for KeyWarp Desktop.
Defines window dimensions, color palettes, and UI state constants.
"""

# Window Configuration
WINDOW_WIDTH = 1200
WINDOW_HEIGHT = 800
MIN_WIDTH = 950
MIN_HEIGHT = 650
FPS = 60
WINDOW_TITLE = "KeyWarp Desktop - Typing Speed Test & Analytics"

# Color Palette (Dark Theme matching KeyWarp Web)
BG_MAIN = (15, 23, 42)        # Deep slate background (#0f172a)
BG_PANEL = (30, 41, 59)      # Container background (#1e293b)
BG_CARD = (51, 65, 85)       # Card & component surface (#334155)
BG_INPUT = (15, 23, 42)      # Inner input surface

TEXT_PRIMARY = (248, 250, 252)   # High-contrast white/slate (#f8fafc)
TEXT_MUTED = (148, 163, 184)     # Medium contrast (#94a3b8)
TEXT_DIM = (100, 116, 139)       # Subtle helper text (#64748b)

ACCENT_CYAN = (56, 189, 248)     # Primary accent sky/cyan (#38bdf8)
ACCENT_PURPLE = (168, 85, 247)   # Secondary accent purple (#a855f7)
COLOR_CORRECT = (34, 197, 94)    # Correct character green (#22c55e)
COLOR_ERROR = (248, 113, 113)     # Mistake light coral red (#f87171) for crisp legibility
COLOR_ERROR_BG = (65, 20, 25)     # Subtle mistake dark-tint background
COLOR_ERROR_LINE = (239, 68, 68)  # Crisp error underline red (#ef4444)
BORDER_COLOR = (71, 85, 105)     # Subtle borders (#475569)
BORDER_ACTIVE = (56, 189, 248)   # Highlight border

# App States
STATE_MENU = "menu"
STATE_TYPING = "typing"
STATE_RESULTS = "results"
STATE_HISTORY = "history"

# Test Modes & Difficulties
MODE_PASSAGE = "Passage"
MODE_SPRINT = "Sprint (60s)"

DIFF_EASY = "Easy"
DIFF_MEDIUM = "Medium"
DIFF_HARD = "Hard"
DIFF_CODE = "Code"
DIFF_QUOTES = "Quotes"
