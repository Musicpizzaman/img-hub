# Compatibility and release checklist

Run `npm test`, `npm run lint`, `npm run test:browser`, and `npm run build`.

The automated Firefox checks cover image filtering, modal focus, pointer zoom, pan, navigation, close actions, preserved default links, dynamically inserted images, optional backgrounds, live settings, scroll/style restoration, image-load failures, narrow layouts, and preference save/reset. Their storage implementation is a test double.

Before distributing a signed extension, manually load manifest.json into your desktop Firefox profile:

- Confirm website access grants and the toolbar popup work.
- Test a news article, blog, gallery, product page, and an infinite-scroll page.
- Check a responsive picture/srcset and a lazy-loaded photo.
- Test a linked photo with direct-click off/on and Ctrl/Shift clicks.
- Use Tab and Shift-Tab repeatedly; focus should stay in the viewer.
- Close by Esc, close button, and outside click; the webpage should resume at the same position.
- Verify an iframe keeps its own gallery and does not affect the parent page's scroll.
- Save settings, reload Firefox and the temporary extension, and confirm storage persists in that profile.
- Confirm restricted pages do not show controls.
- Test the Mozilla-signed XPI separately once signing is complete.

The initial build is not signed and has not been certified against every website.

The helper has unit checks on Windows, Mac, and Linux in CI. They cover first run tool setup, custom paths with spaces, Flatpak aliases, isolated settings, and failures. Firefox tests also check the 100% floor, zoom beyond the old cap, and actual raster pixels at 32x.
