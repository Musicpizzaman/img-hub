# IMG Hub — install in Firefox

IMG Hub opens webpage photos in a viewer with mouse-wheel zoom and drag-to-pan.

## Temporary installation

1. Download this repository using **Code → Download ZIP** and extract it. Because the repository is private, sign into GitHub first.
2. In Firefox **142 or later**, enter `about:debugging#/runtime/this-firefox` in the address bar.
3. Click **Load Temporary Add-on…**.
4. Select `manifest.json` in the extracted project folder.
5. Open or reload a normal webpage with large photos. Grant website access if Firefox asks.
6. Hover a photo and click **View image**.

You do not need Node.js or a build step to install the source folder. Firefox removes temporary add-ons when it closes; load it again after restarting.

## Use it

Put your mouse over the part of the image you want to inspect, then scroll up to zoom in or down to zoom out. The image point under your mouse stays under your mouse in both directions, including after dragging the image.

Drag to pan. **Fit** fits the image to the window; **1:1** shows its original size. Use the arrow buttons or arrow keys to browse. Press **Esc**, click **×**, or click outside the image to close.

Click the IMG Hub toolbar icon to change preferences. Direct-click opening is off by default so website links keep working.

## Keep it installed permanently

The source folder and build ZIP are unsigned. For installation that survives Firefox restarts, submit a package to Mozilla as an **unlisted** extension, download the signed XPI, and install it through **about:addons → gear menu → Install Add-on From File…**.

See the [complete installation guide](docs/SETUP.md) for packaging, signing, settings, and troubleshooting.

Firefox blocks extensions on internal pages and some restricted websites. IMG Hub works on normal HTTP/HTTPS webpages.
