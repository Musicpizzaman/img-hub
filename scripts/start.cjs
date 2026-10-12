const fs = require('node:fs');
const path = require('node:path');
const {spawnSync, spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const setupUrl = 'about:debugging#/runtime/this-firefox';

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
function resolveFirefox(value) {
  const location = require.resolve('fx-runner/lib/utils.js', {paths: [path.join(root, 'node_modules/web-ext')]});
  return require(location).normalizeBinary(value);
}
function openBrowser(binary, args, env, launch = spawn) {
  return new Promise((resolve, reject) => {
    const child = launch(binary, args, {env, shell: false, detached: true, stdio: 'ignore', windowsHide: true});
    child.once('error', reject);
    child.once('spawn', () => { child.unref(); resolve(); });
  });
}

async function main({
  argv = process.argv.slice(2), env = process.env, node = process.execPath,
  version = process.versions.node, exists = fs.existsSync, run = spawnSync,
  locate = resolveFirefox, open = openBrowser, log = console.log, error = console.error
} = {}) {
  if (argv.length === 1 && argv[0] === '--help') {
    log('IMG Hub\n\nRun npm start to open setup in regular Firefox.\nRun npm run try to use a separate test window.\nNeeds Node.js 22 or newer and Firefox 142 or newer.\nSet IMG_HUB_FIREFOX to choose another Firefox path or alias.');
    return 0;
  }
  const testMode = argv.length === 1 && argv[0] === 'try';
  if (argv.length && !testMode) { error('Run npm start or npm run try.'); return 1; }
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
      if (!npm) throw new Error('Could not find npm. Run npm ci in this folder, then try again.');
      log('Getting the tools for the first run. This needs internet access.');
      execute([npm, 'ci', '--include=dev']);
      if (!exists(webExt)) throw new Error('The tools are still missing. Run npm ci, then try again.');
    }
    log('Getting IMG Hub ready.');
    execute([path.join(root, 'scripts/build.cjs')]);
    if (testMode) {
      const args = [webExt, 'run', '--source-dir', path.join(root, 'dist/extension'), '--target', 'firefox-desktop', '--no-config-discovery', '--no-reload', '--no-input'];
      if (env.IMG_HUB_FIREFOX) args.push('--firefox', env.IMG_HUB_FIREFOX);
      if (env.IMG_HUB_HEADLESS === '1') args.push('--args=-headless');
      log('Opening a separate test window. Keep this terminal open while you use it.');
      execute(args);
    } else {
      const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
      const packageFile = path.join(root, 'dist', 'img_hub-' + manifest.version + '.zip');
      log('In Firefox, click the button to load a temporary extension.');
      log('Choose this ZIP file:');
      log(packageFile);
      log('IMG Hub then turns on in your open web tabs and in new tabs.');
      log('If it is already loaded, you can close the setup tab and use it.');
      log('Run this helper and load the ZIP again after you restart Firefox.');
      const chosen = env.IMG_HUB_FIREFOX || 'firefox';
      let binary, args;
      if (chosen.startsWith('flatpak:')) {
        const app = chosen.slice(8);
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(app)) throw new Error('The Flatpak app name is not valid.');
        binary = await locate('flatpak');
        args = ['run', app, '--new-tab', setupUrl];
      } else {
        binary = await locate(chosen);
        args = ['--new-tab', setupUrl];
      }
      log('Opening setup in regular Firefox. It can stay open if it is already running.');
      await open(binary, args, childEnv);
    }
    return 0;
  } catch (failure) {
    error(failure.message);
    error('If Firefox was not found, set IMG_HUB_FIREFOX to its path and try again.');
    return failure.exitCode || 1;
  }
}

module.exports = {main, cleanEnvironment, findNpmCli, openBrowser};
if (require.main === module) main().then(code => { process.exitCode = code; });
