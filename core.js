/* Shared logic for content scripts, preferences, and tests. */
(function (root) {
  'use strict';
  const DEFAULTS = Object.freeze({directClick: false, hoverControls: true, backgroundImages: true, minWidth: 160, hideLogos: true, hideAds: true, hideThumbnails: true});
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function preferences(value = {}) {
    if (!value || typeof value !== 'object') value = {};
    const result = {};
    for (const key of ['directClick', 'hoverControls', 'hideLogos', 'hideAds', 'hideThumbnails']) {
      result[key] = typeof value[key] === 'boolean' ? value[key] : DEFAULTS[key];
    }
    // Preserve the effective background choice from older saved settings.
    result.backgroundImages = value.allImages === true || (typeof value.backgroundImages === 'boolean' ? value.backgroundImages : DEFAULTS.backgroundImages);
    const pixels = Number(value.minWidth);
    result.minWidth = Number.isFinite(pixels) ? clamp(Math.round(pixels), 1, 1000000) : DEFAULTS.minWidth;
    return result;
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
      naturalWidth >= minWidth;
  }
  function filtered({own = '', label = '', context = '', logoContext = '', thumbnailContext = '', source = '', adMarked = false, thumbnailHint = false}, prefs) {
    const tokens = value => String(value).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[^a-z0-9]+/gi, ' ').toLowerCase();
    let pathname = '';
    try {
      const url = new URL(source);
      if (['http:', 'https:'].includes(url.protocol)) {
        try { pathname = decodeURIComponent(url.pathname); } catch { pathname = url.pathname; }
      }
    } catch { /* DOM metadata can still identify a picture. */ }
    const image = tokens(own + ' ' + pathname);
    const logo = /\b(?:logo|logos|logotype|logomark|brandmark|favicon)\d*\b/.test(image + ' ' + tokens(label + ' ' + logoContext));
    const ad = adMarked || /\b(?:ad|ads|advert|advertisement|advertising|adslot|sponsored)\d*\b/.test(image + ' ' + tokens(context));
    const thumbnail = !logo && (thumbnailHint || /\b(?:thumb|thumbs|thumbnail|thumbnails)\d*\b|\b(?:preview (?:image|photo)|(?:image|photo) preview)\b/.test(image + ' ' + tokens(thumbnailContext)));
    return (prefs.hideLogos && logo) || (prefs.hideAds && ad) || (prefs.hideThumbnails && thumbnail);
  }
  function formatZoom(scale) {
    const percent = scale * 100;
    return (percent >= 1 ? String(Math.round(percent)) : String(Number(percent.toPrecision(3)))) + '%';
  }
  function zoomAt(view, nextScale, point) {
    if (!Number.isFinite(nextScale) || nextScale <= 0) return {...view};
    const scale = nextScale;
    const ratio = scale / view.scale;
    const x = point.x - (point.x - view.x) * ratio;
    const y = point.y - (point.y - view.y) * ratio;
    return [scale, x, y].every(Number.isFinite) ? {scale, x, y} : {...view};
  }
  const api = Object.freeze({DEFAULTS, clamp, preferences, safeSource, backgroundSources, eligible, filtered, formatZoom, zoomAt});
  root.IMGHubCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
