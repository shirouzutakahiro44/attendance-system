'use client';

import { useState, useEffect } from 'react';
import { 
  calculateDailyAttendance, 
  calculateMonthlyAttendance,
  formatTimeHours, 
  DailyAttendance, 
  MonthlyAttendance,
  TimeRecord,
  checkLaborLawCompliance
} from '@/lib/time-calculations';

export default function MonthlyAttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance | null>(null);
  const [dailyData, setDailyData] = useState<DailyAttendance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonthlyAttendance();
  }, [selectedMonth]);

  const loadMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      
      const dailyRecords: DailyAttendance[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;
        const records = generateMockRecords(dateStr, day);
        const dailyAttendance = calculateDailyAttendance(records, dateStr);
        dailyRecords.push(dailyAttendance);
      }
      
      setDailyData(dailyRecords);
      
      // 月間集計を計算
      const monthlyAttendance = calculateMonthlyAttendance(dailyRecords);
      setMonthlyData(monthlyAttendance);
      
    } catch (error) {
      console.error('月間勤怠データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecords = (dateStr: string, day: number): TimeRecord[] => {
    // 土日は勤務なし
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return [];
    }
    
    // 一部の日は欠勤や遅刻を模擬
    if (day === 5) {
      // 遅刻の日
      return [
        {
          id: `mock_${dateStr}_1`,
          userId: 'current-user',
          type: 'clock-in',
          timestamp: `${dateStr}T09:15:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        },
        {
          id: `mock_${dateStr}_2`,
          userId: 'current-user',
          type: 'break-start',
          timestamp: `${dateStr}T12:00:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        },
        {
          id: `mock_${dateStr}_3`,
          userId: 'current-user',
          type: 'break-end',
          timestamp: `${dateStr}T13:00:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        },
        {
          id: `mock_${dateStr}_4`,
          userId: 'current-user',
          type: 'clock-out',
          timestamp: `${dateStr}T17:30:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        }
      ];
    }
    
    if (day === 10) {
      // 欠勤の日
      return [];
    }
    
    if (day === 15) {
      // 残業の日
      return [
        {
          id: `mock_${dateStr}_1`,
          userId: 'current-user',
          type: 'clock-in',
          timestamp: `${dateStr}T08:30:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        },
        {
          id: `mock_${dateStr}_2`,
          userId: 'current-user',
          type: 'break-start',
          timestamp: `${dateStr}T12:00:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        },
        {
          id: `mock_${dateStr}_3`,
          userId: 'current-user',
          type: 'break-end',
          timestamp: `${dateStr}T13:00:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        },
        {
          id: `mock_${dateStr}_4`,
          userId: 'current-user',
          type: 'clock-out',
          timestamp: `${dateStr}T20:00:00.000Z`,
          location: '第一工場',
          device: 'web-browser'
        }
      ];
    }
    
    // 通常の勤務日
    return [
      {
        id: `mock_${dateStr}_1`,
        userId: 'current-user',
        type: 'clock-in',
        timestamp: `${dateStr}T08:30:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: `mock_${dateStr}_2`,
        userId: 'current-user',
        type: 'break-start',
        timestamp: `${dateStr}T12:00:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: `mock_${dateStr}_3`,
        userId: 'current-user',
        type: 'break-end',
        timestamp: `${dateStr}T13:00:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: `mock_${dateStr}_4`,
        userId: 'current-user',
        type: 'clock-out',
        timestamp: `${dateStr}T17:30:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      }
    ];
  };

  const getStatusColor = (status: DailyAttendance['status']) => {
    const colors = {
      'present': 'bg-green-100 text-green-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'absent': 'bg-red-100 text-red-800',
      'holiday': 'bg-blue-100 text-blue-800'
    };
    return colors[status];
  };

  const getStatusSymbol = (status: DailyAttendance['status'], isLate: boolean, isEarlyLeave: boolean) => {
    if (status === 'absent') return '×';
    if (status === 'holiday') return '-';
    if (isLate) return '遅';
    if (isEarlyLeave) return '早';
    return '○';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const getDayOfWeekClass = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) return 'text-red-500'; // 日曜日
    if (dayOfWeek === 6) return 'text-blue-500'; // 土曜日
    return 'text-[#0D1B2A]';
  };

  const laborViolations = monthlyData ? checkLaborLawCompliance(monthlyData) : [];

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
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">月次勤怠</h1>
          <p className="text-[#778DA9]">月次の勤怠状況と労働時間の集計を確認できます</p>
        </div>

        {/* 月選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="month-select" className="text-lg font-medium text-[#0D1B2A]">
              表示月:
            </label>
            <input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
            />
            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
              }}
              className="px-4 py-2 bg-[#415A77] text-white rounded-lg hover:bg-[#2E4057] transition-colors duration-200"
            >
              今月
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 月間サマリー */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-6">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">月間サマリー</h2>
              
              {monthlyData && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-[#778DA9]">出勤日数</span>
                    <span className="text-[#0D1B2A] font-bold">{monthlyData.workDays}日</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-[#778DA9]">総労働時間</span>
                    <span className="text-[#0D1B2A] font-bold">{formatTimeHours(monthlyData.totalWorkHours)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-[#778DA9]">残業時間</span>
                    <span className={`font-bold ${monthlyData.totalOvertimeHours > 45 ? 'text-red-600' : 'text-[#F4A261]'}`}>
                      {formatTimeHours(monthlyData.totalOvertimeHours)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-[#778DA9]">深夜労働時間</span>
                    <span className="text-[#415A77] font-bold">{formatTimeHours(monthlyData.totalNightWorkHours)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-[#778DA9]">遅刻日数</span>
                    <span className={`font-bold ${monthlyData.lateDays > 0 ? 'text-yellow-600' : 'text-[#0D1B2A]'}`}>
                      {monthlyData.lateDays}日
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-[#778DA9]">早退日数</span>
                    <span className={`font-bold ${monthlyData.earlyLeaveDays > 0 ? 'text-yellow-600' : 'text-[#0D1B2A]'}`}>
                      {monthlyData.earlyLeaveDays}日
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#778DA9]">欠勤日数</span>
                    <span className={`font-bold ${monthlyData.absentDays > 0 ? 'text-red-600' : 'text-[#0D1B2A]'}`}>
                      {monthlyData.absentDays}日
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 労働基準法チェック */}
            {laborViolations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">労働基準法チェック</h3>
                <div className="space-y-3">
                  {laborViolations.map((violation, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      violation.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className="font-medium">{violation.message}</div>
                      <div className="text-sm mt-1">
                        現在: {violation.value.toFixed(1)}時間 / 上限: {violation.limit}時間
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* カレンダー */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">勤怠カレンダー</h2>
              
              <div className="grid grid-cols-7 gap-2">
                {/* 曜日ヘッダー */}
                {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                  <div key={day} className={`text-center py-2 font-medium ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-[#0D1B2A]'
                  }`}>
                    {day}
                  </div>
                ))}
                
                {/* 日付セル */}
                {dailyData.map((day, index) => (
                  <div key={index} className={`border border-gray-200 p-2 min-h-[80px] ${getDayOfWeekClass(day.date)}`}>
                    <div className="text-center mb-1 font-medium">
                      {formatDate(day.date)}
                    </div>
                    <div className="text-center">
                      <span className={`inline-block w-6 h-6 rounded-full text-xs leading-6 font-bold ${getStatusColor(day.status)}`}>
                        {getStatusSymbol(day.status, day.isLate, day.isEarlyLeave)}
                      </span>
                    </div>
                    {day.workHours > 0 && (
                      <div className="text-center text-xs text-[#778DA9] mt-1">
                        {formatTimeHours(day.workHours)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 凡例 */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-green-100 text-green-800 text-xs leading-4 text-center font-bold">○</span>
                  <span>出勤</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-yellow-100 text-yellow-800 text-xs leading-4 text-center font-bold">遅</span>
                  <span>遅刻</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-yellow-100 text-yellow-800 text-xs leading-4 text-center font-bold">早</span>
                  <span>早退</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-red-100 text-red-800 text-xs leading-4 text-center font-bold">×</span>
                  <span>欠勤</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-xs leading-4 text-center font-bold">-</span>
                  <span>休日</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}