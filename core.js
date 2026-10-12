/* Shared, dependency-free logic for content scripts, preferences, and tests. */
(function (root) {
  'use strict';
  const DEFAULTS = Object.freeze({directClick: false, hoverControls: true, backgroundImages: false, minWidth: 160});
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function preferences(value = {}) {
    return {
      directClick: typeof value.directClick === 'boolean' ? value.directClick : DEFAULTS.directClick,
      hoverControls: typeof value.hoverControls === 'boolean' ? value.hoverControls : DEFAULTS.hoverControls,
      backgroundImages: typeof value.backgroundImages === 'boolean' ? value.backgroundImages : DEFAULTS.backgroundImages,
      minWidth: Number.isFinite(Number(value.minWidth)) ? clamp(Math.round(Number(value.minWidth)), 80, 2000) : DEFAULTS.minWidth
    };
  }
  function safeSource(source, base) {
    try {
      const url = new URL(source, base);
      return ['http:', 'https:', 'data:', 'blob:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  function eligible({width, height, naturalWidth = width, naturalHeight = height, metadata = ''}, minWidth) {
    return width >= minWidth && height >= 80 && naturalWidth >= minWidth && naturalHeight >= 80 &&
      width / height < 6 && height / width < 6 &&
      !/(?:^|[\s_\-/])(icon|logo|avatar|emoji|badge|sprite|favicon)(?:$|[\s_\-/.\d])/i.test(metadata);
  }
  function zoomAt(view, nextScale, point) {
    const scale = clamp(nextScale, 0.02, 16);
    const ratio = scale / view.scale;
    return {scale, x: point.x - (point.x - view.x) * ratio, y: point.y - (point.y - view.y) * ratio};
  }
  function fitScale(width, height, viewportWidth, viewportHeight) {
    return clamp(Math.min(1, (viewportWidth - 48) / width, (viewportHeight - 48) / height), 0.02, 16);
  }
  const api = Object.freeze({DEFAULTS, clamp, preferences, safeSource, eligible, zoomAt, fitScale});
  root.IMGHubCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
