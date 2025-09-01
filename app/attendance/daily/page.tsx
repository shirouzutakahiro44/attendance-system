'use client';

import { useState, useEffect } from 'react';
import { calculateDailyAttendance, formatTimeHours, DailyAttendance, TimeRecord } from '@/lib/time-calculations';

export default function DailyAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<DailyAttendance | null>(null);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyAttendance();
  }, [selectedDate]);

  const loadDailyAttendance = async () => {
    setLoading(true);
    try {
      // Phase 1: ローカルストレージから取得
      const storedRecords = localStorage.getItem('todayRecords');
      let records: TimeRecord[] = [];
      
      if (storedRecords && selectedDate === new Date().toISOString().split('T')[0]) {
        records = JSON.parse(storedRecords);
      } else {
        // 過去日付の場合はモックデータ
        records = generateMockRecords(selectedDate);
      }

      setTimeRecords(records);
      
      // 勤怠データを計算
      const dailyData = calculateDailyAttendance(records, selectedDate);
      setAttendanceData(dailyData);
      
    } catch (error) {
      console.error('勤怠データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecords = (date: string): TimeRecord[] => {
    const mockRecords: TimeRecord[] = [
      {
        id: `mock_1_${date}`,
        userId: 'current-user',
        type: 'clock-in',
        timestamp: `${date}T08:30:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: `mock_2_${date}`,
        userId: 'current-user',
        type: 'break-start',
        timestamp: `${date}T12:00:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: `mock_3_${date}`,
        userId: 'current-user',
        type: 'break-end',
        timestamp: `${date}T13:00:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: `mock_4_${date}`,
        userId: 'current-user',
        type: 'clock-out',
        timestamp: `${date}T17:30:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      }
    ];
    
    return mockRecords;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecordLabel = (type: TimeRecord['type']) => {
    const labels = {
      'clock-in': '出勤',
      'clock-out': '退勤',
      'break-start': '休憩開始',
      'break-end': '休憩終了',
      'temp-out': '一時外出',
      'temp-in': '外出戻り'
    };
    return labels[type];
  };

  const getStatusColor = (status: DailyAttendance['status']) => {
    const colors = {
      'present': 'text-green-600 bg-green-100',
      'partial': 'text-yellow-600 bg-yellow-100',
      'absent': 'text-red-600 bg-red-100',
      'holiday': 'text-blue-600 bg-blue-100'
    };
    return colors[status];
  };

  const getStatusLabel = (status: DailyAttendance['status']) => {
    const labels = {
      'present': '出勤',
      'partial': '部分出勤',
      'absent': '欠勤',
      'holiday': '休日'
    };
    return labels[status];
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
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">日次勤怠</h1>
          <p className="text-[#778DA9]">日次の勤怠状況を確認できます</p>
        </div>

        {/* 日付選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="flex items-center space-x-4">
            <label htmlFor="date-select" className="text-lg font-medium text-[#0D1B2A]">
              表示日付:
            </label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
              max={new Date().toISOString().split('T')[0]}
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 bg-[#415A77] text-white rounded-lg hover:bg-[#2E4057] transition-colors duration-200"
            >
              今日
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 勤怠サマリー */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">勤怠サマリー</h2>
            
            {attendanceData ? (
              <div className="space-y-4">
                {/* ステータス */}
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-[#778DA9]">ステータス</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attendanceData.status)}`}>
                    {getStatusLabel(attendanceData.status)}
                  </span>
                </div>

                {/* 出退勤時刻 */}
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-[#778DA9]">出勤時刻</span>
                  <span className="text-[#0D1B2A] font-mono">
                    {attendanceData.clockIn ? formatTime(attendanceData.clockIn) : '-'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-[#778DA9]">退勤時刻</span>
                  <span className="text-[#0D1B2A] font-mono">
                    {attendanceData.clockOut ? formatTime(attendanceData.clockOut) : '-'}
                  </span>
                </div>

                {/* 労働時間 */}
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-[#778DA9]">労働時間</span>
                  <span className="text-[#0D1B2A] font-mono font-bold">
                    {formatTimeHours(attendanceData.workHours)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-[#778DA9]">休憩時間</span>
                  <span className="text-[#0D1B2A] font-mono">
                    {formatTimeHours(attendanceData.breakTime)}
                  </span>
                </div>

                {/* 残業・深夜労働 */}
                {attendanceData.overtimeHours > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-[#778DA9]">残業時間</span>
                    <span className="text-[#F4A261] font-mono font-bold">
                      {formatTimeHours(attendanceData.overtimeHours)}
                    </span>
                  </div>
                )}

                {attendanceData.nightWorkHours > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-[#778DA9]">深夜労働時間</span>
                    <span className="text-[#415A77] font-mono font-bold">
                      {formatTimeHours(attendanceData.nightWorkHours)}
                    </span>
                  </div>
                )}

                {/* 遅刻・早退 */}
                {(attendanceData.isLate || attendanceData.isEarlyLeave) && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {attendanceData.isLate && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-sm rounded">
                          遅刻
                        </span>
                      )}
                      {attendanceData.isEarlyLeave && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-sm rounded">
                          早退
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-[#778DA9]">
                データがありません
              </div>
            )}
          </div>

          {/* 打刻履歴 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">打刻履歴</h2>
            
            {timeRecords.length > 0 ? (
              <div className="space-y-3">
                {timeRecords.map((record) => (
                  <div key={record.id} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-[#0D1B2A]">
                        {getRecordLabel(record.type)}
                      </span>
                      <div className="text-sm text-[#778DA9]">
                        {record.location} • {record.device}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[#415A77]">
                        {formatTime(record.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#778DA9]">
                打刻記録がありません
              </div>
            )}
          </div>
        </div>

        {/* 修正申請ボタン */}
        <div className="mt-8 text-center">
          <button className="bg-[#F4A261] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200">
            勤怠修正申請
          </button>
        </div>
      </div>
    </div>
  );
}