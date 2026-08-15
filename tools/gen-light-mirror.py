# -*- coding: utf-8 -*-
"""Generate a light-mode mirror of the dark skin rules (regex-based)."""
import re

path = r'C:\Users\USER\Documents\Codex\2026-08-14\deepseek-harness\dsh-skin-digital-arcade\skin.css'
with open(path, 'r', encoding='utf-8') as f:
    css = f.read()

# Strip comments so braces inside comments cannot break matching.
no_comments = re.sub(r'/\*.*?\*/', '', css, flags=re.S)

# Match top-level rules whose selector contains the dark-theme attribute.
# Pattern: selector text (no braces) up to '{', then balanced-ish body to '}'.
rule_re = re.compile(r'([^{}]+)\{([^{}]*)\}')
rules = rule_re.findall(no_comments)
dark_rules = [(sel.strip(), body) for sel, body in rules if 'body[data-ds-dark-theme]' in sel]
print(f'total rules: {len(rules)}, dark rules: {len(dark_rules)}')

# Light palette remap (dark token -> daylight equivalent)
REMAP = [
    ('rgb(8, 13, 29)', 'rgb(250, 252, 255)'),
    ('rgb(12, 19, 40)', 'rgb(238, 244, 252)'),
    ('rgb(17, 26, 52)', 'rgb(230, 238, 249)'),
    ('rgb(24, 35, 68)', 'rgb(220, 231, 246)'),
    ('rgb(29, 42, 78)', 'rgb(214, 227, 244)'),
    ('rgb(14, 22, 46)', 'rgb(233, 240, 250)'),
    ('rgb(8, 14, 31)', 'rgb(244, 248, 253)'),
    ('rgb(14, 23, 47)', 'rgb(240, 246, 253)'),
    ('rgb(9, 16, 35)', 'rgb(252, 254, 255)'),
    ('rgb(17, 27, 55)', 'rgb(236, 242, 250)'),
    ('rgb(8, 14, 30)', 'rgb(235, 241, 250)'),
    ('rgb(12, 20, 42)', 'rgb(238, 243, 251)'),
    ('rgb(42, 42, 85)', 'rgb(226, 233, 246)'),
    ('rgb(19, 31, 61)', 'rgb(222, 232, 246)'),
    ('rgb(237, 245, 255)', 'rgb(38, 52, 82)'),
    ('rgb(170, 187, 216)', 'rgb(88, 106, 140)'),
    ('rgb(126, 145, 178)', 'rgb(120, 138, 168)'),
    ('rgba(8, 13, 29, 0.88)', 'rgba(250, 252, 255, 0.88)'),
    ('rgba(8, 13, 29, 0.9)', 'rgba(250, 252, 255, 0.9)'),
    ('rgba(9, 16, 35, 0.98)', 'rgba(252, 254, 255, 0.98)'),
    ('rgba(8, 14, 31, 0.96)', 'rgba(244, 248, 253, 0.96)'),
    ('rgba(12, 19, 40, 0.96)', 'rgba(238, 244, 252, 0.96)'),
    ('rgba(10, 16, 35, 0.99)', 'rgba(252, 254, 255, 0.99)'),
    ('rgba(14, 22, 46, 0.96)', 'rgba(233, 240, 250, 0.96)'),
    ('rgba(8, 18, 40, 0.88)', 'rgba(244, 248, 253, 0.88)'),
    ('rgba(14, 22, 47, 0.66)', 'rgba(240, 246, 253, 0.66)'),
    ('rgba(8, 17, 37, 0.94)', 'rgba(244, 248, 253, 0.94)'),
    ('rgba(18, 25, 56, 0.78)', 'rgba(233, 240, 250, 0.78)'),
    ('rgba(16, 21, 44, 0.18)', 'rgba(230, 238, 249, 0.18)'),
    ('rgba(32, 19, 52, 0.1)', 'rgba(226, 220, 240, 0.1)'),
    ('rgba(25, 17, 48, 0.74)', 'rgba(236, 230, 245, 0.74)'),
    ('rgba(15, 22, 46, 0.6)', 'rgba(233, 240, 250, 0.6)'),
    ('rgba(12, 25, 46, 0.34)', 'rgba(233, 240, 250, 0.34)'),
    ('rgba(12, 25, 46, 0.06)', 'rgba(233, 240, 250, 0.06)'),
    ('rgba(23, 35, 74, 0.96)', 'rgba(226, 233, 246, 0.96)'),
    ('rgba(14, 22, 47, 0.96)', 'rgba(240, 246, 253, 0.96)'),
    ('rgba(124, 231, 255, 0.13)', 'rgba(42, 127, 212, 0.14)'),
    ('rgba(124, 231, 255, 0.22)', 'rgba(42, 127, 212, 0.22)'),
    ('rgba(167, 139, 250, 0.34)', 'rgba(110, 80, 200, 0.3)'),
    ('rgba(182, 244, 255, 0.48)', 'rgba(42, 127, 212, 0.4)'),
    ('rgba(124, 231, 255, 0.08)', 'rgba(42, 127, 212, 0.08)'),
    ('rgba(124, 231, 255, 0.14)', 'rgba(42, 127, 212, 0.14)'),
    ('rgba(167, 139, 250, 0.2)', 'rgba(110, 80, 200, 0.18)'),
    ('rgba(124, 231, 255, 0.035)', 'rgba(42, 127, 212, 0.05)'),
    ('rgba(124, 231, 255, 0.026)', 'rgba(42, 127, 212, 0.04)'),
    ('rgba(124, 231, 255, 0.045)', 'rgba(42, 127, 212, 0.05)'),
    ('rgba(124, 231, 255, 0.16)', 'rgba(42, 127, 212, 0.14)'),
    ('rgba(124, 231, 255, 0.3)', 'rgba(42, 127, 212, 0.26)'),
    ('rgba(124, 231, 255, 0.36)', 'rgba(42, 127, 212, 0.3)'),
    ('rgba(124, 231, 255, 0.28)', 'rgba(42, 127, 212, 0.24)'),
    ('rgba(124, 231, 255, 0.58)', 'rgba(42, 127, 212, 0.5)'),
    ('rgba(124, 231, 255, 0.52)', 'rgba(42, 127, 212, 0.44)'),
    ('rgba(91, 140, 255, 0.08)', 'rgba(42, 127, 212, 0.08)'),
    ('rgba(91, 140, 255, 0.1)', 'rgba(42, 127, 212, 0.1)'),
    ('rgba(91, 140, 255, 0.18)', 'rgba(42, 127, 212, 0.16)'),
    ('rgba(91, 140, 255, 0.14)', 'rgba(42, 127, 212, 0.14)'),
    ('rgba(91, 140, 255, 0.12)', 'rgba(42, 127, 212, 0.12)'),
    ('rgba(91, 140, 255, 0.16)', 'rgba(42, 127, 212, 0.14)'),
    ('rgba(91, 140, 255, 0.28)', 'rgba(42, 127, 212, 0.24)'),
    ('rgba(210, 140, 255, 0.13)', 'rgba(110, 80, 200, 0.12)'),
    ('rgba(210, 140, 255, 0.24)', 'rgba(110, 80, 200, 0.2)'),
    ('rgba(210, 140, 255, 0.08)', 'rgba(110, 80, 200, 0.08)'),
    ('rgba(111, 255, 224, 0.09)', 'rgba(30, 160, 140, 0.1)'),
    ('rgba(111, 255, 224, 0.022)', 'rgba(30, 160, 140, 0.03)'),
    ('rgba(255, 98, 189, 0.12)', 'rgba(210, 50, 140, 0.1)'),
    ('rgba(255, 98, 189, 0.16)', 'rgba(210, 50, 140, 0.14)'),
    ('rgba(255, 195, 107, 0.11)', 'rgba(190, 130, 40, 0.12)'),
    ('rgba(240, 183, 102, 0.36)', 'rgba(190, 130, 40, 0.4)'),
    ('rgba(240, 183, 102, 0.72)', 'rgba(190, 130, 40, 0.7)'),
    ('rgba(240, 183, 102, 0.9)', 'rgba(190, 130, 40, 0.85)'),
    ('rgba(255, 195, 107, 0.92)', 'rgba(190, 130, 40, 0.9)'),
    ('rgba(255, 195, 107, 0.78)', 'rgba(190, 130, 40, 0.78)'),
    ('rgba(255, 195, 107, 0.72)', 'rgba(190, 130, 40, 0.7)'),
    ('rgba(182, 244, 255, 0.82)', 'rgba(38, 110, 180, 0.8)'),
    ('rgba(182, 244, 255, 0.68)', 'rgba(42, 127, 212, 0.6)'),
    ('rgba(164, 210, 238, 0.88)', 'rgba(42, 110, 180, 0.85)'),
    ('rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.12)'),
    ('rgba(0, 0, 0, 0.42)', 'rgba(0, 0, 0, 0.14)'),
    ('rgba(0, 0, 0, 0.28)', 'rgba(0, 0, 0, 0.1)'),
    ('rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.2)'),
]

def remap(text):
    for old, new in REMAP:
        text = text.replace(old, new)
    return text

light_rules = []
for sel, body in dark_rules:
    light_sel = sel.replace('body[data-ds-dark-theme]', 'body:not([data-ds-dark-theme])')
    light_rules.append(f'{light_sel} {{{remap(body)}}}')

header = (
    '\n\n/* \u2500\u2500 LIGHT MIRROR (auto-generated): dark rules cloned with\n'
    '   selector switched to body:not([data-ds-dark-theme]) and colors remapped\n'
    '   for pale surfaces. Regenerate with tools/gen-light-mirror.py. */\n'
)
with open(path, 'a', encoding='utf-8') as f:
    f.write(header)
    f.write('\n'.join(light_rules))
    f.write('\n')

print(f'appended {len(light_rules)} light rules')
