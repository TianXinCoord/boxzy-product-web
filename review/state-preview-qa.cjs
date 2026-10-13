const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('boxzy-interactive.html');
const start=html.indexOf('function renderOpeningResultState('),end=html.indexOf('function leavePendingOpening(',start);
const fn=html.slice(start,end);
function render(state){
 const nodes=new Map();
 const el=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',hidden:false,disabled:false,href:'',focus(){}});return nodes.get(id)};
 const stage={dataset:{},classList:{contains:()=>true},setAttribute(){}};
 const ctx={boxExperience:{classList:{contains:()=>true}},resultLoadingStage:stage,document:{getElementById:el,querySelector:el},setExperienceStage(){},BoxzyCatalog:{route:s=>s},encodeURIComponent,requestAnimationFrame:f=>f()};
 vm.runInNewContext(fn+';renderOpeningResultState({state:'+JSON.stringify(state)+',openingId:"qa"})',ctx);
 return {el,stage};
}
for(const state of ['failed','updating']){
 const r=render(state);
 assert.match(r.el('resultStatusIcon').innerHTML,/<svg/);
 assert.equal(r.el('leaveOpeningResult').textContent,'Back to My Collection');
 assert.equal(r.el('leaveOpeningResult').hidden,false);
 assert.equal(r.el('retryOpeningResult').hidden,true);
}
assert.equal(render('failed').el('resultStatusTitle').textContent,'Unable to open your box');
assert.match(render('updating').el('resultStatusMessage').textContent,/Your box will stay in My Collection/);
const loading=render('loading');
assert.equal(loading.el('leaveOpeningResult').hidden,true);
assert.equal(loading.el('retryOpeningResult').hidden,true);
assert.equal(loading.el('resultStatusMessage').hidden,true);
const guide=read('guide/START-HERE.html');
assert.ok(guide.includes('boxzy-collection.html?preview=demo&amp;empty=1'));
assert.ok(!guide.includes('boxzy-collection.html?preview=clean&amp;empty=1'));
assert.equal(guide,read('guide/BOXZY-WEB-PRODUCT-GUIDE.html'));
const map=new Map();
const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
const ctx={window:{sessionStorage:storage,localStorage:{getItem(){throw Error('Must not use real storage')}}},location:{search:'?preview=demo&empty=1&guide=doc-collection-empty-v4'},URLSearchParams,document:{addEventListener(){}}};
Object.defineProperty(ctx,'BoxzyStorage',{get:()=>ctx.window.BoxzyStorage});
vm.runInNewContext(read('assets/boxzy/catalog.js'),ctx);
assert.equal(ctx.BoxzyStorage.getItem('boxzyAuthenticated'),'true');
assert.ok([...map.keys()].every(k=>k.startsWith('boxzy-preview-demo:doc-collection-empty-v4:')));
console.log('PASS: authenticated isolated empty preview; failed/updating icons and actions; loading hides actions; guide entries match.');
