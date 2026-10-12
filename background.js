(function () {
  'use strict';
  async function activateOpenTabs(api) {
    let tabs;
    try { tabs = await api.tabs.query({}); }
    catch { return []; }
    return Promise.allSettled(tabs.filter(tab => Number.isInteger(tab.id) && tab.id >= 0).map(tab =>
      api.scripting.executeScript({target: {tabId: tab.id, allFrames: true}, files: ['core.js', 'content.js']})
    ));
  }
  function register(api) {
    const activate = () => activateOpenTabs(api);
    api.runtime.onInstalled.addListener(activate);
    api.runtime.onStartup.addListener(activate);
    api.permissions.onAdded.addListener(permissions => permissions.origins?.length ? activate() : undefined);
  }
  if (typeof module !== 'undefined') module.exports = {activateOpenTabs, register};
  if (typeof browser !== 'undefined') register(browser);
})();
