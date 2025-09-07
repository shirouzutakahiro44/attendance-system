'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, calculateStats, updatePoints } from '@/lib/profile-manager'

// アバタータイプの定義
const AVATAR_TYPES = {
  EGG: { name: '卵', icon: '🥚', minLevel: 1 },
  CHICK: { name: 'ひよこ', icon: '🐣', minLevel: 5 },
  CHICKEN: { name: '鶏', icon: '🐔', minLevel: 10 },
  ROOSTER: { name: '雄鶏', icon: '🐓', minLevel: 20 },
  PHOENIX: { name: '不死鳥', icon: '🔥🦅', minLevel: 50 }
}

// 称号の定義
const TITLES = [
  '新人',
  '時間厳守の達人',
  '早起きマスター',
  '連続出勤王',
  '伝説の従業員'
]

export default function ProfilePage() {
  const [profile, setProfile] = useState(getCurrentUser())
  const [stats, setStats] = useState(calculateStats(profile.employeeId))

  useEffect(() => {
    // プロフィールとステータスを再読み込み
    const currentProfile = getCurrentUser()
    const currentStats = calculateStats(currentProfile.employeeId)
    setProfile(currentProfile)
    setStats(currentStats)
  }, [])

  const avatar = AVATAR_TYPES[profile.avatarType as keyof typeof AVATAR_TYPES]
  const nextLevelPoints = (profile.level + 1) * 200
  const levelProgress = Math.max(0, Math.min(100, (profile.currentPoints / nextLevelPoints) * 100))

  return (
    <div className="min-h-screen bg-base-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            マイプロフィール
          </h1>
          <p className="text-text-sub">あなたの実績と成長を確認しましょう</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* プロフィールカード */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* アバター */}
              <div className="text-center mb-6">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="アバター"
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-accent"
                  />
                ) : (
                  <div className="text-8xl mb-4">{avatar.icon}</div>
                )}
                <h2 className="text-xl font-bold text-text-heading">{profile.name}</h2>
                <p className="text-text-sub">社員番号: {profile.employeeId}</p>
                <p className="text-text-sub">{profile.department}</p>
              </div>

              {/* レベルと称号 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-body">
                    レベル {profile.level} - {avatar.name}
                  </span>
                  <span className="text-sm text-text-sub">
                    {profile.currentPoints}/{nextLevelPoints} PT
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-button to-accent h-3 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>

              {/* 現在の称号 */}
              <div className="bg-accent/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-text-sub mb-1">現在の称号</p>
                <p className="text-lg font-bold text-accent">{profile.currentTitle}</p>
              </div>

              {/* 編集ボタン */}
              <Link
                href="/profile/edit"
                className="block text-center bg-primary-button text-white py-2 px-4 rounded-lg hover:bg-primary-button/80 transition-colors mb-6"
              >
                プロフィール編集
              </Link>

              {/* ステータス */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-body">総獲得ポイント</span>
                  <span className="text-xl font-bold text-primary-button">
                    {profile.totalPoints.toLocaleString()} PT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-body">獲得スター</span>
                  <span className="text-xl">
                    {'⭐'.repeat(Math.max(0, Math.min(profile.stars || 0, 5)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-body">打刻正確率</span>
                  <span className="text-xl font-bold text-state-success">
                    {stats.accuracy}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-body">連続出勤</span>
                  <span className="text-xl font-bold text-accent">
                    {stats.currentStreak}日
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 実績とクエスト */}
          <div className="lg:col-span-2 space-y-6">
            {/* 実績バッジ */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-text-heading mb-4">
                獲得バッジ
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`text-center p-4 rounded-lg transition-all ${
                      achievement.unlocked
                        ? 'bg-accent/10 hover:bg-accent/20'
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="text-xs text-text-body">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 現在のクエスト */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-text-heading mb-4">
                アクティブクエスト
              </h3>
              <div className="space-y-4">
                <QuestItem
                  name="週間皆勤賞"
                  description="今週のシフト全てに5分前出勤を達成"
                  progress={3}
                  target={5}
                  reward={50}
                  type="weekly"
                />
                <QuestItem
                  name="早起きチャレンジ"
                  description="3日連続で10分前に出勤"
                  progress={2}
                  target={3}
                  reward={30}
                  type="daily"
                />
                <QuestItem
                  name="月間マスター"
                  description="今月の打刻正確率90%以上を維持"
                  progress={92}
                  target={90}
                  reward={100}
                  type="monthly"
                />
              </div>
            </div>

            {/* ランキング */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-text-heading mb-4">
                今月のランキング
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ポイントランキング */}
                <div>
                  <h4 className="text-lg font-semibold text-text-body mb-3">
                    総合ポイント
                  </h4>
                  <div className="space-y-2">
                    <RankingItem rank={1} name="佐藤 花子" points={1450} isYou={false} />
                    <RankingItem rank={stats.monthlyRank} name={profile.name} points={profile.totalPoints} isYou={true} />
                    <RankingItem rank={3} name="鈴木 一郎" points={1180} isYou={false} />
                    <RankingItem rank={4} name="田中 美咲" points={1050} isYou={false} />
                    <RankingItem rank={5} name="高橋 健太" points={980} isYou={false} />
                  </div>
                </div>

                {/* 正確率ランキング */}
                <div>
                  <h4 className="text-lg font-semibold text-text-body mb-3">
                    打刻正確率
                  </h4>
                  <div className="space-y-2">
                    <RankingItem rank={1} name="田中 美咲" points={96.5} unit="%" isYou={false} />
                    <RankingItem rank={2} name="高橋 健太" points={94.2} unit="%" isYou={false} />
                    <RankingItem rank={stats.accuracyRank} name={profile.name} points={stats.accuracy} unit="%" isYou={true} />
                    <RankingItem rank={4} name="佐藤 花子" points={91.8} unit="%" isYou={false} />
                    <RankingItem rank={5} name="鈴木 一郎" points={88.3} unit="%" isYou={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// クエストアイテムコンポーネント
function QuestItem({ 
  name, 
  description, 
  progress, 
  target, 
  reward, 
  type 
}: {
  name: string
  description: string
  progress: number
  target: number
  reward: number
  type: 'daily' | 'weekly' | 'monthly'
}) {
  const progressPercent = Math.min((progress / target) * 100, 100)
  const typeColors = {
    daily: 'bg-blue-500',
    weekly: 'bg-purple-500',
    monthly: 'bg-green-500'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-text-heading">{name}</h4>
          <p className="text-sm text-text-sub">{description}</p>
        </div>
        <span className={`text-xs text-white px-2 py-1 rounded ${typeColors[type]}`}>
          {type === 'daily' ? '日次' : type === 'weekly' ? '週次' : '月次'}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-sub">進捗: {progress}/{target}</span>
          <span className="text-accent font-semibold">+{reward} PT</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-button to-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ランキングアイテムコンポーネント
function RankingItem({ 
  rank, 
  name, 
  points, 
  unit = 'PT',
  isYou 
}: {
  rank: number
  name: string
  points: number
  unit?: string
  isYou: boolean
}) {
  const rankEmojis = ['🥇', '🥈', '🥉']
  
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${
      isYou ? 'bg-accent/10 border border-accent' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {rank <= 3 ? rankEmojis[rank - 1] : `${rank}位`}
        </span>
        <span className={`text-sm ${isYou ? 'font-bold text-accent' : 'text-text-body'}`}>
          {name} {isYou && '(あなた)'}
        </span>
      </div>
      <span className={`font-semibold ${isYou ? 'text-accent' : 'text-primary-button'}`}>
        {unit === '%' ? points : points.toLocaleString()} {unit}
      </span>
    </div>
  )
}