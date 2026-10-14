// Tiny interactions only: no libraries, network requests, or build step.
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const themeButton = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeColorMeta = document.getElementById('theme-color-meta');
const root = document.documentElement;

function setTheme(theme, save = true) {
  root.dataset.theme = theme;
  const dark = theme === 'dark';
  if (themeIcon) themeIcon.textContent = dark ? '☀' : '☾';
  if (themeButton) {
    const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
    themeButton.setAttribute('aria-label', label);
    themeButton.setAttribute('title', label);
  }
  if (themeColorMeta) themeColorMeta.setAttribute('content', dark ? '#211f29' : '#fbf7ef');
  if (save) {
    try { localStorage.setItem('swypyy-theme', theme); } catch (_) {}
  }
}

let initialTheme = 'light';
try {
  const savedTheme = localStorage.getItem('swypyy-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') initialTheme = savedTheme;
} catch (_) {}
setTheme(initialTheme, false);
if (themeButton) themeButton.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});
