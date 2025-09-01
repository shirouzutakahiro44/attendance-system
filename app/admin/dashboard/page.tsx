'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalEmployees: number;
  presentEmployees: number;
  absentEmployees: number;
  lateEmployees: number;
  overtimeEmployees: number;
  attendanceRate: number;
  departments: DepartmentStats[];
  alerts: Alert[];
  pendingApprovals: number;
}

interface DepartmentStats {
  name: string;
  totalEmployees: number;
  presentEmployees: number;
  attendanceRate: number;
  avgWorkHours: number;
  overtimeHours: number;
}

interface Alert {
  id: string;
  type: 'overtime_limit' | 'consecutive_work' | 'absence' | 'system';
  severity: 'high' | 'medium' | 'low';
  message: string;
  employeeName?: string;
  department?: string;
  createdAt: string;
}

interface AttendanceStatus {
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'present' | 'absent' | 'late' | 'overtime';
  clockIn?: string;
  clockOut?: string;
  currentWorkHours: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // 30秒ごとに自動更新
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Phase 1: モックデータを生成
      const mockStats: DashboardStats = {
        totalEmployees: 156,
        presentEmployees: 142,
        absentEmployees: 8,
        lateEmployees: 6,
        overtimeEmployees: 12,
        attendanceRate: 91.0,
        departments: [
          {
            name: '第一工場',
            totalEmployees: 45,
            presentEmployees: 42,
            attendanceRate: 93.3,
            avgWorkHours: 8.2,
            overtimeHours: 4.5
          },
          {
            name: '第二工場',
            totalEmployees: 38,
            presentEmployees: 35,
            attendanceRate: 92.1,
            avgWorkHours: 8.1,
            overtimeHours: 3.8
          },
          {
            name: 'プレス部門',
            totalEmployees: 28,
            presentEmployees: 26,
            attendanceRate: 92.9,
            avgWorkHours: 8.3,
            overtimeHours: 5.2
          },
          {
            name: '溶接部門',
            totalEmployees: 32,
            presentEmployees: 29,
            attendanceRate: 90.6,
            avgWorkHours: 8.4,
            overtimeHours: 6.1
          },
          {
            name: '間接部門',
            totalEmployees: 13,
            presentEmployees: 10,
            attendanceRate: 76.9,
            avgWorkHours: 7.8,
            overtimeHours: 2.3
          }
        ],
        alerts: [
          {
            id: 'alert_001',
            type: 'overtime_limit',
            severity: 'high',
            message: '田中太郎の月間残業時間が80時間を超過しています',
            employeeName: '田中太郎',
            department: '第一工場',
            createdAt: new Date().toISOString()
          },
          {
            id: 'alert_002',
            type: 'consecutive_work',
            severity: 'medium',
            message: '佐藤花子が7日連続で勤務しています',
            employeeName: '佐藤花子',
            department: 'プレス部門',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'alert_003',
            type: 'absence',
            severity: 'medium',
            message: '鈴木次郎が連絡なしで欠勤しています',
            employeeName: '鈴木次郎',
            department: '溶接部門',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ],
        pendingApprovals: 8
      };

      // 現在の出勤状況
      const mockAttendance: AttendanceStatus[] = [
        {
          employeeId: 'emp_001',
          employeeName: '田中太郎',
          department: '第一工場',
          status: 'overtime',
          clockIn: '08:30',
          currentWorkHours: 10.5
        },
        {
          employeeId: 'emp_002',
          employeeName: '佐藤花子',
          department: 'プレス部門',
          status: 'present',
          clockIn: '08:25',
          currentWorkHours: 8.2
        },
        {
          employeeId: 'emp_003',
          employeeName: '鈴木次郎',
          department: '溶接部門',
          status: 'absent',
          currentWorkHours: 0
        },
        {
          employeeId: 'emp_004',
          employeeName: '山田美咲',
          department: '間接部門',
          status: 'late',
          clockIn: '09:15',
          currentWorkHours: 7.8
        }
      ];

      setStats(mockStats);
      setCurrentAttendance(mockAttendance);
      setLastUpdate(new Date());
      setLoading(false);

    } catch (error) {
      console.error('ダッシュボードデータの取得に失敗しました:', error);
      setLoading(false);
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    const colors = {
      high: 'bg-[#9D8189] text-white border-[#9D8189]',
      medium: 'bg-[#F4ACB7] text-white border-[#F4ACB7]',
      low: 'bg-[#FFCAD4] text-gray-800 border-[#FFCAD4]'
    };
    return colors[severity];
  };

