const {firefox} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'test-results'), {recursive: true});
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403); return res.end();}
  fs.readFile(file, (error, data) => {
    if (error) {res.writeHead(404); return res.end();}
    const type = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type':type}); res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await firefox.launch({headless:true});
  try {
    const context = await browser.newContext({viewport:{width:1280,height:900}});
    // Test seam: inspect closed UI and mock extension storage in an ordinary Firefox tab.
    await context.addInitScript(() => {
      const attach = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function(options) {return attach.call(this, {...options, mode:'open'});};
      const listeners = [];
      let stored = {};
      window.browser = {storage:{local:{
        get: async () => ({preferences:stored.preferences}),
        set: async value => {const oldValue=stored.preferences; stored={...stored,...value}; listeners.forEach(fn=>fn({preferences:{oldValue,newValue:stored.preferences}},'local'));}
      },onChanged:{addListener:fn=>listeners.push(fn)}}};
    });
    const page = await context.newPage(), errors=[];
    page.on('pageerror', error=>errors.push(error.message));
    const base = 'http://127.0.0.1:' + server.address().port;
    const setup = async () => {
      await page.goto(base+'/tests/fixture.html');
      await page.locator('#first').evaluate(img=>img.decode());
      await page.addScriptTag({path:path.join(root,'core.js')});
      await page.addScriptTag({path:path.join(root,'content.js')});
      await page.locator('#img-hub-root').waitFor();
    };
    await setup();
    const duplicatePage = await context.newPage();
    await duplicatePage.goto(base + '/tests/fixture.html');
    await duplicatePage.addScriptTag({path:path.join(root,'core.js')});
    await duplicatePage.evaluate(async source => {
      await Promise.all([window.eval(source), window.eval(source)]);
    }, fs.readFileSync(path.join(root,'content.js'),'utf8'));
    assert.equal(await duplicatePage.locator('#img-hub-root').count(),1);
    await duplicatePage.close();
    const ui = selector => page.locator('#img-hub-root').locator(selector);
    const openFirst = async () => {
      await page.mouse.move(0,0);
      await page.locator('#first').hover();
      await ui('#view').click();
      await ui('#photo').waitFor({state:'visible'});
    };
    await page.locator('#small').hover();
    assert.equal(await ui('#hover').isVisible(), false);
    await page.locator('#logo').hover();
    assert.equal(await ui('#hover').isVisible(), false);
    await page.locator('#focus').focus();
    await openFirst();
    assert.equal(await ui('#count').innerText(),'1 / 2');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.querySelector('#img-hub-root').shadowRoot.activeElement?.id),'next');
    const initial = await ui('#photo').evaluate(image=>image.getBoundingClientRect().width);
    await ui('#original').click();
    assert.equal(await ui('#zoom').innerText(),'100%');
    assert.equal(await ui('#photo').evaluate(image=>image.getBoundingClientRect().width),1200);
    await ui('#reset').click();
    const stage = await ui('#stage').boundingBox();
    const px=stage.x+stage.width/2+100, py=stage.y+stage.height/2+70;
    const before = await ui('#photo').boundingBox();
    await page.mouse.move(px,py); await page.mouse.wheel(0,-100);
    await page.waitForFunction(width=>document.querySelector('#img-hub-root').shadowRoot.querySelector('#photo').getBoundingClientRect().width>width,initial);
    const after = await ui('#photo').boundingBox();
    assert.ok(Math.abs((px-before.x)/before.width-(px-after.x)/after.width)<.001);
    assert.ok(Math.abs((py-before.y)/before.height-(py-after.y)/after.height)<.001);
    const panBefore = await ui('#photo').boundingBox();
    await page.mouse.down(); await page.mouse.move(px+70,py+35,{steps:5}); await page.mouse.up();
    const panAfter = await ui('#photo').boundingBox();
    assert.ok(Math.abs(panAfter.x-panBefore.x-70)<1);
    // Both wheel directions preserve the mouse's image coordinate after panning,
    // including when the mouse moves to a different part of the photo.
    for (const [delta, offsetX, offsetY] of [[100, -180, -80], [-100, 220, 100]]) {
      const mouseX = stage.x + stage.width / 2 + offsetX;
      const mouseY = stage.y + stage.height / 2 + offsetY;
      const previous = await ui('#photo').boundingBox();
      assert.ok(mouseX > previous.x && mouseX < previous.x + previous.width);
      assert.ok(mouseY > previous.y && mouseY < previous.y + previous.height);
      await page.mouse.move(mouseX, mouseY);
      await page.mouse.wheel(0, delta);
      await page.waitForFunction(({width, delta}) => {
        const current = document.querySelector('#img-hub-root').shadowRoot.querySelector('#photo').getBoundingClientRect().width;
        return delta > 0 ? current < width - .5 : current > width + .5;
      }, {width: previous.width, delta});
      const current = await ui('#photo').boundingBox();
      assert.ok(Math.abs((mouseX - previous.x) / previous.width - (mouseX - current.x) / current.width) < .001, 'Horizontal image point stays under mouse');
      assert.ok(Math.abs((mouseY - previous.y) / previous.height - (mouseY - current.y) / current.height) < .001, 'Vertical image point stays under mouse');
    }
    await ui('#reset').click();
    await page.screenshot({path:path.join(root,'test-results/viewer.png')});
    await page.keyboard.press('ArrowRight');
    assert.equal(await ui('#count').innerText(),'2 / 2');
    await page.keyboard.press('Escape');
    assert.equal(await ui('dialog').isVisible(),false);
    assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'focus');
    // Default links retain their original behavior.
    await page.locator('#first').click({position:{x:200,y:100}});
    assert.ok(page.url().endsWith('#footer'));
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.locator('#add').click();
    await page.locator('#dynamic').evaluate(img=>img.decode());
    await openFirst();
    assert.equal(await ui('#count').innerText(),'1 / 3');
    await ui('#close').click();
    // Live preferences enable direct activation and backgrounds.
    await page.evaluate(()=>browser.storage.local.set({preferences:{directClick:true,hoverControls:false,backgroundImages:true,minWidth:160}}));
    await page.locator('#background').click({position:{x:200,y:100}});
    await ui('#photo').waitFor({state:'visible'});
    assert.equal(await ui('#caption').innerText(),'Background landscape');
    await ui('#close').click();
    await page.evaluate(()=>browser.storage.local.set({preferences:{directClick:false,hoverControls:true,backgroundImages:false,minWidth:160}}));
    // Outside click closes and restores page scroll and pre-existing inline styles.
    await page.evaluate(()=>{document.documentElement.style.setProperty('overflow','auto','important');window.scrollTo(0,120)});
    const scroll = await page.evaluate(()=>scrollY);
    await openFirst();
    await ui('#reset').click();
    await page.mouse.click(stage.x+4,stage.y+4);
    assert.equal(await ui('dialog').isVisible(),false);
    assert.equal(await page.evaluate(()=>scrollY),scroll);
    assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyPriority('overflow')),'important');

    // Inspect actual PNG pixels at 32x, beyond the former 16x cap.
    await page.locator('#first').evaluate(async image => {
      image.src = '/docs/logo.png';
      await image.decode();
    });
    await openFirst();
    const rasterStart = await ui('#photo').boundingBox();
    const natural = await ui('#photo').evaluate(image => ({width: image.naturalWidth, height: image.naturalHeight}));
    assert.equal(rasterStart.width, natural.width);
    assert.equal(await ui('#zoom').innerText(), '100%');
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
    await page.mouse.wheel(0, 200);
    await ui('#out').waitFor({state: 'visible'});
    assert.equal(await ui('#out').isEnabled(), false);
    assert.deepEqual(await ui('#photo').boundingBox(), rasterStart);

    const edge = await ui('#photo').evaluate(image => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let y = Math.floor(canvas.height * .4); y < canvas.height * .65; y++) {
        for (let x = Math.floor(canvas.width * .3); x < canvas.width * .7; x++) {
          const i = (y * canvas.width + x) * 4;
          if (pixels[i + 3] < 253 || pixels[i + 7] < 253) continue;
          const first = Array.from(pixels.slice(i, i + 3));
          const second = Array.from(pixels.slice(i + 4, i + 7));
          if (first.reduce((sum, color, channel) => sum + Math.abs(color - second[channel]), 0) > 80) return {x, y, first, second};
        }
      }
      throw new Error('No solid raster edge found');
    });
    const anchorX = rasterStart.x + edge.x + .5, anchorY = rasterStart.y + edge.y + .5;
    await page.mouse.move(anchorX, anchorY);
    for (let step = 0; step < 9; step++) {
      const previous = await ui('#photo').boundingBox();
      const scale = previous.width / natural.width;
      const delta = step < 8 ? -200 : -Math.log(32 / scale) / .002;
      await page.mouse.wheel(0, delta);
      await page.waitForFunction(width => document.querySelector('#img-hub-root').shadowRoot.querySelector('#photo').getBoundingClientRect().width > width + 1, previous.width);
      const current = await ui('#photo').boundingBox();
      assert.ok(Math.abs(current.x + (anchorX - previous.x) / previous.width * current.width - anchorX) < 1);
      assert.ok(Math.abs(current.y + (anchorY - previous.y) / previous.height * current.height - anchorY) < 1);
    }
    assert.ok(Math.abs((await ui('#photo').boundingBox()).width / natural.width - 32) < .001);
    assert.equal(await ui('#photo').evaluate(image => getComputedStyle(image).imageRendering), 'pixelated');
    const clip = {x: Math.floor(anchorX) - 24, y: Math.floor(anchorY) - 24, width: 96, height: 48};
    const pixelsShot = await page.screenshot({clip, path:path.join(root, 'test-results/raster-pixels.png')});
    const sampled = await page.evaluate(async ({url, points}) => {
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      return points.map(point => Array.from(context.getImageData(point.x, point.y, 1, 1).data).slice(0, 3));
    }, {url:'data:image/png;base64,' + pixelsShot.toString('base64'), points:[16, 48].flatMap(offset => [-6, 0, 6].map(dx => ({x:Math.round(anchorX - clip.x + offset + dx),y:Math.round(anchorY - clip.y + 16)})))});
    sampled.forEach((color, i) => color.forEach((channel, c) => assert.ok(Math.abs(channel - (i < 3 ? edge.first : edge.second)[c]) <= 3, JSON.stringify({expected: i < 3 ? edge.first : edge.second, actual: color, sample:i}))));
    await ui('#reset').click();
    assert.equal(await ui('#zoom').innerText(), '100%');
    assert.equal((await ui('#photo').boundingBox()).width, natural.width);
    assert.equal(await ui('#photo').evaluate(image => getComputedStyle(image).imageRendering), 'auto');
    await ui('#close').click();

    // An image fetch failure remains dismissible.
    await openFirst();
    await ui('#photo').evaluate(img=>{img.src='/missing-selected-photo.png'});

    await page.waitForFunction(()=>document.querySelector('#img-hub-root').shadowRoot.querySelector('#message').textContent.includes('could not'));
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:390,height:844});
    await setup(); await openFirst();
    await page.screenshot({path:path.join(root,'test-results/viewer-narrow.png')});
    await page.keyboard.press('Escape');
    await page.goto(base+'/options.html');
    await page.getByLabel('Direct click to open').check();
    await page.getByRole('button',{name:'Save preferences'}).click();
    assert.ok((await page.locator('#status').innerText()).includes('Saved'));
    assert.equal(await page.evaluate(async()=> (await browser.storage.local.get()).preferences.directClick),true);
    await page.getByRole('button',{name:'Reset',exact:true}).click();
    assert.equal(await page.getByLabel('Direct click to open').isChecked(),false);
    await page.setViewportSize({width:780,height:780});
    await page.screenshot({path:path.join(root,'test-results/preferences.png')});
    assert.deepEqual(errors,[]);
    console.log('Firefox browser checks passed: filtering, focus, zoom anchor, pan, navigation, close, links, dynamic images, backgrounds, live preferences, scroll, load errors, narrow layout, preference save/reset.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});