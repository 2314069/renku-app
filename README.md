# 連句アプリ

オンラインで複数人で連句を詠むためのアプリケーション

## 機能

- オンラインで複数人での協作
- 100句以上の連句作成
- 5-7-5 / 7-7 の交互形式
- リアルタイム同期
- クラウド保存
- 季語チェック・禁忌語チェック
- 進行状況表示
- 完成作品のエクスポート

## 技術スタック

- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: MongoDB
- **リアルタイム通信**: Socket.io

## セットアップ

### 必要な環境

- Node.js 18以上
- MongoDB（ローカルまたはMongoDB Atlas）

### 1. 依存関係のインストール

```bash
# ルートディレクトリで
npm run install:all
```

または個別にインストール:

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

### 2. 環境変数の設定

#### バックエンド

`backend/env.example` をコピーして `backend/.env` を作成:

```bash
cd backend
cp env.example .env
```

`.env` ファイルを編集して、MongoDBの接続文字列を設定:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
DB_NAME=renku-app
FRONTEND_URL=http://localhost:5173
```

**MongoDB Atlasを使用する場合:**
- MongoDB Atlasでクラスターを作成
- 接続文字列を取得（例: `mongodb+srv://username:password@cluster.mongodb.net/renku-app`）
- `MONGODB_URI` に設定

### 3. MongoDBの起動（ローカルの場合）

```bash
# MongoDBがインストールされている場合
mongod
```

### 4. アプリケーションの起動

#### 開発モード（推奨）

バックエンドとフロントエンドを同時に起動:

```bash
# ルートディレクトリで
npm run dev
```

#### 個別に起動

```bash
# ターミナル1: バックエンド
cd backend
npm run dev

# ターミナル2: フロントエンド
cd frontend
npm run dev
```

### 5. アプリケーションにアクセス

ブラウザで `http://localhost:5173` を開きます。

## 使い方

1. **新しい連句を作成**
   - 「新しい連句を作成」からタイトルと名前を入力
   - 作成されると連句IDが表示されます

2. **既存の連句に参加**
   - 連句IDを共有されたら「既存の連句に参加」からIDを入力
   - 名前を入力して参加

3. **句を詠む**
   - 自分の順番になったら、句を入力
   - 5-7-5形式（17文字以内）または7-7形式（14文字以内）を入力
   - 季語や禁忌語は自動でチェックされます

4. **エクスポート**
   - 完成した連句は「エクスポート」ボタンからテキストファイルとして保存できます

## 開発

### プロジェクト構造

```
連句アプリ/
├── backend/          # バックエンド（Node.js + Express）
│   ├── src/
│   │   ├── index.ts      # エントリーポイント
│   │   ├── database.ts   # MongoDB接続
│   │   ├── routes.ts     # REST API
│   │   └── socket.ts     # Socket.io設定
│   └── package.json
├── frontend/         # フロントエンド（React + TypeScript）
│   ├── src/
│   │   ├── components/   # Reactコンポーネント
│   │   ├── api.ts        # API通信
│   │   ├── types.ts      # 型定義
│   │   └── utils/        # ユーティリティ
│   └── package.json
└── README.md
```

## 機能詳細

### 実装済み機能

- ✅ 句の入力（5-7-5 / 7-7形式）
- ✅ 文字数チェック
- ✅ 複数人での協作
- ✅ リアルタイム同期（Socket.io）
- ✅ 参加者管理
- ✅ 順番管理
- ✅ 季語の自動検出
- ✅ 禁忌語チェック（月、花、雪、桜）
- ✅ 進行状況表示（100句目標）
- ✅ 完成作品のエクスポート（テキスト形式）
- ✅ クラウド保存（MongoDB）

### 今後の拡張候補

- より詳細な季語データベース
- 取り合わせのヒント機能
- 完成作品の美しい表示・印刷レイアウト
- ユーザー認証
- 連句の一覧表示
- 句の編集・削除機能

