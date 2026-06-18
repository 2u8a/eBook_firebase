'use strict';

// ===== State =====
const state = {
  view: 'home',
  bookId: null,
  chapterId: null,
  fontSize: parseInt(localStorage.getItem('fontSize') || '18', 10),
  theme: localStorage.getItem('theme') || 'light',
};

// ===== DOM refs =====
const $ = id => document.getElementById(id);
const views = {
  home: $('view-home'),
  toc: $('view-toc'),
  reader: $('view-reader'),
};

// ===== Theme =====
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'ライトモード' : 'ダークモード';
  });
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// ===== Font Size =====
function applyFontSize(size) {
  state.fontSize = Math.max(14, Math.min(26, size));
  document.documentElement.style.setProperty('--font-size-base', state.fontSize + 'px');
  localStorage.setItem('fontSize', state.fontSize);
}

// ===== Bookmarks =====
function saveBookmark(bookId, chapterId, scrollY) {
  try {
    localStorage.setItem('bookmark_' + bookId, JSON.stringify({
      chapterId,
      scrollY,
      savedAt: Date.now(),
    }));
  } catch (_) {}
}

function getBookmark(bookId) {
  try {
    const raw = localStorage.getItem('bookmark_' + bookId);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

// ===== Script Loader (lazy load data files) =====
const loadedScripts = new Set();

function loadScript(src) {
  if (loadedScripts.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => { loadedScripts.add(src); resolve(); };
    el.onerror = () => reject(new Error('Failed to load: ' + src));
    document.head.appendChild(el);
  });
}

// ===== Router =====
function navigate(hash) {
  history.pushState(null, '', '#' + hash);
  handleRoute(hash);
}

function handleRoute(hash) {
  if (!hash) hash = location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  const view = parts[0] || 'home';

  Object.values(views).forEach(v => v.classList.remove('active'));

  if (view === 'home') {
    showHome();
  } else if (view === 'toc' && parts[1]) {
    showTOC(parts[1]);
  } else if (view === 'reader' && parts[1] && parts[2]) {
    showReader(parts[1], parts[2]);
  } else {
    showHome();
  }
}

window.addEventListener('popstate', () => handleRoute(location.hash.slice(1)));

// ===== Home View =====
function showHome() {
  state.view = 'home';
  views.home.classList.add('active');

  const catalog = window.APP_DATA?.catalog || [];
  const listEl = $('book-list');
  listEl.innerHTML = '';

  catalog.forEach(book => {
    const bookmark = getBookmark(book.id);
    const bookMeta = window.APP_DATA?.books?.[book.id];

    // Resume banner
    if (bookmark) {
      const [part, ch] = bookmark.chapterId.split('-');
      const chapterLabel = `第${part}部・第${ch}章`;
      const banner = document.createElement('div');
      banner.className = 'resume-banner';
      banner.innerHTML = `
        <div class="resume-icon">📖</div>
        <div class="resume-text">
          <div class="resume-label">しおり — 続きから読む</div>
          <div class="resume-title">${escapeHtml(book.title)} ${escapeHtml(chapterLabel)}</div>
        </div>
        <div class="resume-arrow">›</div>
      `;
      banner.addEventListener('click', () => {
        navigate(`reader/${book.id}/${bookmark.chapterId}`);
      });
      listEl.appendChild(banner);
    }

    // Book card
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover" style="background:${book.coverColor}">
        <div class="book-cover-author">${escapeHtml(book.author)}</div>
        <div class="book-cover-title">${escapeHtml(book.title)}</div>
      </div>
      <div class="book-info">
        <div class="book-description">${escapeHtml(book.description)}</div>
        <div class="book-meta-row">
          <span class="book-trial-badge">${escapeHtml(book.trialNote)}</span>
          <span class="book-read-btn">目次を見る ›</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => navigate(`toc/${book.id}`));
    listEl.appendChild(card);
  });
}

function resolveChapterTitle(bookId, chapterId) {
  const book = window.APP_DATA?.books?.[bookId];
  if (!book) return chapterId;
  for (const part of book.parts) {
    const ch = part.chapters.find(c => c.id === chapterId);
    if (ch) return `${part.title.replace(/^第\d+部：/, '第$&')} · ${ch.title}`;
  }
  return chapterId;
}

