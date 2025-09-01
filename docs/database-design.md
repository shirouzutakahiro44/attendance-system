# データベース設計書

## 主要テーブル一覧

### 1. ユーザー関連

#### users（ユーザー）
```sql
- id: UUID (PK)
- employee_id: VARCHAR(50) UNIQUE NOT NULL -- 社員番号
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- first_name: VARCHAR(100)
- last_name: VARCHAR(100)
- department_id: UUID (FK)
- role: ENUM('employee', 'manager', 'admin')
- hire_date: DATE
- employment_type: ENUM('full_time', 'part_time', 'contract')
- hourly_rate: DECIMAL(10,2) -- 時給
- monthly_salary: DECIMAL(10,2) -- 月給
- nfc_card_id: VARCHAR(100) UNIQUE -- NFCカードID
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- deleted_at: TIMESTAMP
```

#### departments（部署）
```sql
- id: UUID (PK)
- name: VARCHAR(100)
- location: ENUM('factory1', 'factory2', 'factory3', 'press', 'welding', 'indirect')
- parent_department_id: UUID (FK) -- 親部署
- manager_id: UUID (FK)
- created_at: TIMESTAMP
```

### 2. 打刻関連

#### time_records（打刻記録）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- record_type: ENUM('clock_in', 'clock_out', 'break_start', 'break_end', 'temp_out', 'temp_return')
- recorded_at: TIMESTAMP
- location: VARCHAR(100)
- device_type: ENUM('nfc', 'web', 'mobile', 'manual')
- ip_address: VARCHAR(45)
- is_modified: BOOLEAN DEFAULT false
- original_time: TIMESTAMP -- 修正前の時刻
- modified_by: UUID (FK)
- modified_reason: TEXT
- created_at: TIMESTAMP
```

#### attendance_daily（日次勤怠）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- work_date: DATE
- shift_id: UUID (FK)
- clock_in: TIMESTAMP
- clock_out: TIMESTAMP
- break_duration: INTEGER -- 休憩時間（分）
- actual_work_minutes: INTEGER -- 実労働時間（分）
- overtime_minutes: INTEGER -- 残業時間（分）
- late_night_minutes: INTEGER -- 深夜労働時間（分）
- holiday_work_minutes: INTEGER -- 休日労働時間（分）
- status: ENUM('normal', 'late', 'early_leave', 'absent', 'holiday', 'paid_leave')
- approval_status: ENUM('pending', 'approved', 'rejected')
- approved_by: UUID (FK)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 3. シフト管理

#### shift_patterns（シフトパターン）
```sql
- id: UUID (PK)
- name: VARCHAR(100)
- start_time: TIME
- end_time: TIME
- break_minutes: INTEGER
- is_night_shift: BOOLEAN
- created_at: TIMESTAMP
```

#### user_shifts（ユーザーシフト割当）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- shift_pattern_id: UUID (FK)
- shift_date: DATE
- created_at: TIMESTAMP
```

### 4. 申請・承認

