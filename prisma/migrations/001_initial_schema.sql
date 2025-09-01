-- =====================================================
-- Supabase Migration: Initial Schema Setup
-- Generated from Prisma Schema with IF NOT EXISTS safety
-- =====================================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS "public";

-- =====================================================
-- 1. Create ENUM Types (with checks for existence)
-- =====================================================

-- Role enum
DO $$ BEGIN
    CREATE TYPE "public"."Role" AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- EmploymentType enum
DO $$ BEGIN
    CREATE TYPE "public"."EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Department enum
DO $$ BEGIN
    CREATE TYPE "public"."Department" AS ENUM ('FACTORY_1', 'FACTORY_2', 'FACTORY_3', 'PRESS', 'WELDING', 'INDIRECT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RecordType enum
DO $$ BEGIN
    CREATE TYPE "public"."RecordType" AS ENUM ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END', 'TEMP_OUT', 'TEMP_RETURN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DeviceType enum
DO $$ BEGIN
    CREATE TYPE "public"."DeviceType" AS ENUM ('WEB', 'MOBILE', 'NFC', 'MANUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AttendanceStatus enum
DO $$ BEGIN
    CREATE TYPE "public"."AttendanceStatus" AS ENUM ('NORMAL', 'LATE', 'EARLY_LEAVE', 'ABSENT', 'HOLIDAY', 'PAID_LEAVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ApprovalStatus enum
DO $$ BEGIN
    CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AuditAction enum
DO $$ BEGIN
    CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. Create Tables
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "employee_id" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "first_name_kana" TEXT,
    "last_name_kana" TEXT,
    "department" "public"."Department" NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'EMPLOYEE',
    "employment_type" "public"."EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "hire_date" TIMESTAMP(3) NOT NULL,
    "hourly_rate" DECIMAL(10,2),
    "monthly_salary" DECIMAL(10,2),
    "nfc_card_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Department Managers table
CREATE TABLE IF NOT EXISTS "public"."department_managers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "department" "public"."Department" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMP(3),
    CONSTRAINT "department_managers_pkey" PRIMARY KEY ("id")
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- Time Records table
CREATE TABLE IF NOT EXISTS "public"."time_records" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "record_type" "public"."RecordType" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "device_type" "public"."DeviceType" NOT NULL,
    "ip_address" TEXT,
    "is_modified" BOOLEAN NOT NULL DEFAULT false,
    "original_time" TIMESTAMP(3),
    "modified_by" TEXT,
    "modified_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "time_records_pkey" PRIMARY KEY ("id")
);

-- Attendance Daily table
CREATE TABLE IF NOT EXISTS "public"."attendance_daily" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "work_date" DATE NOT NULL,
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "break_duration" INTEGER NOT NULL DEFAULT 0,
    "actual_work_minutes" INTEGER NOT NULL DEFAULT 0,
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "late_night_minutes" INTEGER NOT NULL DEFAULT 0,
    "holiday_work_minutes" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'NORMAL',
    "approval_status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_daily_pkey" PRIMARY KEY ("id")
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "action" "public"."AuditAction" NOT NULL,
    "target_table" TEXT,
    "target_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 3. Create Indexes (IF NOT EXISTS)
-- =====================================================

-- Users indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_employee_id_key" ON "public"."users"("employee_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "public"."users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_nfc_card_id_key" ON "public"."users"("nfc_card_id");

-- Department Managers indexes
CREATE UNIQUE INDEX IF NOT EXISTS "department_managers_user_id_department_key" ON "public"."department_managers"("user_id", "department");

-- Sessions indexes
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "public"."sessions"("token");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "public"."sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "public"."sessions"("token");

-- Time Records indexes
CREATE INDEX IF NOT EXISTS "time_records_user_id_recorded_at_idx" ON "public"."time_records"("user_id", "recorded_at");

-- Attendance Daily indexes
CREATE INDEX IF NOT EXISTS "attendance_daily_work_date_idx" ON "public"."attendance_daily"("work_date");
CREATE INDEX IF NOT EXISTS "attendance_daily_user_id_idx" ON "public"."attendance_daily"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_daily_user_id_work_date_key" ON "public"."attendance_daily"("user_id", "work_date");

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "public"."audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_target_table_target_id_idx" ON "public"."audit_logs"("target_table", "target_id");

-- =====================================================
-- 4. Add Foreign Key Constraints (IF NOT EXISTS)
-- =====================================================

-- Department Managers FK
DO $$ BEGIN
    ALTER TABLE "public"."department_managers" 
    ADD CONSTRAINT "department_managers_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sessions FK
DO $$ BEGIN
    ALTER TABLE "public"."sessions" 
    ADD CONSTRAINT "sessions_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Time Records FK
DO $$ BEGIN
    ALTER TABLE "public"."time_records" 
    ADD CONSTRAINT "time_records_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Attendance Daily FK
DO $$ BEGIN
    ALTER TABLE "public"."attendance_daily" 
    ADD CONSTRAINT "attendance_daily_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Audit Logs FK
DO $$ BEGIN
    ALTER TABLE "public"."audit_logs" 
    ADD CONSTRAINT "audit_logs_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 5. Create update trigger for updated_at columns
-- =====================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables with updated_at
DO $$ BEGIN
    CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON "public"."users"
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER set_timestamp_attendance_daily
    BEFORE UPDATE ON "public"."attendance_daily"
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_timestamp();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 6. Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."department_managers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."attendance_daily" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. Grant permissions (for Supabase)
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Limited permissions for anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- Migration complete!
-- =====================================================