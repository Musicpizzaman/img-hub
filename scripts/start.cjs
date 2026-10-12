const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');

function cleanEnvironment(env) {
  return Object.fromEntries(Object.entries(env).filter(([key]) => !/^WEB_EXT_/i.test(key)));
}

function findNpmCli(env, exists, node) {
  const folder = path.dirname(node);
  return [
    env.npm_execpath,
    path.join(folder, 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(folder, '../lib/node_modules/npm/bin/npm-cli.js'),
    '/usr/share/nodejs/npm/bin/npm-cli.js',
    '/usr/lib/node_modules/npm/bin/npm-cli.js'
  ].find(file => file && path.basename(file) === 'npm-cli.js' && exists(file));
}

function main({
  argv = process.argv.slice(2),
  env = process.env,
  node = process.execPath,
  version = process.versions.node,
  exists = fs.existsSync,
  run = spawnSync,
  log = console.log,
  error = console.error
} = {}) {
  if (argv.length === 1 && argv[0] === '--help') {
    log('IMG Hub\n\nRun npm start in this folder.\nNeeds Node.js 22 or newer and Firefox 142 or newer.\nSet IMG_HUB_FIREFOX to choose another Firefox path or a Firefox alias.\nThis opens a fresh test window. Use a Mozilla signed copy for a lasting install.');
    return 0;
  }
  if (argv.length) { error('No extra commands are needed. Run npm start.'); return 1; }
  if (Number(version.split('.')[0]) < 22) { error('Please install Node.js 22 or newer.'); return 1; }
  const childEnv = cleanEnvironment(env);
  const webExt = path.join(root, 'node_modules/web-ext/bin/web-ext.js');
  function execute(args) {
    const result = run(node, args, {cwd: root, env: childEnv, stdio: 'inherit', shell: false, windowsHide: true});
    if (result.error) throw new Error(result.error.message);
    if (result.signal || result.status !== 0) {
      const failure = new Error(result.signal ? 'The helper stopped.' : 'The last step did not finish.');
      failure.exitCode = result.signal === 'SIGINT' ? 130 : result.status || 1;
      throw failure;
    }
  }
  try {
    log('IMG Hub');
    if (!exists(webExt)) {
      const npm = findNpmCli(env, exists, node);
      if (!npm) throw new Error('Could not find npm. Run npm ci in this folder, then try npm start.');
      log('Getting the tools for the first run. This needs internet access.');
      execute([npm, 'ci', '--include=dev']);
      if (!exists(webExt)) throw new Error('The tools are still missing. Run npm ci, then try npm start.');
    }
    log('Getting IMG Hub ready.');
    execute([path.join(root, 'scripts/build.cjs')]);
    const args = [webExt, 'run', '--source-dir', path.join(root, 'dist/extension'), '--target', 'firefox-desktop', '--no-config-discovery', '--no-reload', '--no-input'];
    if (env.IMG_HUB_FIREFOX) args.push('--firefox', env.IMG_HUB_FIREFOX);
    if (env.IMG_HUB_HEADLESS === '1') args.push('--args=-headless');
    log('Opening a fresh Firefox test window. Keep this terminal open while you use it.');
    log('If Firefox is not found, set IMG_HUB_FIREFOX to its path and try again.');
    execute(args);
    return 0;
  } catch (failure) {
    error(failure.message);
    return failure.exitCode || 1;
  }
}

module.exports = {main, cleanEnvironment, findNpmCli};
if (require.main === module) process.exitCode = main();
