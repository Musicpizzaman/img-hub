const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {main, cleanEnvironment, findNpmCli} = require('../scripts/start.cjs');

function harness(installed = true, extraEnv = {}) {
  const calls = [], errors = [];
  const npm = path.join('tools with spaces', 'npm-cli.js');
  let ready = installed;
  const options = {
    version: '22.0.0',
    argv: [],
    node: path.join('node folder with spaces', 'node'),
    env: {npm_execpath: npm, WEB_EXT_FIREFOX_PROFILE: 'usual profile', web_ext_keep_profile_changes: 'true', WEB_EXT_CONFIG: 'user config', ...extraEnv},
    exists: file => file === npm || (ready && file.endsWith(path.join('web-ext', 'bin', 'web-ext.js'))),
    run: (executable, args, config) => {
      calls.push({executable, args, config});
      if (args[1] === 'ci') ready = true;
      return {status: 0};
    },
    log: () => {},
    error: message => errors.push(message)
  };
  return {options, calls, errors};
}

test('starts the existing tools without a download or shell', () => {
  const h = harness();
  assert.equal(main(h.options), 0);
  assert.equal(h.calls.length, 2);
  const launch = h.calls[1];
  assert.equal(launch.executable, h.options.node);
  assert.equal(launch.args[1], 'run');
  assert.ok(launch.args.includes('--no-config-discovery'));
  assert.ok(launch.args.includes('--no-reload'));
  assert.equal(launch.config.shell, false);
  assert.equal(launch.config.stdio, 'inherit');
  assert.equal(launch.config.windowsHide, true);
  assert.ok(!Object.keys(launch.config.env).some(key => /^WEB_EXT_/i.test(key)));
});

test('gets locked tools through the npm JavaScript entry point on the first run', () => {
  const h = harness(false);
  assert.equal(main(h.options), 0);
  assert.equal(h.calls.length, 3);
  assert.deepEqual(h.calls[0].args, [h.options.env.npm_execpath, 'ci', '--include=dev']);
  assert.equal(h.calls[0].executable, h.options.node);
  assert.equal(h.calls[0].config.shell, false);
});

test('passes a Firefox path with spaces and shell characters as one argument', () => {
  const firefox = '/Applications/Firefox & Test.app/Contents/MacOS/firefox';
  const h = harness(true, {IMG_HUB_FIREFOX: firefox});
  assert.equal(main(h.options), 0);
  const args = h.calls[1].args;
  assert.equal(args[args.indexOf('--firefox') + 1], firefox);
});

test('supports Flatpak aliases and a headless smoke run', () => {
  const h = harness(true, {IMG_HUB_FIREFOX: 'flatpak:org.mozilla.firefox', IMG_HUB_HEADLESS: '1'});
  assert.equal(main(h.options), 0);
  assert.ok(h.calls[1].args.includes('flatpak:org.mozilla.firefox'));
  assert.ok(h.calls[1].args.includes('--args=-headless'));
});

test('stops before launch when a build fails', () => {
  const h = harness();
  h.options.run = () => ({status: 7});
  assert.equal(main(h.options), 7);
  assert.equal(h.errors.length, 1);
});

test('reports missing npm and old Node with a useful message', () => {
  const h = harness(false);
  h.options.exists = () => false;
  assert.equal(main(h.options), 1);
  assert.ok(h.errors[0].includes('npm ci'));
  const old = harness();
  old.options.version = '20.0.0';
  assert.equal(main(old.options), 1);
  assert.equal(old.calls.length, 0);
});

test('finds npm beside Node when not launched through npm start', () => {
  const node = path.resolve('node folder/bin/node');
  const expected = path.resolve(path.dirname(node), '../lib/node_modules/npm/bin/npm-cli.js');
  assert.equal(findNpmCli({}, file => file === expected, node), expected);
  assert.deepEqual(cleanEnvironment({Path: 'tools', WEB_EXT_CONFIG: 'config', web_ext_firefox_profile: 'profile'}), {Path: 'tools'});
});
