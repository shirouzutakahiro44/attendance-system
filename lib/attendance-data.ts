// 勤怠データ統合管理

import { getCurrentUser, getPointHistory, getShift } from './profile-manager'
import { calculateClockInPoints } from './gamification'

export interface AttendanceRecord {
  date: string
  clockIn?: string
  clockOut?: string
  breaks: { start: string; end: string }[]
  workMinutes: number
  overtimeMinutes: number
  points: number
  pointType?: string
  status: 'normal' | 'late' | 'early' | 'absent' | 'holiday'
  shiftStart?: string
  shiftEnd?: string
}

export interface MonthlyAttendanceSummary {
  totalWorkDays: number
  totalWorkHours: number
  totalOvertimeHours: number
  totalPoints: number
  averageAccuracy: number
  consecutiveDays: number
  lateCount: number
  perfectDays: number
}

// 実際の打刻データから月次勤怠を生成
export function generateMonthlyAttendance(year: number, month: number): {
  records: AttendanceRecord[]
  summary: MonthlyAttendanceSummary
} {
  const employeeId = 'current-user'
  const profile = getCurrentUser()
  const pointHistory = getPointHistory(employeeId)
  
  const daysInMonth = new Date(year, month, 0).getDate()
  const records: AttendanceRecord[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dateStr = date.toISOString().split('T')[0]
    
    // 土日はスキップ（オプション）
    if (date.getDay() === 0 || date.getDay() === 6) {
      records.push({
        date: dateStr,
        workMinutes: 0,
        overtimeMinutes: 0,
        points: 0,
        status: 'holiday',
        breaks: []
      })
      continue
    }
    
    // その日の打刻データを取得
    const dayRecords = getDayTimeRecords(dateStr)
    const shift = getShift(employeeId, dateStr)
    const dayPoints = getPointsForDay(pointHistory, dateStr)
    
    const record = processDayAttendance(dayRecords, shift, dayPoints, dateStr)
    records.push(record)
  }
  
  // 月次サマリーを計算
  const summary = calculateMonthlySummary(records)
  
  return { records, summary }
}

// その日の打刻記録を取得
function getDayTimeRecords(date: string): any[] {
  if (typeof window === 'undefined') return []
  const allRecords = JSON.parse(localStorage.getItem('todayRecords') || '[]')
  return allRecords.filter((record: any) => {
    const recordDate = new Date(record.timestamp).toISOString().split('T')[0]
    return recordDate === date
  })
}

// その日のポイントを取得
function getPointsForDay(pointHistory: any[], date: string): { points: number; type?: string } {
  const dayPoint = pointHistory.find(p => {
    const pointDate = new Date(p.date).toISOString().split('T')[0]
    return pointDate === date
  })
  
  return dayPoint ? { points: dayPoint.points, type: dayPoint.type } : { points: 0 }
}