// ===== TOC View =====
async function showTOC(bookId) {
  state.view = 'toc';
  state.bookId = bookId;
  views.toc.classList.add('active');

  const contentEl = $('toc-content');
  contentEl.innerHTML = '<div class="loading-indicator"><div class="spinner"></div>読み込み中...</div>';

  try {
    await loadScript(`data/books/${bookId}/meta.js`);
  } catch (_) {}

  const book = window.APP_DATA?.books?.[bookId];
  if (!book) {
    contentEl.innerHTML = '<div class="loading-indicator">データを読み込めませんでした</div>';
    return;
  }

  $('toc-header-title').textContent = book.title;

  const html = book.parts.map((part, i) => {
    const hasChapters = part.chapters && part.chapters.length > 0;

    const chaptersHtml = hasChapters
      ? part.chapters.map(ch => `
          <div class="toc-chapter-item" data-chapter="${ch.id}" data-book="${bookId}">
            <div class="toc-ch-num">第${ch.number}章</div>
            <div class="toc-ch-text">
              <div class="toc-ch-title">${escapeHtml(ch.title)}</div>
              <div class="toc-ch-subtitle">${escapeHtml(ch.subtitle)}</div>
            </div>
            <div class="toc-ch-arrow">›</div>
          </div>
        `).join('')
      : `<div class="toc-locked-part">
           <span class="toc-lock-icon">🔒</span>
           <span class="toc-lock-text">この部は準備中です</span>
         </div>`;

    return `
      <div class="toc-part">
        <div class="toc-part-header">
          <div class="toc-part-number">第${part.number}部</div>
          <div class="toc-part-info">
            <div class="toc-part-title">${escapeHtml(part.title.replace(/^第\d+部：/, ''))}</div>
            <div class="toc-part-desc">${escapeHtml(part.description)}</div>
          </div>
        </div>
        <div class="toc-chapters">${chaptersHtml}</div>
      </div>
      ${i < book.parts.length - 1 ? '<div class="toc-divider"></div>' : ''}
    `;
  }).join('');

  contentEl.innerHTML = `
    <div class="toc-book-header">
      <div class="toc-book-title">${escapeHtml(book.title)}</div>
      <div class="toc-book-author">${escapeHtml(book.author)}</div>
    </div>
    ${html}
  `;

  // Attach chapter click handlers
  contentEl.querySelectorAll('.toc-chapter-item[data-chapter]').forEach(el => {
    el.addEventListener('click', () => {
      navigate(`reader/${el.dataset.book}/${el.dataset.chapter}`);
    });
  });
}

// ===== Reader View =====
let scrollSaveTimer = null;
let uiHideTimer = null;
let uiVisible = true;

async function showReader(bookId, chapterId) {
  state.view = 'reader';
  state.bookId = bookId;
  state.chapterId = chapterId;
  views.reader.classList.add('active');

  const bodyEl = $('chapter-body');
  const headingEl = $('chapter-heading');
  bodyEl.innerHTML = '<div class="loading-indicator"><div class="spinner"></div>読み込み中...</div>';
  headingEl.style.display = 'none';

  // Ensure book meta is loaded (for nav context)
  try { await loadScript(`data/books/${bookId}/meta.js`); } catch (_) {}

  // Load chapter data
  try {
    await loadScript(`data/books/${bookId}/${chapterId}.js`);
  } catch (_) {
    bodyEl.innerHTML = '<div class="loading-indicator">章のデータを読み込めませんでした</div>';
    return;
  }

  const chapter = window.APP_DATA?.chapters?.[chapterId];
  if (!chapter) {
    bodyEl.innerHTML = '<div class="loading-indicator">章のデータが見つかりませんでした</div>';
    return;
  }

  // Render heading
  headingEl.style.display = '';
  $('reader-part-label').textContent = `第${chapter.partNumber}部`;
  $('reader-chapter-label').textContent = chapter.title;
  $('chapter-num').textContent = `第${chapter.partNumber}部 · ${chapter.title}`;
  $('chapter-title').textContent = chapter.title;
  $('chapter-subtitle').textContent = chapter.subtitle || '';

  // Render body
  const paragraphsHtml = (chapter.paragraphs || []).map(p =>
    '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>'
  ).join('');

  const trialEndHtml = chapter.trialEndNote
    ? `<div class="trial-end">
         <div class="trial-end-icon">📘</div>
         <div class="trial-end-title">試し読みはここまでです</div>
         <div class="trial-end-body">${escapeHtml(chapter.trialEndNote)}</div>
       </div>`
    : '';

  bodyEl.innerHTML = paragraphsHtml + trialEndHtml;

  // Reload ad iframe so the ad network fires a fresh impression for the new chapter
  const adFrame = document.getElementById('ninja-ad-frame');
  if (adFrame) {
    adFrame.contentWindow.location.reload();
  }

  // Update chapter navigation
  updateChapterNav(bookId, chapterId);

  // Restore scroll position from bookmark
  const bookmark = getBookmark(bookId);
  if (bookmark && bookmark.chapterId === chapterId && bookmark.scrollY > 0) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: bookmark.scrollY, behavior: 'instant' });
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Reset UI visibility
  showUI();
}

