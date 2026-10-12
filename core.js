/* Shared logic for content scripts, preferences, and tests. */
(function (root) {
  'use strict';
  const DEFAULTS = Object.freeze({directClick: false, hoverControls: true, allImages: true, backgroundImages: false, minWidth: 160});
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function preferences(value = {}) {
    return {
      directClick: typeof value.directClick === 'boolean' ? value.directClick : DEFAULTS.directClick,
      hoverControls: typeof value.hoverControls === 'boolean' ? value.hoverControls : DEFAULTS.hoverControls,
      allImages: typeof value.allImages === 'boolean' ? value.allImages : DEFAULTS.allImages,
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
  function backgroundSources(value, base) {
    const result = [];
    const pattern = /url\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|((?:\\.|[^)\\])*?))\s*\)/gi;
    for (const match of String(value || '').matchAll(pattern)) {
      const source = (match[1] ?? match[2] ?? match[3].trim()).replace(/\\(?:([0-9a-f]{1,6})\s?|(\r\n|[\n\r\f])|([\s\S]))/gi, (escape, hex, newline, char) => {
        if (!hex) return newline ? '' : char;
        const code = parseInt(hex, 16);
        return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
      });
      const url = source && safeSource(source, base);
      if (url && !result.includes(url)) result.push(url);
    }
    return result;
  }
  function eligible({width, height, naturalWidth = width, naturalHeight = height}, minWidth = 0) {
    return [width, height, naturalWidth, naturalHeight].every(value => Number.isFinite(value) && value > 0) &&
      width >= minWidth && naturalWidth >= minWidth;
  }
  function zoomAt(view, nextScale, point) {
    if (!Number.isFinite(nextScale)) return {...view};
    const scale = Math.max(1, nextScale);
    const ratio = scale / view.scale;
    const x = point.x - (point.x - view.x) * ratio;
    const y = point.y - (point.y - view.y) * ratio;
    return [scale, x, y].every(Number.isFinite) ? {scale, x, y} : {...view};
  }
  const api = Object.freeze({DEFAULTS, clamp, preferences, safeSource, backgroundSources, eligible, zoomAt});
  root.IMGHubCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
