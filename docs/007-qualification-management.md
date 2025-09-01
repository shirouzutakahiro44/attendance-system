# 007: 技能資格管理機能

## 概要
製造現場で必要な技能資格の管理と有効期限管理を実装する

## 優先度
**Medium** - 安全管理・人員配置に必要

## 見積工数
24時間（3人日）

## 機能要件

### 1. 資格マスタ管理
- [ ] 資格種別の登録
  - [ ] フォークリフト運転
  - [ ] クレーン運転
  - [ ] 玉掛け作業
  - [ ] 溶接技能
  - [ ] 電気工事士
  - [ ] 危険物取扱者
- [ ] 資格要件の設定
- [ ] 更新期間の設定
- [ ] 必須/推奨の区分

### 2. 個人資格管理
- [ ] 資格情報の登録
- [ ] 資格証明書のアップロード
- [ ] 取得日/有効期限の管理
- [ ] 資格証番号の管理
- [ ] 資格履歴の保持

### 3. 期限管理
- [ ] 有効期限アラート（30日前、60日前、90日前）
- [ ] 期限切れ資格の表示
- [ ] 更新申請フロー
- [ ] 更新完了通知
- [ ] 一括期限確認

### 4. スキルマトリックス
- [ ] 部署別スキル一覧
- [ ] 個人別スキル表示
- [ ] スキルレベル管理（初級/中級/上級）
- [ ] 必要スキルと保有スキルのギャップ分析
- [ ] スキルマップの可視化

### 5. 作業割当連携
- [ ] 有資格者のみへの作業割当
- [ ] 資格不足アラート
- [ ] 代替要員の提案
- [ ] 資格要件チェック

## 技術仕様

### データベーステーブル
- qualification_master
- user_qualifications
- qualification_requirements
- skill_matrix
- qualification_documents

### API エンドポイント
```
GET    /api/qualifications/master
POST   /api/qualifications/master
GET    /api/qualifications/user/:userId
POST   /api/qualifications/user
PUT    /api/qualifications/user/:id
GET    /api/qualifications/expiring
GET    /api/qualifications/matrix
POST   /api/qualifications/upload
GET    /api/qualifications/requirements
```

### フロントエンド画面
- /qualifications/my - 個人資格一覧
- /qualifications/register - 資格登録
- /admin/qualifications - 資格管理
- /admin/qualifications/matrix - スキルマトリックス
- /admin/qualifications/alerts - 期限アラート

## 依存関係
- 001: 認証・ユーザー管理機能
- 004: シフト管理機能（作業割当連携）

## テスト項目
- [ ] 資格情報の登録
- [ ] 有効期限アラート
- [ ] ファイルアップロード
- [ ] スキルマトリックス表示
- [ ] 資格要件チェック

## 完了条件
- [ ] 資格情報が管理できる
- [ ] 期限アラートが機能する
- [ ] スキルマトリックスが表示される
- [ ] 資格証明書が保管される
- [ ] 作業割当と連携できる

## 備考
- 法定資格は正確に管理
- 資格証明書は暗号化して保存
- 将来的には教育履歴も管理