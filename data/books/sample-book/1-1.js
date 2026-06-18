window.APP_DATA = window.APP_DATA || {};
window.APP_DATA.chapters = window.APP_DATA.chapters || {};

// =====================================================================
// TEMPLATE: Replace the paragraphs[] array with your actual chapter text.
//
// Each element in paragraphs[] becomes one <p> tag in the reader.
// Line breaks within a paragraph can be written as \n (rendered as <br>).
//
// trialEndNote (optional): If set, a "trial ends here" banner is shown
// after the last paragraph. Remove the key for full chapters.
// =====================================================================

window.APP_DATA.chapters['1-1'] = {
  id: '1-1',
  bookId: 'sample-book',
  partNumber: 1,
  chapterNumber: 1,
  title: '第一章',
  subtitle: 'サンプルテキストが表示される最初の章です。',
  paragraphs: [
    'これはサンプルテキストです。このファイル（data/books/sample-book/1-1.js）の paragraphs 配列を、あなた自身の小説テキストに置き換えてください。',
    '各要素が一つの段落（<p>タグ）として表示されます。長い文章でも、配列の要素を増やすだけで自然に折り返されます。',
    '「ダイアログ（会話文）はこのように書くことができます」と主人公は呟いた。会話の後に地の文が続く場合も、同じ要素内に記述するか、次の要素に分けるかは自由です。',
    'このリーダーはモバイルファーストで設計されており、明朝体・行間1.9・字下げが自動で適用されます。文字サイズの調整（A+/A-）やダークモード切替も標準搭載です。',
    'しおり機能はスクロール位置を自動保存します。次回訪問時には「続きから読む」バナーがホーム画面に表示され、すぐに再開できます。',
    'ここまでがサンプルテキストです。data/books/sample-book/ 以下のファイルを差し替えて、あなただけの電子書籍サイトを完成させてください。'
  ]
};
