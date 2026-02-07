#!/bin/bash
# KOSMOS Toolkit - Claude Code Statusline
# Shows: Model | Context usage (bar) | Git branch | Cost

input=$(cat)

# Parse JSON input
MODEL=$(echo "$input" | jq -r '.model.display_name // "Claude"')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')

# Build progress bar (10 chars)
if [ "$PCT" -lt 50 ]; then
    COLOR='\033[32m' # Green
elif [ "$PCT" -lt 75 ]; then
    COLOR='\033[33m' # Yellow
else
    COLOR='\033[31m' # Red
fi
RESET='\033[0m'

FILLED=$((PCT / 10))
EMPTY=$((10 - FILLED))
BAR=$(printf "%${FILLED}s" | tr ' ' '#')$(printf "%${EMPTY}s" | tr ' ' '-')

# Get git branch
BRANCH=""
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
fi

# Format cost
COST_FMT=$(printf '$%.2f' "$COST")

# Output
if [ -n "$BRANCH" ]; then
    echo -e "[$MODEL] ${COLOR}[$BAR]${RESET} $PCT% | $BRANCH | $COST_FMT"
else
    echo -e "[$MODEL] ${COLOR}[$BAR]${RESET} $PCT% | $COST_FMT"
fi
