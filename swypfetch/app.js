const API_BASE = 'https://swypfetch-api.onrender.com';
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
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') return 'YouTube';
  if (host === 'instagram.com' || host === 'instagr.am') return 'Instagram';
  if (host === 'facebook.com' || host === 'fb.watch' || host === 'm.facebook.com') return 'Facebook';
  return null;
}

function isDirectMediaUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'https:' && /\.(mp4|webm|mov|jpg|jpeg|png|webp|gif)(?:$|\?)/i.test(url.href);
  } catch { return false; }
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
    const icon = document.createElement('span'); icon.className = 'history-type'; icon.textContent = item.platform === 'YouTube' ? '▶' : item.platform === 'Instagram' ? '◎' : item.platform === 'Facebook' ? 'f' : '↓';
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
  if (media.thumbnail_url) {
    const image = document.createElement('img');
    image.src = media.thumbnail_url;
    image.alt = 'Media thumbnail';
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    image.style.cssText = 'width:112px;height:76px;object-fit:cover;border-radius:12px;';
    meta.append(image);
  } else {
    const art = document.createElement('div'); art.className = 'preview-art'; art.textContent = media.type === 'image' ? '▧' : '▶';
    meta.append(art);
  }

  const info = document.createElement('div'); info.className = 'preview-info';
  const title = document.createElement('strong'); title.textContent = media.title || `${media.platform} media`;
  const sub = document.createElement('small'); sub.textContent = `${media.platform} · ${media.author || media.type || 'Media'}`;
  info.append(title, sub); meta.append(info); previewContent.append(meta);

  const actions = document.createElement('div'); actions.className = 'preview-actions';
  const link = document.createElement('a');
  link.className = 'primary-button';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (media.direct_url) {
    link.href = `${API_BASE}/api/download?url=${encodeURIComponent(media.direct_url)}`;
    link.textContent = 'Download authorized file';
  } else {
    link.href = media.canonical_url;
    link.textContent = 'Open original post ↗';
  }
  actions.append(link); previewContent.append(actions);

  const note = document.createElement('p'); note.className = 'helper-text'; note.style.marginTop = '12px';
  note.textContent = media.direct_url
    ? 'Only download files you own or have permission to save. Direct files are limited to 50 MB.'
    : 'This is an official post preview. SwypFetch does not extract media from social posts or bypass platform restrictions.';
  previewContent.append(note);

  saveHistory({ platform: media.platform, title: media.title || `${media.platform} link`, date: new Date().toISOString(), action: media.direct_url ? 'Ready to download' : 'Previewed' });
  previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); hideMessage();
  const rawUrl = urlInput.value.trim();
  if (!rawUrl) return showMessage('Paste a link first.', 'error');

  previewButton.disabled = true; previewButton.textContent = 'Checking link…';
  try {
    if (isDirectMediaUrl(rawUrl)) {
      const parsed = new URL(rawUrl);
      const ext = parsed.pathname.split('.').pop().toLowerCase();
      const image = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
      renderPreview({
        platform: 'Direct file',
        title: decodeURIComponent(parsed.pathname.split('/').pop() || 'Media file'),
        type: image ? 'image' : 'video',
        direct_url: rawUrl
      });
      showMessage('Direct media link checked. Download is ready.', 'success');
      return;
    }

    const platform = detectPlatform(rawUrl);
    if (!platform) return showMessage('Use a YouTube, Instagram, Facebook or direct HTTPS media-file link.', 'error');

    const response = await fetch(`${API_BASE}/api/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: rawUrl, platform })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.allowed !== true) throw new Error(data.message || `Preview request failed (${response.status}).`);
    renderPreview(data);
    showMessage('Post preview information is ready.', 'success');
  } catch (error) {
    showMessage(`${error.message} Check that the backend has finished deploying.`, 'error');
  } finally {
    previewButton.disabled = false;
    previewButton.innerHTML = 'Preview media <span>→</span>';
  }
});

document.querySelector('#paste-button').addEventListener('click', async () => {
  try { urlInput.value = await navigator.clipboard.readText(); urlInput.focus(); hideMessage(); }
  catch { showMessage('Clipboard access is unavailable. Long-press the field and choose Paste.', 'error'); }
});
document.querySelector('#clear-preview').addEventListener('click', () => {
  previewSection.hidden = true;
  previewContent.replaceChildren();
  currentMedia = null;
});
document.querySelector('#clear-history').addEventListener('click', () => {
  if (!readHistory().length) return;
  if (confirm('Clear this browser’s Swypyy activity history?')) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
});
renderHistory();
