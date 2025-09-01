'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DailyLaborGrid, LaborGridAssignment, TimeSlot, EmployeeAvailability, LaborTask } from '@/types/shift-labor';

export default function LaborGridDetailPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('第一工場');
  const [laborGrid, setLaborGrid] = useState<DailyLaborGrid | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ timeSlotId: string; employeeId: string } | null>(null);
  const [draggedTask, setDraggedTask] = useState<LaborTask | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'skills' | 'efficiency'>('grid');
  const [loading, setLoading] = useState(false);

  const departments = ['第一工場', '第二工場', '第三工場', 'プレス部門', '溶接部門', '間接部門'];

  useEffect(() => {
    loadLaborGrid();
  }, [selectedDate, selectedDepartment]);

  const loadLaborGrid = async () => {
    setLoading(true);
    try {
      const mockGrid: DailyLaborGrid = generateMockLaborGrid(selectedDate, selectedDepartment);
      setLaborGrid(mockGrid);
    } catch (error) {
      console.error('レイバーグリッドの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLaborGrid = (date: string, department: string): DailyLaborGrid => {
    // タイムスロット生成（6:00-22:00）
    const timeSlots: TimeSlot[] = [];
    for (let hour = 6; hour < 22; hour++) {
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

    // 指定された従業員データ
    const employees: EmployeeAvailability[] = [
      {
        userId: 'emp_hakusui',
        userName: '白水貴太',
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
          '08:00': 0.95, '12:00': 0.80, '16:00': 0.90, '20:00': 0.75
        }
      },
      {
        userId: 'emp_yashiro_a',
        userName: '八城彰仁',
        skills: [
          { skillId: 'quality', skillName: '品質検査', category: 'quality_inspection', level: 5, practiceHours: 1500, efficiency: 0.98 },
          { skillId: 'assembly', skillName: '組立作業', category: 'assembly', level: 3, practiceHours: 600, efficiency: 0.82 }
        ],
        qualifications: ['q_quality_inspector'],
        currentFatigue: 0.05,
        maxContinuousWork: 150,
        preferredTasks: ['quality_inspection'],
        unavailableSlots: ['12:00-13:00'],
        efficiencyByTimeOfDay: {
          '08:00': 0.98, '12:00': 0.85, '16:00': 0.95, '20:00': 0.80
        }
      },
      {
        userId: 'emp_yashiro_m',
        userName: '八城実恵',
        skills: [
          { skillId: 'maintenance', skillName: '設備保全', category: 'equipment_maintenance', level: 4, practiceHours: 1000, efficiency: 0.89 }
        ],
        qualifications: ['q_forklift', 'q_crane'],
        currentFatigue: 0.2,
        maxContinuousWork: 90,
        preferredTasks: ['equipment_maintenance'],
        unavailableSlots: [],
        efficiencyByTimeOfDay: {
          '08:00': 0.90, '12:00': 0.78, '16:00': 0.85, '20:00': 0.70
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
        id: 'task_assembly_a',
        name: '組立作業（製品A）',
        category: 'manufacturing',
        description: '製品Aの組立・検査作業',
        estimatedDuration: 30,
        requiredSkills: [
          { skillId: 'assembly', skillName: '組立作業', minimumLevel: 2, weight: 0.9, isCritical: true }
        ],
        requiredQualifications: [],
        department,
        location: '組立ライン',
        isHazardous: false,
        maxContinuousHours: 3,
        restRequiredAfter: 10,
        equipmentRequired: ['組立工具セット'],
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
      },
      {
        id: 'task_break',
        name: '休憩',
        category: 'break_time',
        description: '法定休憩時間',
        estimatedDuration: 30,
        requiredSkills: [],
        requiredQualifications: [],
        department,
        location: '休憩室',
        isHazardous: false,
        maxContinuousHours: 8,
        restRequiredAfter: 0,
        equipmentRequired: [],
        priority: 'low',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    // モック配置データ生成
    const assignments: LaborGridAssignment[] = [];
    timeSlots.forEach(slot => {
      employees.forEach(emp => {
        // 基本勤務時間（8:00-17:00）のみ配置
        const hour = parseInt(slot.startTime.split(':')[0]);
        if (hour >= 8 && hour < 17) {
          // 昼休憩時間は除く
          if (slot.startTime === '12:00' || slot.startTime === '12:30') {
            assignments.push({
              timeSlotId: slot.id,
              employeeId: emp.userId,
              taskId: 'task_break',
              efficiency: 1.0,
              skillMatch: 1.0,
              isOptimal: true,
              conflicts: []
            });
          } else {
            // スキルに基づいた適切なタスクを配置
            const suitableTask = findBestTask(emp, tasks);
            if (suitableTask) {
              const skillMatch = calculateSkillMatch(emp, suitableTask);
              const timeEfficiency = emp.efficiencyByTimeOfDay[slot.startTime] || 0.8;
              const fatigueFactor = 1 - emp.currentFatigue;
              
              assignments.push({
                timeSlotId: slot.id,
                employeeId: emp.userId,
                taskId: suitableTask.id,
                efficiency: timeEfficiency * fatigueFactor * skillMatch,
                skillMatch,
                isOptimal: skillMatch >= 0.8 && timeEfficiency >= 0.8,
                conflicts: []
              });
            }
          }
        }
      });
    });

    return {
      date,
      department,
      timeSlots,
      assignments,
      employees,
      tasks,
      constraints: [],
      optimization: {
        totalEfficiency: 0.87,
        skillUtilization: 0.82,
        constraintViolations: [],
        improvements: [],
        calculatedAt: new Date().toISOString(),
        algorithm: 'skill_based_optimization_v1',
        parameters: {}
      }
    };
  };

  const findBestTask = (employee: EmployeeAvailability, tasks: LaborTask[]) => {
    let bestTask = null;
    let bestScore = 0;

    tasks.filter(task => task.category !== 'break_time').forEach(task => {
      const score = calculateSkillMatch(employee, task);
      if (score > bestScore) {
        bestScore = score;
        bestTask = task;
      }
    });

    return bestTask;
  };

  const calculateSkillMatch = (employee: EmployeeAvailability, task: LaborTask) => {
    if (task.requiredSkills.length === 0) return 0.5;

    let totalMatch = 0;
    let totalWeight = 0;

    task.requiredSkills.forEach(reqSkill => {
      const empSkill = employee.skills.find(s => s.skillId === reqSkill.skillId);
      if (empSkill) {
        const levelMatch = Math.min(empSkill.level / reqSkill.minimumLevel, 1.0);
        totalMatch += levelMatch * reqSkill.weight;
      } else {
        totalMatch += 0; // スキルを持っていない場合
      }
      totalWeight += reqSkill.weight;
    });

    return totalWeight > 0 ? totalMatch / totalWeight : 0;
  };

  const handleCellClick = (timeSlotId: string, employeeId: string) => {
    setSelectedCell({ timeSlotId, employeeId });
  };

  const handleTaskDrop = (timeSlotId: string, employeeId: string) => {
    if (!draggedTask || !laborGrid) return;

    // 新しい配置を作成
    const newAssignment: LaborGridAssignment = {
      timeSlotId,
      employeeId,
      taskId: draggedTask.id,
      efficiency: calculateEfficiency(employeeId, draggedTask, timeSlotId),
      skillMatch: calculateSkillMatchById(employeeId, draggedTask),
      isOptimal: true,
      conflicts: []
    };

    // 既存の配置を更新
    const updatedAssignments = laborGrid.assignments.filter(
      a => !(a.timeSlotId === timeSlotId && a.employeeId === employeeId)
    );
    updatedAssignments.push(newAssignment);

    setLaborGrid({
      ...laborGrid,
      assignments: updatedAssignments
    });

    setDraggedTask(null);
  };

  const calculateEfficiency = (employeeId: string, task: LaborTask, timeSlotId: string) => {
    const employee = laborGrid?.employees.find(e => e.userId === employeeId);
    const timeSlot = laborGrid?.timeSlots.find(t => t.id === timeSlotId);
    
    if (!employee || !timeSlot) return 0.5;

    const skillMatch = calculateSkillMatch(employee, task);
    const timeEfficiency = employee.efficiencyByTimeOfDay[timeSlot.startTime] || 0.8;
    const fatigueFactor = 1 - employee.currentFatigue;

    return skillMatch * timeEfficiency * fatigueFactor;
  };

  const calculateSkillMatchById = (employeeId: string, task: LaborTask) => {
    const employee = laborGrid?.employees.find(e => e.userId === employeeId);
    if (!employee) return 0;
    return calculateSkillMatch(employee, task);
  };

  const getAssignment = (timeSlotId: string, employeeId: string) => {
    return laborGrid?.assignments.find(
      a => a.timeSlotId === timeSlotId && a.employeeId === employeeId
    );
  };

  const getTaskById = (taskId: string) => {
    return laborGrid?.tasks.find(t => t.id === taskId);
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.9) return 'bg-green-500';
    if (efficiency >= 0.8) return 'bg-blue-500';
    if (efficiency >= 0.7) return 'bg-yellow-500';
    if (efficiency >= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatTimeSlot = (timeSlot: { startTime: string; endTime: string }) => {
    return `${timeSlot.startTime}-${timeSlot.endTime}`;
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
      <div className="max-w-full mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">詳細レイバーグリッド編集</h1>
              <p className="text-[#778DA9]">ドラッグ&ドロップで作業を配置できます</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/shifts-labor"
                className="bg-[#778DA9] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5A6B7A] transition-colors duration-200"
              >
                ← 戻る
              </Link>
              <button className="bg-[#F4A261] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E8956A] transition-colors duration-200">
                保存
              </button>
            </div>
          </div>
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
                <option value="grid">配置グリッド</option>
                <option value="skills">スキル適合性</option>
                <option value="efficiency">効率性表示</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#2E4057] transition-colors duration-200">
                自動最適化
              </button>
            </div>
          </div>
        </div>

        {laborGrid && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* メインレイバーグリッド */}
            <div className="xl:col-span-3 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">
                {selectedDepartment} - {selectedDate}
              </h2>
              
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  {/* ヘッダー */}
                  <div className="grid gap-1 mb-2" style={{gridTemplateColumns: `120px repeat(${laborGrid.employees.length}, 1fr)`}}>
                    <div className="text-sm font-medium text-[#0D1B2A] p-2">時間帯</div>
                    {laborGrid.employees.map((emp) => (
                      <div key={emp.userId} className="text-sm font-medium text-[#0D1B2A] p-2 text-center bg-gray-50 rounded">
                        <div className="font-semibold">{emp.userName}</div>
                        <div className="text-xs text-[#778DA9] mt-1">
                          疲労: {(emp.currentFatigue * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* グリッド本体 */}
                  <div className="space-y-1">
                    {laborGrid.timeSlots.filter(slot => {
                      const hour = parseInt(slot.startTime.split(':')[0]);
                      return hour >= 6 && hour < 22;
                    }).map((slot) => (
                      <div key={slot.id} className="grid gap-1" style={{gridTemplateColumns: `120px repeat(${laborGrid.employees.length}, 1fr)`}}>
                        <div className="text-sm text-[#778DA9] p-2 bg-gray-50 rounded flex items-center">
                          {formatTimeSlot(slot)}
                        </div>
                        {laborGrid.employees.map((emp) => {
                          const assignment = getAssignment(slot.id, emp.userId);
                          const task = assignment ? getTaskById(assignment.taskId) : null;
                          const isSelected = selectedCell?.timeSlotId === slot.id && selectedCell?.employeeId === emp.userId;
                          
                          return (
                            <div
                              key={`${slot.id}_${emp.userId}`}
                              className={`relative min-h-[60px] border-2 rounded cursor-pointer transition-all duration-200 ${
                                isSelected ? 'border-[#F4A261] shadow-lg' : 'border-gray-200 hover:border-[#415A77]'
                              }`}
                              onClick={() => handleCellClick(slot.id, emp.userId)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                handleTaskDrop(slot.id, emp.userId);
                              }}
                            >
                              {assignment && task && (
                                <div className={`h-full p-2 rounded text-white text-xs ${getEfficiencyColor(assignment.efficiency)}`}>
                                  <div className="font-medium truncate">{task.name}</div>
                                  <div className="mt-1 opacity-90">
                                    効率: {(assignment.efficiency * 100).toFixed(0)}%
                                  </div>
                                  <div className="opacity-80">
                                    適合: {(assignment.skillMatch * 100).toFixed(0)}%
                                  </div>
                                  {assignment.isOptimal && (
                                    <div className="absolute top-1 right-1">
                                      <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                                    </div>
                                  )}
                                </div>
                              )}
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

            {/* 作業タスクパレット */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">作業タスク</h3>
              <div className="space-y-3">
                {laborGrid.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTask(task);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-[#415A77] hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-[#0D1B2A] text-sm">{task.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${ 
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#778DA9] mb-2">{task.description}</p>
                    
                    <div className="text-xs text-[#778DA9]">
                      <div>所要時間: {task.estimatedDuration}分</div>
                      <div>場所: {task.location}</div>
                      {task.isHazardous && (
                        <div className="text-red-600 font-medium mt-1">⚠️ 危険作業</div>
                      )}
                    </div>

                    {task.requiredSkills.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-[#778DA9] mb-1">必要スキル:</div>
                        <div className="flex flex-wrap gap-1">
                          {task.requiredSkills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              {skill.skillName} Lv.{skill.minimumLevel}+
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 選択されたセルの詳細 */}
              {selectedCell && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-bold text-[#0D1B2A] mb-3">選択セル詳細</h4>
                  {(() => {
                    const assignment = getAssignment(selectedCell.timeSlotId, selectedCell.employeeId);
                    const employee = laborGrid.employees.find(e => e.userId === selectedCell.employeeId);
                    const timeSlot = laborGrid.timeSlots.find(t => t.id === selectedCell.timeSlotId);
                    const task = assignment ? getTaskById(assignment.taskId) : null;

                    return (
                      <div className="text-sm space-y-2">
                        <div><span className="text-[#778DA9]">従業員:</span> {employee?.userName}</div>
                        <div><span className="text-[#778DA9]">時間帯:</span> {timeSlot ? formatTimeSlot(timeSlot) : ''}</div>
                        {assignment && task && (
                          <>
                            <div><span className="text-[#778DA9]">作業:</span> {task.name}</div>
                            <div><span className="text-[#778DA9]">効率性:</span> {(assignment.efficiency * 100).toFixed(1)}%</div>
                            <div><span className="text-[#778DA9]">スキル適合:</span> {(assignment.skillMatch * 100).toFixed(1)}%</div>
                            <div className="pt-2">
                              <button className="w-full bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600 transition-colors duration-200">
                                配置を削除
                              </button>
                            </div>
                          </>
                        )}
                        {!assignment && (
                          <div className="text-[#778DA9] italic">未配置</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}