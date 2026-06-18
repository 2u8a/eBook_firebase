window.APP_DATA = window.APP_DATA || {};

// =====================================================================
// CATALOG — list every book you want to appear on the home screen.
//
// Fields:
//   id           — must match the directory name under data/books/
//   title        — book title displayed on the card
//   author       — author name displayed on the card
//   coverColor   — CSS color for the cover background
//   description  — short blurb (shown on home card, truncated to 3 lines)
//   trialNote    — small badge text on the home card
//   trialChapters — array of chapter ids available for free reading
// =====================================================================

window.APP_DATA.catalog = [
  {
    id: 'sample-book',
    title: 'サンプル小説',
    author: 'テンプレート著者',
    coverColor: '#2d6a4f',
    description: 'これはテンプレートのサンプルです。data/books/sample-book/ 内のファイルをあなたの書籍データに差し替えることで、すぐに本番運用できます。',
    trialNote: '第1章・無料公開',
    trialChapters: ['1-1']
  }

  // ---------------------------------------------------------------
  // 本番データの追加例（コメントを外してエントリを追加してください）:
  // ---------------------------------------------------------------
  // ,{
  //   id: 'my-novel',
  //   title: '私の小説',
  //   author: '著者名',
  //   coverColor: '#1a3050',
  //   description: 'あらすじをここに記載します。',
  //   trialNote: '第1部・全3章を無料公開',
  //   trialChapters: ['1-1', '1-2', '1-3']
  // }
];
