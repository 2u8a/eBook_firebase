# CLAUDE.md — eBook_firebase

## Project Overview

A zero-build, lightweight Single-Page Application (SPA) novel reader deployed via Firebase Hosting.
No Node.js, no bundler, no backend — pure HTML + CSS + Vanilla JS. Runs entirely in the browser and is served as static files.

**Firebase project:** `e-book108`
**Live URL:** managed via `firebase deploy`

---

## Repository Structure

```
/
├── index.html          # SPA shell — all three views (home, toc, reader) live here as hidden divs
├── style.css           # All styling via CSS custom properties (theme variables)
├── app.js              # All application logic: router, state, view renderers
├── firebase.json       # Firebase Hosting config — cache headers, SPA rewrite rule
├── .firebaserc         # Firebase project alias (default → e-book108)
└── data/
    ├── catalog.js      # Book list loaded at startup (window.APP_DATA.catalog)
    └── books/
        └── <book-id>/
            ├── meta.js # Table of contents for one book (window.APP_DATA.books[id])
            └── <ch>.js # Chapter content e.g. 1-1.js (window.APP_DATA.chapters[id])
```

`ad.html` (not committed) — optional ad iframe, referenced by the reader view.

---

## Architecture

### SPA Routing
Hash-based routing (`#home`, `#toc/<bookId>`, `#reader/<bookId>/<chapterId>`).
`handleRoute()` in `app.js` switches the active view div. `navigate()` uses `history.pushState` + calls `handleRoute`.

### Global State (`state` object in app.js)
```js
{ view, bookId, chapterId, fontSize, theme }
```
`fontSize` and `theme` are persisted to `localStorage`.

### Data Loading Pattern
Data files (`catalog.js`, `meta.js`, chapter JS files) are loaded **lazily** by injecting `<script>` tags at runtime (`loadScript()`).
Each file assigns to `window.APP_DATA.*` — catalog at startup, meta on TOC view, chapter content on reader view.

### Views
| View | Trigger | Data needed |
|------|---------|-------------|
| Home (`#home`) | default | `catalog.js` (loaded at startup) |
| TOC (`#toc/<id>`) | book card click | `data/books/<id>/meta.js` |
| Reader (`#reader/<id>/<ch>`) | chapter click | `data/books/<id>/meta.js` + `data/books/<id>/<ch>.js` |

---

## Key Conventions

### Adding a New Book
1. Create `data/books/<book-id>/` directory.
2. Write `meta.js` — assigns to `window.APP_DATA.books['<book-id>']`.
3. Write chapter files (`1-1.js`, `1-2.js`, etc.) — assign to `window.APP_DATA.chapters['<chapter-id>']`.
4. Add entry to `data/catalog.js` array.
5. Run `firebase deploy`.

### Chapter File Format
```js
window.APP_DATA = window.APP_DATA || {};
window.APP_DATA.chapters = window.APP_DATA.chapters || {};

window.APP_DATA.chapters['1-1'] = {
  id: '1-1',
  bookId: 'my-novel',
  partNumber: 1,
  chapterNumber: 1,
  title: '第一章',
  subtitle: '...',
  paragraphs: ['paragraph 1', 'paragraph 2'],
  // trialEndNote: '...' // optional: shows "trial ends here" banner
};
```

### meta.js Format
```js
window.APP_DATA.books['my-novel'] = {
  id: 'my-novel',
  title: '...',
  author: '...',
  parts: [
    {
      number: 1,
      title: '第1部：...',
      description: '...',
      chapters: [{ id: '1-1', number: 1, title: '第一章', subtitle: '...' }]
    },
    {
      number: 2,
      title: '...',
      description: '...',
      chapters: [],
      locked: true  // renders as "coming soon"
    }
  ]
};
```

### Catalog Entry Format
```js
{
  id: 'my-novel',          // must match directory name
  title: '...',
  author: '...',
  coverColor: '#1a3050',   // CSS color for cover
  description: '...',
  trialNote: '...',        // badge text on home card
  trialChapters: ['1-1']   // chapters available without paywall
}
```

---

## Theming & Styling
- Theme (`light`/`dark`) toggled via `data-theme` attribute on `<html>`.
- All color/spacing values live in CSS custom properties in `style.css`.
- Font size range: 14px–26px, stored in `--font-size-base`.

## Bookmark / Scroll Persistence
- Scroll position auto-saved to `localStorage` every 800ms (debounced) under key `bookmark_<bookId>`.
- On reader open, position is restored if `bookmark.chapterId === chapterId`.
- Home view shows a "続きから読む" resume banner when a bookmark exists.

---

## Local Development

```bash
# No install needed. Just serve the files:
python -m http.server 8080
# → open http://localhost:8080
```

## Deploy

```bash
npm install -g firebase-tools   # one-time
firebase login
firebase deploy
```

Firebase Hosting cache rules (set in `firebase.json`):
- `index.html`, `app.js`, `style.css` — `no-cache` (always fresh)
- `data/**` — `public, max-age=3600` (1 hour)

---

## Security & Gitignore Notes
- `ad.html` is gitignored — contains ad network credentials; create locally.
- Actual proprietary book directories should be added to `.gitignore`.
- No secrets are committed; `firebaserc` only holds the project alias.

---

## What NOT to Do
- Do not add a build step or bundler — this project intentionally has zero dependencies.
- Do not use `innerHTML` with unsanitized user content — use `escapeHtml()` for any dynamic text rendered to DOM.
- Do not inline sensitive ad code or book text in the template files.
- Do not add `type="module"` to data JS files — they use `window.APP_DATA` globals intentionally.
