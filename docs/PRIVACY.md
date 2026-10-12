# Privacy

IMG Hub has no account service, analytics, telemetry, upload endpoint, or advertising integration.

- Image elements, source URLs, and captions are inspected locally in the webpage to provide the viewer.
- Preferences are stored with browser.storage.local in your Firefox profile.
- The viewer loads the existing image source URL. The hosting website may receive an ordinary image request, including its normal browser authentication and referrer behavior.
- IMG Hub does not store your browsing history or image collection.
- Website access is used by its content scripts. The storage permission is used for preferences.
- No personal information is sent to a project backend.

The manifest declares no data collection for storage or processing outside the extension, using Mozilla's [data consent declaration](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/).
