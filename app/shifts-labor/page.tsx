'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DailyLaborGrid, ShiftPattern, LaborTask, EmployeeAvailability } from '@/types/shift-labor';
import { OptimizationConfig } from '@/lib/labor-optimization';

export default function ShiftsLaborIntegratedPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('第一工場');
  const [laborGrid, setLaborGrid] = useState<DailyLaborGrid | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'efficiency'>('grid');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const departments = ['第一工場', '第二工場', '第三工場', 'プレス部門', '溶接部門', '間接部門'];

  useEffect(() => {
    loadLaborGrid();
  }, [selectedDate, selectedDepartment]);

  const loadLaborGrid = async () => {
    setLoading(true);
    try {
      // Phase 1: モックデータを生成
      const mockGrid: DailyLaborGrid = generateMockLaborGrid(selectedDate, selectedDepartment);
      setLaborGrid(mockGrid);
    } catch (error) {
      console.error('レイバーグリッドの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLaborGrid = (date: string, department: string): DailyLaborGrid => {
    // 30分刻みのタイムスロット生成（6:00-24:00）
    const timeSlots = [];
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        timeSlots.push({
          id: `slot_${hour}_${minute}`,
          startTime,
          endTime,
          duration: 30,
          date
        });
      }
    }

    // モック従業員データ
    const employees: EmployeeAvailability[] = [
      {
        userId: 'emp_001',
        userName: '田中太郎',
        skills: [
          { skillId: 'press_op', skillName: 'プレス操作', category: 'press_operation', level: 4, practiceHours: 1200, efficiency: 0.92 },
          { skillId: 'welding', skillName: '溶接技術', category: 'welding', level: 3, practiceHours: 800, efficiency: 0.85 }
        ],
        qualifications: ['q_forklift', 'q_welding'],
        currentFatigue: 0.1,
        maxContinuousWork: 120,
        preferredTasks: ['manufacturing'],
        unavailableSlots: [],
        efficiencyByTimeOfDay: {
          '08:00': 0.95,
          '12:00': 0.80,
          '16:00': 0.90,
          '20:00': 0.75
        }
      },
      {
        userId: 'emp_002',
        userName: '佐藤花子',
        skills: [
          { skillId: 'quality', skillName: '品質検査', category: 'quality_inspection', level: 5, practiceHours: 1500, efficiency: 0.98 },
          { skillId: 'assembly', skillName: '組立作業', category: 'assembly', level: 3, practiceHours: 600, efficiency: 0.82 }
        ],
        qualifications: ['q_quality_inspector'],
        currentFatigue: 0.05,
        maxContinuousWork: 150,
        preferredTasks: ['quality_inspection'],
        unavailableSlots: ['12:00-13:00'], // 昼休憩
        efficiencyByTimeOfDay: {
          '08:00': 0.98,
          '12:00': 0.85,
          '16:00': 0.95,
          '20:00': 0.80
        }
      },
      {
        userId: 'emp_003',
        userName: '鈴木次郎',
        skills: [
          { skillId: 'maintenance', skillName: '設備保全', category: 'equipment_maintenance', level: 4, practiceHours: 1000, efficiency: 0.89 },
          { skillId: 'material', skillName: '運搬作業', category: 'material_handling', level: 2, practiceHours: 400, efficiency: 0.75 }
        ],
        qualifications: ['q_forklift', 'q_crane'],
        currentFatigue: 0.2,
        maxContinuousWork: 90,
        preferredTasks: ['equipment_maintenance'],
        unavailableSlots: [],
        efficiencyByTimeOfDay: {
          '08:00': 0.90,
          '12:00': 0.78,
          '16:00': 0.85,
          '20:00': 0.70
        }
      }
    ];

    // モック作業タスク
    const tasks: LaborTask[] = [
      {
        id: 'task_press_a',
        name: 'プレス作業（ライン1）',
        category: 'manufacturing',
        description: 'プレス機械でのパーツ成形作業',
        estimatedDuration: 30,
        requiredSkills: [
          { skillId: 'press_op', skillName: 'プレス操作', minimumLevel: 2, weight: 1.0, isCritical: true }
        ],
        requiredQualifications: [],
        department,
        location: 'ライン1',
        isHazardous: true,
        maxContinuousHours: 2,
        restRequiredAfter: 15,
        equipmentRequired: ['プレス機械#1'],
        priority: 'high',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'task_quality_check',
        name: '品質検査',
        category: 'quality_inspection',
        description: '製品の寸法・外観検査',
        estimatedDuration: 30,
        requiredSkills: [
          { skillId: 'quality', skillName: '品質検査', minimumLevel: 3, weight: 1.0, isCritical: true }
        ],
        requiredQualifications: ['q_quality_inspector'],
        department,
        location: '検査室',
        isHazardous: false,
        maxContinuousHours: 4,
        restRequiredAfter: 10,
        equipmentRequired: ['測定器具セット'],
        priority: 'high',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'task_maintenance',
        name: '設備点検',
        category: 'equipment_maintenance',
        description: '生産設備の定期点検・清掃',
        estimatedDuration: 30,
        requiredSkills: [
          { skillId: 'maintenance', skillName: '設備保全', minimumLevel: 2, weight: 0.8, isCritical: false }
        ],
        requiredQualifications: [],
        department,
        location: '工場フロア',
        isHazardous: false,
        maxContinuousHours: 3,
        restRequiredAfter: 10,
        equipmentRequired: ['点検用工具'],
        priority: 'medium',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    return {
      date,
      department,
      timeSlots,
      assignments: [], // 後で最適化機能で生成
      employees,
      tasks,
      constraints: [],
      optimization: {
        totalEfficiency: 0.87,
        skillUtilization: 0.82,
        constraintViolations: [],
        improvements: [],
        calculatedAt: new Date().toISOString(),
        algorithm: 'greedy_optimization_v1',
        parameters: {}
      }
    };
  };

  const runOptimization = async () => {
    if (!laborGrid) return;

    setOptimizing(true);
    try {
      const defaultConfig: OptimizationConfig = {
        algorithm: 'hybrid',
        objectives: {
          efficiency: 0.4,
          skillUtilization: 0.25,
          employeeSatisfaction: 0.15,
          costOptimization: 0.15,
          safetyCompliance: 0.05
        },
        parameters: {
          maxIterations: 500,
          convergenceThreshold: 0.001,
          populationSize: 30,
          mutationRate: 0.1,
          timeLimit: 60
        },
        advanced: {
          enableFatigueModeling: true,
          enableSkillDecay: false,
          enableLearningCurve: true,
          enableSeasonalAdjustment: false
        }
      };

      const response = await fetch('/api/labor/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grid: laborGrid,
          config: defaultConfig
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLaborGrid(result.data);
        console.log('最適化が完了しました:', result.message);
      } else {
        console.error('最適化に失敗しました');
      }
    } catch (error) {
      console.error('最適化実行中にエラーが発生しました:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const formatTimeSlot = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime}-${timeSlot.endTime}`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.9) return 'bg-green-500';
    if (efficiency >= 0.8) return 'bg-blue-500';
    if (efficiency >= 0.7) return 'bg-yellow-500';
    if (efficiency >= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSkillLevelBadge = (level: number) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">シフト・レイバー統合管理</h1>
          <p className="text-[#778DA9]">30分刻みの詳細作業配置とスキルベース最適化</p>
        </div>

        {/* 制御パネル */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">対象日付</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">部門</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">表示モード</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                <option value="grid">グリッド表示</option>
                <option value="timeline">タイムライン表示</option>
                <option value="efficiency">効率性表示</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button 
                onClick={runOptimization}
                disabled={optimizing}
                className="px-4 py-2 bg-[#F4A261] text-white rounded hover:bg-[#E8956A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {optimizing ? '最適化中...' : '最適化実行'}
              </button>
              <button className="px-4 py-2 bg-[#415A77] text-white rounded hover:bg-[#2E4057] transition-colors duration-200">
                保存
              </button>
            </div>
          </div>
        </div>

        {laborGrid && (
          <>
            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#415A77]">
                    {(laborGrid.optimization.totalEfficiency * 100).toFixed(1)}%
                  </div>
                  <div className="text-[#778DA9]">総合効率性</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F4A261]">
                    {(laborGrid.optimization.skillUtilization * 100).toFixed(1)}%
                  </div>
                  <div className="text-[#778DA9]">スキル活用率</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0D1B2A]">{laborGrid.employees.length}</div>
                  <div className="text-[#778DA9]">配置人員</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#778DA9]">{laborGrid.tasks.length}</div>
                  <div className="text-[#778DA9]">作業タスク</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* 従業員スキル情報 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">従業員スキル情報</h2>
                <div className="space-y-4">
                  {laborGrid.employees.map((employee) => (
                    <div key={employee.userId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-[#0D1B2A]">{employee.userName}</h3>
                          <p className="text-sm text-[#778DA9]">疲労度: {(employee.currentFatigue * 100).toFixed(0)}%</p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-[#778DA9]">連続作業可能</div>
                          <div className="font-medium">{employee.maxContinuousWork}分</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {employee.skills.map((skill) => (
                          <div key={skill.skillId} className="flex justify-between items-center">
                            <span className="text-sm text-[#0D1B2A]">{skill.skillName}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillLevelBadge(skill.level)}`}>
                                Lv.{skill.level}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-[#415A77] h-2 rounded-full"
                                  style={{ width: `${skill.efficiency * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 30分刻みレイバーグリッド */}
              <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">
                  レイバー配置グリッド - {selectedDepartment}
                </h2>
                
                {/* グリッド表示 */}
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* ヘッダー */}
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      <div className="text-sm font-medium text-[#0D1B2A] p-2">時間帯</div>
                      {laborGrid.employees.map((emp) => (
                        <div key={emp.userId} className="text-sm font-medium text-[#0D1B2A] p-2 text-center">
                          {emp.userName}
                        </div>
                      ))}
                    </div>

                    {/* タイムスロット（8:00-18:00のみ表示） */}
                    <div className="space-y-1">
                      {laborGrid.timeSlots.filter(slot => {
                        const hour = parseInt(slot.startTime.split(':')[0]);
                        return hour >= 8 && hour < 18;
                      }).map((slot) => (
                        <div key={slot.id} className="grid grid-cols-4 gap-1">
                          <div className="text-sm text-[#778DA9] p-2 bg-gray-50 rounded">
                            {formatTimeSlot(slot)}
                          </div>
                          {laborGrid.employees.map((emp) => {
                            // モック配置データ
                            const mockTask = laborGrid.tasks[Math.floor(Math.random() * laborGrid.tasks.length)];
                            const mockEfficiency = 0.7 + Math.random() * 0.3;
                            
                            return (
                              <div key={`${slot.id}_${emp.userId}`} className="relative">
                                <div className={`p-2 rounded text-xs text-white cursor-pointer hover:opacity-80 transition-opacity ${getEfficiencyColor(mockEfficiency)}`}>
                                  <div className="font-medium">{mockTask.name}</div>
                                  <div className="opacity-80">{(mockEfficiency * 100).toFixed(0)}%効率</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 凡例 */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>高効率 (90%+)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>良好 (80-89%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>普通 (70-79%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>低効率 (60-69%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>要改善 (60%未満)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 作業タスク一覧 */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">利用可能な作業タスク</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {laborGrid.tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#415A77] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-[#0D1B2A]">{task.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-[#778DA9] mb-3">{task.description}</p>
                    
                    <div className="text-xs text-[#778DA9] space-y-1">
                      <div>所要時間: {task.estimatedDuration}分</div>
                      <div>場所: {task.location}</div>
                      <div>必要スキル: {task.requiredSkills.map(s => s.skillName).join(', ')}</div>
                      {task.isHazardous && (
                        <div className="text-red-600 font-medium">⚠️ 危険作業</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* アクション */}
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/shifts-labor/labor-grid"
                className="bg-[#F4A261] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200"
              >
                詳細グリッド編集
              </Link>
              <Link
                href="/admin/labor/optimization"
                className="bg-[#415A77] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2E4057] transition-colors duration-200"
              >
                最適化設定
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}