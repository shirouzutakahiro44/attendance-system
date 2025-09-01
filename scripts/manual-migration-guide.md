# Supabase SQLマイグレーション実行ガイド

## 実行方法

### オプション1: Supabase Dashboard SQL Editor（推奨）

1. **Supabase SQL Editorにアクセス**
   - URL: https://supabase.com/dashboard/project/utkkdwjckfxnfvmppzyg/sql/new
   - Supabaseアカウントでログイン

2. **SQLファイルの内容をコピー**
   - ファイル: `prisma/migrations/001_initial_schema.sql`
   - 全内容をコピー

3. **SQL Editorで実行**
   - SQL Editorに貼り付け
   - "Run" ボタンをクリック
   - 実行が完了するまで待つ

### オプション2: Supabase CLIを使用

1. **データベースパスワードを取得**
   - https://supabase.com/dashboard/project/utkkdwjckfxnfvmppzyg/settings/database
   - "Database Password" セクションからパスワードを確認

2. **環境変数を設定**
   ```bash
   export SUPABASE_ACCESS_TOKEN="sbp_9cac32f7820e4f5bc86ff0142b19eb31e6987db7"
   ```

3. **プロジェクトをリンク**
   ```bash
   npx supabase link --project-ref utkkdwjckfxnfvmppzyg --password <データベースパスワード>
   ```

4. **マイグレーションを実行**
   ```bash
   npx supabase db push < prisma/migrations/001_initial_schema.sql
   ```

## 作成される内容

### テーブル（6個）
- `users` - ユーザー（従業員）情報
- `department_managers` - 部門管理者
- `sessions` - セッション管理  
- `time_records` - 打刻記録
- `attendance_daily` - 日次勤怠データ
- `audit_logs` - 監査ログ

### ENUM型（8個）
- `Role` - ユーザー役割（EMPLOYEE, MANAGER, ADMIN）
- `EmploymentType` - 雇用形態（FULL_TIME, PART_TIME, CONTRACT）
- `Department` - 部門（FACTORY_1, FACTORY_2, FACTORY_3, PRESS, WELDING, INDIRECT）
- `RecordType` - 記録タイプ（CLOCK_IN, CLOCK_OUT, BREAK_START, BREAK_END, TEMP_OUT, TEMP_RETURN）
- `DeviceType` - デバイスタイプ（WEB, MOBILE, NFC, MANUAL）
- `AttendanceStatus` - 勤怠ステータス（NORMAL, LATE, EARLY_LEAVE, ABSENT, HOLIDAY, PAID_LEAVE）
- `ApprovalStatus` - 承認ステータス（PENDING, APPROVED, REJECTED）
- `AuditAction` - 監査アクション（CREATE, UPDATE, DELETE, LOGIN, LOGOUT）

### その他
- インデックス（複数）
- 外部キー制約
- Row Level Security (RLS)の有効化
- updated_atトリガー
- 権限設定

## 実行後の確認

SQL Editorで以下のクエリを実行して、テーブルが作成されたことを確認：

```sql
-- テーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ENUM型一覧を確認
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;
```

## トラブルシューティング

- **エラー: "duplicate object"**: すでにオブジェクトが存在します（正常）
- **エラー: "permission denied"**: 権限不足です。service_roleキーを使用してください
- **エラー: "syntax error"**: SQL構文エラー。ファイルが正しくコピーされているか確認してください