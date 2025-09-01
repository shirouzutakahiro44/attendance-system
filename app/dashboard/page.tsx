"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEFAE0' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D4A373' }}></div>
          <p style={{ color: '#8B7355' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getDepartmentName = (dept: string) => {
    const departmentMap: Record<string, string> = {
      FACTORY_1: '第一工場',
      FACTORY_2: '第二工場',
      FACTORY_3: '第三工場',
      PRESS: 'プレス',
      WELDING: '溶接',
      INDIRECT: '間接部門',
    };
    return departmentMap[dept] || dept;
  };

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      EMPLOYEE: '従業員',
      MANAGER: '管理者',
      ADMIN: 'システム管理者',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E0E1DD' }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="border-l-4 p-4" style={{ backgroundColor: '#FFF3CD', borderColor: '#FFD166' }}>
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm" style={{ color: '#856404' }}>
                <strong>デモモード:</strong> これはUIデモです。実際のデータ保存は行われません。
                <button
                  onClick={() => router.push('/demo')}
                  className="ml-2 underline hover:no-underline"
                  style={{ color: '#415A77' }}
                >
                  デモ画面に戻る
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#1B263B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">
              勤怠管理システム
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.lastName} {user.firstName}
                </p>
                <p className="text-xs" style={{ color: '#778DA9' }}>
                  {getDepartmentName(user.department)} | {getRoleName(user.role)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#778DA9',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5F6B7A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#778DA9';
                }}
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="col-span-full rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#0D1B2A' }}>
              おかえりなさい、{user.firstName}さん
            </h2>
            <p style={{ color: '#778DA9' }}>
              今日も一日お疲れ様です。勤怠管理システムへようこそ。
            </p>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#0D1B2A' }}>
              クイックアクション
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/attendance/clock')}
                className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: '#4CAF50' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45A049'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              >
                勤怠打刻
              </button>
              <button
                onClick={() => router.push('/attendance/daily')}
                className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: '#415A77' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F4156'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#415A77'}
              >
                勤怠確認
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#0D1B2A' }}>
              ユーザー情報
            </h3>
            <div className="space-y-2 text-sm" style={{ color: '#1B263B' }}>
              <p><span className="font-medium">社員番号:</span> {user.employeeId}</p>
              <p><span className="font-medium">所属:</span> {getDepartmentName(user.department)}</p>
              <p><span className="font-medium">権限:</span> {getRoleName(user.role)}</p>
              <p><span className="font-medium">入社日:</span> {new Date(user.hireDate).toLocaleDateString('ja-JP')}</p>
            </div>
          </div>

          {/* Recent Activity - Placeholder */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#0D1B2A' }}>
              最近の活動
            </h3>
            <p className="text-sm" style={{ color: '#778DA9' }}>
              まだ打刻記録がありません。
            </p>
          </div>
        </div>

        {/* Admin Features */}
        {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#0D1B2A' }}>
              管理機能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.role === 'ADMIN' && (
                <button 
                  className="p-4 rounded-lg text-center transition-all hover:shadow-lg border" 
                  style={{ backgroundColor: 'white', borderColor: '#778DA9' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A261'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#778DA9'}
                >
                  <h3 className="font-medium" style={{ color: '#0D1B2A' }}>ユーザー管理</h3>
                  <p className="text-xs mt-1" style={{ color: '#778DA9' }}>従業員の追加・編集</p>
                </button>
              )}
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="p-4 rounded-lg text-center transition-all hover:shadow-lg border" 
                style={{ backgroundColor: 'white', borderColor: '#778DA9' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A261'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#778DA9'}
              >
                <h3 className="font-medium" style={{ color: '#0D1B2A' }}>管理ダッシュボード</h3>
                <p className="text-xs mt-1" style={{ color: '#778DA9' }}>リアルタイム統計</p>
              </button>
              <button 
                onClick={() => router.push('/manager/approvals')}
                className="p-4 rounded-lg text-center transition-all hover:shadow-lg border" 
                style={{ backgroundColor: 'white', borderColor: '#778DA9' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A261'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#778DA9'}
              >
                <h3 className="font-medium" style={{ color: '#0D1B2A' }}>承認待ち</h3>
                <p className="text-xs mt-1" style={{ color: '#778DA9' }}>申請の承認処理</p>
              </button>
              <button 
                onClick={() => router.push('/admin/reports')}
                className="p-4 rounded-lg text-center transition-all hover:shadow-lg border" 
                style={{ backgroundColor: 'white', borderColor: '#778DA9' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F4A261'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#778DA9'}
              >
                <h3 className="font-medium" style={{ color: '#0D1B2A' }}>レポート</h3>
                <p className="text-xs mt-1" style={{ color: '#778DA9' }}>各種レポート出力</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}