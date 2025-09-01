'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DailyLaborGrid, LaborGridAssignment, TimeSlot, EmployeeAvailability, LaborTask, ShiftPattern } from '@/types/shift-labor';
import EmployeeManager from '@/lib/employees';

export default function NewLaborGridPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('第一工場');
  const [laborGrid, setLaborGrid] = useState<DailyLaborGrid | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ timeSlotId: string; employeeId: string } | null>(null);
  const [draggedTask, setDraggedTask] = useState<LaborTask | null>(null);
  const [editing, setEditing] = useState(true);
  const [loading, setLoading] = useState(false);

  const departments = ['第一工場', '第二工場', '第三工場', 'プレス部門', '溶接部門', '間接部門'];

  // シフト情報
  const employeeShifts = {
    'emp_hakusui': { name: '日勤', startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    'emp_yashiro_a': { name: '早番', startTime: '06:00', endTime: '15:00', breakStart: '10:00', breakEnd: '11:00' },
    'emp_yashiro_m': { name: '遅番', startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' }
  };

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
    // 30分刻みのタイムスロット生成（6:00-20:00）
    const timeSlots: TimeSlot[] = [];
    for (let hour = 6; hour < 20; hour++) {
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

    // 共通マスタから従業員データを変換
    const masterEmployees = EmployeeManager.getAllEmployees();
    const employees: EmployeeAvailability[] = masterEmployees.map(emp => ({
      userId: emp.id,
      userName: emp.name,
      skills: [
        { skillId: 'press_op', skillName: 'プレス操作', category: 'press_operation', level: emp.skills.press_operation, practiceHours: emp.skills.press_operation * 300, efficiency: emp.skills.press_operation / 5 },
        { skillId: 'welding', skillName: '溶接技術', category: 'welding', level: emp.skills.welding, practiceHours: emp.skills.welding * 300, efficiency: emp.skills.welding / 5 },
        { skillId: 'quality', skillName: '品質検査', category: 'quality_inspection', level: emp.skills.quality_inspection, practiceHours: emp.skills.quality_inspection * 300, efficiency: emp.skills.quality_inspection / 5 },
        { skillId: 'assembly', skillName: '組立作業', category: 'assembly', level: emp.skills.assembly, practiceHours: emp.skills.assembly * 300, efficiency: emp.skills.assembly / 5 },
        { skillId: 'maintenance', skillName: '設備保全', category: 'equipment_maintenance', level: emp.skills.equipment_maintenance, practiceHours: emp.skills.equipment_maintenance * 300, efficiency: emp.skills.equipment_maintenance / 5 },
        { skillId: 'material', skillName: '運搬作業', category: 'material_handling', level: emp.skills.material_handling, practiceHours: emp.skills.material_handling * 300, efficiency: emp.skills.material_handling / 5 }
      ],
      qualifications: emp.level >= 3 ? ['q_forklift', 'q_quality_inspector'] : ['q_forklift'],
      currentFatigue: Math.random() * 0.2,
      maxContinuousWork: 90 + emp.level * 20,
      preferredTasks: ['manufacturing', 'quality_inspection'],
      unavailableSlots: [],
      efficiencyByTimeOfDay: {
        '08:00': 0.8 + emp.level * 0.04, '12:00': 0.7 + emp.level * 0.03, '16:00': 0.75 + emp.level * 0.04, '20:00': 0.6 + emp.level * 0.03
      }
    }));

    // 作業タスク
    const tasks: LaborTask[] = [
      {
        id: 'task_press_a',
        name: 'プレス作業A',
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
        name: '組立作業A',
        category: 'manufacturing',
        description: '製品Aの組立・検査作業',
        estimatedDuration: 30,
        requiredSkills: [
          { skillId: 'assembly', skillName: '組立作業', minimumLevel: 3, weight: 1.0, isCritical: true }
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
        id: 'task_material_handling',
        name: '運搬作業',
        category: 'material_handling',
        description: '部材・製品の運搬作業',
        estimatedDuration: 30,
        requiredSkills: [
          { skillId: 'material', skillName: '運搬作業', minimumLevel: 2, weight: 1.0, isCritical: false }
        ],
        requiredQualifications: ['q_forklift'],
        department,
        location: '工場フロア',
        isHazardous: false,
        maxContinuousHours: 4,
        restRequiredAfter: 5,
        equipmentRequired: ['フォークリフト'],
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

    return {
      date,
      department,
      timeSlots,
      assignments: [],
      employees,
      tasks,
      constraints: [],
      optimization: {
        totalEfficiency: 0.87,
        skillUtilization: 0.82,
        constraintViolations: [],
        improvements: [],
        calculatedAt: new Date().toISOString(),
        algorithm: 'manual_assignment_v1',
        parameters: {}
      }
    };
  };

  const isWithinShift = (employeeId: string, timeSlot: TimeSlot): boolean => {
    const shift = employeeShifts[employeeId as keyof typeof employeeShifts];
    if (!shift) return false;

    const slotHour = parseInt(timeSlot.startTime.split(':')[0]);
    const slotMinute = parseInt(timeSlot.startTime.split(':')[1]);
    const slotTime = slotHour * 60 + slotMinute;

    const shiftStartHour = parseInt(shift.startTime.split(':')[0]);
    const shiftStartMinute = parseInt(shift.startTime.split(':')[1]);
    const shiftStart = shiftStartHour * 60 + shiftStartMinute;

    const shiftEndHour = parseInt(shift.endTime.split(':')[0]);
    const shiftEndMinute = parseInt(shift.endTime.split(':')[1]);
    const shiftEnd = shiftEndHour * 60 + shiftEndMinute;

    return slotTime >= shiftStart && slotTime < shiftEnd;
  };

  const isBreakTime = (employeeId: string, timeSlot: TimeSlot): boolean => {
    const shift = employeeShifts[employeeId as keyof typeof employeeShifts];
    if (!shift) return false;

    const breakStart = parseInt(shift.breakStart.split(':')[0]) * 60 + parseInt(shift.breakStart.split(':')[1]);
    const breakEnd = parseInt(shift.breakEnd.split(':')[0]) * 60 + parseInt(shift.breakEnd.split(':')[1]);
    const slotTime = parseInt(timeSlot.startTime.split(':')[0]) * 60 + parseInt(timeSlot.startTime.split(':')[1]);

    return slotTime >= breakStart && slotTime < breakEnd;
  };

  const getOptimalTasks = (employeeId: string): LaborTask[] => {
    if (!laborGrid) return [];
    
    const employee = laborGrid.employees.find(e => e.userId === employeeId);
    if (!employee) return [];

    return laborGrid.tasks
      .filter(task => task.category !== 'break_time')
      .map(task => ({
        task,
        score: calculateTaskScore(employee, task)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.task);
  };

  const calculateTaskScore = (employee: EmployeeAvailability, task: LaborTask): number => {
    let score = 0;

    // スキル適合度
    for (const requiredSkill of task.requiredSkills) {
      const empSkill = employee.skills.find(s => s.skillId === requiredSkill.skillId);
      if (empSkill) {
        const skillRatio = empSkill.level / requiredSkill.minimumLevel;
        score += skillRatio * empSkill.efficiency * requiredSkill.weight;
      }
    }

    // 希望作業タイプ
    if (employee.preferredTasks.includes(task.category)) {
      score += 0.2;
    }

    // 資格要件
    const hasAllQualifications = task.requiredQualifications.every(qual => 
      employee.qualifications.includes(qual)
    );
    if (hasAllQualifications) {
      score += 0.1;
    } else if (task.requiredQualifications.length > 0) {
      score *= 0.5; // 資格なしは大幅減点
    }

    return score;
  };

  const handleCellClick = (timeSlotId: string, employeeId: string) => {
    if (!editing) return;
    setSelectedCell({ timeSlotId, employeeId });
  };

  const handleTaskAssign = (taskId: string) => {
    if (!selectedCell || !laborGrid) return;

    const timeSlot = laborGrid.timeSlots.find(t => t.id === selectedCell.timeSlotId);
    const employee = laborGrid.employees.find(e => e.userId === selectedCell.employeeId);
    const task = laborGrid.tasks.find(t => t.id === taskId);

    if (!timeSlot || !employee || !task) return;

    // 既存の配置を削除
    const filteredAssignments = laborGrid.assignments.filter(
      a => !(a.timeSlotId === selectedCell.timeSlotId && a.employeeId === selectedCell.employeeId)
    );

    // 新しい配置を追加
    const newAssignment: LaborGridAssignment = {
      timeSlotId: selectedCell.timeSlotId,
      employeeId: selectedCell.employeeId,
      taskId,
      efficiency: calculateTaskScore(employee, task) / 2, // 0-1の範囲に正規化
      skillMatch: calculateTaskScore(employee, task) / 2,
      isOptimal: calculateTaskScore(employee, task) > 1.0,
      conflicts: []
    };

    setLaborGrid({
      ...laborGrid,
      assignments: [...filteredAssignments, newAssignment]
    });

    setSelectedCell(null);
  };

  const getAssignment = (timeSlotId: string, employeeId: string): LaborGridAssignment | undefined => {
    return laborGrid?.assignments.find(
      a => a.timeSlotId === timeSlotId && a.employeeId === employeeId
    );
  };

  const getTaskById = (taskId: string): LaborTask | undefined => {
    return laborGrid?.tasks.find(t => t.id === taskId);
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.9) return 'bg-[#F4ACB7]';
    if (efficiency >= 0.8) return 'bg-[#FFCAD4]';
    if (efficiency >= 0.7) return 'bg-[#FFE5D9]';
    if (efficiency >= 0.6) return 'bg-[#9D8189]';
    return 'bg-[#D8E2DC]';
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
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">シフトベース レイバーグリッド</h1>
              <p className="text-[#778DA9]">縦軸：従業員、横軸：時間 | シフトに応じた最適配置</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/shifts"
                className="bg-[#778DA9] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5A6B7A] transition-colors duration-200"
              >
                ← シフト管理
              </Link>
              <button
                onClick={() => setEditing(!editing)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  editing 
                    ? 'bg-[#F4A261] text-white hover:bg-[#E8956A]' 
                    : 'bg-[#415A77] text-white hover:bg-[#2E4057]'
                }`}
              >
                {editing ? '編集モード' : '表示モード'}
              </button>
            </div>
          </div>
        </div>

        {/* 制御パネル */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="flex items-end">
              <button
                onClick={loadLaborGrid}
                className="w-full bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#2E4057] transition-colors duration-200"
              >
                更新
              </button>
            </div>
          </div>
        </div>

        {laborGrid && (
          <div className="flex gap-8">
            {/* メインレイバーグリッド */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">
                レイバー配置グリッド - {selectedDate}
              </h2>
              
              {/* スクロール可能なグリッド */}
              <div className="overflow-x-auto">
                <div className="min-w-[1400px]">
                  {/* ヘッダー（時間軸） */}
                  <div className="grid gap-1 mb-2" style={{
                    gridTemplateColumns: `240px repeat(${laborGrid.timeSlots.length}, 50px)`
                  }}>
                    <div className="text-sm font-medium text-[#0D1B2A] p-2 bg-gray-100 rounded">
                      従業員 / 時間
                    </div>
                    {laborGrid.timeSlots.map((slot) => (
                      <div key={slot.id} className="text-xs text-[#0D1B2A] p-1 text-center">
                        <div className="transform -rotate-45 origin-center whitespace-nowrap">
                          {slot.startTime}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 従業員行 */}
                  {laborGrid.employees.map((employee) => {
                    const shift = employeeShifts[employee.userId as keyof typeof employeeShifts];
                    const optimalTasks = getOptimalTasks(employee.userId);

                    return (
                      <div key={employee.userId} className="grid gap-1 mb-1" style={{
                        gridTemplateColumns: `240px repeat(${laborGrid.timeSlots.length}, 50px)`
                      }}>
                        {/* 従業員情報カラム */}
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="font-semibold text-[#0D1B2A] mb-1">{employee.userName}</div>
                          {shift && (
                            <div className="text-xs text-blue-600 mb-2">
                              {shift.name}: {shift.startTime}-{shift.endTime}
                            </div>
                          )}
                          <div className="text-xs text-[#778DA9] mb-2">
                            疲労: {(employee.currentFatigue * 100).toFixed(0)}%
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {employee.skills.slice(0, 2).map((skill, idx) => (
                              <span key={idx} className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                                {skill.skillName.slice(0, 4)} Lv.{skill.level}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-green-600">
                            最適: {optimalTasks.slice(0, 2).map(t => t.name.slice(0, 4)).join(', ')}
                          </div>
                        </div>

                        {/* タイムスロット */}
                        {laborGrid.timeSlots.map((timeSlot) => {
                          const assignment = getAssignment(timeSlot.id, employee.userId);
                          const task = assignment ? getTaskById(assignment.taskId) : null;
                          const withinShift = isWithinShift(employee.userId, timeSlot);
                          const breakTime = isBreakTime(employee.userId, timeSlot);
                          const isSelected = selectedCell?.timeSlotId === timeSlot.id && selectedCell?.employeeId === employee.userId;

                          return (
                            <div
                              key={`${timeSlot.id}_${employee.userId}`}
                              className={`relative min-h-[60px] border cursor-pointer transition-all duration-200 ${
                                isSelected ? 'border-[#F4A261] border-2 shadow-lg' :
                                !withinShift ? 'border-gray-100 bg-gray-100' :
                                breakTime ? 'border-yellow-300 bg-yellow-50' :
                                'border-gray-200 hover:border-[#415A77] bg-white'
                              }`}
                              onClick={() => handleCellClick(timeSlot.id, employee.userId)}
                            >
                              {/* シフト外 */}
                              {!withinShift && (
                                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                  外
                                </div>
                              )}

                              {/* 休憩時間 */}
                              {breakTime && withinShift && (
                                <div className="h-full flex items-center justify-center text-xs text-yellow-700 font-medium">
                                  休
                                </div>
                              )}

                              {/* 作業配置 */}
                              {assignment && task && !breakTime && withinShift && (
                                <div className={`h-full p-1 text-white text-xs flex flex-col justify-center items-center ${getEfficiencyColor(assignment.efficiency)}`}>
                                  <div className="font-medium text-[9px] leading-tight text-center mb-0.5">
                                    {task.name.length > 6 ? task.name.substring(0, 6) + '..' : task.name}
                                  </div>
                                  <div className="text-[8px]">{(assignment.efficiency * 100).toFixed(0)}%</div>
                                  {assignment.isOptimal && (
                                    <div className="absolute top-0.5 right-0.5">
                                      <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 空のセル（編集可能） */}
                              {!assignment && !breakTime && withinShift && editing && (
                                <div className="h-full flex items-center justify-center text-gray-300 hover:text-gray-500 text-lg">
                                  +
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* サイドパネル */}
            {editing && (
              <div className="w-80 space-y-6">
                {/* 選択されたセル情報 */}
                {selectedCell && (
                  <div className="bg-white rounded-lg shadow-md p-4 border border-[#778DA9]">
                    <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">配置設定</h3>
                    {(() => {
                      const employee = laborGrid.employees.find(e => e.userId === selectedCell.employeeId);
                      const timeSlot = laborGrid.timeSlots.find(t => t.id === selectedCell.timeSlotId);
                      const shift = employee ? employeeShifts[employee.userId as keyof typeof employeeShifts] : null;
                      const optimalTasks = employee ? getOptimalTasks(employee.userId) : [];

                      return (
                        <div>
                          <div className="mb-4 p-3 bg-gray-50 rounded">
                            <div className="font-medium">{employee?.userName}</div>
                            <div className="text-sm text-[#778DA9]">
                              時間: {timeSlot?.startTime} - {timeSlot?.endTime}
                            </div>
                            {shift && (
                              <div className="text-sm text-blue-600">
                                シフト: {shift.name}
                              </div>
                            )}
                          </div>

                          {optimalTasks.length > 0 && (
                            <>
                              <h4 className="font-medium text-[#0D1B2A] mb-2">推奨タスク</h4>
                              <div className="space-y-2 mb-4">
                                {optimalTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="p-2 border border-green-200 rounded bg-green-50 cursor-pointer hover:bg-green-100"
                                    onClick={() => handleTaskAssign(task.id)}
                                  >
                                    <div className="font-medium text-sm">{task.name}</div>
                                    <div className="text-xs text-green-600">
                                      適合度: {(calculateTaskScore(employee!, task) * 50).toFixed(0)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          <h4 className="font-medium text-[#0D1B2A] mb-2">全タスク</h4>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {laborGrid.tasks.filter(t => t.category !== 'break_time').map((task) => (
                              <div
                                key={task.id}
                                className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleTaskAssign(task.id)}
                              >
                                <div className="text-sm">{task.name}</div>
                                <div className="text-xs text-[#778DA9]">
                                  適合: {employee ? (calculateTaskScore(employee, task) * 50).toFixed(0) : 0}%
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => setSelectedCell(null)}
                            className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                          >
                            キャンセル
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 効率性統計 */}
                <div className="bg-white rounded-lg shadow-md p-4 border border-[#778DA9]">
                  <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">配置統計</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#778DA9]">配置済み</span>
                      <span className="font-medium">{laborGrid.assignments.length}件</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#778DA9]">平均効率</span>
                      <span className="font-medium">
                        {laborGrid.assignments.length > 0 
                          ? (laborGrid.assignments.reduce((sum, a) => sum + a.efficiency, 0) / laborGrid.assignments.length * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#778DA9]">最適配置</span>
                      <span className="font-medium text-green-600">
                        {laborGrid.assignments.filter(a => a.isOptimal).length}件
                      </span>
                    </div>
                  </div>
                </div>

                {/* 凡例 */}
                <div className="bg-white rounded-lg shadow-md p-4 border border-[#778DA9]">
                  <h3 className="text-sm font-bold text-[#0D1B2A] mb-3">効率性凡例</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#F4ACB7] rounded"></div>
                      <span>優秀 (90%+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#FFCAD4] rounded"></div>
                      <span>良好 (80-89%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#FFE5D9] rounded"></div>
                      <span>普通 (70-79%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#9D8189] rounded"></div>
                      <span>低い (60-69%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#D8E2DC] rounded"></div>
                      <span>要改善 (60%未満)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-8 flex justify-center space-x-4">
          <button className="bg-[#FFCAD4] text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-[#F4ACB7] hover:text-white transition-colors duration-200">
            配置を保存
          </button>
          <button className="bg-[#F4ACB7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9D8189] transition-colors duration-200">
            自動最適化
          </button>
        </div>
      </div>
    </div>
  );
}