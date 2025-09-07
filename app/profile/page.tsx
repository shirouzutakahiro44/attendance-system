'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import { getCurrentUser, calculateStats, updatePoints } from '@/lib/profile-manager'
import { UserQualification, UserSkill, QualificationStatus, SkillLevel } from '@/types/skills'

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
  const [qualifications, setQualifications] = useState<UserQualification[]>([])
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [qualificationsLoading, setQualificationsLoading] = useState(true)

  useEffect(() => {
    // プロフィールとステータスを再読み込み
    const currentProfile = getCurrentUser()
    const currentStats = calculateStats(currentProfile.employeeId)
    setProfile(currentProfile)
    setStats(currentStats)

    // 資格・スキル情報を読み込み
    loadQualificationsAndSkills()
  }, [])

  const loadQualificationsAndSkills = async () => {
    try {
      // Phase 1: モックデータを生成
      const mockQualifications: UserQualification[] = [
        {
          id: 'uq_001',
          userId: 'current-user',
          qualificationId: 'q_forklift',
          qualification: {
            id: 'q_forklift',
            name: 'フォークリフト運転技能講習',
            category: 'equipment',
            description: 'フォークリフト運転に必要な技能講習修了証',
            isRequired: true,
            validityPeriod: 3,
            renewalRequired: true,
            regulatoryBody: '厚生労働省',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          certificateNumber: 'FL-2024-001234',
          obtainedDate: '2024-03-15',
          expiryDate: '2027-03-14',
          issuingAuthority: '〇〇労働基準監督署',
          status: 'active',
          createdAt: '2024-03-15T00:00:00Z',
          updatedAt: '2024-03-15T00:00:00Z'
        },
        {
          id: 'uq_002',
          userId: 'current-user',
          qualificationId: 'q_welding',
          qualification: {
            id: 'q_welding',
            name: 'アーク溶接特別教育',
            category: 'technical',
            description: 'アーク溶接作業に従事するための特別教育',
            isRequired: true,
            validityPeriod: 0,
            renewalRequired: false,
            regulatoryBody: '厚生労働省',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          certificateNumber: 'AW-2023-005678',
          obtainedDate: '2023-11-20',
          issuingAuthority: '〇〇技能講習センター',
          status: 'active',
          createdAt: '2023-11-20T00:00:00Z',
          updatedAt: '2023-11-20T00:00:00Z'
        }
      ]

      const mockSkills: UserSkill[] = [
        {
          id: 'us_001',
          userId: 'current-user',
          skillId: 'skill_press',
          skill: {
            id: 'skill_press',
            name: 'プレス操作',
            category: 'press_operation',
            description: 'プレス機械の操作技能',
            relatedQualifications: [],
            assessmentCriteria: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          currentLevel: 4,
          assessedAt: '2024-07-15T00:00:00Z',
          assessedBy: '班長 田中',
          practiceHours: 1250,
          notes: '非常に熟練している。新人指導も可能。',
          nextAssessmentDate: '2025-01-15',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-07-15T00:00:00Z'
        },
        {
          id: 'us_002',
          userId: 'current-user',
          skillId: 'skill_welding',
          skill: {
            id: 'skill_welding',
            name: '溶接技術',
            category: 'welding',
            description: 'アーク溶接・ガス溶接技術',
            relatedQualifications: ['q_welding'],
            assessmentCriteria: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          currentLevel: 3,
          assessedAt: '2024-06-20T00:00:00Z',
          assessedBy: '主任 佐藤',
          practiceHours: 890,
          notes: '基本技術は習得済み。難易度の高い作業では指導が必要。',
          nextAssessmentDate: '2024-12-20',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-06-20T00:00:00Z'
        }
      ]

      setQualifications(mockQualifications)
      setSkills(mockSkills)
      setQualificationsLoading(false)
    } catch (error) {
      console.error('資格情報の取得に失敗しました:', error)
      setQualificationsLoading(false)
    }
  }

  // シンプルでかわいいアイコンの定義（画像に合わせて）
  const achievementIcons = {
    '初出勤': '👤',      // シンプルな人
    '1週間皆勤': '💼',   // ブリーフケース（画像と同じ）
    '早起き鳥': '⭐',    // 星（画像と同じ）
    '月間MVP': '💖',     // ハート（画像と同じピンクハート）
    '年間皆勤': '✨'      // キラキラ
  }

  const avatar = AVATAR_TYPES[profile.avatarType as keyof typeof AVATAR_TYPES]
  const nextLevelPoints = (profile.level + 1) * 200
  const levelProgress = Math.max(0, Math.min(100, (profile.currentPoints / nextLevelPoints) * 100))

  // ヘルパー関数
  const getStatusColor = (status: QualificationStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-gray-100 text-gray-800',
      pending_renewal: 'bg-blue-100 text-blue-800'
    }
    return colors[status]
  }

  const getStatusLabel = (status: QualificationStatus) => {
    const labels = {
      active: '有効',
      expired: '期限切れ',
      expiring_soon: '期限間近',
      suspended: '停止中',
      pending_renewal: '更新手続き中'
    }
    return labels[status]
  }

  const getSkillLevelLabel = (level: SkillLevel) => {
    const labels = {
      1: '初心者',
      2: '初級',
      3: '中級',
      4: '上級',
      5: 'エキスパート'
    }
    return labels[level]
  }

  const getSkillLevelColor = (level: SkillLevel) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-purple-100 text-purple-800'
    }
    return colors[level]
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP')
  }

  return (
    <div className="min-h-screen bg-base-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <BackButton className="mb-4" />
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
                    className={`text-center p-6 rounded-2xl transition-all ${
                      achievement.unlocked
                        ? 'bg-white border-2 border-pink-200 hover:border-pink-300 shadow-lg hover:shadow-xl'
                        : 'bg-gray-50 border border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      {achievement.unlocked ? (
                        <img 
                          src="/badge-icon.png" 
                          alt={achievement.name}
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center text-3xl text-gray-400">
                          🔒
                        </div>
                      )}
                    </div>
                    <p className={`text-xs ${
                      achievement.unlocked ? 'text-accent font-medium' : 'text-gray-500'
                    }`}>
                      {achievement.name}
                    </p>
                    {achievement.unlocked && (
                      <div className="flex justify-center mt-2 space-x-1">
                        <span className="text-xs">💖</span>
                        <span className="text-xs">⭐</span>
                      </div>
                    )}
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

            {/* 保有資格・スキル */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-heading">
                  保有資格・スキル
                </h3>
                <Link
                  href="/qualifications/my"
                  className="text-primary-button hover:text-accent text-sm font-medium transition-colors"
                >
                  詳細を見る →
                </Link>
              </div>

              {qualificationsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-lg text-text-sub">読み込み中...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 保有資格 */}
                  <div>
                    <h4 className="text-lg font-semibold text-text-body mb-3">
                      保有資格 ({qualifications.length}件)
                    </h4>
                    {qualifications.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {qualifications.slice(0, 4).map((qual) => (
                          <div key={qual.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-text-heading text-sm">
                                {qual.qualification?.name}
                              </h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(qual.status)}`}>
                                {getStatusLabel(qual.status)}
                              </span>
                            </div>
                            <div className="text-xs text-text-sub space-y-1">
                              <div>取得日: {formatDate(qual.obtainedDate)}</div>
                              {qual.expiryDate && (
                                <div>有効期限: {formatDate(qual.expiryDate)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-sub text-sm">資格情報がありません</p>
                    )}
                  </div>

                  {/* スキルレベル */}
                  <div>
                    <h4 className="text-lg font-semibold text-text-body mb-3">
                      スキルレベル ({skills.length}件)
                    </h4>
                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skills.slice(0, 4).map((skill) => (
                          <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-text-heading text-sm">
                                {skill.skill?.name}
                              </h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.currentLevel)}`}>
                                Lv.{skill.currentLevel} {getSkillLevelLabel(skill.currentLevel)}
                              </span>
                            </div>
                            <div className="text-xs text-text-sub space-y-1">
                              <div>実践時間: {skill.practiceHours}時間</div>
                              <div>最終評価: {formatDate(skill.assessedAt)}</div>
                            </div>
                            {/* スキルレベルバー */}
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-primary-button h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-sub text-sm">スキル情報がありません</p>
                    )}
                  </div>

                  {/* サマリー */}
                  <div className="bg-accent/10 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-accent">{qualifications.filter(q => q.status === 'active').length}</div>
                        <div className="text-sm text-accent">有効な資格</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {skills.length > 0 ? (skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length).toFixed(1) : '0.0'}
                        </div>
                        <div className="text-sm text-accent">平均スキルレベル</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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