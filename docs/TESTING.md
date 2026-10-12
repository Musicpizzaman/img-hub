# Tests

Run the checks in this order.

```sh
npm test
npm run lint
npm run test:browser
npm run build
npm run test:tabs
```

The viewer test uses real Firefox. It covers image filtering, focus, zoom under the mouse, pan, navigation, close controls, links, new page images, optional backgrounds, live settings, scroll restore, failed images, small screens, and settings save and reset. Storage is a test double in this test.

The zoom checks include the 100% floor, zoom beyond the old limit, and actual raster pixels at 32 times the photo's size.

The tab test uses the real extension and built ZIP. It opens two web tabs before installing IMG Hub. It checks those tabs, a new tab, a page reload, and an iframe. Firefox uses a fresh profile that is removed after the test.

Helper unit checks run on Windows, Mac, and Linux in CI. They cover the two launch modes, first run tool setup, custom paths with spaces, Flatpak aliases, environment cleanup, and failures.

Before sharing a signed copy, do these desktop checks.

1. Leave two photo tabs open in regular Firefox.
2. Run npm start, choose the ZIP, and allow access to websites.
3. Check the viewer in both tabs. Open another tab and check it too.
4. Close the helper terminal. Firefox should stay open.
5. Check the toolbar popup and website access controls.
6. Try a news page, a blog, a gallery, a shop, and a page that loads more as you scroll.
7. Check a responsive photo and a photo that loads later.
8. Try linked photos with direct clicks off and on. Check Ctrl and Shift clicks.
9. Use Tab and Shift plus Tab. Focus should stay inside the viewer.
10. Close with Esc, the close button, and an empty space click. The page should keep its scroll position.
11. Check that an iframe uses its own gallery.
12. Save settings, restart Firefox, load IMG Hub again, and check the settings.
13. Confirm Firefox settings pages do not show photo controls.
14. Try npm run try. IMG Hub should load in a separate test window. Other tabs in regular Firefox should stay in that profile.
15. Repeat the helper checks on Windows, Mac, and Linux.
16. Test the signed XPI when it is ready.

The current ZIP is unsigned. It has not been checked against every website.
