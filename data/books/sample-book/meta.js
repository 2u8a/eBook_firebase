window.APP_DATA = window.APP_DATA || {};
window.APP_DATA.books = window.APP_DATA.books || {};

// =====================================================================
// TEMPLATE: Replace this file with your own book's table of contents.
//
// Structure:
//   parts[]        — top-level sections (e.g. "Part 1", "Chapter group")
//     chapters[]   — individual chapters within a part
//       id         — must match the filename under this directory (e.g. "1-1" → "1-1.js")
//       number     — display order within the part
//       title      — short label shown in TOC (e.g. "第一章")
//       subtitle   — one-line chapter summary shown in TOC
//
// A part with an empty chapters[] and locked:true is rendered as a
// "coming soon / premium" row — useful for previewing future content.
// =====================================================================

window.APP_DATA.books['sample-book'] = {
  id: 'sample-book',
  title: 'サンプル小説',
  author: 'テンプレート著者',
  parts: [
    {
      number: 1,
      title: '第1部：はじまりの章',
      description: 'これはサンプルです。data/books/sample-book/ 内のファイルを差し替えることで、あなた自身の電子書籍サイトを構築できます。',
      chapters: [
        {
          id: '1-1',
          number: 1,
          title: '第一章',
          subtitle: 'サンプルテキストが表示される最初の章です。'
        }
      ]
    },
    {
      number: 2,
      title: '第2部：続きの章',
      description: '第2部以降のコンテンツをここに追加できます。',
      chapters: [],
      locked: true
    }
  ]
};
