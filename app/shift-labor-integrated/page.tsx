'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import EmployeeManager, { Employee as MasterEmployee } from '@/lib/employees';

// 統合システム用の従業員型（マスタから継承）
interface Employee extends MasterEmployee {}

interface ShiftAssignment {
  employeeId: string;
  date: string;
  shift: 'early' | 'middle' | 'late' | 'custom' | 'off';
  customStart?: string;
  customEnd?: string;
}

interface LaborTask {
  id: string;
  name: string;
  requiredSkills: Array<{skill: keyof Employee['skills'], level: number}>;
  priority: 'high' | 'medium' | 'low';
}

interface LaborAssignment {
  employeeId: string;
  timeSlot: string; // HH:MM format
  taskId: string;
  efficiency: number; // 0-1
}

export default function ShiftLaborIntegratedPage() {
  const [activeTab, setActiveTab] = useState<'shift' | 'labor' | 'employees'>('shift');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
  const [laborTasks, setLaborTasks] = useState<LaborTask[]>([]);
  const [laborAssignments, setLaborAssignments] = useState<LaborAssignment[]>([]);
  const [editingShift, setEditingShift] = useState<{employeeId: string, date: string} | null>(null);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [editingTask, setEditingTask] = useState<LaborTask | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    requiredSkills: [] as Array<{skill: keyof Employee['skills'], level: number}>,
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  const [editingLabor, setEditingLabor] = useState<{employeeId: string, timeSlot: string} | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    level: 1 as 1 | 2 | 3 | 4 | 5,
    skills: {
      press_operation: 1,
      welding: 1,
      quality_inspection: 1,
      assembly: 1,
      equipment_maintenance: 1,
      material_handling: 1
    },
    department: '第一工場'
  });

  // シフトパターン定義 - 新カラーパレット適用
  const shiftPatterns = {
    early: { name: '早番', start: '09:00', end: '17:00', color: 'bg-[#F4ACB7] text-white' }, // Cherry blossom pink
    middle: { name: '中番', start: '11:00', end: '19:00', color: 'bg-[#FFCAD4] text-gray-800' }, // Pink
    late: { name: '遅番', start: '13:00', end: '21:00', color: 'bg-[#FFE5D9] text-gray-800' }, // Champagne pink
    custom: { name: '変則', start: '??:??', end: '??:??', color: 'bg-[#9D8189] text-white' }, // Mountbatten pink
    off: { name: '休み', start: '--', end: '--', color: 'bg-[#D8E2DC] text-gray-700' } // Platinum
  };

  useEffect(() => {
    console.log('Initializing data...');
    initializeData();
  }, []);

  // デバッグ用: データの状態を監視
  useEffect(() => {
    console.log('Employees updated:', employees);
    console.log('Shift assignments updated:', shiftAssignments);
  }, [employees, shiftAssignments]);

  // selectedDateが変更された時にデバッグ情報を出力
  useEffect(() => {
    if (activeTab === 'labor') {
      console.log('Labor tab: selectedDate changed to:', selectedDate);
      console.log('Current shift assignments for date:', shiftAssignments.filter(a => a.date === selectedDate));
      
      // 特に変則シフトをチェック
      const customShiftsForDate = shiftAssignments.filter(a => a.date === selectedDate && a.shift === 'custom');
      console.log('Custom shifts for date:', customShiftsForDate);
    }
  }, [selectedDate, activeTab, shiftAssignments]);

  const initializeData = () => {
    // 共通従業員マスタから初期化
    const initialEmployees: Employee[] = EmployeeManager.getAllEmployees();

    // 作業タスク定義
    const initialTasks: LaborTask[] = [
      { id: 'task_press', name: 'プレス作業', requiredSkills: [{skill: 'press_operation', level: 3}], priority: 'high' },
      { id: 'task_welding', name: '溶接作業', requiredSkills: [{skill: 'welding', level: 3}], priority: 'high' },
      { id: 'task_quality', name: '品質検査', requiredSkills: [{skill: 'quality_inspection', level: 3}], priority: 'high' },
      { id: 'task_assembly', name: '組立作業', requiredSkills: [{skill: 'assembly', level: 2}], priority: 'medium' },
      { id: 'task_maintenance', name: '設備点検', requiredSkills: [{skill: 'equipment_maintenance', level: 3}], priority: 'medium' },
      { id: 'task_material', name: '運搬作業', requiredSkills: [{skill: 'material_handling', level: 2}], priority: 'low' },
      { id: 'task_break', name: '休憩', requiredSkills: [], priority: 'low' },
      { id: 'task_prep', name: '作業準備', requiredSkills: [{skill: 'equipment_maintenance', level: 2}], priority: 'medium' }
    ];

    setEmployees(initialEmployees);
    setLaborTasks(initialTasks);
    generateInitialShifts(initialEmployees);
  };

  const generateInitialShifts = (employees: Employee[]) => {
    console.log('Generating shifts for employees:', employees);
    const assignments: ShiftAssignment[] = [];
    const startDate = new Date();
    console.log('Start date for shift generation:', startDate.toISOString().split('T')[0]);
    
    // 2週間分のシフトを生成
    for (let day = 0; day < 14; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      employees.forEach((employee, empIndex) => {
        // 簡易的なシフトパターン生成
        const dayOfWeek = currentDate.getDay();
        let shift: 'early' | 'middle' | 'late' | 'off' | 'custom' = 'early';

        if (dayOfWeek === 0 || dayOfWeek === 6) { // 土日
          shift = empIndex % 3 === 0 ? 'off' : empIndex % 3 === 1 ? 'middle' : 'late';
        } else { // 平日
          shift = ['early', 'middle', 'late'][empIndex % 3] as 'early' | 'middle' | 'late';
        }

        const assignment = {
          employeeId: employee.id,
          date: dateStr,
          shift
        };

        // テスト用：白水さんを一部の日で変則シフトに設定
        if (employee.id === 'hakusui' && (day % 5 === 2 || day === 0)) { // day 0は今日、5日毎の3日目も
          (assignment as any).shift = 'custom';
          (assignment as any).customStart = '10:30';
          (assignment as any).customEnd = '18:30';
          console.log(`Setting custom shift for ${employee.name} on day ${day} (${dateStr}):`, assignment);
        }
        
        // すべての白水さんのシフトをログ出力
        if (employee.id === 'hakusui') {
          console.log(`Hakusui shift day ${day}:`, assignment);
        }

        assignments.push(assignment);
        console.log('Created assignment:', assignment);
      });
    }

    console.log('Total assignments created:', assignments.length);
    console.log('All assignments:', assignments);
    
    // 変則シフトの確認
    const customShifts = assignments.filter(a => a.shift === 'custom');
    console.log('Custom shifts found:', customShifts);
    
    setShiftAssignments(assignments);
  };

  const generateTwoWeekShifts = () => {
    generateInitialShifts(employees);
  };

  const handleShiftChange = (employeeId: string, date: string, newShift: ShiftAssignment['shift'], customStart?: string, customEnd?: string) => {
    console.log('Changing shift:', { employeeId, date, newShift, customStart, customEnd });
    
    setShiftAssignments(prev => {
      const existingIndex = prev.findIndex(a => a.employeeId === employeeId && a.date === date);
      
      let updatedAssignments;
      if (existingIndex >= 0) {
        // 既存の割り当てを更新
        updatedAssignments = [...prev];
        updatedAssignments[existingIndex] = { 
          ...updatedAssignments[existingIndex], 
          shift: newShift, 
          customStart, 
          customEnd 
        };
        console.log('Updated existing assignment:', updatedAssignments[existingIndex]);
      } else {
        // 新しい割り当てを追加
        const newAssignment = {
          employeeId,
          date,
          shift: newShift,
          customStart,
          customEnd
        };
        console.log('Created new assignment:', newAssignment);
        updatedAssignments = [...prev, newAssignment];
      }
      
      // デバッグ: 更新後の全配置を確認
      console.log('All assignments after update:', updatedAssignments);
      console.log('Assignments for date:', date, updatedAssignments.filter(a => a.date === date));
      
      return updatedAssignments;
    });
    
    // レイバータブを強制的に再レンダリング
    if (activeTab === 'labor') {
      console.log('Force refreshing labor grid due to shift change');
      // レイバータブが更新されるように小さな状態変更をトリガー
      setActiveTab('labor'); 
    }
    
    setEditingShift(null);
  };

  const optimizeLabor = () => {
    const date = selectedDate;
    const newAssignments: LaborAssignment[] = [];
    const breakTaskId = laborTasks.find(t => t.name === '休憩')?.id;

    console.log('Starting labor optimization for date:', date);
    console.log('Break task ID:', breakTaskId);

    // Step 1: 休憩時間を先に配置
    if (breakTaskId) {
      employees.forEach(employee => {
        const shiftInfo = getShiftForDate(employee.id, selectedDate);
        console.log(`Processing breaks for ${employee.name}, shift:`, shiftInfo);
        
        if (!shiftInfo || shiftInfo.shift === 'off') return;

        let breakTimes: string[] = [];
        if (shiftInfo.shift === 'early') {
          breakTimes = ['10:00', '10:30', '14:00']; // 早番: 10:00-11:00 + 14:00
        } else if (shiftInfo.shift === 'middle') {
          breakTimes = ['12:00', '12:30', '15:30']; // 中番: 12:00-13:00 + 15:30
        } else if (shiftInfo.shift === 'late') {
          breakTimes = ['14:00', '14:30', '17:30']; // 遅番: 14:00-15:00 + 17:30
        } else if (shiftInfo.shift === 'custom' && shiftInfo.customStart && shiftInfo.customEnd) {
          const [startH, startM] = shiftInfo.customStart.split(':').map(Number);
          const [endH, endM] = shiftInfo.customEnd.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const midMinutes = (startMinutes + endMinutes) / 2;
          const midHour = Math.floor(midMinutes / 60);
          const midMin = midMinutes % 60 >= 30 ? 30 : 0;
          breakTimes = [
            `${midHour.toString().padStart(2, '0')}:${midMin.toString().padStart(2, '0')}`,
            `${midHour.toString().padStart(2, '0')}:${(midMin + 30).toString().padStart(2, '0')}`
          ];
        }

        console.log(`Break times for ${employee.name}:`, breakTimes);

        breakTimes.forEach(timeSlot => {
          newAssignments.push({
            employeeId: employee.id,
            timeSlot,
            taskId: breakTaskId,
            efficiency: 1.0
          });
        });
      });
    }

    // Step 2: 作業タスクを配置（休憩時間以外）
    const workTasks = laborTasks.filter(t => t.name !== '休憩');
    
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // この時間に勤務中で、まだ配置されていない従業員を取得
        const availableEmployees = getWorkingEmployees(date, timeSlot).filter(employee => {
          const hasAssignment = newAssignments.some(a => 
            a.employeeId === employee.id && a.timeSlot === timeSlot
          );
          return !hasAssignment;
        });
        
        // 優先度の高いタスクから配置
        const prioritizedTasks = [...workTasks].sort((a, b) => {
          const priority = { high: 3, medium: 2, low: 1 };
          return priority[b.priority] - priority[a.priority];
        });

        prioritizedTasks.forEach(task => {
          const bestEmployee = findBestEmployeeForTask(availableEmployees, task);
          if (bestEmployee) {
            const efficiency = calculateEfficiency(bestEmployee, task);
            newAssignments.push({
              employeeId: bestEmployee.id,
              timeSlot,
              taskId: task.id,
              efficiency
            });
            
            // この従業員をこの時間の候補から除外
            const index = availableEmployees.findIndex(e => e.id === bestEmployee.id);
            if (index > -1) availableEmployees.splice(index, 1);
          }
        });
      }
    }

    console.log('Final optimized assignments:', newAssignments);
    setLaborAssignments(newAssignments);
  };

  const getWorkingEmployees = (date: string, timeSlot: string): Employee[] => {
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotMinutes = hour * 60 + minute;

    // 最新のshiftAssignmentsを使用してフィルタリング
    const workingEmployees = employees.filter(employee => {
      const assignment = shiftAssignments.find(a => a.employeeId === employee.id && a.date === date);
      
      if (!assignment || assignment.shift === 'off') return false;

      const pattern = shiftPatterns[assignment.shift];
      if (assignment.shift === 'custom') {
        if (!assignment.customStart || !assignment.customEnd) {
          return false;
        }
        const [startH, startM] = assignment.customStart.split(':').map(Number);
        const [endH, endM] = assignment.customEnd.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const isWorking = slotMinutes >= startMinutes && slotMinutes < endMinutes;
        
        // 変則シフトの場合の詳細ログ
        if (isWorking) {
          console.log(`✓ ${employee.name} is working at ${timeSlot} (custom: ${assignment.customStart}-${assignment.customEnd})`);
        }
        
        return isWorking;
      } else {
        const [startH, startM] = pattern.start.split(':').map(Number);
        const [endH, endM] = pattern.end.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
      }
    });

    return workingEmployees;
  };

  const findBestEmployeeForTask = (employees: Employee[], task: LaborTask): Employee | null => {
    if (employees.length === 0) return null;

    let bestEmployee = null;
    let bestScore = -1;

    employees.forEach(employee => {
      const score = calculateEfficiency(employee, task);
      if (score > bestScore) {
        bestScore = score;
        bestEmployee = employee;
      }
    });

    return bestEmployee;
  };

  const calculateEfficiency = (employee: Employee, task: LaborTask): number => {
    let totalScore = 0;
    let maxPossible = 0;

    task.requiredSkills.forEach(req => {
      const employeeSkillLevel = employee.skills[req.skill] || 0;
      const skillRatio = Math.min(employeeSkillLevel / req.level, 2.0); // 必要レベルの2倍まで
      totalScore += skillRatio;
      maxPossible += 2.0;
    });

    // スキル要件がない場合は基本効率
    if (task.requiredSkills.length === 0) return 0.5;

    return maxPossible > 0 ? totalScore / maxPossible : 0;
  };

  const getShiftForDate = (employeeId: string, date: string): ShiftAssignment | null => {
    return shiftAssignments.find(a => a.employeeId === employeeId && a.date === date) || null;
  };

  const getLaborForTimeSlot = (employeeId: string, timeSlot: string): LaborAssignment | null => {
    return laborAssignments.find(a => a.employeeId === employeeId && a.timeSlot === timeSlot) || null;
  };

  const getTaskById = (taskId: string): LaborTask | null => {
    return laborTasks.find(t => t.id === taskId) || null;
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 0.8) return 'bg-[#D8E2DC] text-gray-800'; // 最適 - Platinum
    if (efficiency >= 0.6) return 'bg-[#FFE5D9] text-gray-800'; // 良好 - Champagne pink
    if (efficiency >= 0.4) return 'bg-[#FFCAD4] text-gray-800'; // 普通 - Pink
    if (efficiency >= 0.2) return 'bg-[#F4ACB7] text-white'; // 低い - Cherry blossom pink
    return 'bg-[#9D8189] text-white'; // 要改善 - Mountbatten pink
  };

  const getNext14Days = (): string[] => {
    const dates = [];
    const startDate = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getDayOfWeek = (date: string): string => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[new Date(date).getDay()];
  };

  const formatDate = (date: string): string => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 6:00-24:00の30分刻みタイムスロット生成
  const getTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const addNewTask = () => {
    if (!newTask.name.trim()) return;
    
    const task: LaborTask = {
      id: `task_${Date.now()}`,
      name: newTask.name,
      requiredSkills: newTask.requiredSkills,
      priority: newTask.priority
    };
    
    setLaborTasks(prev => [...prev, task]);
    setNewTask({ name: '', requiredSkills: [], priority: 'medium' });
    setShowTaskManager(false);
  };

  const editTask = (taskId: string) => {
    const task = laborTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setNewTask({
        name: task.name,
        requiredSkills: task.requiredSkills,
        priority: task.priority
      });
    }
  };

  const updateTask = () => {
    if (!editingTask || !newTask.name.trim()) return;
    
    setLaborTasks(prev => 
      prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, name: newTask.name, requiredSkills: newTask.requiredSkills, priority: newTask.priority }
          : task
      )
    );
    
    setEditingTask(null);
    setNewTask({ name: '', requiredSkills: [], priority: 'medium' });
    setShowTaskManager(false);
  };

  const deleteTask = (taskId: string) => {
    setLaborTasks(prev => prev.filter(task => task.id !== taskId));
    setLaborAssignments(prev => prev.filter(assignment => assignment.taskId !== taskId));
  };

  const addSkillRequirement = () => {
    setNewTask(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, { skill: 'press_operation', level: 1 }]
    }));
  };

  const updateSkillRequirement = (index: number, skill: keyof Employee['skills'], level: number) => {
    setNewTask(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.map((req, idx) => 
        idx === index ? { skill, level } : req
      )
    }));
  };

  const removeSkillRequirement = (index: number) => {
    setNewTask(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, idx) => idx !== index)
    }));
  };

  const handleLaborCellClick = (employeeId: string, timeSlot: string) => {
    setEditingLabor({employeeId, timeSlot});
  };

  const assignLaborTask = (employeeId: string, timeSlot: string, taskId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    const task = laborTasks.find(t => t.id === taskId);
    
    if (!employee || !task) return;
    
    const efficiency = calculateEfficiency(employee, task);
    
    setLaborAssignments(prev => {
      const filtered = prev.filter(a => !(a.employeeId === employeeId && a.timeSlot === timeSlot));
      return [...filtered, {
        employeeId,
        timeSlot,
        taskId,
        efficiency
      }];
    });
    
    setEditingLabor(null);
  };

  const removeLaborAssignment = (employeeId: string, timeSlot: string) => {
    setLaborAssignments(prev => 
      prev.filter(a => !(a.employeeId === employeeId && a.timeSlot === timeSlot))
    );
    setEditingLabor(null);
  };

  const autoAssignBreaks = () => {
    const breakTaskId = laborTasks.find(t => t.name === '休憩')?.id;
    console.log('Auto assigning breaks, break task ID:', breakTaskId);
    console.log('Current employees:', employees);
    console.log('Current shift assignments:', shiftAssignments);
    
    if (!breakTaskId) {
      console.error('No break task found!');
      return;
    }

    const newBreakAssignments: LaborAssignment[] = [];
    
    employees.forEach(employee => {
      const shiftInfo = getShiftForDate(employee.id, selectedDate);
      console.log(`Processing ${employee.name} (ID: ${employee.id}), shift info:`, shiftInfo);
      
      if (!shiftInfo || shiftInfo.shift === 'off') {
        console.log(`Skipping ${employee.name} - no shift or off duty`);
        return;
      }

      // シフトに応じた休憩時間を設定
      let breakTimes: string[] = [];
      if (shiftInfo.shift === 'early') {
        breakTimes = ['10:00', '10:30', '14:00']; // 早番の休憩
      } else if (shiftInfo.shift === 'middle') {
        breakTimes = ['12:00', '12:30', '15:30']; // 中番の休憩
      } else if (shiftInfo.shift === 'late') {
        breakTimes = ['14:00', '14:30', '17:30']; // 遅番の休憩
      } else if (shiftInfo.shift === 'custom' && shiftInfo.customStart && shiftInfo.customEnd) {
        // カスタムシフトの場合は中間時間に休憩を配置
        const [startH, startM] = shiftInfo.customStart.split(':').map(Number);
        const [endH, endM] = shiftInfo.customEnd.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const midMinutes = (startMinutes + endMinutes) / 2;
        const midHour = Math.floor(midMinutes / 60);
        const midMin = midMinutes % 60 >= 30 ? 30 : 0;
        breakTimes = [
          `${midHour.toString().padStart(2, '0')}:${midMin.toString().padStart(2, '0')}`,
          `${midHour.toString().padStart(2, '0')}:${(midMin + 30).toString().padStart(2, '0')}`
        ];
      }

      console.log(`Break times for ${employee.name}:`, breakTimes);

      breakTimes.forEach(timeSlot => {
        const assignment = {
          employeeId: employee.id,
          timeSlot,
          taskId: breakTaskId,
          efficiency: 1.0
        };
        console.log('Adding break assignment:', assignment);
        newBreakAssignments.push(assignment);
      });
    });

    console.log('All break assignments to add:', newBreakAssignments);

    // 既存の休憩配置を削除して新しいものを追加
    setLaborAssignments(prev => {
      const nonBreakAssignments = prev.filter(a => a.taskId !== breakTaskId);
      console.log('Existing non-break assignments:', nonBreakAssignments);
      const result = [...nonBreakAssignments, ...newBreakAssignments];
      console.log('Final labor assignments after break addition:', result);
      return result;
    });
  };

  const addNewEmployee = () => {
    if (!newEmployee.name.trim()) return;
    
    const employee: Employee = {
      id: `emp_${Date.now()}`,
      name: newEmployee.name,
      level: newEmployee.level,
      skills: newEmployee.skills,
      department: newEmployee.department,
      email: `${newEmployee.name.replace(/\s+/g, '').toLowerCase()}@company.com`,
      position: '作業者'
    };
    
    // 共通マスタに追加
    EmployeeManager.addEmployee(employee);
    
    // ローカル状態も更新
    setEmployees(EmployeeManager.getAllEmployees());
    generateInitialShifts(EmployeeManager.getAllEmployees());
    
    setNewEmployee({
      name: '',
      level: 1,
      skills: {
        press_operation: 1,
        welding: 1,
        quality_inspection: 1,
        assembly: 1,
        equipment_maintenance: 1,
        material_handling: 1
      },
      department: '第一工場'
    });
    setEditingEmployee(null);
  };

  const editEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      name: employee.name,
      level: employee.level,
      skills: employee.skills,
      department: employee.department
    });
  };

  const updateEmployee = () => {
    if (!editingEmployee || !newEmployee.name.trim()) return;
    
    // 共通マスタを更新
    EmployeeManager.updateEmployee(editingEmployee.id, {
      name: newEmployee.name,
      level: newEmployee.level,
      skills: newEmployee.skills,
      department: newEmployee.department
    });
    
    // ローカル状態を更新
    setEmployees(EmployeeManager.getAllEmployees());
    
    setEditingEmployee(null);
    setNewEmployee({
      name: '',
      level: 1,
      skills: {
        press_operation: 1,
        welding: 1,
        quality_inspection: 1,
        assembly: 1,
        equipment_maintenance: 1,
        material_handling: 1
      },
      department: '第一工場'
    });
  };

  const deleteEmployee = (employeeId: string) => {
    if (confirm('この従業員を削除しますか？関連するシフトと作業配置も削除されます。')) {
      // 共通マスタから削除
      EmployeeManager.deleteEmployee(employeeId);
      
      // ローカル状態を更新
      setEmployees(EmployeeManager.getAllEmployees());
      setShiftAssignments(prev => prev.filter(shift => shift.employeeId !== employeeId));
      setLaborAssignments(prev => prev.filter(labor => labor.employeeId !== employeeId));
    }
  };

  return (
    <div className="min-h-screen bg-[#E0E1DD]">
      <div className="max-w-full mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">シフト・レイバー統合管理システム</h1>
          <p className="text-[#778DA9]">製造業向けシフト管理と30分刻み作業配置の統合システム</p>
        </div>

        {/* タブ切り替え */}
        <div className="bg-white rounded-lg shadow-md mb-8 border border-[#778DA9]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('shift')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'shift' 
                  ? 'bg-[#415A77] text-white' 
                  : 'bg-white text-[#415A77] hover:bg-gray-50'
              } rounded-l-lg`}
            >
              📅 シフト管理
            </button>
            <button
              onClick={() => setActiveTab('labor')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'labor' 
                  ? 'bg-[#415A77] text-white' 
                  : 'bg-white text-[#415A77] hover:bg-gray-50'
              }`}
            >
              📋 レイバー管理
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors duration-200 ${
                activeTab === 'employees' 
                  ? 'bg-[#415A77] text-white' 
                  : 'bg-white text-[#415A77] hover:bg-gray-50'
              } rounded-r-lg`}
            >
              👥 従業員管理
            </button>
          </div>
        </div>

        {/* 操作パネル */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {activeTab === 'shift' && (
                <>
                  <button
                    onClick={generateTwoWeekShifts}
                    className="bg-[#F4A261] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200"
                  >
                    🔄 2週間シフト自動生成
                  </button>
                  <button
                    onClick={() => {
                      console.log('Test button clicked');
                      setEditingShift({employeeId: 'hakusui', date: getNext14Days()[0]});
                      console.log('Set editingShift to test value');
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                  >
                    テストモーダル
                  </button>
                </>
              )}

              {activeTab === 'labor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#0D1B2A] mb-2">対象日付</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                    />
                  </div>
                  <button
                    onClick={() => setShowTaskManager(true)}
                    className="bg-[#778DA9] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#5A6B7A] transition-colors duration-200"
                  >
                    ⚙️ 作業管理
                  </button>
                  <button
                    onClick={autoAssignBreaks}
                    className="bg-[#415A77] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2E4057] transition-colors duration-200"
                  >
                    ☕ 休憩自動配置
                  </button>
                  <button
                    onClick={optimizeLabor}
                    className="bg-[#F4A261] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200"
                  >
                    🤖 最適化
                  </button>
                </>
              )}

              {activeTab === 'employees' && (
                <button
                  onClick={() => setEditingEmployee({} as Employee)}
                  className="bg-[#F4A261] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200"
                >
                  ➕ 新規従業員追加
                </button>
              )}
            </div>

            <div className="text-sm text-[#778DA9]">
              {activeTab === 'shift' ? '2週間分のシフト表示' : `${selectedDate} のレイバー配置 (変則シフト確認用)`}
              {activeTab === 'labor' && (
                <div className="text-xs text-blue-600 mt-1">
                  Debug: Current selectedDate = {selectedDate}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* シフト管理表示 */}
        {activeTab === 'shift' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">2週間シフト表</h2>
            
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* ヘッダー */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  <div className="text-sm font-medium text-[#0D1B2A] p-3 bg-gray-100 rounded">従業員名</div>
                  {getNext14Days().slice(0, 7).map((date, index) => (
                    <div key={date} className="text-sm font-medium text-[#0D1B2A] p-3 bg-gray-100 rounded text-center">
                      <div>{formatDate(date)} ({getDayOfWeek(date)})</div>
                    </div>
                  ))}
                </div>

                {/* 1週目 */}
                {employees.map((employee) => (
                  <div key={`week1_${employee.id}`} className="grid grid-cols-8 gap-1 mb-1">
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="font-semibold text-[#0D1B2A]">{employee.name}</div>
                      <div className="text-xs text-[#778DA9]">Lv.{employee.level}</div>
                    </div>
                    
                    {getNext14Days().slice(0, 7).map((date) => {
                      const assignment = getShiftForDate(employee.id, date);
                      const pattern = assignment ? shiftPatterns[assignment.shift] : null;
                      
                      return (
                        <div
                          key={`${employee.id}_${date}`}
                          className={`p-2 rounded cursor-pointer border transition-all duration-200 hover:shadow-md ${
                            pattern ? `${pattern.color} text-white hover:opacity-80` : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicked shift cell:', employee.id, date);
                            console.log('Current editingShift state:', editingShift);
                            setEditingShift({employeeId: employee.id, date});
                            console.log('Setting editingShift to:', {employeeId: employee.id, date});
                          }}
                        >
                          <div className="text-sm font-medium text-center">
                            {pattern?.name || '-'}
                          </div>
                          <div className="text-xs text-center opacity-80">
                            {assignment?.shift === 'custom' 
                              ? `${assignment.customStart}-${assignment.customEnd}`
                              : pattern?.start && pattern?.end 
                                ? `${pattern.start}-${pattern.end}`
                                : ''
                            }
                          </div>
                          {/* レイバー表示ボタン */}
                          {assignment?.shift !== 'off' && (
                            <div 
                              className="text-center mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(date);
                                setActiveTab('labor');
                              }}
                            >
                              <span className="text-xs bg-white bg-opacity-20 px-1 rounded hover:bg-opacity-40">
                                📋
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* 2週目ヘッダー */}
                <div className="grid grid-cols-8 gap-1 mb-2 mt-6">
                  <div className="text-sm font-medium text-[#0D1B2A] p-3 bg-gray-100 rounded">2週目</div>
                  {getNext14Days().slice(7, 14).map((date, index) => (
                    <div key={date} className="text-sm font-medium text-[#0D1B2A] p-3 bg-gray-100 rounded text-center">
                      <div>{formatDate(date)} ({getDayOfWeek(date)})</div>
                    </div>
                  ))}
                </div>

                {/* 2週目 */}
                {employees.map((employee) => (
                  <div key={`week2_${employee.id}`} className="grid grid-cols-8 gap-1 mb-1">
                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="font-semibold text-[#0D1B2A]">{employee.name}</div>
                      <div className="text-xs text-[#778DA9]">Lv.{employee.level}</div>
                    </div>
                    
                    {getNext14Days().slice(7, 14).map((date) => {
                      const assignment = getShiftForDate(employee.id, date);
                      const pattern = assignment ? shiftPatterns[assignment.shift] : null;
                      
                      return (
                        <div
                          key={`${employee.id}_${date}`}
                          className={`p-2 rounded cursor-pointer border transition-all duration-200 hover:shadow-md ${
                            pattern ? `${pattern.color} text-white hover:opacity-80` : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicked shift cell:', employee.id, date);
                            console.log('Current editingShift state:', editingShift);
                            setEditingShift({employeeId: employee.id, date});
                            console.log('Setting editingShift to:', {employeeId: employee.id, date});
                          }}
                        >
                          <div className="text-sm font-medium text-center">
                            {pattern?.name || '-'}
                          </div>
                          <div className="text-xs text-center opacity-80">
                            {assignment?.shift === 'custom' 
                              ? `${assignment.customStart}-${assignment.customEnd}`
                              : pattern?.start && pattern?.end 
                                ? `${pattern.start}-${pattern.end}`
                                : ''
                            }
                          </div>
                          {/* レイバー表示ボタン */}
                          {assignment?.shift !== 'off' && (
                            <div 
                              className="text-center mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(date);
                                setActiveTab('labor');
                              }}
                            >
                              <span className="text-xs bg-white bg-opacity-20 px-1 rounded hover:bg-opacity-40">
                                📋
                              </span>
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
        )}

        {/* レイバー管理表示 */}
        {activeTab === 'labor' && (
          <div key={`labor-${selectedDate}-${shiftAssignments.length}`} className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">
              レイバー配置グリッド - {selectedDate}
            </h2>
            
            <div className="overflow-x-auto">
              <div className="min-w-[2000px]">
                {/* ヘッダー（時間軸） */}
                <div className="grid gap-1 mb-2" style={{
                  gridTemplateColumns: `200px repeat(${getTimeSlots().length}, 45px)`
                }}>
                  <div className="text-sm font-medium text-[#0D1B2A] p-2 bg-gray-100 rounded">従業員</div>
                  {getTimeSlots().map((timeSlot) => (
                    <div key={timeSlot} className="text-xs text-[#0D1B2A] p-1 text-center">
                      <div className="transform -rotate-45 origin-center whitespace-nowrap">
                        {timeSlot}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 従業員行 */}
                {employees.map((employee) => {
                  const shiftInfo = getShiftForDate(employee.id, selectedDate);
                  console.log(`Employee ${employee.name} shift info for ${selectedDate}:`, shiftInfo);
                  
                  return (
                    <div key={employee.id} className="grid gap-1 mb-1" style={{
                      gridTemplateColumns: `200px repeat(${getTimeSlots().length}, 45px)`
                    }}>
                      {/* 従業員情報 */}
                      <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="font-semibold text-[#0D1B2A] mb-1">{employee.name}</div>
                        <div className="text-xs text-[#778DA9] mb-2">レベル: {employee.level}</div>
                        {shiftInfo && shiftInfo.shift !== 'off' && (
                          <div className="text-xs text-blue-600 mb-2">
                            {shiftPatterns[shiftInfo.shift].name}: {
                              shiftInfo.shift === 'custom' 
                                ? `${shiftInfo.customStart}-${shiftInfo.customEnd}`
                                : `${shiftPatterns[shiftInfo.shift].start}-${shiftPatterns[shiftInfo.shift].end}`
                            }
                          </div>
                        )}
                        <div className="text-xs">
                          <div>プレス:{employee.skills.press_operation} 溶接:{employee.skills.welding}</div>
                          <div>品質:{employee.skills.quality_inspection} 組立:{employee.skills.assembly}</div>
                        </div>
                      </div>

                      {/* タイムスロット */}
                      {getTimeSlots().map((timeSlot) => {
                        const workingEmployees = getWorkingEmployees(selectedDate, timeSlot);
                        const isWorking = workingEmployees.some(e => e.id === employee.id);
                        const labor = getLaborForTimeSlot(employee.id, timeSlot);
                        
                        // デバッグ: 変則シフトの従業員の状況を詳しく確認
                        if (employee.name === '白水貴太' && timeSlot === '15:00') {
                          console.log(`Debug ${employee.name} at ${timeSlot}:`, {
                            shiftInfo,
                            workingEmployees: workingEmployees.map(e => e.name),
                            isWorking,
                            allAssignments: shiftAssignments.filter(a => a.employeeId === employee.id && a.date === selectedDate)
                          });
                        }
                        const task = labor ? getTaskById(labor.taskId) : null;

                        return (
                          <div
                            key={`${employee.id}_${timeSlot}`}
                            onClick={() => {
                              if (isWorking) {
                                console.log('Clicked labor cell:', employee.id, timeSlot);
                                handleLaborCellClick(employee.id, timeSlot);
                              }
                            }}
                            className={`min-h-[60px] border cursor-pointer transition-all duration-200 ${
                              editingLabor?.employeeId === employee.id && editingLabor?.timeSlot === timeSlot 
                                ? 'border-[#F4A261] border-2 shadow-lg' :
                              !isWorking ? 'bg-gray-100 border-gray-200 cursor-default' :
                              labor && task ? 
                                `${getEfficiencyColor(labor.efficiency)} text-white border-gray-300 hover:opacity-80` :
                                'bg-white border-gray-200 hover:border-[#415A77]'
                            }`}
                          >
                            {/* シフト外 */}
                            {!isWorking && (
                              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                                -
                              </div>
                            )}

                            {/* 作業配置表示 */}
                            {labor && task && isWorking && (
                              <div className="h-full p-1 flex flex-col justify-center items-center">
                                <div className="text-[9px] font-medium leading-tight text-center mb-0.5">
                                  {task.name.length > 4 ? task.name.substring(0, 4) : task.name}
                                </div>
                                <div className="text-[8px] opacity-90">
                                  {(labor.efficiency * 100).toFixed(0)}%
                                </div>
                              </div>
                            )}

                            {/* 空のセル */}
                            {!labor && isWorking && (
                              <div className="h-full flex items-center justify-center text-gray-300 hover:text-gray-500">
                                <span className="text-xs">+</span>
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

            {/* 効率性凡例 */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#D8E2DC] border border-gray-300 rounded"></div>
                <span>最適 (80%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#FFE5D9] border border-gray-300 rounded"></div>
                <span>良好 (60-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#FFCAD4] border border-gray-300 rounded"></div>
                <span>普通 (40-59%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#F4ACB7] rounded"></div>
                <span>低い (20-39%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#9D8189] rounded"></div>
                <span>要改善 (20%未満)</span>
              </div>
            </div>
          </div>
        )}

        {/* 従業員管理表示 */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">従業員管理</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-[#0D1B2A]">{employee.name}</h3>
                      <p className="text-sm text-[#778DA9]">{employee.department}</p>
                      <p className="text-sm text-[#415A77]">レベル: {employee.level}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => editEmployee(employee)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[#0D1B2A]">スキルレベル</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>プレス: {employee.skills.press_operation}</div>
                      <div>溶接: {employee.skills.welding}</div>
                      <div>品質: {employee.skills.quality_inspection}</div>
                      <div>組立: {employee.skills.assembly}</div>
                      <div>保全: {employee.skills.equipment_maintenance}</div>
                      <div>運搬: {employee.skills.material_handling}</div>
                    </div>
                  </div>
                  
                  {/* スキル総合評価 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#778DA9]">平均スキル:</span>
                      <span className="font-medium">
                        {((employee.skills.press_operation + employee.skills.welding + employee.skills.quality_inspection + 
                          employee.skills.assembly + employee.skills.equipment_maintenance + employee.skills.material_handling) / 6).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {employees.length === 0 && (
              <div className="text-center py-12 text-[#778DA9]">
                <p className="text-lg mb-2">従業員が登録されていません</p>
                <p className="text-sm">「新規従業員追加」ボタンから従業員を追加してください</p>
              </div>
            )}
          </div>
        )}

        {/* デバッグ情報 */}
        {editingShift && (
          <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-40">
            Debug: Modal should be open for {employees.find(e => e.id === editingShift.employeeId)?.name}
          </div>
        )}

        {/* シフト編集モーダル */}
        {editingShift && typeof window !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingShift(null);
              }
            }}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">
                シフト変更 - {employees.find(e => e.id === editingShift.employeeId)?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0D1B2A] mb-2">
                    {formatDate(editingShift.date)} ({getDayOfWeek(editingShift.date)})
                  </label>
                  
                  <div className="space-y-2">
                    {Object.entries(shiftPatterns).map(([key, pattern]) => (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Shift button clicked:', key);
                          
                          if (key === 'custom') {
                            // カスタム時間は別途処理
                            const start = prompt('開始時間を入力してください (HH:MM):', '09:00');
                            const end = prompt('終了時間を入力してください (HH:MM):', '18:00');
                            if (start && end) {
                              handleShiftChange(editingShift.employeeId, editingShift.date, 'custom', start, end);
                            }
                          } else {
                            handleShiftChange(editingShift.employeeId, editingShift.date, key as ShiftAssignment['shift']);
                          }
                        }}
                        className={`w-full p-3 rounded text-white font-medium transition-colors duration-200 ${pattern.color} hover:opacity-80 hover:shadow-md`}
                      >
                        {pattern.name} ({pattern.start} - {pattern.end})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingShift(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* 作業タスク管理モーダル */}
        {showTaskManager && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">
                {editingTask ? 'タスク編集' : 'タスク管理'}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 新規タスク作成・編集フォーム */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#0D1B2A]">
                    {editingTask ? 'タスク編集' : '新規タスク作成'}
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0D1B2A] mb-2">タスク名</label>
                    <input
                      type="text"
                      value={newTask.name}
                      onChange={(e) => setNewTask(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                      placeholder="例: プレス作業"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0D1B2A] mb-2">優先度</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({...prev, priority: e.target.value as 'high' | 'medium' | 'low'}))}
                      className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                    >
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-[#0D1B2A]">必要スキル</label>
                      <button
                        onClick={addSkillRequirement}
                        className="bg-[#415A77] text-white px-2 py-1 rounded text-xs hover:bg-[#2E4057]"
                      >
                        + 追加
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {newTask.requiredSkills.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <select
                            value={req.skill}
                            onChange={(e) => updateSkillRequirement(index, e.target.value as keyof Employee['skills'], req.level)}
                            className="flex-1 px-2 py-1 border border-[#778DA9] rounded text-sm"
                          >
                            <option value="press_operation">プレス操作</option>
                            <option value="welding">溶接技術</option>
                            <option value="quality_inspection">品質検査</option>
                            <option value="assembly">組立作業</option>
                            <option value="equipment_maintenance">設備保全</option>
                            <option value="material_handling">運搬作業</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={req.level}
                            onChange={(e) => updateSkillRequirement(index, req.skill, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-[#778DA9] rounded text-sm"
                          />
                          <button
                            onClick={() => removeSkillRequirement(index)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            削除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={editingTask ? updateTask : addNewTask}
                      className="flex-1 bg-[#F4A261] text-white py-2 rounded hover:bg-[#E8956A] transition-colors"
                    >
                      {editingTask ? '更新' : '作成'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setNewTask({ name: '', requiredSkills: [], priority: 'medium' });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      リセット
                    </button>
                  </div>
                </div>
                
                {/* 既存タスク一覧 */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#0D1B2A]">既存タスク一覧</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {laborTasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-[#0D1B2A]">{task.name}</h5>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => editTask(task.id)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-[#778DA9] mb-2">
                          優先度: <span className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                        {task.requiredSkills.length > 0 && (
                          <div className="text-xs text-[#778DA9]">
                            必要スキル: {task.requiredSkills.map(req => `${req.skill}(Lv.${req.level})`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowTaskManager(false);
                    setEditingTask(null);
                    setNewTask({ name: '', requiredSkills: [], priority: 'medium' });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* レイバー編集モーダル */}
        {editingLabor && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">
                作業配置編集
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="font-medium">{employees.find(e => e.id === editingLabor.employeeId)?.name}</div>
                  <div className="text-sm text-[#778DA9]">時間: {editingLabor.timeSlot} - {
                    (() => {
                      const [hour, minute] = editingLabor.timeSlot.split(':').map(Number);
                      const endMinute = minute === 30 ? 0 : 30;
                      const endHour = minute === 30 ? hour + 1 : hour;
                      return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                    })()
                  }</div>
                  {(() => {
                    const currentLabor = getLaborForTimeSlot(editingLabor.employeeId, editingLabor.timeSlot);
                    const currentTask = currentLabor ? getTaskById(currentLabor.taskId) : null;
                    return currentTask && (
                      <div className="text-sm text-blue-600">
                        現在: {currentTask.name} (効率: {(currentLabor!.efficiency * 100).toFixed(0)}%)
                      </div>
                    );
                  })()}
                </div>
                
                <div>
                  <h4 className="font-medium text-[#0D1B2A] mb-2">作業タスクを選択</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {laborTasks.map((task) => {
                      const employee = employees.find(e => e.id === editingLabor.employeeId)!;
                      const efficiency = calculateEfficiency(employee, task);
                      
                      return (
                        <button
                          key={task.id}
                          onClick={() => assignLaborTask(editingLabor.employeeId, editingLabor.timeSlot, task.id)}
                          className={`w-full p-2 text-left rounded border transition-colors duration-200 ${
                            efficiency >= 0.7 ? 'border-[#D8E2DC] bg-[#D8E2DC] hover:bg-[#C5D1CA] text-gray-800' :
                            efficiency >= 0.5 ? 'border-[#FFE5D9] bg-[#FFE5D9] hover:bg-[#FFDBCC] text-gray-800' :
                            'border-[#FFCAD4] bg-[#FFCAD4] hover:bg-[#FFB7C5] text-gray-800'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-sm">{task.name}</div>
                              <div className="text-xs text-[#778DA9]">
                                優先度: {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                              </div>
                            </div>
                            <div className="text-xs font-medium">
                              効率: {(efficiency * 100).toFixed(0)}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {(() => {
                    const currentLabor = getLaborForTimeSlot(editingLabor.employeeId, editingLabor.timeSlot);
                    return currentLabor && (
                      <button
                        onClick={() => removeLaborAssignment(editingLabor.employeeId, editingLabor.timeSlot)}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        配置削除
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => setEditingLabor(null)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* 従業員編集モーダル */}
        {editingEmployee && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">
                {editingEmployee.id ? '従業員編集' : '新規従業員追加'}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0D1B2A] mb-2">氏名</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                      placeholder="例: 田中太郎"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#0D1B2A] mb-2">部門</label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee(prev => ({...prev, department: e.target.value}))}
                      className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                    >
                      <option value="第一工場">第一工場</option>
                      <option value="第二工場">第二工場</option>
                      <option value="第三工場">第三工場</option>
                      <option value="プレス部門">プレス部門</option>
                      <option value="溶接部門">溶接部門</option>
                      <option value="間接部門">間接部門</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#0D1B2A] mb-2">経験レベル (1-5)</label>
                  <select
                    value={newEmployee.level}
                    onChange={(e) => setNewEmployee(prev => ({...prev, level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5}))}
                    className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                  >
                    <option value={1}>1 - 新人</option>
                    <option value={2}>2 - 初級</option>
                    <option value={3}>3 - 中級</option>
                    <option value={4}>4 - 上級</option>
                    <option value={5}>5 - エキスパート</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#0D1B2A] mb-2">スキルレベル設定</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'press_operation', label: 'プレス操作' },
                      { key: 'welding', label: '溶接技術' },
                      { key: 'quality_inspection', label: '品質検査' },
                      { key: 'assembly', label: '組立作業' },
                      { key: 'equipment_maintenance', label: '設備保全' },
                      { key: 'material_handling', label: '運搬作業' }
                    ].map((skill) => (
                      <div key={skill.key}>
                        <label className="block text-xs text-[#778DA9] mb-1">{skill.label}</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={newEmployee.skills[skill.key as keyof Employee['skills']]}
                          onChange={(e) => setNewEmployee(prev => ({
                            ...prev,
                            skills: {
                              ...prev.skills,
                              [skill.key]: parseInt(e.target.value) || 1
                            }
                          }))}
                          className="w-full px-2 py-1 border border-[#778DA9] rounded text-sm focus:outline-none focus:border-[#415A77]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={editingEmployee.id ? updateEmployee : addNewEmployee}
                    className="flex-1 bg-[#F4A261] text-white py-2 rounded hover:bg-[#E8956A] transition-colors"
                  >
                    {editingEmployee.id ? '更新' : '追加'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingEmployee(null);
                      setNewEmployee({
                        name: '',
                        level: 1,
                        skills: {
                          press_operation: 1,
                          welding: 1,
                          quality_inspection: 1,
                          assembly: 1,
                          equipment_maintenance: 1,
                          material_handling: 1
                        },
                        department: '第一工場'
                      });
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* 統計情報 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">従業員情報</h3>
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center">
                  <span className="text-[#778DA9]">{employee.name}</span>
                  <span className="font-medium">Lv.{employee.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">シフト統計</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#778DA9]">総シフト数</span>
                <span className="font-medium">{shiftAssignments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#778DA9]">本日出勤予定</span>
                <span className="font-medium">
                  {shiftAssignments.filter(a => a.date === selectedDate && a.shift !== 'off').length}名
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">レイバー統計</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#778DA9]">配置済み作業</span>
                <span className="font-medium">{laborAssignments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#778DA9]">平均効率性</span>
                <span className="font-medium">
                  {laborAssignments.length > 0 
                    ? (laborAssignments.reduce((sum, a) => sum + a.efficiency, 0) / laborAssignments.length * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}