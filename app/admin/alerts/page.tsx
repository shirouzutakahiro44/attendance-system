'use client';

import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'overtime_limit' | 'consecutive_work' | 'absence' | 'system' | 'qualification' | 'health';
  severity: 'high' | 'medium' | 'low';
  message: string;
  employeeName?: string;
  department?: string;
  details?: any;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  status: 'active' | 'resolved' | 'dismissed';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // 1分ごとに自動更新
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      // Phase 1: モックデータを生成
      const mockAlerts: Alert[] = [
        {
          id: 'alert_001',
          type: 'overtime_limit',
          severity: 'high',
          message: '田中太郎の月間残業時間が労働基準法の上限（80時間）を超過しています',
          employeeName: '田中太郎',
          department: '第一工場',
          details: {
            currentOvertimeHours: 85.5,
            limit: 80,
            exceedingHours: 5.5
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'active'
        },
        {
          id: 'alert_002',
          type: 'consecutive_work',
          severity: 'medium',
          message: '佐藤花子が8日連続で勤務しています（法定休日の確保が必要）',
          employeeName: '佐藤花子',
          department: 'プレス部門',
          details: {
            consecutiveDays: 8,
            lastRestDay: '2024-08-22'
          },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'active'
        },
        {
          id: 'alert_003',
          type: 'absence',
          severity: 'high',
          message: '鈴木次郎が連絡なしで欠勤しています（緊急連絡が必要）',
          employeeName: '鈴木次郎',
          department: '溶接部門',
          details: {
            expectedClockIn: '08:30',
            currentTime: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            contactAttempts: 0
          },
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          status: 'active'
        },
        {
          id: 'alert_004',
          type: 'system',
          severity: 'medium',
          message: '第三工場のNFCリーダー#3が応答していません',
          department: '第三工場',
          details: {
            deviceId: 'nfc_reader_003',
            lastHeartbeat: new Date(Date.now() - 900000).toISOString(),
            location: '第三工場 東側入口'
          },
          createdAt: new Date(Date.now() - 900000).toISOString(),
          status: 'active'
        },
        {
          id: 'alert_005',
          type: 'qualification',
          severity: 'medium',
          message: '山田美咲のフォークリフト運転資格が来月末に期限切れになります',
          employeeName: '山田美咲',
          department: '間接部門',
          details: {
            qualificationName: 'フォークリフト運転技能講習',
            expiryDate: '2024-09-30',
            daysUntilExpiry: 30
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'active'
        },
        {
          id: 'alert_006',
          type: 'health',
          severity: 'low',
          message: '高橋一郎の定期健康診断の受診期限が近づいています',
          employeeName: '高橋一郎',
          department: '第二工場',
          details: {
            examinationType: '定期健康診断',
            dueDate: '2024-09-15',
            daysUntilDue: 15
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'active'
        },
        {
          id: 'alert_007',
          type: 'overtime_limit',
          severity: 'low',
          message: '加藤次郎の残業時間が月間40時間に達しました（45時間上限注意）',
          employeeName: '加藤次郎',
          department: '溶接部門',
          details: {
            currentOvertimeHours: 40,
            warningThreshold: 40,
            limit: 45
          },
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          status: 'resolved',
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          resolvedBy: '管理者'
        }
      ];

      setAlerts(mockAlerts);
      setLoading(false);

    } catch (error) {
      console.error('アラートデータの取得に失敗しました:', error);
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: '管理者'
            }
          : alert
      ));
    } catch (error) {
      console.error('アラートの解決に失敗しました:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'dismissed' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: '管理者'
            }
          : alert
      ));
    } catch (error) {
      console.error('アラートの非表示に失敗しました:', error);
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    const colors = {
      high: 'border-l-4 border-red-500 bg-red-50',
      medium: 'border-l-4 border-yellow-500 bg-yellow-50',
      low: 'border-l-4 border-blue-500 bg-blue-50'
    };
    return colors[severity];
  };

  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      overtime_limit: '⏰',
      consecutive_work: '📅',
      absence: '❌',
      system: '🔧',
      qualification: '📋',
      health: '🏥'
    };
    return icons[type];
  };

  const getTypeLabel = (type: Alert['type']) => {
    const labels = {
      overtime_limit: '残業上限',
      consecutive_work: '連続勤務',
      absence: '欠勤',
      system: 'システム',
      qualification: '資格',
      health: '健康管理'
    };
    return labels[type];
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    const labels = {
      high: '緊急',
      medium: '注意',
      low: '情報'
    };
    return labels[severity];
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[severity];
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.status !== filter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const highPriorityAlerts = activeAlerts.filter(alert => alert.severity === 'high');

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
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">アラート管理</h1>
          <p className="text-[#778DA9]">システムアラートと注意事項の管理</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{highPriorityAlerts.length}</div>
              <div className="text-[#778DA9]">緊急アラート</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#F4A261]">{activeAlerts.length}</div>
              <div className="text-[#778DA9]">アクティブ</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#415A77]">{alerts.filter(a => a.status === 'resolved').length}</div>
              <div className="text-[#778DA9]">解決済み</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0D1B2A]">{alerts.length}</div>
              <div className="text-[#778DA9]">総件数</div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <label className="text-[#0D1B2A] font-medium">ステータス:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                <option value="all">すべて</option>
                <option value="active">アクティブ</option>
                <option value="resolved">解決済み</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-[#0D1B2A] font-medium">重要度:</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                <option value="all">すべて</option>
                <option value="high">緊急</option>
                <option value="medium">注意</option>
                <option value="low">情報</option>
              </select>
            </div>
          </div>
        </div>

        {/* アラートリスト */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className={`bg-white rounded-lg shadow-md p-6 ${getAlertColor(alert.severity)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                      <div>
                        <span className="inline-block px-3 py-1 bg-[#415A77] text-white text-sm rounded-full font-medium mr-2">
                          {getTypeLabel(alert.type)}
                        </span>
                        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getSeverityColor(alert.severity)}`}>
                          {getSeverityLabel(alert.severity)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-[#0D1B2A] mb-2">
                      {alert.message}
                    </h3>

                    {alert.employeeName && alert.department && (
                      <div className="text-[#778DA9] mb-3">
                        対象: {alert.employeeName} ({alert.department})
                      </div>
                    )}

                    {alert.details && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <h4 className="font-medium text-[#0D1B2A] mb-2">詳細情報</h4>
                        <div className="text-sm text-[#778DA9] space-y-1">
                          {Object.entries(alert.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-[#778DA9]">
                      発生日時: {formatDateTime(alert.createdAt)}
                      {alert.resolvedAt && (
                        <span className="ml-4">
                          解決日時: {formatDateTime(alert.resolvedAt)} ({alert.resolvedBy})
                        </span>
                      )}
                    </div>
                  </div>

                  {alert.status === 'active' && (
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                      >
                        解決
                      </button>
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
                      >
                        非表示
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 border border-[#778DA9] text-center">
              <p className="text-[#778DA9] text-lg">該当するアラートがありません</p>
            </div>
          )}
        </div>

        {/* アラート設定リンク */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/settings#alerts"
            className="inline-block bg-[#778DA9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5A6B7D] transition-colors duration-200"
          >
            アラート設定を変更
          </Link>
        </div>
      </div>
    </div>
  );
}