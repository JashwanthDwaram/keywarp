"""
Constants and UI theme definition for Typing Speed Test Game.
Inspired by modern dark mode UI design systems (slate + indigo/emerald/rose accents).
"""

WINDOW_WIDTH = 1100
WINDOW_HEIGHT = 720
FPS = 60
WINDOW_TITLE = "TypePulse - Real-time Typing Speed Test & Analytics"

# Color Palette (RGB)
BG_MAIN = (15, 23, 42)          # Slate 900
BG_PANEL = (30, 41, 59)         # Slate 800
BG_PANEL_ALT = (23, 32, 48)     # Slate 850
BG_CARD = (30, 41, 59)          # Card background
BG_CARD_HOVER = (39, 52, 73)    # Hover state for card
BG_INPUT_BOX = (15, 23, 42)     # Deep input container
BORDER_SUBTLE = (51, 65, 85)    # Slate 700
BORDER_ACTIVE = (99, 102, 241)  # Indigo 500
BORDER_HIGHLIGHT = (56, 189, 248) # Sky 400

# Typography Colors
TEXT_PRIMARY = (248, 250, 252)   # Slate 50
TEXT_SECONDARY = (203, 213, 225) # Slate 300
TEXT_MUTED = (148, 163, 184)     # Slate 400
TEXT_DIM = (71, 85, 105)         # Slate 600

# Functional Status Colors
ACCENT_INDIGO = (99, 102, 241)   # Indigo 500
ACCENT_INDIGO_HOVER = (129, 140, 248)
ACCENT_SKY = (56, 189, 248)      # Sky 400
ACCENT_PURPLE = (168, 85, 247)   # Purple 500

# Typing Feedback Colors
CHAR_CORRECT = (52, 211, 153)    # Emerald 400
CHAR_CORRECT_BG = (6, 78, 59, 80)# Dark Emerald highlight
CHAR_INCORRECT = (248, 113, 113) # Red 400
CHAR_INCORRECT_BG = (153, 27, 27)# Deep Red highlight
CHAR_PENDING = (100, 116, 139)   # Slate 500 (upcoming)
CARET_COLOR = (56, 189, 248)     # Glowing Sky Caret

# Badges & Accents
SUCCESS = (16, 185, 129)
WARNING = (245, 158, 11)
ERROR = (239, 68, 68)

# Application States
STATE_MENU = "MENU"
STATE_TYPING = "TYPING"
STATE_SPRINT = "SPRINT"
STATE_RESULTS = "RESULTS"
STATE_HISTORY = "HISTORY"
STATE_ANALYTICS = "ANALYTICS"

# Difficulty Levels
DIFF_EASY = "Easy"
DIFF_MEDIUM = "Medium"
DIFF_HARD = "Hard"
DIFF_CODE = "Code"
DIFF_QUOTES = "Quotes"

# CSV Data File Path
CSV_FILE_PATH = "data/typing_history.csv"
PASSAGES_FILE_PATH = "data/passages.json"
WORDS_FILE_PATH = "data/words.txt"
