# IMG Hub

Firefox Extension · Version 0.1.0 · Product Design & Implementation

A browser extension that lets you open photographs from websites in a dark image viewer, zoom with your mouse wheel, and navigate images without leaving the webpage.

## Feature and implementation cards

01\. Photo Detection

Automatically identifies photographs and large images on webpages.

Filters icons, logos, and small graphics using image dimensions and element metadata. Supports dynamically loaded images.

02\. Hover Mini Menu

A compact floating toolbar appears beneath eligible photos.

View image

Direct-click activation is optional so existing webpage links can remain functional.

03\. Image Lightbox

Opens the selected image in a dark overlay above the website.

[Горные озера Канады | ландшафты, пейзажи](https://images.openai.com/static-rsc-4/ZhFZtvwGWXGC7H8t-irT1C7Xvu-RtHoEtNhLIAjY_H81dBefAJbkmzirqy9NWDc0S3in4Ky3nKwUn7rxltTNHf8xdlz28knf-RNQTBYHx3boN9gDBFEec0SLjtcTKiPb4QqBcfrVGXnUmCgWG38es4AynW8-WIxduVxmVA5OncU?purpose=inline)

100%

Concept visualization

04\. Zoom & Pan

Mouse-wheel zoom centered on the pointer, plus click-and-drag panning.

Includes zoom in, zoom out, fit-to-screen, original-size view, and a magnification indicator.

100%

05\. Close Actions

Multiple ways to dismiss the viewer.

Esc

Close

Outside click

Restores normal page interaction and preserves the original scroll position.

06\. Preferences

Direct-click activation

Hover controls

CSS background images

Minimum image width160 px

Interactive settings mockup. These controls do not change Firefox settings.

07\. Firefox Architecture

Manifest V3 → Content Script → Shadow DOM → Browser Storage

JavaScript, HTML, and CSS. No .NET backend, database server, or external dependency required.

08\. Compatibility Testing

Test IMG Hub against typical webpage layouts.

News articles and blogs

Image galleries

Product image pages

Infinite-scrolling content

Firefox-restricted pages and some embedded content will need special handling.

## GitHub and Firefox setup cards

09\. Create the GitHub Repository

Repository: `img-hub` · Suggested visibility: Private

&#x20;Create repository Copy Git commands

```

git init
git add .
git commit -m "Initial IMG Hub build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/img-hub.git
git push -u origin main
    
```

Run these from the project folder. Replace YOUR_USERNAME with your GitHub username.

10\. Project Structure

```

img-hub/
├── manifest.json
├── content.js
├── options.html
├── options.js
├── icons/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── screenshots/
├── README.md
├── LICENSE
└── .gitignore
    
```

Use the new IMG Hub name in the manifest, README, options page, and extension metadata. Export the logo into Firefox icon sizes.

11\. Install IMG Hub in Firefox

1. Clone or download the GitHub repository.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click Load Temporary Add-on.
4. Select the project's `manifest.json` file.
5. Test the hover menu, lightbox, zoom, drag, and close interactions.

&#x20;Copy Firefox debugging address

The temporary installation must be reloaded after Firefox restarts.

12\. Permanent Private Installation

Submit IMG Hub through Mozilla Add-ons as an unlisted extension for signing, then install the signed `.xpi` file in Firefox.

Unlisted means the extension does not need a public listing, although Mozilla's signing requirements still apply.

&#x20;Mozilla Developer Hub

## Branding card

13\. IMG Hub Visual Identity

# IMG Hub

Charcoal

\#0B0F17

Cyan

\#00C2FF

Violet

\#8B5CFF

Snow

\#F8FAFC

Rounded image-frame icon with blue-to-violet accents, dark image viewer, and minimal floating controls. The identity is intended for the Firefox toolbar, GitHub README, and extension settings.

These are the 13 IMG Hub cards covering the user experience, technical implementation, GitHub setup, Firefox installation, and visual identity.