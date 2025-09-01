'use client';

import { useState, useEffect } from 'react';

interface TimeRecord {
  id: string;
  userId: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end' | 'temp-out' | 'temp-in';
  timestamp: string;
  location: string;
  device: string;
}

export default function ClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    loadTodayRecords();

    return () => clearInterval(timer);
  }, []);

  const loadTodayRecords = () => {
    const storedRecords = localStorage.getItem('todayRecords');
    if (storedRecords) {
      setTodayRecords(JSON.parse(storedRecords));
    }
  };

  const getCurrentStatus = () => {
    if (todayRecords.length === 0) return 'not-clocked-in';
    
    const lastRecord = todayRecords[todayRecords.length - 1];
    switch (lastRecord.type) {
      case 'clock-in':
        return 'working';
      case 'break-start':
        return 'on-break';
      case 'temp-out':
        return 'temp-out';
      case 'clock-out':
        return 'not-clocked-in';
      default:
        return 'working';
    }
  };

  const handleClock = async (type: TimeRecord['type']) => {
    setIsLoading(true);
    setMessage('');

    try {
      // 重複打刻チェック
      const now = new Date();
      const lastRecord = todayRecords[todayRecords.length - 1];
      
      if (lastRecord) {
        const timeDiff = now.getTime() - new Date(lastRecord.timestamp).getTime();
        if (timeDiff < 60000) { // 1分以内の重複チェック
          setMessage('1分以内の重複打刻はできません');
          setIsLoading(false);
          return;
        }
      }

      // 新しい記録を作成
      const newRecord: TimeRecord = {
        id: `record_${now.getTime()}`,
        userId: 'current-user', // 実際の認証情報から取得
        type,
        timestamp: now.toISOString(),
        location: '第一工場', // 実際の場所情報から取得
        device: 'web-browser'
      };

      // ローカルストレージに保存（Phase 1）
      const updatedRecords = [...todayRecords, newRecord];
      setTodayRecords(updatedRecords);
      localStorage.setItem('todayRecords', JSON.stringify(updatedRecords));

      // 成功メッセージ
      const typeMessages = {
        'clock-in': '出勤しました',
        'clock-out': '退勤しました',
        'break-start': '休憩に入りました',
        'break-end': '休憩から戻りました',
        'temp-out': '外出しました',
        'temp-in': '外出から戻りました'
      };
      
      setMessage(typeMessages[type]);

      // 2秒後にメッセージクリア
      setTimeout(() => setMessage(''), 2000);

    } catch (error) {
      setMessage('打刻に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonConfig = () => {
    const status = getCurrentStatus();
    
    switch (status) {
      case 'not-clocked-in':
        return [{ type: 'clock-in' as const, label: '出勤', className: 'bg-blue-600 hover:bg-blue-700' }];
      
      case 'working':
        return [
          { type: 'break-start' as const, label: '休憩開始', className: 'bg-yellow-600 hover:bg-yellow-700' },
          { type: 'temp-out' as const, label: '一時外出', className: 'bg-purple-600 hover:bg-purple-700' },
          { type: 'clock-out' as const, label: '退勤', className: 'bg-red-600 hover:bg-red-700' }
        ];
      
      case 'on-break':
        return [{ type: 'break-end' as const, label: '休憩終了', className: 'bg-green-600 hover:bg-green-700' }];
      
      case 'temp-out':
        return [{ type: 'temp-in' as const, label: '外出から戻る', className: 'bg-green-600 hover:bg-green-700' }];
      
      default:
        return [];
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatRecordTime = (timestamp: string) => {
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

  const getCurrentStatusText = () => {
    const status = getCurrentStatus();
    const statusTexts = {
      'not-clocked-in': '未出勤',
      'working': '勤務中',
      'on-break': '休憩中',
      'temp-out': '外出中'
    };
    return statusTexts[status];
  };

  return (
    <div className="min-h-screen bg-[#E0E1DD]">
      <div className="max-w-4xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">勤怠打刻</h1>
          <p className="text-[#778DA9]">出勤・退勤の打刻を行ってください</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 打刻エリア */}
          <div className="space-y-6">
            {/* 現在時刻表示 */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-[#0D1B2A] mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-lg text-[#1B263B]">
                  {formatDate(currentTime)}
                </div>
                <div className="mt-4 text-sm text-[#778DA9]">
                  現在の状態: <span className="font-semibold text-[#415A77]">{getCurrentStatusText()}</span>
                </div>
              </div>
            </div>

            {/* 打刻ボタンエリア */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <div className="space-y-4">
                {getButtonConfig().map(({ type, label, className }) => (
                  <button
                    key={type}
                    onClick={() => handleClock(type)}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                  >
                    {isLoading ? '処理中...' : label}
                  </button>
                ))}
              </div>

              {/* メッセージ表示 */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                  message.includes('失敗') || message.includes('できません')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* 右側: 本日の打刻履歴 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-4">本日の打刻履歴</h2>
            
            {todayRecords.length === 0 ? (
              <div className="text-center py-8 text-[#778DA9]">
                本日の打刻記録はありません
              </div>
            ) : (
              <div className="space-y-3">
                {todayRecords.map((record) => (
                  <div key={record.id} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-[#0D1B2A]">
                        {getRecordLabel(record.type)}
                      </span>
                      <div className="text-sm text-[#778DA9]">
                        {record.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[#415A77]">
                        {formatRecordTime(record.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}