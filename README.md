<p align="center"><img src="docs/logo.png" width="112" height="112" alt="IMG Hub logo"></p>

# IMG Hub

See photos and clips up close. Use your mouse wheel to zoom in and out.

## Easy start

This helper works on Windows, Mac, and Linux.

1. Install Firefox 142 or newer and [Node.js](https://nodejs.org/) 22 or newer.
2. Download this project and open its folder in a terminal.
3. Run:

```sh
npm start
```

It makes the app file and opens the setup page in your regular Firefox. Firefox can stay open if it is already running.

Click the button to load a temporary extension. Choose the ZIP file shown in the terminal. Let IMG Hub work on all sites if Firefox asks.

IMG Hub then turns on in your open web tabs. It also works in new tabs. You do not need to add it to each tab.

You can close the terminal after setup. Firefox keeps running.

This copy is removed when Firefox closes. Run the same command and load the ZIP again next time. See [more help](docs/SETUP.md) to learn how to keep it.

## Try it fast

To open a separate test window with IMG Hub already loaded, run:

```sh
npm run try
```

It works in all web tabs in that test window too. Keep the terminal open while you use it.

## Start by hand

1. In Firefox, type `about:debugging` in the address bar.
2. Click **This Firefox** on the left.
3. Click the button to load a temporary extension.
4. Choose `manifest.json` from the project folder.

The app turns on in open web tabs and works in new tabs.

## Look at a photo

Move your mouse over a photo. Click **View image** below it. At the edge of the screen, the button may sit above or beside it.

GIFs and animated PNG files keep moving. WebM and other video clips that Firefox can play work too. Click **View clip**, then use **Play**, **Pause**, or **Sound on**. Clips start with sound off.

IMG Hub also finds tall comic pages, page backgrounds, and photos under a page cover.

Put your mouse over the spot you want to see. Scroll up to zoom in. Scroll down to zoom out. You can keep zooming out or zooming in to see the pixels. The spot under your mouse stays in place.

Drag the photo to move it. Click **Reset** to go back to 100%. Click **1:1** to see its full size.

Use the arrows to see other photos. Press **Esc** or click **×** to close. You can also click an empty spot outside the photo.

## Settings

Click the IMG Hub icon in Firefox to change settings. **Minimum width (pixels)** starts at 160. Lower it to include small pictures. A pixel is one small dot in a picture.

**Hide logos**, **Hide ads**, and **Hide thumbnails** start on. These checks are guesses. Turn one off if it hides a picture you want. Click **Save preferences** when you are done.

After loading an updated copy, reload your open web pages.

Firefox blocks extensions on some pages, such as its settings pages. IMG Hub works on normal web pages where Firefox lets it run.
