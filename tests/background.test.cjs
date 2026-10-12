const {test} = require('node:test');
const assert = require('node:assert/strict');
const {activateOpenTabs, register} = require('../background.js');

function fixture() {
  const scripts = [], events = {};
  const event = key => ({addListener: handler => {events[key] = handler;}});
  const api = {
    runtime: {onInstalled: event('install'), onStartup: event('startup')},
    permissions: {onAdded: event('access')},
    tabs: {query: async filter => {assert.deepEqual(filter, {}); return [{id:1},{id:2},{id:3},{id:-1},{}];}},
    scripting: {executeScript: async options => {
      scripts.push(options);
      if (options.target.tabId === 2) throw Error('Restricted page');
      if (options.target.tabId === 3) throw Error('Host access not granted');
      return [{frameId:0}];
    }}
  };
  return {api, scripts, events};
}
test('activates all tab ids and frames while accepting restricted and ungranted tabs', async () => {
  const {api,scripts} = fixture();
  const results = await activateOpenTabs(api);
  assert.equal(results.length,3);
  assert.deepEqual(results.map(result => result.status), ['fulfilled','rejected','rejected']);
  assert.deepEqual(scripts.map(script => script.target.tabId), [1,2,3]);
  for (const script of scripts) {
    assert.equal(script.target.allFrames,true);
    assert.deepEqual(script.files,['core.js','content.js']);
  }
});
test('runs on install, startup, and new website access', async () => {
  const {api,scripts,events} = fixture();
  register(api);
  await events.install(); await events.startup();
  await events.access({origins:['https://*/*']});
  assert.equal(scripts.length,9);
  await events.access({permissions:['storage']});
  assert.equal(scripts.length,9);
});
test('handles a failed tab query without an unhandled rejection', async () => {
  const {api} = fixture();
  api.tabs.query = async () => {throw Error('Browser shutting down');};
  assert.deepEqual(await activateOpenTabs(api),[]);
});
