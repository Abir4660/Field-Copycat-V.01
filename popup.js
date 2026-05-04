const btnCapture = document.getElementById('btnCapture');
const btnPaste = document.getElementById('btnPaste');
const btnClear = document.getElementById('btnClear');
const fieldsPreview = document.getElementById('fieldsPreview');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const capturedCount = document.getElementById('capturedCount');
const pasteCount = document.getElementById('pasteCount');
const footerStatus = document.getElementById('footerStatus');

function setStatus(msg, type) {
  statusText.textContent = msg;
  statusDot.className = 'status-dot' + (type ? ' ' + type : '');
}

function renderFields(fields) {
  capturedCount.textContent = fields.length ? `(${fields.length})` : '';
  if (!fields.length) {
    fieldsPreview.innerHTML = '<div class="empty-hint">No fields captured yet</div>';
    btnPaste.disabled = true;
    pasteCount.textContent = '';
    footerStatus.textContent = '';
    return;
  }
  fieldsPreview.innerHTML = fields.map((f, i) => `
    <div class="field-item">
      <span class="field-num">${i + 1}</span>
      <span class="field-val">${f.value || '<em style="color:#aaa">empty</em>'}</span>
      <span class="field-type">${f.type}</span>
    </div>
  `).join('');
  btnPaste.disabled = false;
  pasteCount.textContent = fields.length;
  footerStatus.textContent = `${fields.length} field${fields.length > 1 ? 's' : ''} ready`;
}

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function injectAndRun(action) {
  const tab = await getCurrentTab();
  if (!tab || !tab.id) { setStatus('Cannot access this page', 'error'); return; }

  const url = tab.url || '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
    setStatus('Cannot run on browser system pages', 'error');
    return;
  }

  try {
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content.css'] }).catch(() => {});
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).catch(() => {});
    await new Promise(r => setTimeout(r, 100));
    await chrome.tabs.sendMessage(tab.id, { action });
  } catch (err) {
    console.error('Inject error:', err);
    setStatus('Could not access page — try refreshing it', 'error');
  }
}

btnCapture.addEventListener('click', async () => {
  setStatus('Launching capture mode…', 'active');
  await injectAndRun('startCapture');
  window.close();
});

btnPaste.addEventListener('click', async () => {
  setStatus('Launching paste mode…', 'pasting');
  await injectAndRun('startPaste');
  window.close();
});

btnClear.addEventListener('click', async () => {
  await chrome.storage.local.set({ capturedFields: [] });
  renderFields([]);
  setStatus('Cleared — ready to capture again', '');
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.capturedFields) renderFields(changes.capturedFields.newValue || []);
});

async function init() {
  const data = await chrome.storage.local.get('capturedFields');
  renderFields(data.capturedFields || []);
}
init();
