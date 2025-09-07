'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { getCurrentUser, updateProfile, updateAvatar, getShift, saveShift } from '@/lib/profile-manager'

export default function ProfileEditPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState(getCurrentUser())
  const [formData, setFormData] = useState({
    name: profile.name,
    nameKana: profile.nameKana || '',
    email: profile.email || '',
    department: profile.department,
    bio: profile.bio || ''
  })
  const [todayShift, setTodayShift] = useState({
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60
  })
  const [previewImage, setPreviewImage] = useState<string | undefined>(profile.avatarUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 今日のシフト情報を取得
    const today = new Date().toISOString().split('T')[0]
    const shift = getShift(profile.employeeId, today)
    if (shift) {
      setTodayShift({
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakMinutes: shift.breakMinutes
      })
    }
  }, [profile.employeeId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      setMessage('画像は5MB以下にしてください')
      return
    }

    // 画像をBase64に変換
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreviewImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      // プロフィール更新
      const updatedProfile = updateProfile(profile.employeeId, {
        ...formData,
        avatarUrl: previewImage
      })

      if (updatedProfile) {
        // 今日のシフトを保存
        const today = new Date().toISOString().split('T')[0]
        saveShift({
          id: `shift_${Date.now()}`,
          employeeId: profile.employeeId,
          date: today,
          ...todayShift,
          location: formData.department
        })

        setMessage('プロフィールを更新しました')
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      }
    } catch (error) {
      setMessage('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const departments = [
    '第一工場',
    '第二工場',
    '第三工場',
    'プレス',
    '溶接',
    '間接部門'
  ]

  const avatarEmojis = {
    EGG: '🥚',
    CHICK: '🐣',
    CHICKEN: '🐔',
    ROOSTER: '🐓',
    PHOENIX: '🔥🦅'
  }

  return (
    <div className="min-h-screen bg-base-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <BackButton href="/profile" label="プロフィールに戻る" className="mb-4" />
          <div>
            <h1 className="text-3xl font-bold text-text-heading">
              プロフィール編集
            </h1>
            <p className="text-text-sub">プロフィール情報とシフトを設定</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: アバター設定 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-text-heading mb-4">
                アバター設定
              </h2>

              {/* 現在のアバター */}
              <div className="text-center mb-6">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="アバター"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-accent"
                  />
                ) : (
                  <div className="text-8xl mb-4">
                    {avatarEmojis[profile.avatarType as keyof typeof avatarEmojis]}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors"
                >
                  画像をアップロード
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-text-sub mt-2">
                  JPG, PNG (最大5MB)
                </p>
              </div>

              {/* 現在のステータス */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-sub">レベル</span>
                  <span className="font-bold text-primary-button">
                    Lv.{profile.level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-sub">称号</span>
                  <span className="font-bold text-accent">
                    {profile.currentTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-sub">総ポイント</span>
                  <span className="font-bold text-primary-button">
                    {profile.totalPoints} PT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: 基本情報とシフト設定 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-text-heading mb-4">
                基本情報
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    氏名 <span className="text-state-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    氏名（カナ）
                  </label>
                  <input
                    type="text"
                    value={formData.nameKana}
                    onChange={(e) => setFormData({...formData, nameKana: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="ヤマダ タロウ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="yamada@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    所属部署 <span className="text-state-error">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-body mb-1">
                    自己紹介
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    rows={3}
                    placeholder="趣味や特技など自由に記入してください"
                  />
                </div>
              </div>
            </div>

            {/* シフト設定 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-text-heading mb-4">
                本日のシフト設定
              </h2>
              <p className="text-sm text-text-sub mb-4">
                シフト時間を設定すると、打刻時のポイント計算が正確になります
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    出勤時刻
                  </label>
                  <input
                    type="time"
                    value={todayShift.startTime}
                    onChange={(e) => setTodayShift({...todayShift, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    退勤時刻
                  </label>
                  <input
                    type="time"
                    value={todayShift.endTime}
                    onChange={(e) => setTodayShift({...todayShift, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    休憩時間（分）
                  </label>
                  <input
                    type="number"
                    value={todayShift.breakMinutes}
                    onChange={(e) => setTodayShift({...todayShift, breakMinutes: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                    min="0"
                    max="120"
                  />
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="flex justify-end gap-4">
              <Link
                href="/profile"
                className="px-6 py-3 border border-secondary text-text-body rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Link>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.department}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : '保存する'}
              </button>
            </div>

            {/* メッセージ */}
            {message && (
              <div className={`text-center p-3 rounded-lg ${
                message.includes('失敗') ? 'bg-state-error/10 text-state-error' : 'bg-state-success/10 text-state-success'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}