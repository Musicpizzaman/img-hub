const {firefox} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const root = path.resolve(__dirname, '..');

async function unusedPort() {
  const reservation = net.createServer();
  await new Promise((resolve, reject) => {
    reservation.once('error', reject);
    reservation.listen(0, '127.0.0.1', resolve);
  });
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  return port;
}

const fixtures = new Map([
  ['/tests/fixture.html', ['fixture.html', 'text/html']],
  ['/tests/landscape.svg', ['landscape.svg', 'image/svg+xml']],
  ['/tests/landscape-2.svg', ['landscape-2.svg', 'image/svg+xml']],
  ['/tests/landscape-3.svg', ['landscape-3.svg', 'image/svg+xml']]
]);
const server = http.createServer(async (request, response) => {
  const fixture = fixtures.get(new URL(request.url, 'http://localhost').pathname);
  if (!fixture) { response.writeHead(404); response.end(); return; }
  try {
    const data = await fs.readFile(path.join(__dirname, fixture[0]));
    response.writeHead(200, {'Content-Type': fixture[1]});
    response.end(data);
  } catch {
    response.writeHead(500); response.end();
  }
});

(async () => {
  let context, remote;
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const port = await unusedPort();
    // Debugging is enabled only in Playwright's disposable test profile.
    context = await firefox.launchPersistentContext('', {
      headless: true,
      args: ['--start-debugger-server', String(port)],
      firefoxUserPrefs: {
        'devtools.debugger.remote-enabled': true,
        'devtools.debugger.prompt-connection': false
      }
    });
    const base = 'http://127.0.0.1:' + server.address().port;
    const first = await context.newPage();
    const second = await context.newPage();
    await Promise.all([
      first.goto(base + '/tests/fixture.html?first'),
      second.goto(base + '/tests/fixture.html?second')
    ]);
    for (const page of [first, second]) {
      assert.equal(await page.locator('#img-hub-root').count(), 0);
    }
    const moduleUrl = pathToFileURL(path.join(root, 'node_modules/web-ext/lib/firefox/remote.js'));
    const {connectWithMaxRetries} = await import(moduleUrl.href);
    remote = await connectWithMaxRetries({port});
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
    const archive = path.join(root, 'dist', 'img_hub-' + manifest.version + '.zip');
    await remote.installTemporaryAddon(archive, false);
    const assertActive = async page => {
      await page.locator('#img-hub-root').waitFor({state: 'attached', timeout: 15000});
      assert.equal(await page.locator('#img-hub-root').count(), 1);
    };
    await Promise.all([assertActive(first), assertActive(second)]);
    const third = await context.newPage();
    await third.goto(base + '/tests/fixture.html?new');
    await assertActive(third);
    await first.reload();
    await assertActive(first);
    const frameHandle = await second.evaluateHandle(url => {
      const frame = document.createElement('iframe');
      frame.src = url;
      document.body.append(frame);
      return frame;
    }, base + '/tests/fixture.html?frame');
    const frame = await frameHandle.asElement().contentFrame();
    assert.ok(frame);
    await assertActive(frame);
    console.log('Firefox extension check passed for two existing tabs, a new tab, a page reload, and an iframe.');
  } finally {
    remote?.disconnect();
    if (context) await context.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
