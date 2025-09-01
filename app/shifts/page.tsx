'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShiftPattern, ShiftAssignment, ShiftStatus } from '@/types/shift-labor';
import EmployeeManager from '@/lib/employees';

export default function ShiftManagementPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('第一工場');
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const departments = EmployeeManager.getDepartments();
  
  // 共通マスタから従業員データを取得
  const employees = EmployeeManager.getAllEmployees().map(emp => ({
    id: emp.id,
    name: emp.name,
    department: emp.department
  }));

  useEffect(() => {
    loadShiftData();
  }, [selectedDate, selectedDepartment]);

  const loadShiftData = async () => {
    setLoading(true);
    try {
      // シフトパターンのモックデータ
      const mockPatterns: ShiftPattern[] = [
        {
          id: 'shift_day',
          name: '日勤シフト',
          startTime: '08:00',
          endTime: '17:00',
          breakPeriods: [
            { startTime: '12:00', duration: 60, type: 'lunch', isRequired: true }
          ],
          isNightShift: false,
          category: 'day',
          description: '標準的な日勤シフト（8:00-17:00）',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'shift_early',
          name: '早番シフト',
          startTime: '06:00',
          endTime: '15:00',
          breakPeriods: [
            { startTime: '10:00', duration: 60, type: 'lunch', isRequired: true }
          ],
          isNightShift: false,
          category: 'early',
          description: '早番シフト（6:00-15:00）',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'shift_late',
          name: '遅番シフト',
          startTime: '10:00',
          endTime: '19:00',
          breakPeriods: [
            { startTime: '14:00', duration: 60, type: 'lunch', isRequired: true }
          ],
          isNightShift: false,
          category: 'late',
          description: '遅番シフト（10:00-19:00）',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'shift_night',
          name: '夜勤シフト',
          startTime: '22:00',
          endTime: '06:00',
          breakPeriods: [
            { startTime: '02:00', duration: 60, type: 'lunch', isRequired: true }
          ],
          isNightShift: true,
          category: 'night',
          description: '夜勤シフト（22:00-翌6:00）',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // シフト配置のモックデータ
      const mockAssignments: ShiftAssignment[] = [
        {
          id: 'assign_001',
          userId: 'emp_hakusui',
          date: selectedDate,
          shiftPatternId: 'shift_day',
          department: selectedDepartment,
          status: 'confirmed',
          laborAssignments: [],
          plannedWorkHours: 8,
          actualWorkHours: undefined,
          plannedBreakTime: 1,
          actualBreakTime: undefined,
          notes: '',
          assignedBy: 'system',
          assignedAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString()
        },
        {
          id: 'assign_002',
          userId: 'emp_yashiro_a',
          date: selectedDate,
          shiftPatternId: 'shift_early',
          department: selectedDepartment,
          status: 'confirmed',
          laborAssignments: [],
          plannedWorkHours: 8,
          actualWorkHours: undefined,
          plannedBreakTime: 1,
          actualBreakTime: undefined,
          notes: '',
          assignedBy: 'system',
          assignedAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString()
        },
        {
          id: 'assign_003',
          userId: 'emp_yashiro_m',
          date: selectedDate,
          shiftPatternId: 'shift_late',
          department: '第二工場',
          status: 'planned',
          laborAssignments: [],
          plannedWorkHours: 8,
          actualWorkHours: undefined,
          plannedBreakTime: 1,
          actualBreakTime: undefined,
          notes: '',
          assignedBy: 'system',
          assignedAt: new Date().toISOString()
        }
      ];

      setShiftPatterns(mockPatterns);
      setShiftAssignments(mockAssignments);
    } catch (error) {
      console.error('シフトデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (userId: string) => {
    const employee = employees.find(e => e.id === userId);
    return employee ? employee.name : userId;
  };

  const getShiftPatternName = (patternId: string) => {
    const pattern = shiftPatterns.find(p => p.id === patternId);
    return pattern ? pattern.name : patternId;
  };

  const getStatusLabel = (status: ShiftStatus) => {
    const labels = {
      draft: '下書き',
      planned: '計画済み',
      confirmed: '確定',
      in_progress: '実行中',
      completed: '完了',
      cancelled: 'キャンセル'
    };
    return labels[status];
  };

  const getStatusColor = (status: ShiftStatus) => {
    const colors = {
      draft: 'bg-[#D8E2DC] text-gray-700',
      planned: 'bg-[#FFE5D9] text-gray-800',
      confirmed: 'bg-[#FFCAD4] text-gray-800',
      in_progress: 'bg-[#F4ACB7] text-white',
      completed: 'bg-[#9D8189] text-white',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const handleShiftChange = (assignmentId: string, newShiftPatternId: string) => {
    setShiftAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, shiftPatternId: newShiftPatternId, status: 'planned' as ShiftStatus }
          : assignment
      )
    );
  };

  const handleStatusChange = (assignmentId: string, newStatus: ShiftStatus) => {
    setShiftAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: newStatus, ...(newStatus === 'confirmed' ? { confirmedAt: new Date().toISOString() } : {}) }
          : assignment
      )
    );
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">シフト管理</h1>
              <p className="text-[#778DA9]">従業員のシフトパターン設定と配置管理</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/shifts-labor"
                className="bg-[#F4A261] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#E8956A] transition-colors duration-200"
              >
                レイバー管理 →
              </Link>
              <button
                onClick={() => setEditing(!editing)}
                className="bg-[#415A77] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2E4057] transition-colors duration-200"
              >
                {editing ? '編集完了' : '編集モード'}
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
                onClick={loadShiftData}
                className="w-full bg-[#778DA9] text-white py-2 px-4 rounded hover:bg-[#5A6B7A] transition-colors duration-200"
              >
                更新
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* シフトパターン一覧 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">利用可能シフトパターン</h2>
            
            <div className="space-y-4">
              {shiftPatterns.map((pattern) => (
                <div key={pattern.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-[#0D1B2A]">{pattern.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pattern.isNightShift ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pattern.isNightShift ? '夜勤' : '日勤'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#778DA9]">勤務時間:</span>
                      <span className="font-medium">{pattern.startTime} - {pattern.endTime}</span>
                    </div>
                    
                    {pattern.breakPeriods.map((breakPeriod, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-[#778DA9]">休憩:</span>
                        <span className="font-medium">{breakPeriod.startTime} ({breakPeriod.duration}分)</span>
                      </div>
                    ))}
                    
                    <p className="text-[#778DA9] text-xs mt-2">{pattern.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* シフト配置 */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">
              シフト配置 - {selectedDate}
            </h2>
            
            <div className="space-y-4">
              {shiftAssignments
                .filter(assignment => assignment.department === selectedDepartment)
                .map((assignment) => {
                const pattern = shiftPatterns.find(p => p.id === assignment.shiftPatternId);
                
                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-[#0D1B2A] text-lg">
                          {getEmployeeName(assignment.userId)}
                        </h3>
                        <p className="text-sm text-[#778DA9]">{assignment.department}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment.status)}`}>
                        {getStatusLabel(assignment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0D1B2A] mb-2">シフトパターン</label>
                        {editing ? (
                          <select
                            value={assignment.shiftPatternId}
                            onChange={(e) => handleShiftChange(assignment.id, e.target.value)}
                            className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                          >
                            {shiftPatterns.map(pattern => (
                              <option key={pattern.id} value={pattern.id}>
                                {pattern.name} ({pattern.startTime}-{pattern.endTime})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded border">
                            {pattern?.name} ({pattern?.startTime}-{pattern?.endTime})
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0D1B2A] mb-2">ステータス</label>
                        {editing ? (
                          <select
                            value={assignment.status}
                            onChange={(e) => handleStatusChange(assignment.id, e.target.value as ShiftStatus)}
                            className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
                          >
                            <option value="draft">下書き</option>
                            <option value="planned">計画済み</option>
                            <option value="confirmed">確定</option>
                            <option value="cancelled">キャンセル</option>
                          </select>
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded border">
                            {getStatusLabel(assignment.status)}
                          </div>
                        )}
                      </div>
                    </div>

                    {pattern && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-[#778DA9]">予定勤務:</span>
                            <div className="font-medium">{assignment.plannedWorkHours}時間</div>
                          </div>
                          <div>
                            <span className="text-[#778DA9]">休憩時間:</span>
                            <div className="font-medium">{assignment.plannedBreakTime}時間</div>
                          </div>
                          <div>
                            <span className="text-[#778DA9]">夜勤:</span>
                            <div className="font-medium">{pattern.isNightShift ? 'あり' : 'なし'}</div>
                          </div>
                          <div>
                            <span className="text-[#778DA9]">配置日時:</span>
                            <div className="font-medium text-xs">
                              {new Date(assignment.assignedAt).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                        </div>
                        
                        {assignment.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-[#778DA9] text-sm">備考:</span>
                            <p className="text-sm mt-1">{assignment.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 統計情報 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-[#0D1B2A] mb-3">本日のシフト統計</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#415A77]">
                    {shiftAssignments.filter(a => a.department === selectedDepartment).length}
                  </div>
                  <div className="text-[#778DA9]">配置済み人数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {shiftAssignments.filter(a => a.department === selectedDepartment && a.status === 'confirmed').length}
                  </div>
                  <div className="text-[#778DA9]">確定済み</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F4A261]">
                    {shiftAssignments.filter(a => a.department === selectedDepartment)
                      .reduce((sum, a) => sum + (a.plannedWorkHours || 0), 0)}
                  </div>
                  <div className="text-[#778DA9]">総予定時間</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {shiftAssignments.filter(a => a.department === selectedDepartment && 
                      shiftPatterns.find(p => p.id === a.shiftPatternId)?.isNightShift).length}
                  </div>
                  <div className="text-[#778DA9]">夜勤者数</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            className="bg-[#778DA9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5A6B7A] transition-colors duration-200"
          >
            シフト保存
          </button>
          <Link
            href="/shifts-labor"
            className="bg-[#F4A261] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200"
          >
            レイバー配置へ進む
          </Link>
        </div>
      </div>
    </div>
  );
}