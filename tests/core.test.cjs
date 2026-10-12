const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');

test('pixel width always applies and old effective backgrounds are retained', () => {
  assert.equal(C.preferences().directClick,false);
  assert.equal(C.preferences({minWidth:64}).minWidth,64);
  assert.equal(C.preferences({minWidth:-10}).minWidth,1);
  assert.equal(C.preferences({minWidth:Infinity}).minWidth,160);
  assert.equal(C.preferences({minWidth:1e7}).minWidth,1000000);
  assert.equal(C.preferences({allImages:true,backgroundImages:false}).backgroundImages,true);
  assert.equal(C.preferences({allImages:false,backgroundImages:false}).backgroundImages,false);
  assert.equal(C.preferences({hideLogos:false}).hideLogos,false);
  assert.equal(C.preferences(null).hideAds,true);
  assert.equal('allImages' in C.preferences(),false);
});

test('width uses intrinsic pixels without banning tall or narrow pictures',()=>{
  assert.equal(C.eligible({width:40,height:40,naturalWidth:1200,naturalHeight:1200},600),true);
  assert.equal(C.eligible({width:600,height:400,naturalWidth:96,naturalHeight:64},160),false);
  assert.equal(C.eligible({width:80,height:2000,naturalWidth:1200,naturalHeight:30000},1000),true);
  for(const value of [{width:0,height:100},{width:100,height:100,naturalWidth:0},{width:100,height:100,naturalHeight:0},{width:Infinity,height:100}])assert.equal(C.eligible(value,1),false);
});

test('hide choices use distinct clues and avoid ordinary names and comic shapes',()=>{
  const defaults=C.preferences();
  assert.equal(C.filtered({own:'siteLogo',source:'https://example.com/random.png'},defaults),true);
  assert.equal(C.filtered({label:'Acme logo'},defaults),true);
  assert.equal(C.filtered({logoContext:'brand-logo'},defaults),true);
  assert.equal(C.filtered({source:'https://example.com/assets/logo2.svg?signature=ad'},defaults),true);
  assert.equal(C.filtered({context:'adContainer'},defaults),true);
  assert.equal(C.filtered({adMarked:true},defaults),true);
  assert.equal(C.filtered({own:'thumbnail-large'},defaults),true);
  assert.equal(C.filtered({thumbnailHint:true},defaults),true);
  assert.equal(C.filtered({own:'header',context:'reader loaded adventure',label:'News about ads',source:'https://example.com/comic/page-2.png'},defaults),false);
  assert.equal(C.filtered({source:'data:image/png;base64,logo'},defaults),false);
  assert.equal(C.filtered({own:'site-logo',thumbnailHint:true},C.preferences({hideLogos:false})),false);
  assert.equal(C.filtered({context:'advertisement'},C.preferences({hideAds:false})),false);
  assert.equal(C.filtered({own:'thumb'},C.preferences({hideThumbnails:false})),false);
});

test('zoom keeps the pointer anchor in both directions without preset limits',()=>{
  const view={scale:1.25,x:80,y:-30},point={x:140,y:90};
  for(const scale of [.001,.5,2.5,1e6]){
    const result=C.zoomAt(view,scale,point);
    assert.equal(result.scale,scale);
    assert.ok(Math.abs((point.x-view.x)/view.scale-(point.x-result.x)/result.scale)<1e-8);
    assert.ok(Math.abs((point.y-view.y)/view.scale-(point.y-result.y)/result.scale)<1e-8);
  }
  for(const scale of [0,-1,Infinity,NaN])assert.deepEqual(C.zoomAt(view,scale,point),view);
  assert.deepEqual(C.zoomAt({scale:1,x:-1e308,y:0},10,{x:1e308,y:0}),{scale:1,x:-1e308,y:0});
  assert.equal(C.formatZoom(.0025),'0.25%');
});

test('source rejects executable and restricted protocols',()=>{
  assert.equal(C.safeSource('/image.jpg','https://example.com/article'),'https://example.com/image.jpg');
  for(const url of ['javascript:alert(1)','file:///secret','moz-extension://id/file','about:config'])assert.equal(C.safeSource(url),null);
});

test('background URLs support layers, gradients, escapes and safe protocols',()=>{
  const base='https://example.com/pages/comic';
  assert.deepEqual(C.backgroundSources('linear-gradient(red,blue),url("/a.gif"),url(../b.webp),url("/a.gif")',base),['https://example.com/a.gif','https://example.com/b.webp']);
  assert.deepEqual(C.backgroundSources('url("/comic\\20 page.png"),url("javascript:alert(1)"),url("")',base),['https://example.com/comic%20page.png']);
  assert.deepEqual(C.backgroundSources('none',base),[]);
});
