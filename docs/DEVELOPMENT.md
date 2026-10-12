# Development

IMG Hub preserves the requested architecture: Firefox Manifest V3 → content script → Shadow DOM UI → browser.storage.local. No backend, network API, database, or runtime package is needed.

| File | Purpose |
| --- | --- |
| manifest.json | Firefox metadata, website matches, permissions, toolbar popup, options |
| core.js | Preferences, detection thresholds, safe image URLs, zoom math |
| content.js | Photo discovery, hover toolbar, viewer, navigation and page interaction |
| options.html / options.css / options.js | Locally saved preferences |
| icons/ | Toolbar icons, exported at 16/32/48/128 pixels |
| scripts/build.cjs | Package allowlist; excludes development and documentation |
| tests/ | Unit tests, Firefox interaction harness, local fixture artwork |

## Commands

Use Node.js 22 or later. `npm ci` installs the locked development dependencies.

```sh
npm test
npm run lint
npx playwright install firefox
npm run test:browser
npm run build
```

After changing content scripts or the manifest, choose **Reload** next to IMG Hub on `about:debugging`, then reload the test webpage. Settings changes propagate through `browser.storage.onChanged` without a webpage reload.

## Implementation choices

Photo discovery indexes img elements and updates affected subtrees with MutationObserver. Dimensions and metadata are checked at use time, so an image can qualify after lazy loading. Optional background discovery runs in 150-element idle chunks. Removed nodes are pruned.

The native modal dialog goes into the top layer, isolating focus and page input. UI lives in a closed Shadow DOM with static markup. Page captions use textContent; source URLs use image properties and approved URL protocols. Wheel zoom keeps the image coordinate under the cursor fixed. Pan offsets use viewport pixels. Native dialog cancellation, buttons, and empty-space clicks converge on the same cleanup path.

Settings default to hover enabled, direct-click disabled, backgrounds disabled, and 160px minimum width. Minimum height is 80px and extreme aspect ratios are excluded. This is heuristic filtering rather than image classification.

No telemetry is collected. IMG Hub only loads the selected source as an image; it does not fetch webpage contents to a backend.

## Validation boundaries

The Firefox interaction tests load the actual content and preference scripts into a real Firefox tab, replace closed Shadow DOM with open Shadow DOM for assertions, and mock WebExtension storage. They verify DOM behavior and math. They do not replace a full manual test of host permissions, actual Firefox extension storage, browser toolbar popup behavior, or Mozilla signing. `web-ext lint` validates the manifest and package. See [the manual test checklist](TESTING.md).

## Future distribution

The package is unsigned. Submit it as unlisted through Mozilla before permanent installation. Increase manifest and package versions together before signing a new release, and retain the add-on ID.

## Development dependency audit

The extension package has no npm runtime dependencies. The current web-ext developer tool includes an upstream node-forge advisory through its Android adbkit dependency (npm reports three high-severity entries including dependents). This project does not use Android deployment. A shell-quote override removes the known command-quoting advisory. Recheck npm audit when updating tooling; npm audit --omit=dev currently reports zero vulnerabilities.

The initial package was also installed successfully as a temporary add-on in an isolated headless Firefox profile using web-ext run. This smoke check verifies loading; manual toolbar and website permission checks remain listed in TESTING.md.

## Firefox helper

Run npm start to download missing tools, build the app, and open Firefox with IMG Hub loaded. It needs Node.js 22 or newer and Firefox 142 or newer. It uses a fresh test profile. The helper uses the locked local web-ext package. It does not use a saved web-ext config or WEB_EXT environment options.

Set IMG_HUB_FIREFOX to a Firefox executable path or a Firefox alias if the default app is not found. For Linux Flatpak, set it to flatpak:org.mozilla.firefox. Set IMG_HUB_HEADLESS to 1 for a smoke test. These are optional environment settings. The helper uses Node to run npm, build, and launch commands with argument arrays and no shell.

Mozilla documents default Firefox discovery, custom paths, and fresh profiles in its [web-ext reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/). A lasting install still needs a signed XPI.
