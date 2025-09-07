// ゲーミフィケーションロジック

export interface ShiftInfo {
  date: string
  startTime: string
  endTime: string
}

export interface ClockInData {
  employeeId: string
  timestamp: Date
  type: 'clock_in' | 'clock_out'
}

export interface PointCalculation {
  points: number
  type: 'EARLY_CLOCK_IN_10_6' | 'EARLY_CLOCK_IN_5_0' | 'LATE_CLOCK_IN'
  message: string
}

// 打刻時間とシフト時間を比較してポイントを計算
export function calculateClockInPoints(
  clockInTime: Date,
  shiftStartTime: Date
): PointCalculation {
  const diffMinutes = Math.floor(
    (shiftStartTime.getTime() - clockInTime.getTime()) / (1000 * 60)
  )

  // 10分前〜6分前: +1ポイント
  if (diffMinutes >= 6 && diffMinutes <= 10) {
    return {
      points: 1,
      type: 'EARLY_CLOCK_IN_10_6',
      message: `シフト${diffMinutes}分前に出勤！ +1ポイント獲得！`
    }
  }

  // 5分前〜定時: +2ポイント
  if (diffMinutes >= 0 && diffMinutes <= 5) {
    return {
      points: 2,
      type: 'EARLY_CLOCK_IN_5_0',
      message: `シフト${diffMinutes}分前に出勤！ +2ポイント獲得！`
    }
  }

  // 遅刻: -1ポイント
  if (diffMinutes < 0) {
    return {
      points: -1,
      type: 'LATE_CLOCK_IN',
      message: `${Math.abs(diffMinutes)}分の遅刻... -1ポイント`
    }
  }

  // 10分より前の出勤: ポイントなし
  return {
    points: 0,
    type: 'EARLY_CLOCK_IN_10_6',
    message: '早すぎる出勤のためポイント対象外'
  }
}

// 打刻正確率を計算
export function calculateAccuracy(
  positivePoints: number,
  totalDays: number
): number {
  if (totalDays === 0) return 0
  return Math.round((positivePoints / totalDays) * 100 * 10) / 10
}

// レベルを計算
export function calculateLevel(totalPoints: number): number {
  // 100ポイントごとに1レベル
  return Math.floor(totalPoints / 100) + 1
}

// アバタータイプを判定
export function getAvatarType(level: number): string {
  if (level >= 50) return 'PHOENIX'
  if (level >= 20) return 'ROOSTER'
  if (level >= 10) return 'CHICKEN'
  if (level >= 5) return 'CHICK'
  return 'EGG'
}

// 連続ボーナスをチェック
export function checkStreak(
  history: { date: string; points: number }[]
): { isStreak: boolean; days: number } {
  if (!history || history.length === 0) {
    return { isStreak: false, days: 0 }
  }

  // 日付順にソート
  const sorted = [...history].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let currentStreak = 0
  let lastDate: Date | null = null

  for (const record of sorted) {
    if (record.points > 0) {
      const currentDate = new Date(record.date)
      
      if (lastDate) {
        const diffDays = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        if (diffDays === 1) {
          currentStreak++
        } else if (diffDays > 1) {
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }
      
      lastDate = currentDate
    } else {
      currentStreak = 0
      lastDate = null
    }
  }

  return {
    isStreak: currentStreak >= 5,
    days: currentStreak
  }
}

// クエスト進捗をチェック
export function checkQuestProgress(
  questType: string,
  currentValue: number,
  targetValue: number
): { isComplete: boolean; progress: number } {
  const progress = Math.min((currentValue / targetValue) * 100, 100)
  
  return {
    isComplete: currentValue >= targetValue,
    progress: Math.round(progress * 10) / 10
  }
}

// モックデータを生成（開発用）
export function generateMockShift(date: Date = new Date()): ShiftInfo {
  const shiftStart = new Date(date)
  shiftStart.setHours(9, 0, 0, 0)
  
  const shiftEnd = new Date(date)
  shiftEnd.setHours(18, 0, 0, 0)
  
  return {
    date: date.toISOString().split('T')[0],
    startTime: shiftStart.toISOString(),
    endTime: shiftEnd.toISOString()
  }
}

// ポイント履歴を保存（localStorage使用）
export function savePointHistory(
  employeeId: string,
  points: number,
  type: string
): void {
  const key = `points_${employeeId}`
  const existing = localStorage.getItem(key)
  const history = existing ? JSON.parse(existing) : []
  
  history.push({
    date: new Date().toISOString(),
    points,
    type,
    timestamp: Date.now()
  })
  
  // 最新100件のみ保持
  if (history.length > 100) {
    history.splice(0, history.length - 100)
  }
  
  localStorage.setItem(key, JSON.stringify(history))
}

// ポイント履歴を取得
export function getPointHistory(employeeId: string): any[] {
  const key = `points_${employeeId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// 合計ポイントを取得
export function getTotalPoints(employeeId: string): number {
  const history = getPointHistory(employeeId)
  return history.reduce((sum, record) => sum + record.points, 0)
}