# Date Planner - デプロイガイド

デートプラン提案システムを無料でデプロイする方法をご紹介します。

## 🚀 方法1: Vercel（おすすめ・最も簡単）

### 手順

1. **GitHubにリポジトリを作成**
   ```bash
   cd vercel-deploy
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/date-planner.git
   git push -u origin main
   ```

2. **Vercelにサインアップ**
   - https://vercel.com にアクセス
   - GitHubアカウントでサインアップ（無料）

3. **プロジェクトをインポート**
   - 「New Project」をクリック
   - GitHubリポジトリを選択
   - 「Deploy」をクリック

4. **完了！**
   - 数分でデプロイ完了
   - `https://your-project.vercel.app` でアクセス可能

### 環境変数の設定（オプション）
Vercelダッシュボード → Settings → Environment Variables で設定：
- `HOTPEPPER_API_KEY`
- `OPENWEATHER_API_KEY`
- `JORUDAN_API_KEY`

---

## 🌐 方法2: Netlify

1. https://netlify.com にサインアップ
2. 「New site from Git」をクリック
3. GitHubリポジトリを選択
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 「Deploy site」をクリック

---

## 🐙 方法3: GitHub Pages（フロントエンドのみ）

GitHub Pagesは静的サイトのみ対応のため、バックエンドは別サービスが必要です。

### フロントエンドのみデプロイ

1. `vite.config.js` を編集：
   ```js
   export default defineConfig({
     base: '/date-planner/',  // リポジトリ名
     plugins: [react()]
   })
   ```

2. GitHub Actionsを設定（`.github/workflows/deploy.yml`）：
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. Repository Settings → Pages → Source: `gh-pages` branch

---

## 🚂 方法4: Railway（フルスタック）

1. https://railway.app にサインアップ
2. 「New Project」→「Deploy from GitHub repo」
3. リポジトリを選択
4. 環境変数を設定
5. 自動デプロイ完了

---

## 📁 ディレクトリ構造

```
vercel-deploy/
├── api/                    # Vercel Serverless Functions
│   ├── plan/
│   │   └── generate.js     # プラン生成API
│   └── settings/
│       └── keys.js         # API設定確認
├── src/
│   ├── App.jsx             # メインアプリ
│   ├── main.jsx            # エントリーポイント
│   └── index.css           # スタイル
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json             # Vercel設定
```

---

## 🔧 ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

---

## ⚠️ 注意事項

- **Vercel無料プラン**: 月100GBの帯域幅、100時間のサーバーレス実行時間
- **Netlify無料プラン**: 月100GBの帯域幅、300分のビルド時間
- **Railway無料プラン**: 月$5のクレジット（約500時間）

---

## 🎉 デプロイ後

デプロイが完了したら、以下のURLでアクセスできます：

- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`
- GitHub Pages: `https://username.github.io/date-planner`

お疲れ様でした！素敵なデートプランを！💕
