"""Check file dependencies and embedded guide images; no browser invocation."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import re,json,hashlib,base64,datetime
root=Path(__file__).resolve().parent.parent
missing=[];outside=[];remote=[];assets=set();images=0;embedded=0;html_count=0

def check(file,value,kind):
 if not value or value.startswith(('#','data:','mailto:','tel:','javascript:')):return
 u=urlparse(value)
 if u.scheme not in ('','file'):
  if kind!='href':remote.append({'file':str(file.relative_to(root)),'url':value})
  return
 dest=(Path(unquote(u.path)) if u.scheme=='file' else file.parent/unquote(u.path)).resolve()
 try:dest.relative_to(root)
 except ValueError:outside.append({'file':str(file.relative_to(root)),'reference':value});return
 if not dest.exists():missing.append({'file':str(file.relative_to(root)),'reference':value})
 elif dest.is_file():assets.add(str(dest.relative_to(root)))
class Parser(HTMLParser):
 def handle_starttag(self,tag,attrs):
  global images,embedded
  a=dict(attrs)
  for k in ['src','href','poster']:check(self.file,a.get(k,''),k)
  if tag=='img':
   images+=1
   value=a.get('src','')
   if value.startswith('data:image/'):
    raw=base64.b64decode(value.split(',',1)[1],validate=True)
    assert len(raw)>0
    embedded+=1
for f in list(root.glob('*.html'))+list((root/'guide').glob('*.html')):
 parser=Parser();parser.file=f;parser.feed(f.read_text());html_count+=1
for f in (root/'assets').rglob('*.css'):
 for value in re.findall(r'url\([\"\']?([^\)\"\']+)',f.read_text()):check(f,value,'src')
for f in list((root/'assets').rglob('*.js'))+list(root.glob('*.html')):
 for value in re.findall(r'''["'](assets/[^"'`\s<>]+)["']''',f.read_text()):
  if '${' in value:continue
  # Runtime asset literals are relative to the document, not JS file.
  check(root/'index.html',value,'src')
report={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Static offline dependency validation, not browser rendering','htmlFiles':html_count,'imageElements':images,'embeddedImagesDecoded':embedded,'localDependencies':len(assets),'missing':missing,'outsidePackage':outside,'remoteRuntimeDependencies':remote,'browserValidation':'Not performed. Browser tool rejected file:// and explicitly prohibited workarounds.'}
(root/'review/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
assert not missing and not outside and not remote,json.dumps(report,ensure_ascii=False)
manifest={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((root/'assets').rglob('*')) if p.is_file()}
(root/'review/asset-manifest.json').write_text(json.dumps({'algorithm':'sha256','files':manifest},ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
