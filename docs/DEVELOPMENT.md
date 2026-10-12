# Development

IMG Hub uses Firefox Manifest V3, content scripts, a Shadow DOM viewer, and browser.storage.local. It has no backend or runtime packages.

The manifest loads core.js and content.js in new web pages. background.js also turns on the viewer in tabs that were open before installation. It runs after installation, Firefox startup, and new website access grants. Each tab can fail on its own, so a blocked page does not stop the others. The scripting permission lets it do this. It does not need the tabs permission or save a list of tabs.

Both paths may run together. content.js checks for the viewer before and after loading preferences to avoid two viewers in one page.

## Commands

Use Node.js 22 or newer and Firefox 142 or newer. npm ci installs the locked tools.

```sh
npm test
npm run lint
npx playwright install firefox
npm run test:browser
npm run test:images
npm run build
npm run test:tabs
```

After a source change, click Reload next to IMG Hub in about:debugging. Then reload web tabs to use the changed content scripts. Settings changes use browser.storage.onChanged.

## Viewer

Photo discovery checks img elements and accessible component roots. Each root watches changes and image load events, including a reader replacing the source under an unchanged cover. Discovery uses idle chunks of 150 elements. Removed images and component observers are pruned.

Hover uses the browser hit layers under the pointer, including sibling covers. An IntersectionObserver keeps a set of candidates in the viewport for images with pointer events off. Pointer moves are handled once per animation frame. The entire page image list is not scanned on each move. Native buttons and form controls keep their own clicks. Firefox's [extension access to closed roots](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/dom/openOrClosedShadowRoot) also allows discovery of closed page components. Native form and media widget roots are skipped.

Background URL parsing handles multiple layers, gradients before an image, and CSS escapes. Each source can join the gallery. Responsive img elements use currentSrc. The viewer uses native image URLs, so animated GIF and PNG files retain their animation.

The native modal dialog holds focus and page input. A closed Shadow DOM keeps its styles separate. Captions use textContent. Source URLs must use approved image protocols.

Wheel zoom keeps the point under the mouse in place. Its minimum is 100% of the photo's pixel size. There is no preset maximum. Invalid numbers are rejected so the image stays usable. Above 100%, pixelated rendering shows each source pixel clearly.

Default settings turn on hover controls and Show all images. The new allImages field defaults to true when it is absent from older saved settings. This mode includes page backgrounds and skips the optional width limit. Names such as logo and icon and very tall or wide shapes are no longer rejected. Hidden, disconnected, and unloaded images remain outside the gallery.

When Show all images is off, the saved minimum width and background choice apply. Direct clicks stay off by default to preserve page links. The optional width starts at 160 pixels.

## Firefox helper

npm start gets any missing tools, builds a ZIP, and opens the setup page in regular Firefox. It uses the running Firefox profile when Firefox is already open. The user must choose the ZIP on the setup page. The helper can close without closing Firefox.

npm run try loads IMG Hub for the user in a fresh test profile. That window stays open while the helper runs. All web tabs in that window can use the viewer.

The helper uses the locked web ext tool and ignores saved web ext configs and WEB_EXT environment options. Commands use argument arrays with no shell. IMG_HUB_FIREFOX can name a custom Firefox path or alias. flatpak:org.mozilla.firefox selects Linux Flatpak. IMG_HUB_HEADLESS=1 applies only to the test window.

The normal helper leaves browser security and profile settings alone. The [Firefox command guide](https://firefox-source-docs.mozilla.org/browser/CommandLineParameters.html) describes opening a new tab. Mozilla's [temporary install guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) supports choosing a ZIP. A lasting install needs a signed XPI.

## Tests and limits

The viewer tests use real Firefox with a storage test double and an open Shadow DOM test seam. They check image controls, preferences, pointer zoom, and raster pixel rendering. Image discovery tests add actual GIF and PNG frame changes, JPG, PNG, WebP, AVIF, SVG comic pages, sibling covers, pointer events off, shared covers, lazy images, reader page turns, layered backgrounds, and page components.

The tab test installs the built ZIP into a disposable Firefox profile. It checks two tabs opened before installation, a new tab, a page reload, and an iframe using the actual extension APIs. It also opens a covered small GIF through the real closed viewer and checks an image inside a closed comic component. Debugging is enabled only in that disposable test profile.

Helper unit tests run in CI on Windows, Mac, and Linux. They check discovery, launch arguments, tool setup, and failures. A desktop check of an already running Firefox is still needed on each system before a public release. See [the test guide](TESTING.md).

Detection uses accessible image elements and CSS image URLs in the [formats Firefox can show](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types). Readers that draw pages into a canvas, or show video clips need a separate capture or video path. Browser access restrictions still apply.

## Distribution

The package is unsigned. Submit it as unlisted through Mozilla for a lasting install. Keep the add on ID. Increase the manifest and package versions together before signing.

## Tool audit

The extension ZIP has no npm runtime dependencies. The web ext tool has an upstream node forge advisory through its Android adbkit dependency. npm reports three high entries including dependents. IMG Hub does not use Android deployment. A shell quote override removes the known quoting advisory. Recheck npm audit when updating tools. npm audit with development packages left out currently reports zero issues.
