<p align="center"><img src="logo.png" width="112" height="112" alt="IMG Hub logo"></p>

# IMG Hub

Open photos and clips. Zoom in and take a closer look.

## Use it in your Firefox

On Windows, Mac, or Linux, install Firefox 142 or newer and [Node.js](https://nodejs.org/) 22 or newer.

Download this project. Open a terminal in its folder and run:

```sh
npm start
```

The helper gets its tools on the first run. It makes a ZIP file with the app inside. It then opens the setup page in your regular Firefox. If Firefox is already open, it uses that browser.

Click the button to load a temporary extension. Choose the ZIP file whose path is shown in the terminal.

Let IMG Hub work on all sites if Firefox asks. It then turns on in your open web tabs. It works in new tabs too. You do not need to load it in each tab or reload every page.

You can close the terminal when you are done with setup.

Firefox removes this copy when the browser closes. Load the ZIP again next time. To keep the app, use a copy signed by Mozilla.

This helper is for computers. Phones need a different setup.

## Try a test window

For a quick test with no file choice, run:

```sh
npm run try
```

It opens a separate Firefox test window with IMG Hub already loaded. The app works in all web tabs in that window.

Keep the terminal open. Each new test window starts with fresh settings.

## Start by hand

1. Download this project and open the ZIP file.
2. Copy the files into a folder.
3. In Firefox 142 or newer, type `about:debugging`.
4. Click **This Firefox** on the left.
5. Click the button to load a temporary extension.
6. Choose `manifest.json` from your saved folder.
7. Check that **IMG Hub** is in the list.

You do not need Node.js or a build step for this path. The app turns on in open web tabs after it is loaded.

## Use the mouse

Move your mouse over a photo and click **View image** below it. Near the edge of the screen, the button may sit above or beside it.

GIFs and animated PNG images keep moving. Tall comic pages and photos under a page cover can open too.

For MP4, WebM, and other clips that Firefox can play, click **View clip**. Clips start with sound off and play again when they end. Use **Play**, **Pause**, and **Sound on** to control them. Closing the viewer stops its clip.

For a comic reader, close the viewer before you turn the page on the site. Then open the new picture.

Point at the part you want to see. Scroll up to zoom in. Scroll down to zoom out. You can keep zooming out or zooming in to see the pixels. That part stays under your mouse in both cases.

Hold the mouse button and drag to move the photo. You can still zoom at the spot under your mouse after you move the photo.

Click **Reset** to go back to 100%. Click **1:1** to see it at full size.

Use the arrows to see the next or last photo. Press **Esc**, click **×**, or click outside the photo to close it.

## Change settings

Click the IMG Hub icon in Firefox.

**Direct click to open** lets you open a photo with a click. It starts off so links on web pages still work.

**Hover controls** shows a button outside the picture when your mouse is over it.

**CSS background images** finds pictures used as page backgrounds.

**Minimum width (pixels)** sets how wide a picture must be. It starts at 160 pixels. A pixel is one small dot in a picture. You can always edit this value. Lower it to include small pictures. It uses the full picture width when Firefox knows it. For backgrounds and clips that have not loaded yet, it uses the width on the page.

**Hide logos** tries to skip logos by their names and page labels, even if they are large.

**Hide ads** tries to skip pictures marked as ads.

**Hide thumbnails** tries to skip small preview pictures.

These three choices start on. They are guesses. Turn one off if it hides a picture you want. They only change what IMG Hub shows.

Click **Save preferences** to save your choices. Click **Reset** to go back to the first settings.

Keep either direct click or hover controls on so you can open photos.

## Keep it in Firefox

To keep the app after you close Firefox, Mozilla must sign a copy of it.

Run `npm start` or `npm run build` to make a ZIP file. The file path is shown in the terminal. This ZIP is not signed yet.

1. Sign in to the [Mozilla Developer Hub](https://addons.mozilla.org/developers/).
2. Start a new app submission. Choose **On your own** so it does not need a public page.
3. Upload the ZIP file from `dist`.
4. Follow Mozilla's checks.
5. Download the signed XPI file. This is the file Firefox can keep.
6. In Firefox, type `about:addons`.
7. Click the gear icon. Choose the option to install an extension from a file.
8. Choose the signed XPI file and follow the prompt.

The signed copy works across your web tabs each time you open Firefox.

Changing a ZIP file's name to XPI does not sign it. Mozilla has to sign it first.

## Need help?

**No setup page opens:** Type `about:debugging` in Firefox and follow the steps above. If you use more than one Firefox profile, load IMG Hub in the one with the tabs you want.

**No button shows up on a web page:** Let IMG Hub work on the site if Firefox asks. Check that hover controls are on. Try reloading that page if it still does not show up.

**A photo is missing:** Check that **Hover controls** is on. Lower **Minimum width (pixels)**. Try turning off the hide choices. Wait for the picture to load, then move your mouse over it.

**You loaded an updated copy:** Reload the web pages that were open so they use the new viewer.

**A photo or clip will not load:** The site may have blocked it, or the image link may have changed. Try another photo.

**A new photo is not in the viewer:** Close the viewer and open it again.

**The app is gone after a restart:** Load the temporary copy again, or use a signed copy.

**The app does not work on a Firefox settings page:** Try a normal web page. Firefox blocks extensions on some pages.
