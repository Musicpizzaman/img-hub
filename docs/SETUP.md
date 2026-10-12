<p align="center"><img src="logo.png" width="112" height="112" alt="IMG Hub logo"></p>

# IMG Hub

Open photos, zoom in, and take a closer look.

## Use the helper

On Windows, Mac, or Linux, install Firefox 142 or newer and [Node.js](https://nodejs.org/) 22 or newer.

Download this project. Open a terminal in its folder and run:

```sh
npm start
```

The helper downloads its tools on the first run. It then opens a fresh Firefox test window and loads IMG Hub for you.

Keep the terminal open. Run this command each time you want that test window. Each new window starts with fresh settings.

This helper is for computers. Phones need a different setup. A copy signed by Mozilla is still needed to keep IMG Hub in your usual Firefox window.

## Get started by hand

1. Sign in to GitHub and open this project.
2. Click **Code**, then **Download ZIP**.
3. Open the ZIP file. Copy the files into a folder.
4. Use Firefox 142 or newer.
5. Type `about:debugging` in the address bar.
6. Click **This Firefox** on the left.
7. Click the button to load a temporary extension.
8. Choose `manifest.json` from your saved folder.
9. Check that **IMG Hub** is in the list.

You can use the app right away. You do not need Node.js or a build step.

Open a web page with large photos. Reload the page if it was already open. If Firefox asks to let IMG Hub work on the site, allow it.

This copy is removed when you close Firefox. Add it again the next time you open Firefox.

## Use the mouse

Move your mouse over a photo and click **View image**.

Point at the part you want to see. Scroll up to zoom in. Scroll down to zoom out. Zoom stops at 100% when you zoom out. You can keep zooming in to see the pixels. That part stays under your mouse in both cases.

Hold the mouse button and drag to move the photo. You can still zoom at the spot under your mouse after you move the photo.

Click **Reset** to go back to 100%. Click **1:1** to see it at full size.

Use the arrows to see the next or last photo. Press **Esc**, click **×**, or click outside the photo to close it.

## Change settings

Click the IMG Hub icon in Firefox.

**Direct click to open** lets you open a photo with a click. It starts off so links on web pages still work.

**Hover controls** shows the **View image** button when your mouse is over a photo.

**CSS background images** lets the app find photos used as page backgrounds. It starts off.

**Minimum image width** tells the app how wide a photo must be. It starts at 160 pixels. A pixel is one small dot in a picture.

Click **Save preferences** to save your choices. Click **Reset** to go back to the first settings.

Keep either direct click or hover controls on so you can open photos.

## Keep it in Firefox

To keep the app after you close Firefox, Mozilla must sign a copy of it.

First, make a ZIP file with just the app files. If you have Node.js 22 or newer, run these commands in the project folder:

```sh
npm ci
npm run build
```

The ZIP file is in the `dist` folder. This file is not signed yet.

1. Sign in to the [Mozilla Developer Hub](https://addons.mozilla.org/developers/).
2. Start a new app submission. Choose **On your own** so it does not need a public page.
3. Upload the ZIP file from `dist`.
4. Follow Mozilla's checks.
5. Download the signed XPI file. This is the file Firefox can keep.
6. In Firefox, type `about:addons` in the address bar.
7. Click the gear icon. Choose the option to install an extension from a file.
8. Choose the signed XPI file and follow the prompt.

Changing a ZIP file's name to XPI does not sign it. Mozilla has to sign it first.

## Need help?

**No button shows up:** Reload the web page. Check that hover controls are on. Let the app work on the site if Firefox asks.

**A photo is missing:** It may be too small. Try a lower image width in settings. For a page background, turn on CSS background images.

**A photo will not load:** The site may have blocked it, or the image link may have changed. Try another photo.

**A new photo is not in the viewer:** Close the viewer and open it again.

**The app is gone after a restart:** Add the temporary copy again, or use a signed copy.

**The app does not work on a Firefox settings page:** Try a normal web page. Firefox blocks extensions on some pages.
