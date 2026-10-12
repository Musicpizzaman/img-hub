(async function () {
  'use strict';
  if (document.getElementById('img-hub-root')) return;
  const C = IMGHubCore;
  let prefs = C.preferences();
  try { prefs = C.preferences((await browser.storage.local.get('preferences')).preferences); } catch { /* Defaults work without storage. */ }
  // Manifest and open-tab injection can both start while storage is loading.
  if (document.getElementById('img-hub-root')) return;
  const host = document.createElement('div');
  host.id = 'img-hub-root';
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;pointer-events:none!important;z-index:2147483647!important;';
  const shadow = host.attachShadow({mode: 'closed'});
  // This markup is a fixed template; webpage text and URLs are assigned via DOM properties.
  shadow.innerHTML = `
    <style>
      :host{color-scheme:dark;font:14px system-ui,sans-serif;color:#f8fafc}*{box-sizing:border-box}
      [hidden]{display:none!important}button{font:inherit;color:#f8fafc;background:#1c2637;border:1px solid #3b4962;border-radius:10px;padding:10px 14px;cursor:pointer;touch-action:manipulation}button:hover{background:#303e58}button:disabled{opacity:.35;cursor:default}button:focus-visible{outline:3px solid #00c2ff;outline-offset:3px}
      #hover{position:fixed;pointer-events:auto;display:flex;gap:8px;background:#0b0f17;border:1px solid #4c6484;border-radius:12px;padding:4px;box-shadow:0 6px 24px #0008}#hover button{border:0;background:none;padding:7px 12px}#hover button:hover{background:#24344c}
      dialog{position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#0b0f17f5;color:#f8fafc;pointer-events:auto;overflow:hidden;overscroll-behavior:contain;font:14px system-ui,sans-serif}dialog::backdrop{background:#0b0f17e8}
      header{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:14px;padding:18px 24px;z-index:2;background:linear-gradient(#0b0f17,transparent)}header strong{font-size:20px;white-space:nowrap}header strong span{color:#00c2ff}#caption{color:#b5c1d4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}#close{font-size:24px;padding:3px 14px}
      #stage{position:absolute;inset:78px 22px 96px;overflow:hidden;touch-action:none;cursor:grab;border-radius:14px}#stage.dragging{cursor:grabbing}#photo{position:absolute;left:50%;top:50%;max-width:none;max-height:none;user-select:none;pointer-events:none;transform-origin:0 0;will-change:transform}#message{position:absolute;inset:45% 10% auto;text-align:center;color:#b5c1d4;pointer-events:none}
      nav{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;max-width:calc(100% - 24px);padding:8px;border:1px solid #344359;border-radius:16px;background:#131b29;box-shadow:0 10px 35px #0009}#zoom{min-width:58px;text-align:center;font-variant-numeric:tabular-nums}#count{min-width:60px;text-align:center;color:#9caac1;font-variant-numeric:tabular-nums}#hint{position:absolute;bottom:4px;left:0;right:0;text-align:center;color:#a6b4c9;font-size:11px;pointer-events:none}
      @media(max-width:600px){header{padding:12px}#stage{inset:64px 8px 122px}nav{bottom:30px;flex-wrap:wrap;justify-content:center;width:320px}nav button{padding:7px 10px}#hint{bottom:8px}#caption{font-size:12px}}
    </style>
    <div id="hover" hidden><button id="view" type="button" aria-label="View image in IMG Hub">◉ View image</button></div>
    <dialog aria-label="IMG Hub image viewer">
      <header><strong>IMG <span>Hub</span></strong><span id="caption"></span><button id="close" aria-label="Close image viewer" title="Close (Esc)">×</button></header>
      <div id="stage"><img id="photo" alt="" draggable="false" hidden><div id="message" role="status" aria-live="polite"></div></div>
      <nav aria-label="Image controls">
        <button id="prev" aria-label="Previous image" title="Previous (←)">←</button><span id="count"></span><button id="next" aria-label="Next image" title="Next (→)">→</button>
        <button id="out" aria-label="Zoom out" title="Zoom out (−)">−</button><output id="zoom" aria-label="Magnification">100%</output><button id="in" aria-label="Zoom in" title="Zoom in (+)">+</button>
        <button id="reset" title="Reset view (F)">Reset</button><button id="original" title="Original size (0)">1:1</button>
      </nav><div id="hint">Wheel to zoom · Drag to pan · Arrow keys to browse · Esc to close</div>
    </dialog>`;
  document.documentElement.append(host);
  const $ = id => shadow.getElementById(id);
  const dialog = shadow.querySelector('dialog');
  const stage = $('stage');
  const photo = $('photo');
  const hover = $('hover');
  const candidates = new Set(document.querySelectorAll('img'));
  let hovered = null, hoverTimer, pageFocus = null, gallery = [], index = 0, view = {scale: 1, x: 0, y: 0};
  let drag = null, didDrag = false, savedScroll = null, loadId = 0;

  function sourceFor(element) {
    if (!(element instanceof Element) || !element.isConnected || element === host) return null;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(element).visibility === 'hidden') return null;
    const img = element instanceof HTMLImageElement;
    if (!img && !prefs.backgroundImages) return null;
    const metadata = `${element.id} ${typeof element.className === 'string' ? element.className : ''} ${element.getAttribute('alt') || ''} ${element.getAttribute('role') || ''}`;
    if (!C.eligible({width: rect.width, height: rect.height, naturalWidth: img ? element.naturalWidth : rect.width, naturalHeight: img ? element.naturalHeight : rect.height, metadata}, prefs.minWidth)) return null;
    let source;
    if (img) source = element.currentSrc || element.src;
    else {
      const background = getComputedStyle(element).backgroundImage;
      const match = /^url\(["']?(.*?)["']?\)$/.exec(background);
      source = match?.[1];
    }
    const url = source && C.safeSource(source, document.baseURI);
    return url ? {element, url, caption: element.getAttribute('alt') || element.getAttribute('aria-label') || 'Webpage image'} : null;
  }
  function findTarget(target) {
    // Ancestors support photos with captions or transparent overlays.
    for (let element = target, depth = 0; element instanceof Element && depth < 5; element = element.parentElement, depth++) {
      const entry = sourceFor(element);
      if (entry) { candidates.add(element); return entry; }
    }
    return null;
  }
  function hideHover() { hover.hidden = true; hovered = null; }
  function positionHover() {
    if (!hovered || !hovered.element.isConnected || dialog.open) { hideHover(); return; }
    const rect = hovered.element.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth) { hideHover(); return; }
    hover.style.left = `${C.clamp(rect.left + 12, 6, innerWidth - hover.offsetWidth - 6)}px`;
    hover.style.top = `${C.clamp(rect.bottom - hover.offsetHeight - 10, 6, innerHeight - hover.offsetHeight - 6)}px`;
  }
  document.addEventListener('pointerover', event => {
    if (event.target === host || dialog.open || !prefs.hoverControls) return;
    clearTimeout(hoverTimer);
    const entry = findTarget(event.target);
    if (!entry) { hideHover(); return; }
    pageFocus = document.activeElement;
    hovered = entry; hover.hidden = false; positionHover();
  }, true);
  document.addEventListener('pointerout', event => {
    if (dialog.open || event.relatedTarget === host || event.target === host) return;
    hoverTimer = setTimeout(hideHover, 200);
  }, true);
  hover.addEventListener('pointerenter', () => clearTimeout(hoverTimer));
  hover.addEventListener('pointerleave', () => { hoverTimer = setTimeout(hideHover, 200); });
  $('view').addEventListener('click', () => { if (hovered) open(hovered); });
  document.addEventListener('click', event => {
    if (!prefs.directClick || dialog.open || event.target === host || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const entry = findTarget(event.target);
    if (!entry) return;
    event.preventDefault(); event.stopImmediatePropagation(); pageFocus = document.activeElement; open(entry);
  }, true);

  // Background discovery runs in small idle chunks; mutations only scan affected subtrees.
  const pending = [];
  let scanScheduled = false;
  function queueBackground(root) {
    if (!prefs.backgroundImages || !(root instanceof Element) || root === host || host.contains(root)) return;
    pending.push({root, walker: document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT), started: false});
    scheduleScan();
  }
  function scheduleScan() {
    if (scanScheduled || !pending.length) return;
    scanScheduled = true;
    (window.requestIdleCallback || (fn => setTimeout(fn, 30)))(scanBackground);
  }
  function scanBackground() {
    scanScheduled = false;
    if (!prefs.backgroundImages) { pending.length = 0; return; }
    for (let count = 0; pending.length && count < 150; count++) {
      const task = pending[0];
      if (!task.root.isConnected) { pending.shift(); continue; }
      const element = task.started ? task.walker.nextNode() : task.root;
      task.started = true;
      if (!element) { pending.shift(); continue; }
      if (element !== host && !(element instanceof HTMLImageElement) && getComputedStyle(element).backgroundImage.startsWith('url(')) candidates.add(element);
    }
    scheduleScan();
  }
  queueBackground(document.body);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.target === host) continue;
      if (record.type === 'attributes') {
        if (!(record.target instanceof HTMLImageElement)) queueBackground(record.target);
      } else {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element) || node === host) continue;
          if (node.matches('img')) candidates.add(node);
          for (const img of node.querySelectorAll('img')) candidates.add(img);
          queueBackground(node);
        }
      }
    }
    for (const element of candidates) if (!element.isConnected) candidates.delete(element);
    if (hovered && !sourceFor(hovered.element)) hideHover();
  });
  observer.observe(document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'srcset', 'style', 'class']});
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.preferences) return;
    const backgroundsEnabled = !prefs.backgroundImages && changes.preferences.newValue?.backgroundImages;
    prefs = C.preferences(changes.preferences.newValue);
    hideHover(); if (backgroundsEnabled) queueBackground(document.body);
  });

  function collect(selected) {
    const entries = [...candidates].map(sourceFor).filter(Boolean);
    entries.sort((a, b) => a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1);
    const unique = entries.filter((entry, i, all) => all.findIndex(other => other.url === entry.url) === i);
    if (!unique.some(entry => entry.url === selected.url)) unique.push(selected);
    return unique;
  }
  function open(entry) {
    gallery = collect(entry); index = gallery.findIndex(image => image.url === entry.url); gallery[index] = entry;
    savedScroll = {x: scrollX, y: scrollY, overflow: document.documentElement.style.getPropertyValue('overflow'), priority: document.documentElement.style.getPropertyPriority('overflow')};
    document.documentElement.style.setProperty('overflow', 'hidden', 'important');
    hideHover(); dialog.showModal(); load(); $('close').focus({preventScroll: true});
  }
  function close() {
    if (!dialog.open) return;
    ++loadId; stopDrag(); dialog.close(); photo.hidden = true; photo.removeAttribute('src'); gallery = [];
    if (savedScroll) {
      if (savedScroll.overflow) document.documentElement.style.setProperty('overflow', savedScroll.overflow, savedScroll.priority);
      else document.documentElement.style.removeProperty('overflow');
      window.scrollTo({left: savedScroll.x, top: savedScroll.y, behavior: 'instant'});
      savedScroll = null;
    }
    if (pageFocus?.isConnected) pageFocus.focus({preventScroll: true});
  }
  function render() {
    photo.style.transform = `translate(${view.x - photo.naturalWidth * view.scale / 2}px, ${view.y - photo.naturalHeight * view.scale / 2}px) scale(${view.scale})`;
    photo.style.imageRendering = view.scale > 1 ? 'pixelated' : 'auto';
    $('out').disabled = view.scale <= 1;
    $('zoom').value = `${Math.round(view.scale * 100)}%`;
  }
  function reset() {
    if (!photo.naturalWidth || photo.hidden) return;
    view = {scale: 1, x: 0, y: 0}; render();
  }
  function load() {
    const currentLoad = ++loadId;
    stopDrag(); photo.hidden = true; $('message').textContent = 'Loading image…'; $('caption').textContent = gallery[index].caption;
    $('count').textContent = `${index + 1} / ${gallery.length}`;
    $('prev').disabled = index === 0; $('next').disabled = index === gallery.length - 1;
    for (const id of ['in', 'out', 'reset', 'original']) $(id).disabled = true;
    photo.onload = () => {
      if (currentLoad !== loadId || !dialog.open) return;
      photo.hidden = false; $('message').textContent = ''; reset();
      for (const id of ['in', 'reset', 'original']) $(id).disabled = false;
    };
    photo.onerror = () => { if (currentLoad === loadId && dialog.open) $('message').textContent = 'This image could not be loaded. Try another photo or close the viewer.'; };
    photo.alt = gallery[index].caption; photo.src = gallery[index].url;
  }
  function navigate(delta) {
    const next = C.clamp(index + delta, 0, gallery.length - 1);
    if (next !== index) { index = next; load(); }
  }
  function zoom(factor, point = {x: 0, y: 0}) {
    if (photo.hidden) return;
    const next = C.zoomAt(view, view.scale * factor, point);
    if (![next.scale * photo.naturalWidth, next.scale * photo.naturalHeight, next.scale * 100].every(Number.isFinite)) return;
    view = next; render();
  }
  stage.addEventListener('wheel', event => {
    event.preventDefault(); event.stopPropagation();
    const rect = stage.getBoundingClientRect();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1);
    zoom(Math.exp(-C.clamp(delta, -200, 200) * 0.002), {x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2});
  }, {passive: false});
  function pointOnPhoto(event) {
    const rect = photo.getBoundingClientRect();
    return !photo.hidden && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }
  stage.addEventListener('pointerdown', event => {
    didDrag = false;
    if (event.button !== 0 || !pointOnPhoto(event)) return;
    drag = {id: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y};
    stage.setPointerCapture(event.pointerId); stage.classList.add('dragging'); event.preventDefault();
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) didDrag = true;
    view.x = drag.x + dx; view.y = drag.y + dy; render();
  });
  function stopDrag() {
    if (drag && stage.hasPointerCapture(drag.id)) stage.releasePointerCapture(drag.id);
    drag = null; stage.classList.remove('dragging');
  }
  stage.addEventListener('pointerup', stopDrag); stage.addEventListener('pointercancel', stopDrag); stage.addEventListener('lostpointercapture', stopDrag);
  stage.addEventListener('click', event => { if (!didDrag && !pointOnPhoto(event)) close(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  $('close').addEventListener('click', close); $('prev').addEventListener('click', () => navigate(-1)); $('next').addEventListener('click', () => navigate(1));
  $('in').addEventListener('click', () => zoom(1.25)); $('out').addEventListener('click', () => zoom(0.8)); $('reset').addEventListener('click', reset);
  $('original').addEventListener('click', () => { if (!photo.hidden) { view = {scale: 1, x: 0, y: 0}; render(); } });
  // Native modal dialog supplies focus containment and makes the underlying page inert.
  document.addEventListener('keydown', event => {
    if (!dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
    const actions = {Escape: close, ArrowLeft: () => navigate(-1), ArrowRight: () => navigate(1), '+': () => zoom(1.25), '=': () => zoom(1.25), '-': () => zoom(0.8), f: reset, F: reset, '0': () => $('original').click()};
    if (actions[event.key]) { event.preventDefault(); event.stopImmediatePropagation(); actions[event.key](); }
  }, true);
  window.addEventListener('resize', () => { if (dialog.open) reset(); else positionHover(); });
  window.addEventListener('scroll', () => { if (!hover.hidden) positionHover(); }, true);
})();