// 1日分の勤怠データを処理
function processDayAttendance(
  timeRecords: any[],
  shift: any,
  dayPoints: { points: number; type?: string },
  date: string
): AttendanceRecord {
  let clockIn: string | undefined
  let clockOut: string | undefined
  const breaks: { start: string; end: string }[] = []
  let currentBreakStart: string | undefined
  
  // 打刻記録を処理
  for (const record of timeRecords) {
    const time = new Date(record.timestamp).toTimeString().slice(0, 5)
    
    switch (record.type) {
      case 'clock-in':
        clockIn = time
        break
      case 'clock-out':
        clockOut = time
        break
      case 'break-start':
        currentBreakStart = time
        break
      case 'break-end':
        if (currentBreakStart) {
          breaks.push({ start: currentBreakStart, end: time })
          currentBreakStart = undefined
        }
        break
    }
  }
  
  // 勤務時間計算
  let workMinutes = 0
  let overtimeMinutes = 0
  let status: AttendanceRecord['status'] = 'absent'
  
  if (clockIn && clockOut) {
    const start = new Date(`${date}T${clockIn}:00`)
    const end = new Date(`${date}T${clockOut}:00`)
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    
    // 休憩時間を引く
    const breakMinutes = breaks.reduce((total, b) => {
      const breakStart = new Date(`${date}T${b.start}:00`)
      const breakEnd = new Date(`${date}T${b.end}:00`)
      return total + (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60)
    }, 0)
    
    workMinutes = totalMinutes - breakMinutes
    
    // ステータス判定
    if (shift) {
      const shiftStart = new Date(`${date}T${shift.startTime}:00`)
      const actualStart = new Date(`${date}T${clockIn}:00`)
      
      if (actualStart > shiftStart) {
        status = 'late'
      } else {
        status = 'normal'
      }
      
      // 残業計算（8時間超過分）
      const standardWorkMinutes = 8 * 60
      if (workMinutes > standardWorkMinutes) {
        overtimeMinutes = workMinutes - standardWorkMinutes
      }
    } else {
      status = 'normal'
    }
  } else if (clockIn && !clockOut) {
    // 打刻忘れ
    status = 'early'
  }
  
  return {
    date,
    clockIn,
    clockOut,
    breaks,
    workMinutes: Math.max(0, workMinutes),
    overtimeMinutes: Math.max(0, overtimeMinutes),
    points: dayPoints.points,
    pointType: dayPoints.type,
    status,
    shiftStart: shift?.startTime,
    shiftEnd: shift?.endTime
  }
}

// 月次サマリー計算
function calculateMonthlySummary(records: AttendanceRecord[]): MonthlyAttendanceSummary {
  const workRecords = records.filter(r => r.status !== 'holiday' && r.status !== 'absent')
  
  const totalWorkDays = workRecords.length
  const totalWorkHours = workRecords.reduce((sum, r) => sum + r.workMinutes / 60, 0)
  const totalOvertimeHours = workRecords.reduce((sum, r) => sum + r.overtimeMinutes / 60, 0)
  const totalPoints = records.reduce((sum, r) => sum + r.points, 0)
  
  const lateCount = records.filter(r => r.status === 'late').length
  const perfectDays = records.filter(r => r.points > 0).length
  
  const averageAccuracy = totalWorkDays > 0 ? (perfectDays / totalWorkDays) * 100 : 0
  
  // 連続出勤日数計算
  let consecutiveDays = 0
  let currentStreak = 0
  
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].status !== 'holiday' && records[i].status !== 'absent' && records[i].points > 0) {
      currentStreak++
    } else if (records[i].status !== 'holiday') {
      break
    }
  }
  consecutiveDays = currentStreak
  
  return {
    totalWorkDays,
    totalWorkHours: Math.round(totalWorkHours * 10) / 10,
    totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
    totalPoints,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    consecutiveDays,
    lateCount,
    perfectDays
  }
}

// ゲーミフィケーション用のステータスを取得
export function getGamificationStatus() {
  const profile = getCurrentUser()
  return {
    name: profile.name,
    level: profile.level,
    totalPoints: profile.totalPoints,
    avatarUrl: profile.avatarUrl,
    avatarType: profile.avatarType,
    currentTitle: profile.currentTitle,
    stars: profile.stars
  }
}

// 今日の実績を取得
export function getTodayPerformance(): {
  hasClockIn: boolean
  hasClockOut: boolean
  points: number
  status: string
} {
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = getDayTimeRecords(today)
  const pointHistory = getPointHistory('current-user')
  const todayPoint = getPointsForDay(pointHistory, today)
  
  const hasClockIn = todayRecords.some(r => r.type === 'clock-in')
  const hasClockOut = todayRecords.some(r => r.type === 'clock-out')
  
  let status = '未出勤'
  if (hasClockIn && hasClockOut) status = '退勤済み'
  else if (hasClockIn) status = '勤務中'
  
  return {
    hasClockIn,
    hasClockOut,
    points: todayPoint.points,
    status
  }
}