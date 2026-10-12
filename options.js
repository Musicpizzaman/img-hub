(async function () {
  'use strict';
  const form = document.querySelector('form');
  const status = document.querySelector('#status');
  const keys = Object.keys(IMGHubCore.DEFAULTS);
  const controls = Object.fromEntries(keys.map(key => [key, document.getElementById(key)]));
  const buttons = [...document.querySelectorAll('button')];
  function fill(value) {
    const prefs = IMGHubCore.preferences(value);
    for (const key of keys) controls[key][key === 'minWidth' ? 'value' : 'checked'] = prefs[key];
    updateControls();
  }
  function updateControls() {
    controls.backgroundImages.disabled = controls.allImages.checked;
    controls.minWidth.disabled = controls.allImages.checked;
  }
  controls.allImages.addEventListener('change', updateControls);
  async function save(value) {
    buttons.forEach(button => button.disabled = true);
    try {
      const prefs = IMGHubCore.preferences(value);
      await browser.storage.local.set({preferences: prefs});
      fill(prefs);
      status.textContent = 'Saved. Open webpages update immediately.';
    } catch { status.textContent = 'Could not save. Please try again.'; }
    finally { buttons.forEach(button => button.disabled = false); }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.reportValidity()) save(Object.fromEntries(keys.map(key => [key, key === 'minWidth' ? Number(controls[key].value) : controls[key].checked])));
  });
  document.querySelector('#reset').addEventListener('click', () => save(IMGHubCore.DEFAULTS));
  try { fill((await browser.storage.local.get('preferences')).preferences); }
  catch { fill(IMGHubCore.DEFAULTS); status.textContent = 'Could not load saved preferences.'; }
})();
