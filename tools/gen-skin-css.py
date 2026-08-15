# -*- coding: utf-8 -*-
"""Generate skin.css from personal.css:
1. Rewrite /fonts/ -> /skin-assets/fonts/
2. Rewrite /assets/*.png -> /skin-assets/*.webp (assets shipped as webp)
"""
import re

src = r'C:\Users\USER\Documents\Codex\2026-08-14\deepseek-harness\packages\client\ui-theme\src\styles\personal.css'
out = r'C:\Users\USER\Documents\Codex\2026-08-14\deepseek-harness\dsh-skin-digital-arcade\skin.css'

with open(src, 'r', encoding='utf-8') as f:
    css = f.read()

# 1) Fonts: /fonts/ -> /skin-assets/fonts/
css = re.sub(r"url\('/fonts/", "url('/skin-assets/fonts/", css)
css = re.sub(r'url\("/fonts/', 'url("/skin-assets/fonts/', css)
css = re.sub(r"url\(/fonts/", "url(/skin-assets/fonts/", css)

# 2) Assets: /assets/<name>.png -> /skin-assets/<name>.webp (all quote forms)
css = re.sub(r"url\('/assets/([^']+)\.png'", r"url('/skin-assets/\1.webp'", css)
css = re.sub(r'url\("/assets/([^"]+)\.png"', r'url("/skin-assets/\1.webp"', css)
css = re.sub(r"url\(/assets/([^)]+)\.png", r"url(/skin-assets/\1.webp", css)

with open(out, 'w', encoding='utf-8') as f:
    f.write(css)

print('written:', out, len(css), 'chars')

# Audit: every url() reference, normalized
refs = set()
for m in re.finditer(r"url\(([^)]*)\)", css):
    u = m.group(1).strip().strip('"').strip("'")
    if u.startswith('/skin-assets/'):
        refs.add(u)
for r in sorted(refs):
    print('REF:', r)
print('total:', len(refs))
