# -*- coding: utf-8 -*-
"""Revert the simplified light-mode block from skin.css (lines between the
'Light mode: a soft daylight' comment and the last light rule)."""
import re

path = r'C:\Users\USER\Documents\Codex\2026-08-14\deepseek-harness\dsh-skin-digital-arcade\skin.css'
with open(path, 'r', encoding='utf-8') as f:
    css = f.read()

marker = '/* \u2500\u2500 Light mode: a soft daylight version of the console'
idx = css.find(marker)
if idx == -1:
    print('marker not found; nothing to revert')
    raise SystemExit(0)

# Find the end: the last '}' before the next dark-theme block or EOF,
# specifically after the final light rule (button hover drop-shadow).
tail_marker = "body:not([data-ds-dark-theme]) :is(button, [role='button']):not(:disabled):hover {"
tail_idx = css.find(tail_marker, idx)
if tail_idx == -1:
    print('tail marker not found; aborting without change')
    raise SystemExit(1)
# end of that rule: next '}'
end = css.find('}', tail_idx)
if end == -1:
    print('no closing brace; aborting')
    raise SystemExit(1)
end += 1  # include the '}'

removed = css[idx:end]
css = css[:idx] + css[end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(css)

print(f'removed {len(removed)} chars, {removed.count(chr(10))} lines')
print('light block count now:', css.count('Light mode'))
