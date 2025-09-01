'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LaborConstraint, ConstraintType, OptimizationResult } from '@/types/shift-labor';

interface OptimizationSettings {
  algorithm: 'greedy' | 'genetic' | 'simulated_annealing' | 'hybrid';
  objectives: {
    efficiency: number;
    skillUtilization: number;
    employeeSatisfaction: number;
    costOptimization: number;
    safetyCompliance: number;
  };
  constraints: LaborConstraint[];
  parameters: {
    maxIterations: number;
    convergenceThreshold: number;
    populationSize: number;
    mutationRate: number;
    timeLimit: number;
  };
  advanced: {
    enableFatigueModeling: boolean;
    enableSkillDecay: boolean;
    enableLearningCurve: boolean;
    enableSeasonalAdjustment: boolean;
  };
}

export default function OptimizationSettingsPage() {
  const [settings, setSettings] = useState<OptimizationSettings>({
    algorithm: 'hybrid',
    objectives: {
      efficiency: 0.4,
      skillUtilization: 0.25,
      employeeSatisfaction: 0.15,
      costOptimization: 0.15,
      safetyCompliance: 0.05
    },
    constraints: [],
    parameters: {
      maxIterations: 1000,
      convergenceThreshold: 0.001,
      populationSize: 50,
      mutationRate: 0.1,
      timeLimit: 300
    },
    advanced: {
      enableFatigueModeling: true,
      enableSkillDecay: false,
      enableLearningCurve: true,
      enableSeasonalAdjustment: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Phase 1: モック設定データを読み込み
      const mockConstraints: LaborConstraint[] = [
        {
          id: 'constraint_skill_req',
          type: 'skill_requirement',
          description: '作業に必要なスキルレベル要件',
          parameters: { minLevel: 2, strictMode: true },
          severity: 'hard',
          isActive: true
        },
        {
          id: 'constraint_qual_req',
          type: 'qualification_requirement',
          description: '危険作業における資格要件',
          parameters: { requiredQuals: ['forklift', 'welding'], checkExpiry: true },
          severity: 'hard',
          isActive: true
        },
        {
          id: 'constraint_max_work',
          type: 'max_continuous_work',
          description: '連続作業時間の制限',
          parameters: { maxMinutes: 120, breakRequired: 15 },
          severity: 'hard',
          isActive: true
        },
        {
          id: 'constraint_min_rest',
          type: 'minimum_rest',
          description: '最低休憩時間の確保',
          parameters: { minRestMinutes: 60, perShift: 8 },
          severity: 'hard',
          isActive: true
        },
        {
          id: 'constraint_equipment',
          type: 'equipment_availability',
          description: '設備稼働状況による制限',
          parameters: { checkMaintenance: true, maxCapacity: true },
          severity: 'soft',
          isActive: true
        },
        {
          id: 'constraint_preference',
          type: 'employee_preference',
          description: '従業員の希望作業への配慮',
          parameters: { weight: 0.3, respectUnavailable: true },
          severity: 'soft',
          isActive: false
        }
      ];

      setSettings(prev => ({ ...prev, constraints: mockConstraints }));
      setLoading(false);
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setRunning(true);
    try {
      // Phase 1: モック最適化実行
      await new Promise(resolve => setTimeout(resolve, 3000)); // 実行をシミュレート

      const mockResult: OptimizationResult = {
        totalEfficiency: 0.89,
        skillUtilization: 0.85,
        constraintViolations: [],
        improvements: [
          {
            type: 'swap_assignment',
            description: '田中太郎と佐藤花子の10:30の作業を交換することで効率が3.2%向上',
            expectedImprovement: 0.032,
            effort: 'low',
            implementation: '管理画面で配置を変更してください'
          },
          {
            type: 'skill_training',
            description: '鈴木次郎にプレス操作スキルを習得させることで長期的に効率向上',
            expectedImprovement: 0.078,
            effort: 'high',
            implementation: '技能研修プログラムに登録してください'
          }
        ],
        calculatedAt: new Date().toISOString(),
        algorithm: settings.algorithm + '_optimization_v2',
        parameters: settings.parameters
      };

      setLastResult(mockResult);
    } catch (error) {
      console.error('最適化の実行に失敗しました:', error);
    } finally {
      setRunning(false);
    }
  };

  const updateObjective = (key: keyof typeof settings.objectives, value: number) => {
    const newObjectives = { ...settings.objectives, [key]: value };
    
    // 合計を1.0に正規化
    const total = Object.values(newObjectives).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(newObjectives).forEach(k => {
        newObjectives[k as keyof typeof newObjectives] = newObjectives[k as keyof typeof newObjectives] / total;
      });
    }

    setSettings(prev => ({ ...prev, objectives: newObjectives }));
  };

  const toggleConstraint = (constraintId: string) => {
    setSettings(prev => ({
      ...prev,
      constraints: prev.constraints.map(c => 
        c.id === constraintId ? { ...c, isActive: !c.isActive } : c
      )
    }));
  };

  const getConstraintTypeLabel = (type: ConstraintType) => {
    const labels = {
      skill_requirement: 'スキル要件',
      qualification_requirement: '資格要件', 
      max_continuous_work: '連続作業制限',
      minimum_rest: '最低休憩時間',
      equipment_availability: '設備稼働状況',
      employee_preference: '従業員希望',
      safety_regulation: '安全規制',
      labor_law_compliance: '労働法準拠'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: 'hard' | 'soft') => {
    return severity === 'hard' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getSeverityLabel = (severity: 'hard' | 'soft') => {
    return severity === 'hard' ? 'ハード制約' : 'ソフト制約';
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
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">最適化設定</h1>
              <p className="text-[#778DA9]">レイバー配置の自動最適化パラメータを調整できます</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/shifts-labor"
                className="bg-[#778DA9] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5A6B7A] transition-colors duration-200"
              >
                ← 戻る
              </Link>
              <button
                onClick={runOptimization}
                disabled={running}
                className="bg-[#F4A261] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E8956A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? '実行中...' : '最適化実行'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* アルゴリズム設定 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">アルゴリズム設定</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0D1B2A] mb-2">最適化アルゴリズム</label>
                <select
                  value={settings.algorithm}
                  onChange={(e) => setSettings(prev => ({ ...prev, algorithm: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                >
                  <option value="greedy">貪欲法（高速）</option>
                  <option value="genetic">遺伝的アルゴリズム（高品質）</option>
                  <option value="simulated_annealing">焼きなまし法（バランス）</option>
                  <option value="hybrid">ハイブリッド（推奨）</option>
                </select>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0D1B2A]">パラメータ</h3>
                
                <div>
                  <label className="block text-sm text-[#778DA9] mb-1">
                    最大イテレーション: {settings.parameters.maxIterations}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={settings.parameters.maxIterations}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, maxIterations: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#778DA9] mb-1">
                    実行時間制限: {settings.parameters.timeLimit}秒
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="1800"
                    step="30"
                    value={settings.parameters.timeLimit}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, timeLimit: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>

                {settings.algorithm === 'genetic' && (
                  <>
                    <div>
                      <label className="block text-sm text-[#778DA9] mb-1">
                        個体数: {settings.parameters.populationSize}
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="10"
                        value={settings.parameters.populationSize}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          parameters: { ...prev.parameters, populationSize: parseInt(e.target.value) }
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#778DA9] mb-1">
                        突然変異率: {(settings.parameters.mutationRate * 100).toFixed(1)}%
                      </label>
                      <input
                        type="range"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        value={settings.parameters.mutationRate}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          parameters: { ...prev.parameters, mutationRate: parseFloat(e.target.value) }
                        }))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 目的関数の重み */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">最適化目標</h2>
            
            <div className="space-y-4">
              {Object.entries(settings.objectives).map(([key, value]) => {
                const labels = {
                  efficiency: '作業効率性',
                  skillUtilization: 'スキル活用率',
                  employeeSatisfaction: '従業員満足度',
                  costOptimization: 'コスト最適化',
                  safetyCompliance: '安全コンプライアンス'
                };

                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-[#0D1B2A]">
                        {labels[key as keyof typeof labels]}
                      </label>
                      <span className="text-sm text-[#778DA9]">
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={value}
                      onChange={(e) => updateObjective(key as keyof typeof settings.objectives, parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>

            {/* 高度な設定 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4">高度な設定</h3>
              <div className="space-y-3">
                {Object.entries(settings.advanced).map(([key, value]) => {
                  const labels = {
                    enableFatigueModeling: '疲労モデルを考慮',
                    enableSkillDecay: 'スキル劣化を考慮',
                    enableLearningCurve: '学習効果を考慮',
                    enableSeasonalAdjustment: '季節調整を適用'
                  };

                  return (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          advanced: { ...prev.advanced, [key]: e.target.checked }
                        }))}
                        className="w-4 h-4 text-[#415A77] border-gray-300 rounded focus:ring-[#415A77]"
                      />
                      <span className="text-sm text-[#0D1B2A]">
                        {labels[key as keyof typeof labels]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 制約条件 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">制約条件</h2>
            
            <div className="space-y-4">
              {settings.constraints.map((constraint) => (
                <div key={constraint.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={constraint.isActive}
                        onChange={() => toggleConstraint(constraint.id)}
                        className="w-4 h-4 text-[#415A77] border-gray-300 rounded focus:ring-[#415A77]"
                      />
                      <div>
                        <h4 className="font-medium text-[#0D1B2A]">
                          {getConstraintTypeLabel(constraint.type)}
                        </h4>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(constraint.severity)}`}>
                      {getSeverityLabel(constraint.severity)}
                    </span>
                  </div>
                  <p className="text-sm text-[#778DA9] mb-3">{constraint.description}</p>
                  
                  {constraint.parameters && Object.keys(constraint.parameters).length > 0 && (
                    <div className="text-xs text-[#778DA9]">
                      <strong>パラメータ:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {Object.entries(constraint.parameters).map(([key, value]) => (
                          <li key={key}>
                            {key}: {JSON.stringify(value)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最適化実行結果 */}
        {lastResult && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">最適化結果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4">パフォーマンス指標</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#778DA9]">総合効率性</span>
                    <span className="font-semibold text-[#415A77]">
                      {(lastResult.totalEfficiency * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#778DA9]">スキル活用率</span>
                    <span className="font-semibold text-[#415A77]">
                      {(lastResult.skillUtilization * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#778DA9]">制約違反</span>
                    <span className="font-semibold text-[#E63946]">
                      {lastResult.constraintViolations.length}件
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#0D1B2A] mb-4">改善提案</h3>
                <div className="space-y-3">
                  {lastResult.improvements.map((improvement, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-[#0D1B2A]">
                          {improvement.description}
                        </span>
                        <span className="text-xs text-green-600 font-semibold">
                          +{(improvement.expectedImprovement * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-[#778DA9]">{improvement.implementation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-[#778DA9] text-center">
              計算日時: {new Date(lastResult.calculatedAt).toLocaleString('ja-JP')} | 
              アルゴリズム: {lastResult.algorithm}
            </div>
          </div>
        )}

        {/* アクション */}
        <div className="mt-8 flex justify-center space-x-4">
          <button className="bg-[#778DA9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5A6B7A] transition-colors duration-200">
            設定を保存
          </button>
          <button className="bg-[#415A77] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2E4057] transition-colors duration-200">
            デフォルトに戻す
          </button>
        </div>
      </div>
    </div>
  );
}