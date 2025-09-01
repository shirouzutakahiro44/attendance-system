# 008: 安全衛生管理機能

## 概要
労働安全衛生法に基づく健康管理と疲労度管理を実装する

## 優先度
**Medium** - 法令遵守・従業員の健康管理に必要

## 見積工数
32時間（4人日）

## 機能要件

### 1. 健康診断管理
- [ ] 健康診断実施記録
- [ ] 受診状況管理
- [ ] 次回受診予定日設定
- [ ] 未受診者アラート
- [ ] 再検査フォローアップ
- [ ] 産業医面談記録

### 2. ストレスチェック
- [ ] ストレスチェック実施管理
- [ ] 高ストレス者の抽出
- [ ] 面談対象者管理
- [ ] 実施履歴管理
- [ ] 集団分析

### 3. 疲労度管理
- [ ] 連続勤務日数チェック
- [ ] 月間労働時間による疲労度判定
- [ ] 深夜勤務回数管理
- [ ] インターバル時間チェック（勤務間隔）
- [ ] 疲労度レベル表示（低/中/高/危険）

### 4. 長時間労働者管理
- [ ] 月80時間超の自動抽出
- [ ] 月100時間超の緊急アラート
- [ ] 産業医面談対象者リスト
- [ ] 面談実施記録
- [ ] 改善措置の記録

### 5. 労災防止
- [ ] ヒヤリハット報告
- [ ] 労災発生記録
- [ ] 原因分析
- [ ] 再発防止策管理
- [ ] 安全教育実施記録

### 6. 法定管理
- [ ] 衛生委員会議事録
- [ ] 安全衛生計画
- [ ] 法定届出管理
- [ ] 監査対応記録

## 技術仕様

### データベーステーブル
- health_checkups
- stress_checks
- fatigue_management
- medical_interviews
- incident_reports
- safety_education

### API エンドポイント
```
GET    /api/health/checkups
POST   /api/health/checkups
GET    /api/health/stress-check
POST   /api/health/stress-check
GET    /api/health/fatigue
GET    /api/health/long-hours
POST   /api/health/interview
GET    /api/safety/incidents
POST   /api/safety/incidents
GET    /api/safety/education
```

### フロントエンド画面
- /health/my-health - 個人健康情報
- /health/checkup - 健診予約・結果
- /admin/health/dashboard - 健康管理ダッシュボード
- /admin/health/alerts - 健康アラート一覧
- /admin/safety/incidents - 労災・ヒヤリハット管理

## 依存関係
- 001: 認証・ユーザー管理機能
- 003: 勤怠管理機能（労働時間データ）

## テスト項目
- [ ] 疲労度計算ロジック
- [ ] アラート発生条件
- [ ] データプライバシー
- [ ] 法定要件の充足
- [ ] レポート出力

## 完了条件
- [ ] 健康診断が管理できる
- [ ] 疲労度が自動判定される
- [ ] 長時間労働者が抽出される
- [ ] 法定帳票が出力できる
- [ ] プライバシーが保護される

## 備考
- 個人情報保護法の遵守
- 健康情報は特に慎重に扱う
- 産業医との連携を考慮