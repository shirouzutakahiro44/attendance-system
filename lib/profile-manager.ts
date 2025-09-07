// プロフィール管理システム

export interface UserProfile {
  id: string
  employeeId: string
  name: string
  nameKana?: string
  email?: string
  department: string
  avatarUrl?: string
  avatarType: 'EGG' | 'CHICK' | 'CHICKEN' | 'ROOSTER' | 'PHOENIX'
  level: number
  totalPoints: number
  currentPoints: number
  stars: number
  currentTitle: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface ProfileStats {
  accuracy: number
  currentStreak: number
  totalDays: number
  achievements: Achievement[]
  monthlyRank: number
  accuracyRank: number
}

export interface Achievement {
  id: string
  name: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

// プロフィール作成
export function createProfile(employeeId: string, name: string, department: string): UserProfile {
  const profile: UserProfile = {
    id: `profile_${Date.now()}`,
    employeeId,
    name,
    department,
    avatarType: 'EGG',
    level: 1,
    totalPoints: 0,
    currentPoints: 0,
    stars: 0,
    currentTitle: '新人',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  saveProfile(profile)
  return profile
}

// プロフィール保存
export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`profile_${profile.employeeId}`, JSON.stringify(profile))
}

// プロフィール取得
export function getProfile(employeeId: string): UserProfile | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(`profile_${employeeId}`)
  if (!data) return null
  return JSON.parse(data)
}

// プロフィール更新
export function updateProfile(employeeId: string, updates: Partial<UserProfile>): UserProfile | null {
  const profile = getProfile(employeeId)
  if (!profile) return null
  
  const updatedProfile = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveProfile(updatedProfile)
  return updatedProfile
}

// アバター画像をBase64で保存
export function updateAvatar(employeeId: string, imageDataUrl: string): void {
  const profile = getProfile(employeeId)
  if (!profile) return
  
  updateProfile(employeeId, { avatarUrl: imageDataUrl })
}

// ポイント更新
export function updatePoints(employeeId: string, points: number): void {
  const profile = getProfile(employeeId)
  if (!profile) return
  
  const newTotalPoints = profile.totalPoints + points
  const newCurrentPoints = profile.currentPoints + points
  const newLevel = Math.floor(newTotalPoints / 100) + 1
  
  // アバタータイプの自動更新
  let avatarType: UserProfile['avatarType'] = 'EGG'
  if (newLevel >= 50) avatarType = 'PHOENIX'
  else if (newLevel >= 20) avatarType = 'ROOSTER'
  else if (newLevel >= 10) avatarType = 'CHICKEN'
  else if (newLevel >= 5) avatarType = 'CHICK'
  
  // 称号の更新
  let currentTitle = '新人'
  if (newLevel >= 30) currentTitle = '伝説の従業員'
  else if (newLevel >= 20) currentTitle = '連続出勤王'
  else if (newLevel >= 10) currentTitle = '早起きマスター'
  else if (newLevel >= 5) currentTitle = '時間厳守の達人'
  
  // スター計算（500ポイントごとに1スター）
  const stars = Math.max(0, Math.min(Math.floor(newTotalPoints / 500), 5))
  
  updateProfile(employeeId, {
    totalPoints: newTotalPoints,
    currentPoints: newCurrentPoints,
    level: newLevel,
    avatarType,
    currentTitle,
    stars
  })
}

// 統計情報を計算
export function calculateStats(employeeId: string): ProfileStats {
  const pointHistory = getPointHistory(employeeId)
  const profile = getProfile(employeeId)
  
  // 出勤日数とプラスポイント日数を計算
  const totalDays = pointHistory.length
  const positiveDays = pointHistory.filter(p => p.points > 0).length
  const accuracy = totalDays > 0 ? Math.round((positiveDays / totalDays) * 100 * 10) / 10 : 0
  
  // 連続記録を計算
  let currentStreak = 0
  for (let i = pointHistory.length - 1; i >= 0; i--) {
    if (pointHistory[i].points > 0) {
      currentStreak++
    } else {
      break
    }
  }
  
  // デフォルトの実績
  const achievements: Achievement[] = [
    { id: '1', name: '初出勤', icon: '🎯', unlocked: totalDays > 0 },
    { id: '2', name: '1週間皆勤', icon: '📅', unlocked: currentStreak >= 5 },
    { id: '3', name: '早起き鳥', icon: '🌅', unlocked: positiveDays >= 10 },
    { id: '4', name: '月間MVP', icon: '🏆', unlocked: accuracy >= 95 },
    { id: '5', name: '年間皆勤', icon: '👑', unlocked: totalDays >= 200 && accuracy >= 90 }
  ]
  
  return {
    accuracy,
    currentStreak,
    totalDays,
    achievements,
    monthlyRank: Math.floor(Math.random() * 10) + 1, // 仮のランキング
    accuracyRank: Math.floor(Math.random() * 10) + 1  // 仮のランキング
  }
}

// ポイント履歴を取得
export function getPointHistory(employeeId: string): any[] {
  if (typeof window === 'undefined') return []
  const key = `points_${employeeId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// 現在のユーザーを取得または作成
export function getCurrentUser(): UserProfile {
  const employeeId = 'current-user'
  let profile = getProfile(employeeId)
  
  if (!profile) {
    // プロフィールが存在しない場合はデフォルトプロフィールを返す
    const defaultProfile: UserProfile = {
      id: `profile_${Date.now()}`,
      employeeId,
      name: '山田 太郎',
      department: '第一工場',
      avatarType: 'EGG',
      level: 1,
      totalPoints: 0,
      currentPoints: 0,
      stars: 0,
      currentTitle: '新人',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // クライアントサイドでのみ保存
    if (typeof window !== 'undefined') {
      saveProfile(defaultProfile)
    }
    
    return defaultProfile
  }
  
  return profile
}

// シフトデータ（モック）
export interface ShiftData {
  id: string
  employeeId: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  location: string
}

// シフト保存
export function saveShift(shift: ShiftData): void {
  const key = `shift_${shift.employeeId}_${shift.date}`
  localStorage.setItem(key, JSON.stringify(shift))
}

// シフト取得
export function getShift(employeeId: string, date: string): ShiftData | null {
  if (typeof window === 'undefined') {
    // SSR時はデフォルトシフトを返す
    return {
      id: `shift_${Date.now()}`,
      employeeId,
      date,
      startTime: '09:00',
      endTime: '18:00',
      breakMinutes: 60,
      location: '第一工場'
    }
  }
  
  const key = `shift_${employeeId}_${date}`
  const data = localStorage.getItem(key)
  if (!data) {
    // デフォルトシフトを生成（開発用）
    const defaultShift: ShiftData = {
      id: `shift_${Date.now()}`,
      employeeId,
      date,
      startTime: '09:00',
      endTime: '18:00',
      breakMinutes: 60,
      location: '第一工場'
    }
    saveShift(defaultShift)
    return defaultShift
  }
  return JSON.parse(data)
}

// 今週のシフトを取得
export function getWeeklyShifts(employeeId: string): ShiftData[] {
  const shifts: ShiftData[] = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    // 土日は除外（仮）
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const shift = getShift(employeeId, dateStr)
    if (shift) shifts.push(shift)
  }
  
  return shifts
}