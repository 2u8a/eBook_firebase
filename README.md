# 📖 Lightweight SPA Novel Reader

**Firebaseにデプロイするだけで、誰でも簡単に高機能な電子書籍サイトが作れるテンプレートです。**

ビルドツール・バックエンド・データベース一切不要。HTML / CSS / Vanilla JS だけで動く軽量SPA構成なので、Firebase Hosting の無料枠だけで本番運用できます。

---

## ✨ 主な機能

| 機能 | 詳細 |
|---|---|
| 📚 本棚画面 | 複数の書籍をカード形式で一覧表示 |
| 📋 目次画面 | 部・章のツリー構造、未公開章はロック表示 |
| 📖 本文リーダー | 明朝体・行間1.9・字下げ最適化による高い没入感 |
| 🌙 ダーク/ライトモード | ワンタップで即切替、設定を記憶 |
| **A+ / A-** | 文字サイズをリアルタイム調整（14px〜26px）、設定を記憶 |
| 🔖 自動しおり | スクロール位置をLocalStorageに自動保存。次回訪問時に「続きから読む」バナーを表示 |
| ⚡ 遅延読み込み | 章ごとにデータを遅延ロード（`<script>` タグ動的挿入）。初回表示が高速 |
| 📊 読書進捗バー | ヘッダー下に現在の読了率をリアルタイム表示 |
| 📱 モバイルファースト | スマホで読むことを最優先に設計。680px幅でデスクトップも快適 |

---

## 🚀 セットアップ

### 1. このリポジトリをクローン

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. ローカルで動作確認

```bash
# Python が入っていれば即起動
python -m http.server 8080
# → http://localhost:8080 を開く
```

### 3. Firebase にデプロイ

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # Firebaseプロジェクトを選択
firebase deploy
```

---

## 📂 ディレクトリ構成

```
/
├── index.html              # SPA本体（ビューの切り替え）
├── style.css               # デザイン（CSS変数でテーマ管理）
├── app.js                  # ルーター・ロジック
├── ad.html                 # 広告タグ用iframe（任意）
├── firebase.json           # Hosting設定（キャッシュ制御）
└── data/
    ├── catalog.js          # ★ 書籍一覧（起動時に読み込み）
    └── books/
        └── sample-book/   # ★ 書籍ごとにディレクトリを作成
            ├── meta.js    #   目次・部章構成
            └── 1-1.js     #   章テキスト（遅延読み込み）
```

---

## 📝 新しい本の追加方法

### Step 1 — `data/books/` にディレクトリを作成

```
data/books/
└── my-novel/
    ├── meta.js   ← 目次
    ├── 1-1.js    ← 第1部・第1章
    ├── 1-2.js
    └── 2-1.js    ← 第2部・第1章（任意）
```

### Step 2 — `meta.js` を書く（目次定義）

```js
window.APP_DATA = window.APP_DATA || {};
window.APP_DATA.books = window.APP_DATA.books || {};

window.APP_DATA.books['my-novel'] = {
  id: 'my-novel',
  title: '私の小説',
  author: '著者名',
  parts: [
    {
      number: 1,
      title: '第1部：はじまり',
      description: '第1部のあらすじ',
      chapters: [
        { id: '1-1', number: 1, title: '第一章', subtitle: '章のサブタイトル' },
        { id: '1-2', number: 2, title: '第二章', subtitle: '章のサブタイトル' }
      ]
    }
  ]
};
```

### Step 3 — `1-1.js` を書く（本文）

```js
window.APP_DATA = window.APP_DATA || {};
window.APP_DATA.chapters = window.APP_DATA.chapters || {};

window.APP_DATA.chapters['1-1'] = {
  id: '1-1',
  bookId: 'my-novel',
  partNumber: 1,
  chapterNumber: 1,
  title: '第一章',
  subtitle: '章のサブタイトル',
  paragraphs: [
    '一段落目のテキストをここに書きます。',
    '二段落目です。配列の要素が一つの<p>タグになります。',
    '「会話文もこのように書けます」と主人公は言った。'
  ]
};
```

### Step 4 — `data/catalog.js` にエントリを追加

```js
window.APP_DATA.catalog = [
  {
    id: 'my-novel',
    title: '私の小説',
    author: '著者名',
    coverColor: '#1a3050',       // カバーの背景色
    description: 'あらすじ...',
    trialNote: '第1部・全2章を無料公開',
    trialChapters: ['1-1', '1-2']
  }
];
```

**以上で完了です。** `firebase deploy` を再実行するだけで本番に反映されます。

---

## 🔒 著作権・プライバシーについて

- 本テンプレートは著作権フリーの自作テキストや、許諾済みの作品のみに使用してください。
- 実際の書籍データ（`data/books/YOUR_BOOK/`）は `.gitignore` に追加して、公開リポジトリにアップロードしないことを推奨します。

---

## 📄 ライセンス

MIT License — テンプレート部分のコード（`index.html`, `style.css`, `app.js`）は自由に改変・商用利用できます。
