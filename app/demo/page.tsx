"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState('');

  const demoUsers = [
    { id: 'admin', name: '管理 太郎 (システム管理者)', role: 'ADMIN', department: '間接部門' },
    { id: 'manager', name: '班長 次郎 (管理者)', role: 'MANAGER', department: '第一工場' },
    { id: 'employee', name: '田中 花子 (従業員)', role: 'EMPLOYEE', department: '第一工場' },
  ];

  const handleDemoLogin = () => {
    if (!selectedUser) return;

    const user = demoUsers.find(u => u.id === selectedUser);
    if (!user) return;

    // Store demo user data
    const demoUserData = {
      id: user.id,
      employeeId: user.id.toUpperCase() + '001',
      firstName: user.name.split(' ')[1],
      lastName: user.name.split(' ')[0],
      department: user.department === '間接部門' ? 'INDIRECT' : 'FACTORY_1',
      role: user.role,
      employmentType: 'FULL_TIME',
      hireDate: '2022-04-01',
      isActive: true,
    };

    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('user', JSON.stringify(demoUserData));
    localStorage.setItem('token', 'demo-token');
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#E0E1DD' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#0D1B2A' }}>
            デモモード
          </h1>
          <p className="text-lg mb-2" style={{ color: '#778DA9' }}>
            UIを確認するためのデモモードです
          </p>
          <p className="text-sm" style={{ color: '#778DA9' }}>
            データベース接続なしでUIを体験できます
          </p>
        </div>

        <div className="rounded-2xl p-8 shadow-lg mb-6" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#0D1B2A' }}>
            ユーザーを選択してください
          </h2>
          
          <div className="space-y-4">
            {demoUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center p-4 rounded-lg cursor-pointer transition-colors border-2"
                style={{
                  backgroundColor: selectedUser === user.id ? '#F0F8FF' : 'white',
                  borderColor: selectedUser === user.id ? '#415A77' : '#778DA9',
                }}
                onClick={() => setSelectedUser(user.id)}
              >
                <input
                  type="radio"
                  name="demoUser"
                  value={user.id}
                  checked={selectedUser === user.id}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: '#0D1B2A' }}>
                    {user.name}
                  </div>
                  <div className="text-sm" style={{ color: '#778DA9' }}>
                    {user.department} - {user.role === 'ADMIN' ? 'システム管理者' : user.role === 'MANAGER' ? '管理者' : '従業員'}
                  </div>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: '#415A77' }}
                >
                  {selectedUser === user.id && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: '#415A77' }}
                    />
                  )}
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={!selectedUser}
            className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              backgroundColor: '#415A77',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#2F4156')}
            onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#415A77')}
          >
            デモを開始
          </button>
        </div>

        <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'white', border: '1px solid #778DA9' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#0D1B2A' }}>
            確認できる機能
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: '#1B263B' }}>
            <li>• ログイン画面のデザイン</li>
            <li>• ダッシュボードのレイアウト</li>
            <li>• 権限による表示の違い</li>
            <li>• レスポンシブデザイン</li>
            <li>• カラーパレットの適用</li>
          </ul>
          
          <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: '#FFF3CD', borderColor: '#FFD166' }}>
            <p className="text-xs font-medium" style={{ color: '#856404' }}>
              ⚠️ 注意: これはUIデモです。実際のデータ保存や認証は行われません。
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/login')}
            className="text-sm px-4 py-2 rounded-lg transition-colors border"
            style={{ 
              color: '#415A77',
              backgroundColor: 'white',
              borderColor: '#778DA9'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F8FF';
              e.currentTarget.style.borderColor = '#415A77';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#778DA9';
            }}
          >
            ログイン画面を見る
          </button>
        </div>
      </div>
    </div>
  );
}