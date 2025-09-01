'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LaborAnalytics, LaborMetrics, LaborTrend, SkillGapAnalysis } from '@/types/shift-labor';

export default function LaborAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<LaborAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const departments = ['all', '第一工場', '第二工場', '第三工場', 'プレス部門', '溶接部門', '間接部門'];
  const periods = [
    { value: 'day', label: '今日' },
    { value: 'week', label: '今週' },
    { value: 'month', label: '今月' },
    { value: 'quarter', label: '四半期' }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedDepartment]);

  const loadAnalytics = async () => {
    if (analytics) setRefreshing(true);
    else setLoading(true);

    try {
      // Phase 1: モック分析データを生成
      const mockAnalytics: LaborAnalytics = generateMockAnalytics();
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('分析データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockAnalytics = (): LaborAnalytics => {
    const mockTrends: LaborTrend[] = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockTrends.push({
        date: date.toISOString().split('T')[0],
        efficiency: 0.75 + Math.random() * 0.2,
        skillUtilization: 0.65 + Math.random() * 0.25,
        taskCompletion: 0.85 + Math.random() * 0.15,
        employeeCount: 45 + Math.floor(Math.random() * 10)
      });
    }

    const mockSkillGaps: SkillGapAnalysis[] = [
      {
        skillId: 'press_op',
        skillName: 'プレス操作',
        requiredLevel: 4,
        currentAverageLevel: 3.2,
        gap: -0.8,
        employeesAffected: 8,
        impactOnEfficiency: -0.15,
        trainingRecommendation: 'プレス操作技能講習の実施（中級→上級）'
      },
      {
        skillId: 'quality_inspection',
        skillName: '品質検査',
        requiredLevel: 3,
        currentAverageLevel: 2.1,
        gap: -0.9,
        employeesAffected: 12,
        impactOnEfficiency: -0.22,
        trainingRecommendation: '品質検査技能研修と実践訓練プログラム'
      },
      {
        skillId: 'equipment_maintenance',
        skillName: '設備保全',
        requiredLevel: 3,
        currentAverageLevel: 3.8,
        gap: 0.8,
        employeesAffected: 5,
        impactOnEfficiency: 0.12,
        trainingRecommendation: '高度な設備保全技術の習得推進'
      }
    ];

    return {
      period: selectedPeriod,
      department: selectedDepartment,
      metrics: {
        totalAssignments: 2847,
        averageEfficiency: 0.847,
        skillUtilizationRate: 0.723,
        taskCompletionRate: 0.912,
        overtimeRate: 0.087,
        safetyIncidents: 0,
        employeeSatisfaction: 0.78
      },
      trends: mockTrends,
      skillGaps: mockSkillGaps,
      recommendations: [
        {
          id: 'rec_001',
          type: 'skill_development',
          priority: 'high',
          title: '品質検査スキル向上プログラム',
          description: '品質検査分野でのスキルギャップを解消し、全体的な効率性を向上',
          expectedBenefit: '効率性22%向上、品質向上',
          estimatedCost: 850000,
          implementationTime: 45,
          dependencies: ['研修講師確保', '実習設備準備']
        },
        {
          id: 'rec_002',
          type: 'process_improvement',
          priority: 'medium',
          title: '作業配置最適化アルゴリズム改善',
          description: 'AIベースの配置最適化により、スキル活用率と効率性を同時改善',
          expectedBenefit: 'スキル活用率18%向上',
          estimatedCost: 320000,
          implementationTime: 21,
          dependencies: ['システム開発', '運用テスト']
        },
        {
          id: 'rec_003',
          type: 'resource_allocation',
          priority: 'low',
          title: '部門間スキル共有制度',
          description: '部門をまたいだスキル共有により、全体的なスキル活用率を向上',
          expectedBenefit: '人員配置柔軟性向上',
          estimatedCost: 150000,
          implementationTime: 30,
          dependencies: ['部門間調整', '評価制度見直し']
        }
      ]
    };
  };

  const formatPercentage = (value: number) => (value * 100).toFixed(1) + '%';
  const formatNumber = (value: number) => value.toLocaleString();
  const formatCurrency = (value: number) => '¥' + value.toLocaleString();

  const getMetricStatus = (current: number, threshold: number) => {
    if (current >= threshold) return { color: 'text-green-600', icon: '↗' };
    if (current >= threshold * 0.9) return { color: 'text-yellow-600', icon: '→' };
    return { color: 'text-red-600', icon: '↘' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      <div className="max-w-8xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">レイバー分析ダッシュボード</h1>
              <p className="text-[#778DA9]">スキルベース作業配置の総合分析と改善提案</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/shifts-labor"
                className="bg-[#778DA9] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5A6B7A] transition-colors duration-200"
              >
                配置管理
              </Link>
              <button
                onClick={loadAnalytics}
                disabled={refreshing}
                className="bg-[#F4A261] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E8956A] transition-colors duration-200 disabled:opacity-50"
              >
                {refreshing ? '更新中...' : 'データ更新'}
              </button>
            </div>
          </div>
        </div>

        {/* 制御パネル */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">分析期間</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">部門</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? '全部門' : dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Link
                href="/admin/labor/optimization"
                className="w-full bg-[#415A77] text-white py-2 px-4 rounded text-center hover:bg-[#2E4057] transition-colors duration-200"
              >
                最適化設定
              </Link>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* KPIメトリクス */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-[#778DA9]">平均効率性</p>
                    <p className="text-2xl font-bold text-[#0D1B2A]">
                      {formatPercentage(analytics.metrics.averageEfficiency)}
                    </p>
                  </div>
                  <div className={`text-2xl ${getMetricStatus(analytics.metrics.averageEfficiency, 0.8).color}`}>
                    {getMetricStatus(analytics.metrics.averageEfficiency, 0.8).icon}
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#415A77] h-2 rounded-full"
                    style={{ width: `${analytics.metrics.averageEfficiency * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-[#778DA9]">スキル活用率</p>
                    <p className="text-2xl font-bold text-[#0D1B2A]">
                      {formatPercentage(analytics.metrics.skillUtilizationRate)}
                    </p>
                  </div>
                  <div className={`text-2xl ${getMetricStatus(analytics.metrics.skillUtilizationRate, 0.75).color}`}>
                    {getMetricStatus(analytics.metrics.skillUtilizationRate, 0.75).icon}
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#F4A261] h-2 rounded-full"
                    style={{ width: `${analytics.metrics.skillUtilizationRate * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-[#778DA9]">作業完了率</p>
                    <p className="text-2xl font-bold text-[#0D1B2A]">
                      {formatPercentage(analytics.metrics.taskCompletionRate)}
                    </p>
                  </div>
                  <div className={`text-2xl ${getMetricStatus(analytics.metrics.taskCompletionRate, 0.9).color}`}>
                    {getMetricStatus(analytics.metrics.taskCompletionRate, 0.9).icon}
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analytics.metrics.taskCompletionRate * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-[#778DA9]">従業員満足度</p>
                    <p className="text-2xl font-bold text-[#0D1B2A]">
                      {formatPercentage(analytics.metrics.employeeSatisfaction)}
                    </p>
                  </div>
                  <div className={`text-2xl ${getMetricStatus(analytics.metrics.employeeSatisfaction, 0.75).color}`}>
                    {getMetricStatus(analytics.metrics.employeeSatisfaction, 0.75).icon}
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${analytics.metrics.employeeSatisfaction * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* 推移グラフ */}
              <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">パフォーマンス推移</h2>
                
                {/* 簡易チャート表示 */}
                <div className="space-y-4">
                  {analytics.trends.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20 text-sm text-[#778DA9]">
                        {new Date(trend.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#415A77]">効率性</span>
                          <span className="font-medium">{formatPercentage(trend.efficiency)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#415A77] h-2 rounded-full"
                            style={{ width: `${trend.efficiency * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-[#F4A261]">スキル活用</span>
                          <span className="font-medium">{formatPercentage(trend.skillUtilization)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#F4A261] h-2 rounded-full"
                            style={{ width: `${trend.skillUtilization * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* その他の詳細メトリクス */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">詳細メトリクス</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#778DA9]">総配置数</span>
                    <span className="font-semibold text-[#0D1B2A]">{formatNumber(analytics.metrics.totalAssignments)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#778DA9]">残業率</span>
                    <span className="font-semibold text-[#0D1B2A]">{formatPercentage(analytics.metrics.overtimeRate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#778DA9]">安全インシデント</span>
                    <span className="font-semibold text-[#0D1B2A]">{analytics.metrics.safetyIncidents}件</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-[#0D1B2A] mb-2">今週のハイライト</h4>
                    <ul className="text-sm text-[#778DA9] space-y-1">
                      <li>• 効率性が前週比で2.3%向上</li>
                      <li>• プレス部門のスキル活用率が85%達成</li>
                      <li>• 安全インシデント0日継続中</li>
                      <li>• 新人3名がレベル2に昇格</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* スキルギャップ分析 */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">スキルギャップ分析</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.skillGaps.map((gap) => (
                  <div key={gap.skillId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-[#0D1B2A]">{gap.skillName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        gap.gap < 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {gap.gap < 0 ? 'ギャップ有' : '余剰有'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#778DA9]">必要レベル:</span>
                        <span>Lv.{gap.requiredLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#778DA9]">現在平均:</span>
                        <span>Lv.{gap.currentAverageLevel.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#778DA9]">影響人数:</span>
                        <span>{gap.employeesAffected}名</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#778DA9]">効率影響:</span>
                        <span className={gap.impactOnEfficiency < 0 ? 'text-red-600' : 'text-green-600'}>
                          {(gap.impactOnEfficiency * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-[#778DA9]">
                        <strong>推奨:</strong> {gap.trainingRecommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 改善提案 */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">改善提案</h2>
              
              <div className="space-y-4">
                {analytics.recommendations.map((rec) => (
                  <div key={rec.id} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#0D1B2A]">{rec.title}</h3>
                        <span className="text-xs font-medium">
                          {rec.priority === 'high' ? '高優先度' : rec.priority === 'medium' ? '中優先度' : '低優先度'}
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-[#415A77]">{rec.expectedBenefit}</div>
                        <div className="text-[#778DA9]">{rec.implementationTime}日</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#1B263B] mb-3">{rec.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-[#778DA9]">
                      <span>予算: {formatCurrency(rec.estimatedCost)}</span>
                      <span>依存: {rec.dependencies.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}