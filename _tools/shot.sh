#!/usr/bin/env bash
# usage: shot.sh <version-dir> <width> <height> <anchor...>
# Saves _tools/shots/<version>-<anchor>-<width>.png
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
v=$1; w=$2; h=$3; shift 3
for a in "$@"; do
  out="D:/Claude/落地页/_tools/shots/${v}-${a}-${w}.png"
  hash=""; [ "$a" != "top" ] && hash="#$a"
  "$CHROME" --headless=new --hide-scrollbars --window-size=$w,$h --virtual-time-budget=5000 \
    --screenshot="$out" "http://localhost:5173/${v}/${hash}" >/dev/null 2>&1
  echo "$out"
done
