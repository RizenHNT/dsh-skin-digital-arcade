# -*- coding: utf-8 -*-
"""Generate skin.css from the Harness personal theme.

The skin's stylesheet is the Harness personal theme with its asset paths
rewritten to this package's own route:

1. /fonts/ -> /skin-assets/fonts/
2. /assets/*.png -> /skin-assets/*.webp (the skin ships the sprites as webp)

Usage:
    python tools/gen-skin-css.py [path/to/harness/checkout]

The Harness checkout defaults to the path this skin is developed beside; pass it
explicitly (or set DSH_HARNESS_ROOT) when working elsewhere.
"""
import os
import re
import sys

DEFAULT_HARNESS = r'C:\Users\USER\Documents\Codex\2026-08-14\deepseek-harness'

harness = os.path.abspath(
    sys.argv[1] if len(sys.argv) > 1 else os.environ.get('DSH_HARNESS_ROOT', DEFAULT_HARNESS)
)
skin = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

src = os.path.join(harness, 'packages', 'client', 'ui-theme', 'src', 'styles', 'personal.css')
out = os.path.join(skin, 'skin.css')

if not os.path.isfile(src):
    sys.stderr.write('gen-skin-css: cannot read the Harness theme:\n  %s\n' % src)
    sys.stderr.write('Pass the Harness checkout path: python tools/gen-skin-css.py <harness-root>\n')
    sys.exit(1)

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

css = css.replace('/assets/whale-workbench/', '/skin-assets/whale-workbench/').replace('/assets/vendor/', '/skin-assets/vendor/')

with open(out, 'w', encoding='utf-8') as f:
    f.write(css)

print('read:   ', src)
print('written:', out, len(css), 'chars')

# Audit: every url() reference, normalized. The /skin-assets/ route serves this
# package's own assets/ directory, so that is where each reference must resolve.
refs = set()
for m in re.finditer(r"url\(([^)]*)\)", css):
    u = m.group(1).strip().strip('"').strip("'")
    if u.startswith('/skin-assets/'):
        refs.add(u)
missing = []
for r in sorted(refs):
    on_disk = os.path.join(skin, 'assets', r[len('/skin-assets/'):])
    ok = os.path.isfile(on_disk)
    if not ok:
        missing.append(r)
    print('REF:', r, '' if ok else '  <-- MISSING ON DISK')
print('total:', len(refs), 'missing:', len(missing))
if missing:
    sys.exit(1)
