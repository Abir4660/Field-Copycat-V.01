// Guard against double-injection
if (typeof window.__fieldCopycatLoaded === 'undefined') {
  window.__fieldCopycatLoaded = true;

  let mode = null;
  let isDragging = false;
  let startX = 0, startY = 0, currentX = 0, currentY = 0;
  let overlay, selBox, instructions, countBadge, highlightsContainer;

  const FIELD_SEL = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]):not([type="file"]), textarea, select';

  function showToast(msg, type, duration) {
    duration = duration || 2500;
    let t = document.getElementById('fc-toast');
    if (!t) { t = document.createElement('div'); t.id = 'fc-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'fc-show' + (type ? ' fc-' + type : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('fc-show'), duration);
  }

  function getFieldsInRect(rect) {
    const all = document.querySelectorAll(FIELD_SEL);
    const found = [];
    all.forEach(el => {
      if (el.closest('#fc-overlay')) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
        found.push(el);
      }
    });
    return found;
  }

  function extractFieldData(el) {
    const tag = el.tagName.toLowerCase();
    let value = '', type = el.type || tag;
    if (tag === 'select') {
      value = el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : el.value;
      type = 'select';
    } else if (el.type === 'checkbox' || el.type === 'radio') {
      value = el.checked ? (el.value || 'true') : '';
      type = el.type;
    } else {
      value = el.value || '';
      type = el.type || 'text';
    }
    return { value, type, tagName: tag, inputType: el.type || '', name: el.name || el.id || el.placeholder || '', placeholder: el.placeholder || '' };
  }

  function triggerEvent(el, name) {
    el.dispatchEvent(new Event(name, { bubbles: true }));
  }

  function pasteIntoFields(targets, captured) {
    let count = 0;
    targets.forEach((el, i) => {
      if (i >= captured.length) return;
      const data = captured[i];
      const tag = el.tagName.toLowerCase();
      if (tag === 'select') {
        const opts = Array.from(el.options);
        const match = opts.find(o => o.text.toLowerCase() === data.value.toLowerCase() || o.value.toLowerCase() === data.value.toLowerCase());
        if (match) { el.value = match.value; triggerEvent(el, 'change'); count++; }
      } else if (el.type === 'checkbox' || el.type === 'radio') {
        el.checked = !!data.value && data.value !== 'false';
        triggerEvent(el, 'change'); count++;
      } else {
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value');
        if (setter && setter.set) setter.set.call(el, data.value);
        else el.value = data.value;
        triggerEvent(el, 'input');
        triggerEvent(el, 'change');
        count++;
      }
    });
    return count;
  }

  function flashHighlights(els, isPaste) {
    if (!highlightsContainer) {
      highlightsContainer = document.createElement('div');
      highlightsContainer.id = 'fc-field-highlights';
      document.body.appendChild(highlightsContainer);
    }
    highlightsContainer.innerHTML = '';
    const scrollX = window.scrollX, scrollY = window.scrollY;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      const h = document.createElement('div');
      h.className = 'fc-highlight' + (isPaste ? ' paste' : '');
      h.style.cssText = `position:absolute;left:${r.left+scrollX}px;top:${r.top+scrollY}px;width:${r.width}px;height:${r.height}px;`;
      highlightsContainer.appendChild(h);
    });
    setTimeout(() => { if (highlightsContainer) highlightsContainer.innerHTML = ''; }, 1800);
  }

  function getSelRect() {
    return {
      left: Math.min(startX, currentX), top: Math.min(startY, currentY),
      right: Math.max(startX, currentX), bottom: Math.max(startY, currentY)
    };
  }

  function removeOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
    if (instructions) { instructions.remove(); instructions = null; }
    isDragging = false;
    mode = null;
    document.removeEventListener('keydown', onKeyDown);
  }

  function buildOverlay(isPaste) {
    removeOverlay();
    mode = isPaste ? 'paste' : 'capture';

    overlay = document.createElement('div');
    overlay.id = 'fc-overlay';

    const bg = document.createElement('div');
    bg.id = 'fc-overlay-bg';
    overlay.appendChild(bg);

    selBox = document.createElement('div');
    selBox.id = 'fc-selection';
    if (isPaste) selBox.classList.add('paste-mode');
    overlay.appendChild(selBox);

    countBadge = document.createElement('div');
    countBadge.id = 'fc-count-badge';
    if (isPaste) countBadge.classList.add('paste');
    countBadge.style.display = 'none';
    overlay.appendChild(countBadge);

    overlay.addEventListener('mousedown', onMouseDown);
    overlay.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    document.body.appendChild(overlay);

    instructions = document.createElement('div');
    instructions.id = 'fc-instructions';
    instructions.innerHTML = isPaste
      ? '&#9889; Drag over the <b>empty</b> fields to paste into &nbsp;<span class="fc-key">Esc</span> cancel'
      : '&#9702; Drag over the <b>filled</b> fields to copy &nbsp;<span class="fc-key">Esc</span> cancel';
    document.body.appendChild(instructions);
  }

  function onMouseDown(e) {
    isDragging = true;
    startX = currentX = e.clientX;
    startY = currentY = e.clientY;
    selBox.style.cssText = `display:block;left:${startX}px;top:${startY}px;width:0;height:0;`;
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    currentX = e.clientX; currentY = e.clientY;
    const r = getSelRect();
    selBox.style.left = r.left + 'px';
    selBox.style.top = r.top + 'px';
    selBox.style.width = (r.right - r.left) + 'px';
    selBox.style.height = (r.bottom - r.top) + 'px';
    const found = getFieldsInRect(r);
    if (found.length) {
      countBadge.style.display = 'block';
      countBadge.style.left = (r.right - 10) + 'px';
      countBadge.style.top = (r.top - 14) + 'px';
      countBadge.textContent = found.length + (found.length === 1 ? ' field' : ' fields');
    } else {
      countBadge.style.display = 'none';
    }
  }

  async function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    currentX = e.clientX; currentY = e.clientY;
    const r = getSelRect();
    const foundEls = getFieldsInRect(r);
    const currentMode = mode;
    removeOverlay();

    if (currentMode === 'capture') {
      if (!foundEls.length) { showToast('No form fields found in that area', 'error'); return; }
      const fields = foundEls.map(extractFieldData);
      await chrome.storage.local.set({ capturedFields: fields });
      flashHighlights(foundEls, false);
      showToast('Copied ' + fields.length + ' field' + (fields.length > 1 ? 's' : '') + '!', 'success');
    } else if (currentMode === 'paste') {
      if (!foundEls.length) { showToast('No form fields found in that area', 'error'); return; }
      const data = await chrome.storage.local.get('capturedFields');
      const captured = data.capturedFields || [];
      if (!captured.length) { showToast('Nothing captured yet — use Copy first', 'error'); return; }
      const count = pasteIntoFields(foundEls, captured);
      flashHighlights(foundEls, true);
      showToast('Pasted into ' + count + ' field' + (count > 1 ? 's' : '') + '!', 'info');
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { removeOverlay(); showToast('Cancelled'); }
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'startCapture') buildOverlay(false);
    if (msg.action === 'startPaste') buildOverlay(true);
  });

} else {
  // Already loaded — just re-listen for messages (handles re-injection)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'startCapture' || msg.action === 'startPaste') {
      // Re-trigger via a custom event so the existing instance handles it
      window.dispatchEvent(new CustomEvent('fc-action', { detail: msg.action }));
    }
  });
}