#### attendance_requests（勤怠申請）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- request_type: ENUM('overtime', 'leave', 'attendance_correction', 'holiday_work')
- target_date: DATE
- start_time: TIMESTAMP
- end_time: TIMESTAMP
- reason: TEXT
- status: ENUM('pending', 'approved', 'rejected')
- approver_id: UUID (FK)
- approved_at: TIMESTAMP
- approver_comment: TEXT
- created_at: TIMESTAMP
```

#### leave_balances（休暇残高）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- leave_type: ENUM('paid', 'sick', 'special')
- fiscal_year: INTEGER
- granted_days: DECIMAL(4,1)
- used_days: DECIMAL(4,1)
- remaining_days: DECIMAL(4,1)
- expiry_date: DATE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 5. 労働時間管理

#### overtime_management（残業管理）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- year_month: VARCHAR(7) -- YYYY-MM
- monthly_overtime_minutes: INTEGER
- yearly_overtime_minutes: INTEGER
- over_60_hours: BOOLEAN -- 月60時間超フラグ
- agreement_36_alert: BOOLEAN -- 36協定上限接近
- special_clause_used: BOOLEAN -- 特別条項使用
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### work_regulations（労働規則）
```sql
- id: UUID (PK)
- name: VARCHAR(100)
- daily_standard_hours: INTEGER DEFAULT 480 -- 8時間
- weekly_standard_hours: INTEGER DEFAULT 2400 -- 40時間
- monthly_overtime_limit: INTEGER DEFAULT 2700 -- 45時間
- yearly_overtime_limit: INTEGER DEFAULT 21600 -- 360時間
- special_monthly_limit: INTEGER DEFAULT 6000 -- 100時間
- special_yearly_limit: INTEGER DEFAULT 43200 -- 720時間
- break_threshold_6h: INTEGER DEFAULT 45 -- 6時間超で45分
- break_threshold_8h: INTEGER DEFAULT 60 -- 8時間超で60分
- created_at: TIMESTAMP
```

### 6. 技能・資格管理

#### user_qualifications（ユーザー資格）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- qualification_type: VARCHAR(100) -- フォークリフト、クレーン等
- certificate_number: VARCHAR(100)
- acquired_date: DATE
- expiry_date: DATE
- is_active: BOOLEAN
- created_at: TIMESTAMP
```

### 7. 安全衛生管理

#### health_management（健康管理）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- check_type: ENUM('health_checkup', 'stress_check', 'doctor_interview')
- check_date: DATE
- next_check_date: DATE
- result: TEXT
- follow_up_required: BOOLEAN
- created_at: TIMESTAMP
```

#### fatigue_management（疲労度管理）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- check_date: DATE
- consecutive_work_days: INTEGER
- monthly_overtime_hours: DECIMAL(5,2)
- fatigue_level: ENUM('low', 'medium', 'high', 'critical')
- alert_sent: BOOLEAN
- created_at: TIMESTAMP
```

### 8. システム管理

#### audit_logs（監査ログ）
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- action: VARCHAR(100)
- target_table: VARCHAR(100)
- target_id: UUID
- old_value: JSONB
- new_value: JSONB
- ip_address: VARCHAR(45)
- user_agent: TEXT
- created_at: TIMESTAMP
```

## インデックス設計

```sql
-- 頻繁に検索される項目にインデックスを作成
CREATE INDEX idx_time_records_user_date ON time_records(user_id, recorded_at);
CREATE INDEX idx_attendance_daily_user_date ON attendance_daily(user_id, work_date);
CREATE INDEX idx_attendance_daily_status ON attendance_daily(status);
CREATE INDEX idx_user_shifts_date ON user_shifts(shift_date);
CREATE INDEX idx_overtime_management_user_month ON overtime_management(user_id, year_month);
```

## ビュー設計

```sql
-- 月次勤怠サマリービュー
CREATE VIEW monthly_attendance_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', work_date) as month,
    COUNT(*) as work_days,
    SUM(actual_work_minutes) as total_work_minutes,
    SUM(overtime_minutes) as total_overtime_minutes,
    SUM(late_night_minutes) as total_late_night_minutes,
    SUM(holiday_work_minutes) as total_holiday_work_minutes
FROM attendance_daily
WHERE approval_status = 'approved'
GROUP BY user_id, DATE_TRUNC('month', work_date);

-- リアルタイム出勤状況ビュー
CREATE VIEW current_attendance_status AS
SELECT 
    u.id,
    u.employee_id,
    u.first_name,
    u.last_name,
    d.name as department,
    tr.record_type,
    tr.recorded_at,
    tr.location
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN (
    SELECT DISTINCT ON (user_id) *
    FROM time_records
    WHERE DATE(recorded_at) = CURRENT_DATE
    ORDER BY user_id, recorded_at DESC
) tr ON u.id = tr.user_id;
```