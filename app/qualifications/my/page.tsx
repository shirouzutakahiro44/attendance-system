'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserQualification, UserSkill, QualificationAlert } from '@/types/skills';

export default function MyQualificationsPage() {
  const [qualifications, setQualifications] = useState<UserQualification[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [alerts, setAlerts] = useState<QualificationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserQualifications();
  }, []);

  const loadUserQualifications = async () => {
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
            validityPeriod: 0, // 永続
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
        },
        {
          id: 'uq_003',
          userId: 'current-user',
          qualificationId: 'q_crane',
          qualification: {
            id: 'q_crane',
            name: '玉掛け技能講習',
            category: 'safety',
            description: 'クレーン等による玉掛け作業技能講習',
            isRequired: false,
            validityPeriod: 3,
            renewalRequired: true,
            regulatoryBody: '厚生労働省',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          certificateNumber: 'CR-2022-009876',
          obtainedDate: '2022-08-10',
          expiryDate: '2025-08-09',
          issuingAuthority: '〇〇クレーン協会',
          status: 'expiring_soon',
          createdAt: '2022-08-10T00:00:00Z',
          updatedAt: '2022-08-10T00:00:00Z'
        }
      ];

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
        },
        {
          id: 'us_003',
          userId: 'current-user',
          skillId: 'skill_quality',
          skill: {
            id: 'skill_quality',
            name: '品質検査',
            category: 'quality_inspection',
            description: '製品品質の検査・測定技能',
            relatedQualifications: [],
            assessmentCriteria: [],
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          currentLevel: 2,
          assessedAt: '2024-05-10T00:00:00Z',
          assessedBy: '品質管理 山田',
          practiceHours: 320,
          notes: '基本的な検査は可能。複雑な測定器具の使用は要練習。',
          nextAssessmentDate: '2024-11-10',
          improvementPlan: '三次元測定器の操作訓練を予定',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-05-10T00:00:00Z'
        }
      ];

      const mockAlerts: QualificationAlert[] = [
        {
          id: 'qa_001',
          type: 'expiring',
          severity: 'medium',
          userId: 'current-user',
          userName: '白水 創薫',
          qualificationId: 'q_crane',
          qualificationName: '玉掛け技能講習',
          expiryDate: '2025-08-09',
          daysUntilExpiry: 8,
          message: '玉掛け技能講習の有効期限が8日後に切れます',
          actionRequired: ['更新講習の受講申込', '会社への報告'],
          createdAt: new Date().toISOString()
        }
      ];

      setQualifications(mockQualifications);
      setSkills(mockSkills);
      setAlerts(mockAlerts);
      setLoading(false);

    } catch (error) {
      console.error('資格情報の取得に失敗しました:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: QualificationStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-gray-100 text-gray-800',
      pending_renewal: 'bg-blue-100 text-blue-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: QualificationStatus) => {
    const labels = {
      active: '有効',
      expired: '期限切れ',
      expiring_soon: '期限間近',
      suspended: '停止中',
      pending_renewal: '更新手続き中'
    };
    return labels[status];
  };

  const getCategoryLabel = (category: QualificationCategory) => {
    const labels = {
      safety: '安全関連',
      technical: '技術関連',
      equipment: '設備関連',
      quality: '品質関連',
      management: '管理関連',
      other: 'その他'
    };
    return labels[category];
  };

  const getSkillLevelLabel = (level: SkillLevel) => {
    const labels = {
      1: '初心者',
      2: '初級',
      3: '中級',
      4: '上級',
      5: 'エキスパート'
    };
    return labels[level];
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-purple-100 text-purple-800'
    };
    return colors[level];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP');
  };

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0E1DD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#415A77] mx-auto mb-4"></div>
          <p className="text-[#778DA9]">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0E1DD]">
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">保有資格・スキル</h1>
          <p className="text-[#778DA9]">あなたの資格とスキルレベルを確認できます</p>
        </div>

        {/* アラート */}
        {alerts.length > 0 && (
          <div className="mb-8">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-[#0D1B2A]">{alert.message}</h3>
                    <div className="mt-2 text-sm text-[#778DA9]">
                      <strong>必要な対応:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {alert.actionRequired.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-right text-sm text-[#778DA9]">
                    残り{alert.daysUntilExpiry}日
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 保有資格 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#0D1B2A]">保有資格</h2>
              <Link
                href="/qualifications/register"
                className="bg-[#F4A261] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E8956A] transition-colors duration-200"
              >
                資格追加
              </Link>
            </div>

            <div className="space-y-4">
              {qualifications.map((qual) => (
                <div key={qual.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#0D1B2A]">{qual.qualification?.name}</h3>
                      <p className="text-sm text-[#778DA9]">
                        {getCategoryLabel(qual.qualification?.category || 'other')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(qual.status)}`}>
                      {getStatusLabel(qual.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#778DA9]">証明書番号: </span>
                      <span className="font-mono">{qual.certificateNumber}</span>
                    </div>
                    <div>
                      <span className="text-[#778DA9]">取得日: </span>
                      <span>{formatDate(qual.obtainedDate)}</span>
                    </div>
                    {qual.expiryDate && (
                      <>
                        <div>
                          <span className="text-[#778DA9]">有効期限: </span>
                          <span className={calculateDaysUntilExpiry(qual.expiryDate) <= 30 ? 'text-red-600 font-medium' : ''}>
                            {formatDate(qual.expiryDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#778DA9]">残り日数: </span>
                          <span className={calculateDaysUntilExpiry(qual.expiryDate) <= 30 ? 'text-red-600 font-bold' : ''}>
                            {calculateDaysUntilExpiry(qual.expiryDate)}日
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-3 text-sm">
                    <span className="text-[#778DA9]">発行機関: </span>
                    <span>{qual.issuingAuthority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* スキルレベル */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">スキルレベル</h2>

            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#0D1B2A]">{skill.skill?.name}</h3>
                      <p className="text-sm text-[#778DA9]">
                        実践時間: {skill.practiceHours}時間
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skill.currentLevel)}`}>
                      Lv.{skill.currentLevel} {getSkillLevelLabel(skill.currentLevel)}
                    </span>
                  </div>

                  {/* スキルレベルバー */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-[#778DA9] mb-1">
                      <span>進捗</span>
                      <span>{skill.currentLevel}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#415A77] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-[#778DA9]">最終評価: </span>
                      <span>{formatDate(skill.assessedAt)} ({skill.assessedBy})</span>
                    </div>
                    <div>
                      <span className="text-[#778DA9]">次回評価: </span>
                      <span>{skill.nextAssessmentDate ? formatDate(skill.nextAssessmentDate) : '未定'}</span>
                    </div>
                    {skill.notes && (
                      <div>
                        <span className="text-[#778DA9]">評価コメント: </span>
                        <p className="text-[#1B263B] mt-1">{skill.notes}</p>
                      </div>
                    )}
                    {skill.improvementPlan && (
                      <div>
                        <span className="text-[#778DA9]">改善計画: </span>
                        <p className="text-[#415A77] mt-1 font-medium">{skill.improvementPlan}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* スキル向上目標 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
          <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">スキル向上目標</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.filter(skill => skill.currentLevel < 5).map((skill) => (
              <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-[#0D1B2A] mb-2">{skill.skill?.name}</h3>
                <div className="text-sm text-[#778DA9] space-y-1">
                  <div>現在: Lv.{skill.currentLevel}</div>
                  <div>目標: Lv.{skill.currentLevel + 1}</div>
                  <div>必要時間: 約{(skill.currentLevel + 1) * 200 - skill.practiceHours}時間</div>
                </div>
                <div className="mt-3">
                  <button className="w-full bg-[#415A77] text-white py-2 rounded hover:bg-[#2E4057] transition-colors duration-200">
                    研修申請
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}