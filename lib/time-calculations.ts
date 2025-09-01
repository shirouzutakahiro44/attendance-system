// 労働基準法準拠の時間計算ユーティリティ

export interface TimeRecord {
  id: string;
  userId: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end' | 'temp-out' | 'temp-in';
  timestamp: string;
  location: string;
  device: string;
}

export interface DailyAttendance {
  date: string;
  clockIn?: string;
  clockOut?: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightWorkHours: number;
  tempOutTime: number;
  isLate: boolean;
  isEarlyLeave: boolean;
  status: 'present' | 'absent' | 'partial' | 'holiday';
}

// 標準労働時間（8時間）
export const STANDARD_WORK_HOURS = 8;

// 深夜時間帯（22:00-5:00）
export const NIGHT_START_HOUR = 22;
export const NIGHT_END_HOUR = 5;

// 残業率
export const OVERTIME_RATE_25 = 0.25; // 通常残業（25%増）
export const OVERTIME_RATE_50 = 0.50; // 60時間超残業（50%増）
export const NIGHT_RATE = 0.25; // 深夜割増（25%増）

/**
 * 時間を分に変換
 */
export function timeToMinutes(timeString: string): number {
  const date = new Date(timeString);
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * 分を時間（小数）に変換
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

/**
 * 時間文字列をフォーマット（HH:MM）
 */
export function formatTimeHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * 深夜時間帯かどうかを判定
 */
export function isNightTime(timeString: string): boolean {
  const date = new Date(timeString);
  const hour = date.getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

/**
 * 深夜時間を計算
 */
export function calculateNightHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  let nightMinutes = 0;

  // 1時間ごとにチェック
  const current = new Date(start);
  while (current < end) {
    const nextHour = new Date(current);
    nextHour.setHours(current.getHours() + 1, 0, 0, 0);
    
    const periodEnd = nextHour > end ? end : nextHour;
    const periodMinutes = (periodEnd.getTime() - current.getTime()) / (1000 * 60);
    
    if (isNightTime(current.toISOString())) {
      nightMinutes += periodMinutes;
    }
    
    current.setTime(nextHour.getTime());
  }

  return minutesToHours(nightMinutes);
}

/**
 * 1日の勤怠記録から勤務時間を計算
 */
export function calculateDailyAttendance(records: TimeRecord[], date: string): DailyAttendance {
  const sortedRecords = records
    .filter(r => r.timestamp.startsWith(date))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  let clockIn: string | undefined;
  let clockOut: string | undefined;
  let workMinutes = 0;
  let breakMinutes = 0;
  let tempOutMinutes = 0;
  let currentWorkStart: string | undefined;
  let currentBreakStart: string | undefined;
  let currentTempOutStart: string | undefined;

  // 記録を順番に処理
  for (const record of sortedRecords) {
    switch (record.type) {
      case 'clock-in':
        if (!clockIn) clockIn = record.timestamp;
        currentWorkStart = record.timestamp;
        break;

      case 'clock-out':
        clockOut = record.timestamp;
        if (currentWorkStart) {
          const workTime = new Date(record.timestamp).getTime() - new Date(currentWorkStart).getTime();
          workMinutes += workTime / (1000 * 60);
          currentWorkStart = undefined;
        }
        break;

      case 'break-start':
        if (currentWorkStart) {
          const workTime = new Date(record.timestamp).getTime() - new Date(currentWorkStart).getTime();
          workMinutes += workTime / (1000 * 60);
          currentWorkStart = undefined;
        }
        currentBreakStart = record.timestamp;
        break;

      case 'break-end':
        if (currentBreakStart) {
          const breakTime = new Date(record.timestamp).getTime() - new Date(currentBreakStart).getTime();
          breakMinutes += breakTime / (1000 * 60);
          currentBreakStart = undefined;
        }
        currentWorkStart = record.timestamp;
        break;

      case 'temp-out':
        if (currentWorkStart) {
          const workTime = new Date(record.timestamp).getTime() - new Date(currentWorkStart).getTime();
          workMinutes += workTime / (1000 * 60);
          currentWorkStart = undefined;
        }
        currentTempOutStart = record.timestamp;
        break;

      case 'temp-in':
        if (currentTempOutStart) {
          const tempTime = new Date(record.timestamp).getTime() - new Date(currentTempOutStart).getTime();
          tempOutMinutes += tempTime / (1000 * 60);
          currentTempOutStart = undefined;
        }
        currentWorkStart = record.timestamp;
        break;
    }
  }

  // 未完了の作業時間を計算（現在時刻まで）
  const now = new Date();
  if (currentWorkStart && now.toDateString() === new Date(date).toDateString()) {
    const currentWorkTime = now.getTime() - new Date(currentWorkStart).getTime();
    workMinutes += currentWorkTime / (1000 * 60);
  }

  const workHours = minutesToHours(workMinutes);
  const breakTime = minutesToHours(breakMinutes);
  const tempOutTime = minutesToHours(tempOutMinutes);

  // 残業時間計算
  const overtimeHours = Math.max(0, workHours - STANDARD_WORK_HOURS);

  // 深夜労働時間計算
  let nightWorkHours = 0;
  if (clockIn && clockOut) {
    nightWorkHours = calculateNightHours(clockIn, clockOut);
  }

  // 遅刻・早退判定（仮の基準時間）
  const standardStartTime = '09:00';
  const standardEndTime = '17:00';
  
  const isLate = clockIn ? 
    timeToMinutes(clockIn) > timeToMinutes(`${date}T${standardStartTime}:00.000Z`) : false;
  
  const isEarlyLeave = clockOut ? 
    timeToMinutes(clockOut) < timeToMinutes(`${date}T${standardEndTime}:00.000Z`) : false;

  // ステータス判定
  let status: DailyAttendance['status'] = 'absent';
  if (clockIn && clockOut) {
    status = 'present';
  } else if (clockIn) {
    status = 'partial';
  }

  return {
    date,
    clockIn,
    clockOut,
    workHours,
    breakTime,
    overtimeHours,
    nightWorkHours,
    tempOutTime,
    isLate,
    isEarlyLeave,
    status
  };
}

/**
 * 月間の労働時間集計
 */
export interface MonthlyAttendance {
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalNightWorkHours: number;
  workDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  overtimeRate25Hours: number; // 25%残業時間
  overtimeRate50Hours: number; // 50%残業時間（60時間超分）
}

export function calculateMonthlyAttendance(dailyRecords: DailyAttendance[]): MonthlyAttendance {
  const totalOvertimeHours = dailyRecords.reduce((sum, day) => sum + day.overtimeHours, 0);
  
  // 60時間超の場合は50%割増
  const overtimeRate25Hours = Math.min(60, totalOvertimeHours);
  const overtimeRate50Hours = Math.max(0, totalOvertimeHours - 60);

  return {
    totalWorkHours: dailyRecords.reduce((sum, day) => sum + day.workHours, 0),
    totalOvertimeHours,
    totalNightWorkHours: dailyRecords.reduce((sum, day) => sum + day.nightWorkHours, 0),
    workDays: dailyRecords.filter(day => day.status === 'present').length,
    lateDays: dailyRecords.filter(day => day.isLate).length,
    earlyLeaveDays: dailyRecords.filter(day => day.isEarlyLeave).length,
    absentDays: dailyRecords.filter(day => day.status === 'absent').length,
    overtimeRate25Hours,
    overtimeRate50Hours
  };
}

/**
 * 労働基準法チェック
 */
export interface LaborLawViolation {
  type: 'overtime_monthly' | 'overtime_yearly' | 'consecutive_work_days' | 'insufficient_rest';
  message: string;
  severity: 'warning' | 'error';
  value: number;
  limit: number;
}

export function checkLaborLawCompliance(
  monthlyAttendance: MonthlyAttendance,
  consecutiveWorkDays: number = 0
): LaborLawViolation[] {
  const violations: LaborLawViolation[] = [];

  // 月間残業時間チェック（原則45時間）
  if (monthlyAttendance.totalOvertimeHours > 45) {
    violations.push({
      type: 'overtime_monthly',
      message: '月間残業時間が45時間を超えています',
      severity: monthlyAttendance.totalOvertimeHours > 80 ? 'error' : 'warning',
      value: monthlyAttendance.totalOvertimeHours,
      limit: 45
    });
  }

  // 連続勤務日数チェック（原則6日まで）
  if (consecutiveWorkDays > 6) {
    violations.push({
      type: 'consecutive_work_days',
      message: '連続勤務日数が6日を超えています',
      severity: 'warning',
      value: consecutiveWorkDays,
      limit: 6
    });
  }

  return violations;
}