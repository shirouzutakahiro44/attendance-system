'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { generateMonthlyAttendance, getGamificationStatus, AttendanceRecord, MonthlyAttendanceSummary } from '@/lib/attendance-data';

export default function MonthlyAttendancePage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [attendanceData, setAttendanceData] = useState<{
    records: AttendanceRecord[]
    summary: MonthlyAttendanceSummary
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [userStatus] = useState(getGamificationStatus());

  useEffect(() => {
    loadMonthlyAttendance();
  }, [selectedMonth]);

  const loadMonthlyAttendance = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const data = generateMonthlyAttendance(parseInt(year), parseInt(month));
      setAttendanceData(data);
    } catch (error) {
      console.error('月間勤怠データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    switch (record.status) {
      case 'normal':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">正常</span>;
      case 'late':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">遅刻</span>;
      case 'early':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">早退</span>;
      case 'absent':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">欠勤</span>;
      case 'holiday':
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">休日</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">-</span>;
    }
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const avatarEmojis = {
    EGG: '🥚',
    CHICK: '🐣', 
    CHICKEN: '🐔',
    ROOSTER: '🐓',
    PHOENIX: '🔥🦅'
  } as const;

  return (
    <div className="min-h-screen bg-[#E0E1DD]">
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-[#778DA9]">
          <BackButton className="mb-4" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">月次勤怠表</h1>
              <div className="flex items-center gap-4">
                {userStatus.avatarUrl ? (
                  <img
                    src={userStatus.avatarUrl}
                    alt="アバター"
                    className="w-12 h-12 rounded-full object-cover border-2 border-accent"
                  />
                ) : (
                  <span className="text-3xl">
                    {avatarEmojis[userStatus.avatarType as keyof typeof avatarEmojis]}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-heading">{userStatus.name}</span>
                    <span className="text-sm bg-accent text-white px-2 py-1 rounded">
                      Lv.{userStatus.level}
                    </span>
                    <span className="text-sm bg-primary-button text-white px-2 py-1 rounded">
                      {userStatus.totalPoints} PT
                    </span>
                  </div>
                  <div className="text-sm text-text-sub">
                    {userStatus.currentTitle} {'⭐'.repeat(Math.max(0, Math.min(userStatus.stars || 0, 5)))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="bg-gradient-to-r from-accent to-accent/80 text-white px-4 py-2 rounded-lg hover:from-accent/80 hover:to-accent transition-all"
              >
                プロフィール
              </Link>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-[#778DA9] rounded-lg focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261]"
              />
            </div>
          </div>
        </div>

        {/* 月次サマリー */}
        {!loading && attendanceData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">月次サマリー</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attendanceData.summary.totalWorkDays}</div>
                <div className="text-sm text-gray-600">出勤日数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attendanceData.summary.totalWorkHours}h</div>
                <div className="text-sm text-gray-600">総労働時間</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{attendanceData.summary.totalOvertimeHours}h</div>
                <div className="text-sm text-gray-600">残業時間</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{attendanceData.summary.averageAccuracy}%</div>
                <div className="text-sm text-gray-600">打刻正確率</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-accent">+{attendanceData.summary.totalPoints}</div>
                <div className="text-sm text-accent font-medium">獲得ポイント</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-state-success/10 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-state-success">{attendanceData.summary.perfectDays}日</div>
                <div className="text-sm text-state-success">完璧な出勤</div>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-accent">{attendanceData.summary.consecutiveDays}日</div>
                <div className="text-sm text-accent">連続記録</div>
              </div>
              <div className="bg-state-warning/10 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-state-warning">{attendanceData.summary.lateCount}日</div>
                <div className="text-sm text-state-warning">遅刻</div>
              </div>
            </div>
          </div>
        )}

        {/* 勤怠詳細テーブル */}
        {!loading && attendanceData && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-[#778DA9]">
            <div className="px-6 py-4 border-b border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A]">日別勤怠詳細</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#415A77] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      日付
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      出勤時刻 / 予定
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      退勤時刻 / 予定
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      労働時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      残業時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      状態
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.records.map((record) => (
                    <tr key={record.date} className={`hover:bg-gray-50 ${
                      record.points > 0 ? 'bg-green-50/30' : 
                      record.points < 0 ? 'bg-red-50/30' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0D1B2A]">
                        <div className="flex items-center gap-2">
                          <span>
                            {new Date(record.date).toLocaleDateString('ja-JP', { 
                              month: 'numeric', 
                              day: 'numeric',
                              weekday: 'short' 
                            })}
                          </span>
                          {record.points !== 0 && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              record.points > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.points > 0 ? '+' : ''}{record.points} PT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1B263B]">
                        <div className="flex flex-col">
                          <span>{record.clockIn || '-'}</span>
                          {record.shiftStart && (
                            <span className="text-xs text-gray-400">予定: {record.shiftStart}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1B263B]">
                        <div className="flex flex-col">
                          <span>{record.clockOut || '-'}</span>
                          {record.shiftEnd && (
                            <span className="text-xs text-gray-400">予定: {record.shiftEnd}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1B263B]">
                        {formatHours(record.workMinutes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1B263B]">
                        {formatHours(record.overtimeMinutes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record)}
                          {record.breaks.length > 0 && (
                            <span className="text-xs text-gray-500">
                              休憩{record.breaks.length}回
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-[#778DA9]">データを読み込み中...</div>
          </div>
        )}
      </div>
    </div>
  );
}