const {firefox} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types={'.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.avif':'image/avif'};
const names=new Set(['sample.png','sample.jpg','sample.webp','sample.avif','animated.gif','animated.png']);
const server=http.createServer(async(request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname;
  const name=path.basename(pathname);
  const file=pathname==='/tests/discovery.html' ? path.join(__dirname,'discovery.html')
    : pathname.startsWith('/tests/images/') && names.has(name) ? path.join(__dirname,'images',name) : null;
  if(!file){response.writeHead(404);response.end();return;}
  try{response.writeHead(200,{'Content-Type':types[path.extname(file)]});response.end(await fs.readFile(file));}
  catch{response.end();}
});

(async()=>{
  let browser;
  try{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    browser=await firefox.launch({headless:true});
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.addInitScript(()=>{
      const attach=Element.prototype.attachShadow;
      Element.prototype.attachShadow=function(options){return attach.call(this,{...options,mode:'open'})};
      const listeners=[];let stored={};
      window.browser={storage:{local:{
        get:async()=>({preferences:stored.preferences}),
        set:async value=>{const oldValue=stored.preferences;stored={...stored,...value};listeners.forEach(fn=>fn({preferences:{oldValue,newValue:stored.preferences}},'local'))}
      },onChanged:{addListener:fn=>listeners.push(fn)}}};
    });
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/tests/discovery.html');
    await page.evaluate(()=>Promise.all([...document.images].filter(image=>!image.hidden).map(image=>image.decode())));
    await page.addScriptTag({path:path.join(root,'core.js')});
    await page.addScriptTag({path:path.join(root,'content.js')});
    await page.locator('#img-hub-root').waitFor();
    const ui=selector=>page.locator('#img-hub-root').locator(selector);
    const openAt=async(selector)=>{
      await page.mouse.move(0,0);
      const box=await page.locator(selector).boundingBox();
      assert.ok(box,selector+' is on the page');
      await page.locator(selector).scrollIntoViewIfNeeded();
      const visible=await page.locator(selector).boundingBox();
      await page.mouse.move(visible.x+visible.width/2,visible.y+visible.height/2);
      await ui('#view').waitFor({state:'visible',timeout:4000});
      await ui('#view').click({timeout:4000});
      await ui('#photo').waitFor({state:'visible'});
    };
    const close=()=>page.keyboard.press('Escape');
    for(const name of names){
      await openAt('#format-'+name.replaceAll('.','-'));
      assert.ok((await ui('#photo').getAttribute('src')).endsWith('/'+name));
      assert.equal(await ui('#photo').evaluate(image=>image.naturalWidth),96);
      await close();
    }
    await openAt('#site-logo');
    assert.equal(await ui('#photo').evaluate(image=>image.naturalWidth),96);
    await close();
    await openAt('#comic');
    assert.equal(await ui('#photo').evaluate(image=>image.naturalHeight),1200);
    await close();
    for(const [selector,name] of [['#cover','sample.webp'],['#pointer-cover','sample.jpg']]){
      await openAt(selector);
      assert.ok((await ui('#photo').getAttribute('src')).endsWith('/'+name));
      await close();
    }
    await openAt('#layered');
    assert.ok((await ui('#photo').getAttribute('src')).endsWith('/sample.webp?layer=top'));
    await ui('#next').click();
    await ui('#photo').waitFor({state:'visible'});
    assert.ok((await ui('#photo').getAttribute('src')).endsWith('/sample.png?layer=bottom'));
    await close();
    for(const [x,name] of [[75,'sample.png'],[225,'sample.jpg']]){
      await page.locator('#split-cover').scrollIntoViewIfNeeded();
      const box=await page.locator('#split-cover').boundingBox();
      await page.mouse.move(box.x+x,box.y+70);
      await page.waitForFunction(({left,right})=>{const button=document.querySelector('#img-hub-root').shadowRoot.querySelector('#view');const x=button.getBoundingClientRect().left;return x>=left && x<right}, {left:box.x+(x>150?150:0),right:box.x+(x>150?300:150)});
      await ui('#view').click();
      await ui('#photo').waitFor({state:'visible'});
      assert.ok((await ui('#photo').getAttribute('src')).endsWith('/'+name));
      await close();
    }
    await page.locator('#lazy-cover').scrollIntoViewIfNeeded();
    const lazyBox=await page.locator('#lazy-cover').boundingBox();
    await page.mouse.move(lazyBox.x+80,lazyBox.y+60);
    await page.evaluate(()=>{const image=new Image();image.id='lazy-image';image.src='/tests/images/sample.avif';document.querySelector('#lazy-box').prepend(image)});
    await page.locator('#lazy-image').evaluate(image=>image.decode());
    await ui('#view').click();
    await ui('#photo').waitFor({state:'visible'});
    assert.ok((await ui('#photo').getAttribute('src')).endsWith('/sample.avif'));
    await close();
    await openAt('#component-image');
    assert.ok((await ui('#photo').getAttribute('src')).endsWith('/sample.webp'));
    await close();

    await page.locator('#pager-cover').scrollIntoViewIfNeeded();
    const pager=await page.locator('#pager-cover').boundingBox();
    await page.mouse.move(pager.x+50,pager.y+50);
    await ui('#view').waitFor({state:'visible'});
    // The reader changes the source without replacing the cover or moving the mouse.
    await page.locator('#pager-next').evaluate(button=>button.click());
    await page.locator('#pager-image').evaluate(image=>image.decode());
    await ui('#view').click();
    await ui('#photo').waitFor({state:'visible'});
    assert.ok((await ui('#photo').getAttribute('src')).endsWith('/sample.jpg'));
    await close();

    for(const name of ['animated.gif','animated.png']){
      await openAt('#format-'+name.replaceAll('.','-'));
      const box=await ui('#photo').boundingBox();
      const colors=new Set();
      for(let attempt=0;attempt<12 && colors.size<2;attempt++){
        const shot=await page.screenshot({clip:{x:Math.floor(box.x+box.width/2),y:Math.floor(box.y+box.height/2),width:4,height:4}});
        const color=await page.evaluate(async source=>{
          const image=new Image();image.src=source;await image.decode();
          const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          return [...ctx.getImageData(1,1,1,1).data].slice(0,3).join(',');
        },'data:image/png;base64,'+shot.toString('base64'));
        colors.add(color);
        await page.waitForTimeout(90);
      }
      assert.deepEqual([...colors].sort(),['0,68,255','255,34,0'],name+' keeps playing in the viewer');
      await close();
    }
    await page.evaluate(()=>browser.storage.local.set({preferences:{directClick:true}}));
    const turns=await page.evaluate(()=>window.pageTurns);
    await page.locator('#pager-next').click();
    assert.equal(await page.evaluate(()=>window.pageTurns),turns+1);
    assert.equal(await ui('dialog').isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log('Firefox image checks passed: small images, logos, tall comics, image formats, GIF and APNG animation, covers, page turns, backgrounds and components.');
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1});
