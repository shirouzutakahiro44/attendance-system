# システムアーキテクチャ設計書

## 1. 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                         クライアント層                          │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Web App    │  Mobile App  │   NFC端末    │  管理画面      │
│  (Next.js)   │   (React)    │  (専用App)   │  (Next.js)     │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   API Gateway     │
                    │   (認証・認可)     │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                      アプリケーション層                      │
├──────────────┬──────────────┬──────────────┬──────────────┤
│   勤怠API    │   申請API    │  レポートAPI │   管理API    │
│  (Express)   │  (Express)   │  (Express)   │  (Express)   │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
       │              │              │              │
┌──────┴──────────────┴──────────────┴──────────────┴──────┐
│                        ビジネスロジック層                     │
├──────────────┬──────────────┬──────────────┬──────────────┤
│  打刻処理    │  労働時間計算 │  申請承認    │  レポート生成 │
│              │  割増計算     │  ワークフロー │              │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
       │              │              │              │
┌──────┴──────────────┴──────────────┴──────────────┴──────┐
│                         データアクセス層                      │
├───────────────────────────────────────────────────────────┤
│                    ORM (Prisma/TypeORM)                     │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                        データベース層                        │
├──────────────┬──────────────┬──────────────┬──────────────┤
│  PostgreSQL  │    Redis     │ TimescaleDB  │   S3/Blob    │
│  (主データ)   │  (キャッシュ) │  (時系列)    │  (ファイル)   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## 2. 技術スタック詳細

### 2.1 フロントエンド

#### Web アプリケーション
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand / TanStack Query
- **UI Components**: Radix UI + Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts / Chart.js
- **Date Handling**: date-fns

#### モバイルアプリケーション
- **Framework**: React Native / Expo
- **Navigation**: React Navigation
- **NFC**: react-native-nfc-manager

### 2.2 バックエンド

#### API サーバー
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js / Fastify
- **Language**: TypeScript
- **Validation**: Joi / Zod
- **ORM**: Prisma / TypeORM
- **Queue**: Bull (Redis-based)
- **Scheduler**: node-cron

#### 認証・認可
- **Authentication**: JWT + Refresh Token
- **Authorization**: RBAC (Role-Based Access Control)
- **Session**: Redis
- **2FA**: TOTP (Google Authenticator対応)

### 2.3 データベース

#### 主データベース
- **RDBMS**: PostgreSQL 15
- **拡張機能**:
  - UUID生成: uuid-ossp
  - 全文検索: pg_trgm
  - JSON処理: jsonb

#### 時系列データ
- **TimescaleDB**: 打刻データの効率的な管理

#### キャッシュ
- **Redis**: セッション、一時データ、キュー管理

#### ファイルストレージ
- **AWS S3 / Azure Blob**: レポート、エクスポートファイル

## 3. マイクロサービス構成

### 3.1 サービス分割

```yaml
services:
  # 認証サービス
  auth-service:
    responsibilities:
      - ユーザー認証
      - トークン管理
      - 権限管理
    
  # 勤怠サービス
  attendance-service:
    responsibilities:
      - 打刻処理
      - 勤怠データ管理
      - リアルタイム状況
    
  # 計算サービス
  calculation-service:
    responsibilities:
      - 労働時間計算
      - 割増賃金計算
      - 法定チェック
    
  # ワークフローサービス
  workflow-service:
    responsibilities:
      - 申請処理
      - 承認フロー
      - 通知
    
  # レポートサービス
  report-service:
    responsibilities:
      - レポート生成
      - データエクスポート
      - 帳票作成
    
  # 通知サービス
  notification-service:
    responsibilities:
      - メール送信
      - プッシュ通知
      - アラート
```

### 3.2 サービス間通信

- **同期通信**: REST API / GraphQL
- **非同期通信**: Redis Pub/Sub / RabbitMQ
- **イベント駆動**: Event Sourcing パターン

## 4. セキュリティ設計

### 4.1 認証・認可

```typescript
// 認証フロー
1. ユーザーログイン
   ↓
2. 認証情報検証
   ↓
3. JWT + Refresh Token発行
   ↓
4. Redisにセッション保存
   ↓
5. クライアントにトークン返却
```

### 4.2 データ保護

- **通信**: TLS 1.3
- **パスワード**: bcrypt (salt rounds: 12)
- **暗号化**: AES-256-GCM
- **個人情報**: カラムレベル暗号化

### 4.3 アクセス制御

```typescript
// RBACモデル
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

interface Role {
  name: 'employee' | 'manager' | 'admin';
  permissions: Permission[];
}
```

## 5. パフォーマンス最適化

### 5.1 キャッシュ戦略

```typescript
// キャッシュレイヤー
1. CDN (静的アセット)
2. Redis (APIレスポンス、セッション)
3. アプリケーション (メモリキャッシュ)
4. データベース (クエリキャッシュ)
```

### 5.2 データベース最適化

- **インデックス**: 頻繁に検索されるカラム
- **パーティショニング**: 月単位で勤怠データを分割
- **コネクションプール**: 最大100接続
- **読み取り専用レプリカ**: レポート生成用

### 5.3 非同期処理

```typescript
// ジョブキュー
- 即時: 打刻処理
- 5分: 勤怠集計
- 1時間: レポート生成
- 日次: データアーカイブ
```

## 6. スケーラビリティ

### 6.1 水平スケーリング

- **アプリケーション**: Kubernetes (HPA)
- **データベース**: Read Replica
- **キャッシュ**: Redis Cluster

### 6.2 負荷分散

```yaml
load_balancer:
  algorithm: round_robin
  health_check:
    interval: 10s
    timeout: 5s
  sticky_session: true
```

## 7. 監視・ロギング

### 7.1 監視

- **APM**: New Relic / DataDog
- **メトリクス**: Prometheus + Grafana
- **ログ**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **エラー追跡**: Sentry

### 7.2 アラート

```yaml
alerts:
  - name: high_error_rate
    threshold: 5%
    window: 5m
  
  - name: slow_response
    threshold: 3s
    window: 1m
  
  - name: database_connection
    threshold: 80%
    window: 30s
```

## 8. 災害復旧

### 8.1 バックアップ

- **データベース**: 日次フルバックアップ、1時間毎の差分
- **ファイル**: S3 クロスリージョンレプリケーション
- **設定**: Git リポジトリ

### 8.2 復旧目標

- **RPO (Recovery Point Objective)**: 1時間
- **RTO (Recovery Time Objective)**: 4時間

## 9. 開発・デプロイ

### 9.1 CI/CD パイプライン

```yaml
pipeline:
  - stage: test
    steps:
      - unit_tests
      - integration_tests
      - security_scan
  
  - stage: build
    steps:
      - docker_build
      - push_registry
  
  - stage: deploy
    environments:
      - dev (自動)
      - staging (自動)
      - production (手動承認)
```

### 9.2 環境構成

- **開発環境**: Docker Compose
- **ステージング**: Kubernetes (同一構成、縮小版)
- **本番環境**: Kubernetes (フルスケール)

## 10. 外部連携

### 10.1 NFC連携

```typescript
// NFC読み取りフロー
1. カードタッチ検知
2. カードID読み取り
3. サーバーに打刻送信
4. 結果表示 (音/LED)
```

### 10.2 給与システム連携

```typescript
// データ連携
- 形式: CSV/JSON
- 頻度: 月次
- 項目: 勤怠データ、残業時間、休暇情報
```