function updateChapterNav(bookId, chapterId) {
  const book = window.APP_DATA?.books?.[bookId];
  if (!book) return;

  const allChapters = book.parts.flatMap(p => p.chapters);
  const currentIdx = allChapters.findIndex(c => c.id === chapterId);

  const prevCh = currentIdx > 0 ? allChapters[currentIdx - 1] : null;
  const nextCh = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null;

  const btnPrev = $('btn-prev-chapter');
  const btnNext = $('btn-next-chapter');

  if (prevCh) {
    btnPrev.disabled = false;
    btnPrev.onclick = () => navigate(`reader/${bookId}/${prevCh.id}`);
  } else {
    btnPrev.disabled = true;
    btnPrev.onclick = null;
  }

  if (nextCh) {
    btnNext.disabled = false;
    btnNext.onclick = () => navigate(`reader/${bookId}/${nextCh.id}`);
  } else {
    btnNext.disabled = true;
    btnNext.onclick = null;
  }

  // Progress label
  if (currentIdx >= 0) {
    $('reader-progress-label').textContent = `${currentIdx + 1} / ${allChapters.length} 章`;
  }
}

// ===== Scroll tracking (bookmark + progress bar) =====
function onScroll() {
  if (state.view !== 'reader') return;

  // Progress bar
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
  $('reading-progress-bar').style.width = progress + '%';

  // Auto-save bookmark (debounced)
  clearTimeout(scrollSaveTimer);
  scrollSaveTimer = setTimeout(() => {
    if (state.bookId && state.chapterId) {
      saveBookmark(state.bookId, state.chapterId, window.scrollY);
    }
  }, 800);
}

// ===== Tap to show/hide UI in reader =====
function showUI() {
  uiVisible = true;
  document.querySelector('.reader-header').classList.remove('hidden-ui');
  document.querySelector('.reader-nav').classList.remove('hidden-ui');
  clearTimeout(uiHideTimer);
}

function scheduleHideUI() {
  clearTimeout(uiHideTimer);
  uiHideTimer = setTimeout(() => {
    uiVisible = false;
    document.querySelector('.reader-header').classList.add('hidden-ui');
    document.querySelector('.reader-nav').classList.add('hidden-ui');
  }, 3500);
}

// ===== Utilities =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== Init =====
function init() {
  // Apply saved settings
  applyTheme(state.theme);
  applyFontSize(state.fontSize);

  // Theme toggles
  document.querySelectorAll('.btn-theme').forEach(btn =>
    btn.addEventListener('click', toggleTheme)
  );

  // Font size controls
  $('btn-font-increase').addEventListener('click', () => applyFontSize(state.fontSize + 1));
  $('btn-font-decrease').addEventListener('click', () => applyFontSize(state.fontSize - 1));

  // Back buttons
  $('toc-back').addEventListener('click', () => navigate('home'));
  $('reader-back').addEventListener('click', () => {
    if (state.bookId) navigate(`toc/${state.bookId}`);
    else navigate('home');
  });

  // Scroll events
  window.addEventListener('scroll', onScroll, { passive: true });

  // Tap to show UI in reader (mobile)
  document.addEventListener('click', e => {
    if (state.view !== 'reader') return;
    // Don't fire on buttons or links
    if (e.target.closest('button, a, .reader-nav, .reader-header')) return;
    if (!uiVisible) {
      showUI();
      scheduleHideUI();
    } else {
      scheduleHideUI();
    }
  });

  // Route
  handleRoute(location.hash.slice(1) || 'home');
}

document.addEventListener('DOMContentLoaded', init);
