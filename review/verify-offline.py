"""Validate local Web assets and the mixed online/offline guide without a browser."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re, json
ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / 'guide'
missing, outside = [], []
checked = 0

def check(file, value):
 global checked
 if not value or value.startswith(('#','data:','mailto:','tel:','javascript:')): return
 u = urlsplit(value)
 if u.scheme in ('https','http'): return
 if not u.path: return
 target = (file.parent / unquote(u.path)).resolve()
 checked += 1
 if not target.is_relative_to(ROOT): outside.append([str(file.relative_to(ROOT)),value])
 if not target.exists(): missing.append([str(file.relative_to(ROOT)),value])

class Refs(HTMLParser):
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ('a','img','iframe','link','script','video','source'):
   for key in ('src','href','poster'):
    if key in a: check(self.path,a[key])
  if tag=='meta' and a.get('http-equiv','').lower()=='refresh':
   m=re.search(r'url\s*=\s*(.*)',a.get('content',''),re.I)
   if m: check(self.path,m.group(1).strip())
for p in ROOT.rglob('*.html'):
 if '.git' in p.parts: continue
 parser=Refs();parser.path=p;parser.feed(p.read_text())
for p in (ROOT/'assets').rglob('*.css'):
 for s in re.findall(r'''url\(["']?([^)'"\s]+)''',p.read_text()):check(p,s)
for p in list((ROOT/'assets').rglob('*.js'))+list(ROOT.glob('*.html')):
 for s in re.findall(r'''["'](assets/[^"'`\s<>]+)["']''',p.read_text()):
  if '${' not in s:check(ROOT/'index.html',s)
for rank in (1,2,3):check(ROOT/'index.html',f'assets/boxzy/rank-medal-{rank}.png')
html=(GUIDE/'START-HERE.html').read_text()
assert html==(GUIDE/'BOXZY-WEB-PRODUCT-GUIDE.html').read_text()
assert html.count('<iframe ')==0
assert len(re.findall(r'<section id=',html))==28
assert html.count('class="nav-updated"')==8
assert '../boxzy-product-web/' not in html
for row in json.loads((GUIDE/'implementation.json').read_text()):
 for key in ('current_preview','historical_image'):
  s=row.get(key)
  if s and not s.startswith('deliverables/'):check(GUIDE/'implementation.json',s)
report={'localReferencesChecked':checked,'missing':missing,'outsideRepository':outside,'guideCurrentPreviews':0,'localHtmlPreviews':0,'onlineHtmlPreviews':0,'guideSections':28,'onlinePreviewsRequireNetwork':False,'guideCopiesIdentical':True,'browserVisualVerified':False}
print(json.dumps(report,ensure_ascii=False,indent=2))
assert not missing and not outside
