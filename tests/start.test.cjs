const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {EventEmitter} = require('node:events');
const {main, cleanEnvironment, findNpmCli, openBrowser} = require('../scripts/start.cjs');

function harness(installed = true, extraEnv = {}, argv = []) {
  const calls = [], opens = [], messages = [], errors = [];
  const npm = path.join('tools with spaces', 'npm-cli.js');
  let ready = installed;
  const options = {
    version: '22.0.0', argv,
    node: path.join('node folder with spaces', 'node'),
    env: {npm_execpath: npm, WEB_EXT_FIREFOX_PROFILE: 'usual profile', web_ext_keep_profile_changes: 'true', WEB_EXT_CONFIG: 'user config', ...extraEnv},
    exists: file => file === npm || (ready && file.endsWith(path.join('web-ext', 'bin', 'web-ext.js'))),
    run: (executable, args, config) => {
      calls.push({executable,args,config});
      if (args[1] === 'ci') ready = true;
      return {status:0};
    },
    locate: async value => value,
    open: async (binary,args,env) => {opens.push({binary,args,env});},
    log: message => messages.push(message),
    error: message => errors.push(message)
  };
  return {options,calls,opens,messages,errors};
}
test('default opens setup in regular Firefox without a test profile', async () => {
  const h = harness();
  assert.equal(await main(h.options),0);
  assert.equal(h.calls.length,1);
  assert.equal(h.opens.length,1);
  assert.deepEqual(h.opens[0].args,['--new-tab','about:debugging#/runtime/this-firefox']);
  assert.ok(!h.opens[0].args.includes('--no-remote'));
  assert.ok(!h.opens[0].args.includes('--profile'));
  assert.ok(h.messages.some(message => message.endsWith('.zip')));
  assert.ok(!Object.keys(h.opens[0].env).some(key => /^WEB_EXT_/i.test(key)));
});
test('test mode keeps the isolated web-ext launcher and shell safe arguments', async () => {
  const h = harness(true,{},['try']);
  assert.equal(await main(h.options),0);
  assert.equal(h.calls.length,2);
  assert.equal(h.opens.length,0);
  const launch=h.calls[1];
  assert.equal(launch.executable,h.options.node);
  assert.equal(launch.args[1],'run');
  assert.ok(launch.args.includes('--no-config-discovery'));
  assert.ok(launch.args.includes('--no-reload'));
  assert.equal(launch.config.shell,false);
  assert.equal(launch.config.stdio,'inherit');
  assert.equal(launch.config.windowsHide,true);
  assert.ok(!Object.keys(launch.config.env).some(key => /^WEB_EXT_/i.test(key)));
});
test('gets locked tools via the npm JavaScript entry point on first run', async () => {
  const h = harness(false);
  assert.equal(await main(h.options),0);
  assert.deepEqual(h.calls[0].args,[h.options.env.npm_execpath,'ci','--include=dev']);
  assert.equal(h.calls[0].executable,h.options.node);
  assert.equal(h.calls[0].config.shell,false);
});
test('a custom Firefox path with spaces and shell characters stays one executable value', async () => {
  const firefox='/Applications/Firefox & Test.app/Contents/MacOS/firefox';
  const h=harness(true,{IMG_HUB_FIREFOX:firefox});
  assert.equal(await main(h.options),0);
  assert.equal(h.opens[0].binary,firefox);
});
test('normal Flatpak mode uses its app id with no test profile or lifecycle flags', async () => {
  const h=harness(true,{IMG_HUB_FIREFOX:'flatpak:org.mozilla.firefox'});
  assert.equal(await main(h.options),0);
  assert.equal(h.opens[0].binary,'flatpak');
  assert.deepEqual(h.opens[0].args,['run','org.mozilla.firefox','--new-tab','about:debugging#/runtime/this-firefox']);
  const bad=harness(true,{IMG_HUB_FIREFOX:'flatpak:--socket=all'});
  assert.equal(await main(bad.options),1);
  assert.equal(bad.opens.length,0);
});
test('test mode supports a custom path and headless smoke run', async () => {
  const h=harness(true,{IMG_HUB_FIREFOX:'flatpak:org.mozilla.firefox',IMG_HUB_HEADLESS:'1'},['try']);
  assert.equal(await main(h.options),0);
  assert.ok(h.calls[1].args.includes('flatpak:org.mozilla.firefox'));
  assert.ok(h.calls[1].args.includes('--args=-headless'));
});
test('stops before opening Firefox when build fails or executable is missing', async () => {
  const h=harness(); h.options.run=()=>({status:7});
  assert.equal(await main(h.options),7);
  assert.equal(h.opens.length,0);
  const missing=harness(); missing.options.locate=async()=>{throw Error('Not found');};
  assert.equal(await main(missing.options),1);
  assert.equal(missing.opens.length,0);
});
test('reports missing npm and old Node clearly', async () => {
  const h=harness(false); h.options.exists=()=>false;
  assert.equal(await main(h.options),1);
  assert.ok(h.errors[0].includes('npm ci'));
  const old=harness(); old.options.version='20.0.0';
  assert.equal(await main(old.options),1);
  assert.equal(old.calls.length,0);
});
test('finds npm beside Node and strips web-ext settings without touching other environment values', () => {
  const node=path.resolve('node folder/bin/node');
  const expected=path.resolve(path.dirname(node),'../lib/node_modules/npm/bin/npm-cli.js');
  assert.equal(findNpmCli({},file=>file===expected,node),expected);
  assert.deepEqual(cleanEnvironment({Path:'tools',WEB_EXT_CONFIG:'config',web_ext_firefox_profile:'profile'}),{Path:'tools'});
});
test('detaches normal Firefox so ending the helper cannot close it', async () => {
  let options, args, unreferenced=false;
  const launch=(binary,values,config)=>{
    assert.equal(binary,'Firefox with spaces');
    args=values; options=config;
    const child=new EventEmitter();
    child.unref=()=>{unreferenced=true;};
    process.nextTick(()=>child.emit('spawn'));
    return child;
  };
  await openBrowser('Firefox with spaces',['--new-tab','about:debugging'],{},launch);
  assert.deepEqual(args,['--new-tab','about:debugging']);
  assert.equal(options.shell,false);
  assert.equal(options.detached,true);
  assert.equal(options.stdio,'ignore');
  assert.equal(options.windowsHide,true);
  assert.equal(unreferenced,true);
});
test('reports normal browser spawn errors', async () => {
  const launch=()=>{
    const child=new EventEmitter();
    process.nextTick(()=>child.emit('error',Error('Firefox missing')));
    return child;
  };
  await assert.rejects(openBrowser('missing',[],{},launch),/Firefox missing/);
});
