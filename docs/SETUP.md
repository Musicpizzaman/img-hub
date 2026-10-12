# IMG Hub: Firefox setup guide

![Standalone Firefox setup illustration](../assets/setup-illustration.png)

This guide takes you from the private GitHub repository to a temporary installation, then an optional signed installation that survives Firefox restarts.

## 1. Get the project

Open [Musicpizzaman/img-hub](https://github.com/Musicpizzaman/img-hub). You must be signed into an account with access because the repository is private.

Choose **Code → Download ZIP**, save it, and extract it. Do not select a file inside the unextracted ZIP when loading the extension. Alternatively:

```sh
git clone https://github.com/Musicpizzaman/img-hub.git
cd img-hub
```

Locate `manifest.json`. The same directory should contain `content.js`, `core.js`, the options files, and `icons/`. You do not need Node.js, npm, or a build step to load this source folder.

## 2. Load it temporarily

1. Use desktop Firefox **142 or later**.
2. Enter `about:debugging#/runtime/this-firefox` in the address bar.
3. Click **Load Temporary Add-on…**.
4. Select this project's `manifest.json`.
5. Confirm **IMG Hub** appears under Temporary Extensions.
6. Visit or reload an ordinary HTTP/HTTPS page with large photographs. If Firefox asks for website access, grant access for the site you want to use.

Mozilla's [temporary installation instructions](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) describe the same workflow. Firefox removes temporary add-ons when it closes; repeat these steps after restarting.

## 3. Use the viewer

Hover a photograph and click **View image**. A dark viewer opens above the webpage.

![Working viewer](../screenshots/viewer.png)

Use your mouse wheel to zoom toward the pointer, and drag the image to pan. **Fit** returns it to the available viewport; **1:1** shows the image at its natural size. The percentage is relative to that natural size. Use the arrows to move through eligible images. **Esc**, **×**, or an empty area outside the image closes the viewer.

Direct clicking is off initially so webpage image links remain usable. Modifier clicks such as Ctrl-click continue to follow normal browser behavior.

## 4. Adjust preferences

Click the IMG Hub icon in Firefox's extensions menu or toolbar. You can also open **Add-ons and themes → Extensions → IMG Hub → Preferences**.

![Implemented preferences](../screenshots/preferences.png)

- **Direct click to open:** opens eligible photos with a normal click.
- **Hover controls:** shows the View image button.
- **CSS background images:** adds single background-image URLs. Large decorative backgrounds may qualify.
- **Minimum image width:** defaults to 160 pixels; accepts 80–2000 pixels. Images also need at least 80 pixels of height.

Click **Save preferences**. Existing pages update immediately. **Reset** restores the defaults. If both hover and direct-click opening are disabled, turn one on to open images again.

## 5. Build a clean package

For temporary use, the source folder is enough. For Mozilla signing, install Node.js 22 or later and run:

```sh
npm ci
npm test
npm run lint
npm run build
```

Upload `dist/img_hub-0.1.0.zip`, which contains only the extension files. The manifest is at the ZIP root. Renaming an unsigned ZIP to XPI does not make it a permanently installable signed extension.

## 6. Keep it installed permanently

1. Sign into the [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2. Start a new add-on submission and select **On your own** / the unlisted self-distribution option.
3. Upload the clean ZIP. Complete Mozilla's validation, data declarations, and any review requirements.
4. Download the **signed XPI** Mozilla provides.
5. In Firefox, open `about:addons`. Use the gear menu and choose **Install Add-on From File…**.
6. Select the signed XPI and approve Firefox's installation prompt.

Mozilla's [signing overview](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/) and [self-distributed installation guide](https://extensionworkshop.com/documentation/publish/install-self-distributed/) explain these steps. Unlisted extensions do not need a public marketplace listing, but they still require signing. This repository does not already include a signed XPI or submit anything to Mozilla.

Keep the manifest's add-on ID stable for future versions. For unlisted releases without an update server, install each newer signed XPI manually. Temporary-install and signed-install profiles may have different saved preferences.

## Troubleshooting

| Symptom | What to try |
| --- | --- |
| No View image button | Reload the webpage after loading IMG Hub, grant site access, enable hover controls, or lower minimum width. |
| Nothing happens on a Firefox settings or Add-ons page | Use a normal website. Firefox prevents content scripts on restricted pages. |
| Background photo is missed | Enable CSS backgrounds and allow a moment for discovery. Only single URL backgrounds qualify. |
| Viewer says the image cannot load | The source may have expired, require authentication, or be blocked by the website. Close it or move to another image. |
| Image links open instead of the viewer | Enable direct-click opening, or use the hover button. |
| Navigation misses recently added images | Close and reopen the viewer to collect a fresh gallery. |
| The extension disappears on restart | Temporary loading lasts only for the current Firefox session. Use a Mozilla-signed XPI for persistent installation. |
| Install from file says the package is unsigned | Complete the unlisted signing process; the build ZIP is not signed. |

For editing and validation, continue with [development instructions](DEVELOPMENT.md).
