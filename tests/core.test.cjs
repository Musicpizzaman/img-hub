const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
test('defaults preserve links and preferences are bounded', () => {
  assert.equal(C.preferences().directClick, false);
  assert.equal(C.preferences().allImages, true);
  assert.equal(C.preferences({minWidth:160,backgroundImages:false}).allImages,true);
  assert.equal(C.preferences({minWidth: -10}).minWidth, 80);
  assert.equal(C.preferences({minWidth: Infinity}).minWidth, 160);
  assert.equal(C.preferences({minWidth: 9999}).minWidth, 2000);
});
test('optional width filtering keeps logos, banners and tall pages', () => {
  assert.equal(C.eligible({width: 600, height: 400}, 160), true);
  for (const value of [{width: 32, height: 32}, {width: 600, height: 400, naturalWidth: 0}]) assert.equal(C.eligible(value, 160), false);
  assert.equal(C.eligible({width: 600, height: 400, metadata: 'site-logo.png'}, 160), true);
  assert.equal(C.eligible({width:1000,height:90},160),true);
  assert.equal(C.eligible({width:80,height:2000},0),true);
  assert.equal(C.eligible({width:1,height:1},0),true);
  assert.equal(C.eligible({width:0,height:100},0),false);
  assert.equal(C.eligible({width:100,height:100,naturalHeight:0},0),false);
  assert.equal(C.eligible({width:Infinity,height:100},0),false);
});
test('zoom preserves the image coordinate under the pointer', () => {
  const view = {scale: 1.25, x: 80, y: -30}, point = {x: 140, y: 90};
  const result = C.zoomAt(view, 2.5, point);
  assert.equal((point.x - view.x) / view.scale, (point.x - result.x) / result.scale);
  assert.equal((point.y - view.y) / view.scale, (point.y - result.y) / result.scale);
  assert.deepEqual(C.zoomAt(result, 1.25, point), view);
  assert.equal(C.zoomAt(view, 1000, point).scale, 1000);
});
test('zoom has a 100% floor and no preset upper limit', () => {
  const view = {scale: 1, x: 70, y: -30}, point = {x: 140, y: 90};
  assert.deepEqual(C.zoomAt(view, .001, point), view);
  assert.equal(C.zoomAt(view, 1000000, point).scale, 1000000);
  assert.deepEqual(C.zoomAt(view, Infinity, point), view);
  assert.deepEqual(C.zoomAt(view, NaN, point), view);
  const extreme = {scale: 1, x: -1e308, y: 0};
  assert.deepEqual(C.zoomAt(extreme, 10, {x: 1e308, y: 0}), extreme);
});
test('source rejects executable and privileged protocols', () => {
  assert.equal(C.safeSource('/image.jpg', 'https://example.com/article'), 'https://example.com/image.jpg');
  for (const url of ['javascript:alert(1)', 'file:///secret', 'moz-extension://id/file', 'about:config']) assert.equal(C.safeSource(url), null);
});
test('background URLs support gradients, layers, CSS escapes and safe protocols', () => {
  const base = 'https://example.com/pages/comic';
  assert.deepEqual(C.backgroundSources('linear-gradient(red,blue),url("/a.gif"),url(../b.webp),url("/a.gif")',base),['https://example.com/a.gif','https://example.com/b.webp']);
  assert.deepEqual(C.backgroundSources('url("/comic\\20 page.png"), url("javascript:alert(1)"), url("")',base),['https://example.com/comic%20page.png']);
  assert.deepEqual(C.backgroundSources('none',base),[]);
});
