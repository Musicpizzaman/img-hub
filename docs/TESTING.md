# Tests

Run the checks in this order.

```sh
npm test
npm run lint
npm run test:browser
npm run test:images
npm run build
npm run test:tabs
```

The viewer test uses real Firefox. It covers image filtering, focus, zoom under the mouse, pan, navigation, close controls, links, new page images, optional backgrounds, live settings, scroll restore, failed images, small screens, and settings save and reset, including an editable pixel field. Storage is a test double in this test.

The image checks cover small pictures, logos, tall comic strips, supported formats, GIF and PNG animation, sibling covers, pointer events off, shared covers, lazy images, reader page changes, layered backgrounds, and open components. Animation is checked from the actual viewer screenshot pixels. They also check large logo detection, independent ad and thumbnail filters, the hover gap, WebM play and sound controls, MP4 direct and typed source playback, video source children, small screen layout, and source playback restored on close.

The zoom checks include values below 100%, zoom beyond the old limit, and actual raster pixels at 32 times the photo's size.

The tab test uses the real extension and built ZIP. It opens two web tabs before installing IMG Hub. It checks those tabs, a new tab, a page reload, and an iframe. It also opens a covered GIF through the closed viewer with real extension storage and checks a closed comic component. Changing screenshot pixels prove MP4 and WebM playback in the installed extension. Firefox uses a fresh profile that is removed after the test.

Helper unit checks run on Windows, Mac, and Linux in CI. They cover the two launch modes, first run tool setup, custom paths with spaces, Flatpak aliases, environment cleanup, and failures.

Before sharing a signed copy, do these desktop checks.

1. Leave two photo tabs open in regular Firefox.
2. Run npm start, choose the ZIP, and allow access to websites.
3. Check the viewer in both tabs. Open another tab and check it too.
4. Close the helper terminal. Firefox should stay open.
5. Check the toolbar popup and website access controls.
6. Try a comic reader with page arrows and a cover over the picture. Check a real GIF, a WebM clip, and an MP4 clip. Try the play and sound controls. Turn the page, then open the new picture.
7. Try a news page, a blog, a gallery, a shop, and a page that loads more as you scroll.
8. Check a responsive photo and a photo that loads later.
9. Try linked photos with direct clicks off and on. Check Ctrl and Shift clicks.
10. Use Tab and Shift plus Tab. Focus should stay inside the viewer.
11. Close with Esc, the close button, and an empty space click. The page should keep its scroll position.
12. Check that an iframe uses its own gallery.
13. Save settings, restart Firefox, load IMG Hub again, and check the settings.
14. Confirm Firefox settings pages do not show photo controls.
15. Try npm run try. IMG Hub should load in a separate test window. Other tabs in regular Firefox should stay in that profile.
16. Repeat the helper checks on Windows, Mac, and Linux.
17. Test the signed XPI when it is ready.

The current ZIP is unsigned. It has not been checked against every website.
