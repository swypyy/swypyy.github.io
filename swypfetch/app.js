const API_BASE = ''; // Example when deployed separately: 'https://api.your-domain.com'
const HISTORY_KEY = 'swypyy-downloader-history-v1';
const form = document.querySelector('#download-form');
const urlInput = document.querySelector('#media-url');
const message = document.querySelector('#message');
const previewSection = document.querySelector('#preview-section');
const previewContent = document.querySelector('#preview-content');
const previewButton = document.querySelector('#preview-button');
const historyList = document.querySelector('#history-list');
const historyCount = document.querySelector('#history-count');

let currentMedia = null;
document.querySelector('#year').textContent = new Date().getFullYear();

function detectPlatform(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') return 'YouTube';
  if (host === 'instagram.com' || host === 'instagr.am') return 'Instagram';
  if (host === 'facebook.com' || host === 'fb.watch' || host === 'm.facebook.com') return 'Facebook';
  return null;
}

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`.trim();
  message.hidden = false;
}
function hideMessage() { message.hidden = true; message.textContent = ''; }
function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}
function saveHistory(item) {
  const history = readHistory();
  history.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  renderHistory();
}
function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString();
}
function renderHistory() {
  const items = readHistory();
  historyCount.textContent = items.length;
  if (!items.length) {
    historyList.innerHTML = '<div class="empty-state"><span class="empty-icon">↻</span><p>No activity yet</p><small>Your preview and download activity will appear here.</small></div>';
    return;
  }
  historyList.replaceChildren();
  for (const item of items) {
    const row = document.createElement('div'); row.className = 'history-item';
    const icon = document.createElement('span'); icon.className = 'history-type'; icon.textContent = item.platform === 'YouTube' ? '▶' : item.platform === 'Instagram' ? '◎' : 'f';
    const details = document.createElement('div'); details.className = 'history-details';
    const title = document.createElement('strong'); title.textContent = item.title || `${item.platform} link`;
    const sub = document.createElement('small'); sub.textContent = `${item.platform} · ${safeDate(item.date)}`;
    details.append(title, sub);
    const state = document.createElement('span'); state.className = 'history-state'; state.textContent = item.action || 'Previewed';
    row.append(icon, details, state); historyList.append(row);
  }
}

function renderPreview(media) {
  currentMedia = media;
  previewSection.hidden = false;
  previewContent.replaceChildren();
  const meta = document.createElement('div'); meta.className = 'preview-meta';
  const art = document.createElement('div'); art.className = 'preview-art'; art.textContent = media.type === 'image' ? '▧' : '▶';
  const info = document.createElement('div'); info.className = 'preview-info';
  const title = document.createElement('strong'); title.textContent = media.title || `${media.platform} media`;
  const sub = document.createElement('small'); sub.textContent = `${media.platform} · ${media.type || 'Media'} · Permission-based access`;
  info.append(title, sub); meta.append(art, info); previewContent.append(meta);
  const note = document.createElement('p'); note.className = 'helper-text'; note.style.marginTop = '12px';
  note.textContent = 'Preview details will appear here when the backend integration is connected. No media has been downloaded.';
  previewContent.append(note);
  const actions = document.createElement('div'); actions.className = 'preview-actions';
  const unavailable = document.createElement('button'); unavailable.type = 'button'; unavailable.className = 'primary-button'; unavailable.disabled = true; unavailable.textContent = 'Download unavailable until backend is connected';
  actions.append(unavailable); previewContent.append(actions);
  saveHistory({ platform: media.platform, title: media.title || `${media.platform} link`, date: new Date().toISOString(), action: 'Previewed' });
  previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); hideMessage();
  const rawUrl = urlInput.value.trim();
  if (!rawUrl) return showMessage('Paste a link first.', 'error');
  const platform = detectPlatform(rawUrl);
  if (!platform) return showMessage('That link is not from YouTube, Instagram or Facebook. Check the URL and try again.', 'error');
  previewButton.disabled = true; previewButton.textContent = 'Checking link…';
  try {
    const response = await fetch(`${API_BASE}/api/resolve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: rawUrl, platform })
    });
    if (!response.ok) throw new Error(response.status === 404 ? 'The preview API is not connected yet.' : `Preview request failed (${response.status}).`);
    const data = await response.json();
    if (!data || data.allowed !== true) throw new Error(data?.message || 'This media is not available through an authorized source.');
    renderPreview({ platform, title: data.title, type: data.type || 'video' });
    showMessage('Link checked. Preview information is ready.', 'success');
  } catch (error) {
    // The frontend is usable before the backend exists; explain the missing connection honestly.
    showMessage(`${error.message} The frontend is ready; the next step is connecting approved platform integrations.`, 'error');
  } finally {
    previewButton.disabled = false; previewButton.innerHTML = 'Preview media <span>→</span>';
  }
});

document.querySelector('#paste-button').addEventListener('click', async () => {
  try { urlInput.value = await navigator.clipboard.readText(); urlInput.focus(); hideMessage(); }
  catch { showMessage('Clipboard access is unavailable. Long-press the field and choose Paste.', 'error'); }
});
document.querySelector('#clear-preview').addEventListener('click', () => { previewSection.hidden = true; previewContent.replaceChildren(); currentMedia = null; });
document.querySelector('#clear-history').addEventListener('click', () => {
  if (!readHistory().length) return;
  if (confirm('Clear this browser’s Swypyy activity history?')) { localStorage.removeItem(HISTORY_KEY); renderHistory(); }
});
renderHistory();
