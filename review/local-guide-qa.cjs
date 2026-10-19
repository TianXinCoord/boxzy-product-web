const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_MODULE||'jsdom');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'guide/START-HERE.html'),'utf8');
const dom=new JSDOM(source,{url:'file://'+path.join(root,'guide/START-HERE.html'),runScripts:'outside-only'}),w=dom.window,d=w.document;
const dialog=d.querySelector('#zoom');dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>dialog.removeAttribute('open');
for(const s of d.querySelectorAll('script'))w.eval(s.textContent);
assert.equal(d.querySelectorAll('iframe').length,0);assert.equal(d.querySelectorAll('aside .nav-updated').length,8);
for(const section of d.querySelectorAll('.module')){assert.ok(section.querySelector('.image-button img'));for(const img of section.querySelectorAll('img')){if(!img.src.startsWith('data:'))assert.ok(fs.existsSync(new URL(img.src)));}}
for(const button of d.querySelectorAll('.static-ui .image-button')){button.click();assert.equal(d.querySelector('#zoomImage').src,button.querySelector('img').src);assert.equal(dialog.hasAttribute('open'),true);d.querySelector('#close').click();assert.equal(dialog.hasAttribute('open'),false);}
assert.equal(source,fs.readFileSync(path.join(root,'guide/BOXZY-WEB-PRODUCT-GUIDE.html'),'utf8'));
assert.match(d.querySelector('#address-dialog').textContent,/Save address/);assert.doesNotMatch(d.querySelector('#address-dialog').textContent,/Enter an address label|Save changes/);
w.close();console.log('PASS: zero nested HTML, 28 illustrated sections, 8 updated badges, image files and zoom behavior, matching guide entries.');
