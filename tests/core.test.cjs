const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
test('defaults preserve links and preferences are bounded', () => {
  assert.equal(C.preferences().directClick, false);
  assert.equal(C.preferences({minWidth: -10}).minWidth, 80);
  assert.equal(C.preferences({minWidth: Infinity}).minWidth, 160);
  assert.equal(C.preferences({minWidth: 9999}).minWidth, 2000);
});
test('detection filters small, unloaded and decorative images', () => {
  assert.equal(C.eligible({width: 600, height: 400}, 160), true);
  for (const value of [{width: 32, height: 32}, {width: 600, height: 400, naturalWidth: 0}, {width: 600, height: 400, metadata: 'site-logo.png'}, {width: 1000, height: 90}]) assert.equal(C.eligible(value, 160), false);
  assert.equal(C.eligible({width: 600, height: 400, metadata: 'ecological landscape'}, 160), true);
});
test('zoom preserves the image coordinate under the pointer', () => {
  const view = {scale: .75, x: 80, y: -30}, point = {x: 140, y: 90};
  const result = C.zoomAt(view, 1.5, point);
  assert.equal((point.x - view.x) / view.scale, (point.x - result.x) / result.scale);
  assert.equal((point.y - view.y) / view.scale, (point.y - result.y) / result.scale);
  assert.deepEqual(C.zoomAt(result, .75, point), view);
  assert.equal(C.zoomAt(view, 1000, point).scale, 16);
});
test('fit scales large images without upscaling small photos', () => {
  assert.equal(C.fitScale(1200, 800, 648, 448), .5);
  assert.equal(C.fitScale(100, 100, 1000, 1000), 1);
});
test('source rejects executable and privileged protocols', () => {
  assert.equal(C.safeSource('/image.jpg', 'https://example.com/article'), 'https://example.com/image.jpg');
  for (const url of ['javascript:alert(1)', 'file:///secret', 'moz-extension://id/file', 'about:config']) assert.equal(C.safeSource(url), null);
});