  const getStatusColor = (status: AttendanceStatus['status']) => {
    const colors = {
      present: 'bg-[#FFCAD4] text-gray-800',
      absent: 'bg-[#9D8189] text-white',
      late: 'bg-[#F4ACB7] text-white',
      overtime: 'bg-[#FFE5D9] text-gray-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: AttendanceStatus['status']) => {
    const labels = {
      present: '出勤',
      absent: '欠勤',
      late: '遅刻',
      overtime: '残業中'
    };
    return labels[status];
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">管理ダッシュボード</h1>
              <p className="text-[#778DA9]">リアルタイムの勤怠状況と統計情報</p>
            </div>
            <div className="text-right text-sm text-[#778DA9] mt-4 lg:mt-0">
              <div>最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}</div>
              <div className="mt-1">
                <button
                  onClick={loadDashboardData}
                  className="text-[#415A77] hover:text-[#2E4057] font-medium"
                >
                  手動更新
                </button>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* 統計カード */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0D1B2A]">{stats.presentEmployees}</div>
                  <div className="text-[#778DA9]">出勤中</div>
                  <div className="text-sm text-green-600 mt-1">{stats.attendanceRate.toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.absentEmployees}</div>
                  <div className="text-[#778DA9]">欠勤</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.lateEmployees}</div>
                  <div className="text-[#778DA9]">遅刻</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stats.overtimeEmployees}</div>
                  <div className="text-[#778DA9]">残業中</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#415A77]">{stats.pendingApprovals}</div>
                  <div className="text-[#778DA9]">承認待ち</div>
                  <Link href="/manager/approvals" className="text-sm text-[#415A77] hover:text-[#2E4057] mt-1 block">
                    確認 →
                  </Link>
                </div>
              </div>
            </div>

            {/* アラート */}
            {stats.alerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">アラート ({stats.alerts.length}件)</h2>
                <div className="space-y-3">
                  {stats.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          {alert.employeeName && alert.department && (
                            <p className="text-sm mt-1 opacity-80">
                              {alert.employeeName} ({alert.department})
                            </p>
                          )}
                        </div>
                        <div className="text-sm opacity-60">
                          {formatDateTime(alert.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.alerts.length > 5 && (
                    <div className="text-center pt-3">
                      <Link href="/admin/alerts" className="text-[#415A77] hover:text-[#2E4057] font-medium">
                        すべてのアラートを表示 ({stats.alerts.length - 5}件)
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* 部署別出勤状況 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">部署別出勤状況</h2>
                <div className="space-y-4">
                  {stats.departments.map((dept) => (
                    <div key={dept.name} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-[#0D1B2A]">{dept.name}</h3>
                        <span className="text-[#415A77] font-bold">
                          {dept.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#778DA9]">出勤: </span>
                          <span className="font-medium">{dept.presentEmployees}/{dept.totalEmployees}人</span>
                        </div>
                        <div>
                          <span className="text-[#778DA9]">平均労働時間: </span>
                          <span className="font-medium">{dept.avgWorkHours.toFixed(1)}h</span>
                        </div>
                        <div>
                          <span className="text-[#778DA9]">残業時間: </span>
                          <span className="font-medium text-orange-600">{dept.overtimeHours.toFixed(1)}h</span>
                        </div>
                      </div>
                      
                      {/* 出勤率バー */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#415A77] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${dept.attendanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 現在の勤務状況 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">要注意者リスト</h2>
                <div className="space-y-3">
                  {currentAttendance.filter(emp => emp.status !== 'present').map((employee) => (
                    <div key={employee.employeeId} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-[#0D1B2A]">{employee.employeeName}</div>
                        <div className="text-sm text-[#778DA9]">{employee.department}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee.status)}`}>
                          {getStatusLabel(employee.status)}
                        </span>
                        {employee.clockIn && (
                          <div className="text-sm text-[#778DA9] mt-1">
                            {formatTime(employee.clockIn)} - {employee.currentWorkHours.toFixed(1)}h
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {currentAttendance.filter(emp => emp.status !== 'present').length === 0 && (
                    <div className="text-center py-8 text-[#778DA9]">
                      現在、要注意者はいません
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">クイックアクション</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/manager/approvals"
                  className="bg-[#F4ACB7] text-white px-6 py-4 rounded-lg text-center font-semibold hover:bg-[#9D8189] transition-colors duration-200"
                >
                  承認管理
                  {stats.pendingApprovals > 0 && (
                    <span className="block text-sm mt-1">({stats.pendingApprovals}件)</span>
                  )}
                </Link>
                
                <Link
                  href="/attendance/monthly"
                  className="bg-[#FFCAD4] text-gray-800 px-6 py-4 rounded-lg text-center font-semibold hover:bg-[#F4ACB7] hover:text-white transition-colors duration-200"
                >
                  月次勤怠
                </Link>
                
                <button
                  onClick={() => window.open('/api/attendance/export?format=csv&startDate=2024-08-01&endDate=2024-08-31', '_blank')}
                  className="bg-[#FFE5D9] text-gray-800 px-6 py-4 rounded-lg text-center font-semibold hover:bg-[#FFCAD4] transition-colors duration-200"
                >
                  CSV出力
                </button>
                
                <Link
                  href="/admin/settings"
                  className="bg-[#9D8189] text-white px-6 py-4 rounded-lg text-center font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  システム設定
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}