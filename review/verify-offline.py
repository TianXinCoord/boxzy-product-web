"""Validate the two sibling delivery folders; does not invoke a browser."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re, json
WEB = Path(__file__).resolve().parents[1]
GUIDE = WEB.parent / 'boxzy-product-web-guide'
assert GUIDE.is_dir(), 'Place boxzy-product-web-guide beside boxzy-product-web'
roots = [WEB, GUIDE]
missing, outside, remote = [], [], set()
checked = 0

def check(file, value):
 global checked
 if not value or value.startswith(('#', 'data:', 'mailto:', 'tel:', 'javascript:')): return
 u = urlsplit(value)
 if u.scheme in ('https', 'http'):
  remote.add(value); return
 if not u.path: return
 target = (file.parent / unquote(u.path)).resolve()
 checked += 1
 if not any(target.is_relative_to(r) for r in roots): outside.append([str(file), value])
 if not target.exists(): missing.append([str(file), value])

class Refs(HTMLParser):
 def handle_starttag(self, tag, attrs):
  if tag not in ('a', 'img', 'iframe', 'link', 'script', 'video', 'source'): return
  a = dict(attrs)
  for key in ('src', 'href', 'poster'):
   if key in a: check(self.path, a[key])

for root in roots:
 for p in root.rglob('*.html'):
  if '.git' in p.parts: continue
  parser = Refs(); parser.path = p; parser.feed(p.read_text())
 for p in (root / 'assets').rglob('*.css'):
  for s in re.findall(r'''url\(["']?([^)'"\s]+)''', p.read_text()): check(p, s)
# JS and inline asset literals resolve relative to their HTML document.
for p in list((WEB / 'assets').rglob('*.js')) + list(WEB.glob('*.html')):
 for s in re.findall(r'''["'](assets/[^"'`\s<>]+)["']''', p.read_text()):
  if '${' not in s: check(WEB / 'index.html', s)
for rank in (1, 2, 3): check(WEB / 'index.html', f'assets/boxzy/rank-medal-{rank}.png')
html = (GUIDE / 'START-HERE.html').read_text()
assert html == (GUIDE / 'BOXZY-WEB-PRODUCT-GUIDE.html').read_text()
assert html.count('<iframe ') == 36
for row in json.loads((GUIDE / 'implementation.json').read_text()):
 for key in ('current_preview', 'historical_image'):
  s = row.get(key)
  if s and not s.startswith('deliverables/'): check(GUIDE / 'implementation.json', s)
report = {'localReferencesChecked': checked, 'missing': missing, 'outsideDelivery': outside,
          'guideCurrentPreviews': 36, 'guideCopiesIdentical': True, 'browserVisualVerified': False}
print(json.dumps(report, ensure_ascii=False, indent=2))
assert not missing and not outside
