'use client';

import { useState, useEffect } from 'react';

interface PendingApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'correction' | 'overtime' | 'leave' | 'vacation';
  date: string;
  status: 'pending';
  reason: string;
  requestDetails: any;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [filter, setFilter] = useState<'all' | 'correction' | 'overtime' | 'leave' | 'vacation'>('all');
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      // Phase 1: モックデータを表示
      const mockApprovals: PendingApproval[] = [
        {
          id: 'approval_001',
          employeeId: 'emp_001',
          employeeName: '田中太郎',
          department: '第一工場',
          type: 'correction',
          date: '2024-08-30',
          status: 'pending',
          reason: 'NFCカードの不具合で打刻できませんでした',
          requestDetails: {
            originalClockIn: null,
            requestedClockIn: '08:30',
            originalClockOut: '17:30',
            requestedClockOut: '17:30'
          },
          createdAt: '2024-08-30T18:00:00.000Z',
          priority: 'high'
        },
        {
          id: 'approval_002',
          employeeId: 'emp_002',
          employeeName: '佐藤花子',
          department: 'プレス部門',
          type: 'overtime',
          date: '2024-08-31',
          status: 'pending',
          reason: '緊急注文対応のため残業が必要',
          requestDetails: {
            plannedStart: '17:30',
            plannedEnd: '21:00',
            estimatedHours: 3.5
          },
          createdAt: '2024-08-30T14:00:00.000Z',
          priority: 'medium'
        },
        {
          id: 'approval_003',
          employeeId: 'emp_003',
          employeeName: '鈴木次郎',
          department: '溶接部門',
          type: 'vacation',
          date: '2024-09-02',
          status: 'pending',
          reason: '家族旅行のため',
          requestDetails: {
            startDate: '2024-09-02',
            endDate: '2024-09-04',
            vacationDays: 3
          },
          createdAt: '2024-08-25T16:00:00.000Z',
          priority: 'low'
        },
        {
          id: 'approval_004',
          employeeId: 'emp_004',
          employeeName: '山田美咲',
          department: '間接部門',
          type: 'leave',
          date: '2024-08-29',
          status: 'pending',
          reason: '体調不良のため欠勤',
          requestDetails: {
            leaveType: 'sick',
            startDate: '2024-08-29',
            endDate: '2024-08-29'
          },
          createdAt: '2024-08-28T20:30:00.000Z',
          priority: 'medium'
        }
      ];

      setApprovals(mockApprovals);
    } catch (error) {
      console.error('承認待ちデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject', comment?: string) => {
    setProcessingId(approvalId);
    try {
      // Phase 1: ローカル状態更新のみ
      console.log(`${action} approval ${approvalId}:`, comment);
      
      // 承認リストから削除
      setApprovals(prev => prev.filter(approval => approval.id !== approvalId));
      setSelectedApprovals(prev => prev.filter(id => id !== approvalId));
      
      // 成功メッセージ（実際にはトースト通知等で表示）
      alert(`申請を${action === 'approve' ? '承認' : '却下'}しました`);
      
    } catch (error) {
      console.error('承認処理に失敗しました:', error);
      alert('承認処理に失敗しました');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBulkApproval = async (action: 'approve' | 'reject') => {
    if (selectedApprovals.length === 0) return;
    
    const confirmMessage = `選択した${selectedApprovals.length}件の申請を${action === 'approve' ? '承認' : '却下'}しますか？`;
    if (!confirm(confirmMessage)) return;
    
    try {
      for (const approvalId of selectedApprovals) {
        await handleApproval(approvalId, action, '一括処理');
      }
    } catch (error) {
      console.error('一括承認処理に失敗しました:', error);
    }
  };

  const getTypeLabel = (type: PendingApproval['type']) => {
    const labels = {
      correction: '勤怠修正',
      overtime: '残業申請',
      leave: '欠勤届',
      vacation: '有給申請'
    };
    return labels[type];
  };

  const getPriorityColor = (priority: PendingApproval['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: PendingApproval['priority']) => {
    const labels = {
      high: '急用',
      medium: '通常',
      low: '低'
    };
    return labels[priority];
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP');
  };

  const renderRequestDetails = (approval: PendingApproval) => {
    switch (approval.type) {
      case 'correction':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>出勤: {approval.requestDetails.originalClockIn || '未打刻'} → {approval.requestDetails.requestedClockIn}</div>
            <div>退勤: {approval.requestDetails.originalClockOut || '未打刻'} → {approval.requestDetails.requestedClockOut}</div>
          </div>
        );
      
      case 'overtime':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>時間: {approval.requestDetails.plannedStart} 〜 {approval.requestDetails.plannedEnd}</div>
            <div>予定残業時間: {approval.requestDetails.estimatedHours}時間</div>
          </div>
        );
      
      case 'leave':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>期間: {formatDate(approval.requestDetails.startDate)} 〜 {formatDate(approval.requestDetails.endDate)}</div>
            <div>種別: {approval.requestDetails.leaveType === 'sick' ? '病気' : '私用'}</div>
          </div>
        );
      
      case 'vacation':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>期間: {formatDate(approval.requestDetails.startDate)} 〜 {formatDate(approval.requestDetails.endDate)}</div>
            <div>取得日数: {approval.requestDetails.vacationDays}日</div>
          </div>
        );
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    if (filter === 'all') return true;
    return approval.type === filter;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApprovals(filteredApprovals.map(approval => approval.id));
    } else {
      setSelectedApprovals([]);
    }
  };

  const handleSelectApproval = (approvalId: string, checked: boolean) => {
    if (checked) {
      setSelectedApprovals(prev => [...prev, approvalId]);
    } else {
      setSelectedApprovals(prev => prev.filter(id => id !== approvalId));
    }
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
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">承認待ち一覧</h1>
          <p className="text-[#778DA9]">部下からの申請を承認・却下できます</p>
        </div>

        {/* フィルターと一括操作 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* フィルター */}
            <div className="flex items-center space-x-4">
              <label className="text-[#0D1B2A] font-medium">絞り込み:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                <option value="all">すべて ({approvals.length}件)</option>
                <option value="correction">勤怠修正 ({approvals.filter(a => a.type === 'correction').length}件)</option>
                <option value="overtime">残業申請 ({approvals.filter(a => a.type === 'overtime').length}件)</option>
                <option value="leave">欠勤届 ({approvals.filter(a => a.type === 'leave').length}件)</option>
                <option value="vacation">有給申請 ({approvals.filter(a => a.type === 'vacation').length}件)</option>
              </select>
            </div>

            {/* 一括操作 */}
            {selectedApprovals.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-[#0D1B2A]">{selectedApprovals.length}件選択中</span>
                <button
                  onClick={() => handleBulkApproval('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
                >
                  一括承認
                </button>
                <button
                  onClick={() => handleBulkApproval('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                >
                  一括却下
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 承認リスト */}
        {filteredApprovals.length > 0 ? (
          <div className="space-y-4">
            {/* 全選択 */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-[#778DA9]">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedApprovals.length === filteredApprovals.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-[#415A77] border-[#778DA9] rounded focus:ring-[#415A77]"
                />
                <span className="text-[#0D1B2A] font-medium">すべて選択</span>
              </label>
            </div>

            {/* 承認アイテム */}
            {filteredApprovals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedApprovals.includes(approval.id)}
                    onChange={(e) => handleSelectApproval(approval.id, e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#415A77] border-[#778DA9] rounded focus:ring-[#415A77]"
                  />
                  
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        {/* ヘッダー情報 */}
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="inline-block px-3 py-1 bg-[#415A77] text-white text-sm rounded-full font-medium">
                            {getTypeLabel(approval.type)}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded border ${getPriorityColor(approval.priority)}`}>
                            {getPriorityLabel(approval.priority)}
                          </span>
                          <span className="text-[#778DA9] text-sm">
                            {formatDate(approval.date)}
                          </span>
                        </div>

                        {/* 従業員情報 */}
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-[#0D1B2A]">{approval.employeeName}</h3>
                          <p className="text-[#778DA9]">{approval.department}</p>
                        </div>

                        {/* 申請理由 */}
                        <div className="mb-3">
                          <h4 className="font-medium text-[#0D1B2A] mb-2">申請理由</h4>
                          <p className="text-[#1B263B]">{approval.reason}</p>
                        </div>

                        {/* 詳細情報 */}
                        <div className="mb-4">
                          <h4 className="font-medium text-[#0D1B2A] mb-2">詳細</h4>
                          {renderRequestDetails(approval)}
                        </div>

                        {/* 申請日時 */}
                        <div className="text-sm text-[#778DA9]">
                          申請日時: {formatDateTime(approval.createdAt)}
                        </div>
                      </div>

                      {/* 承認ボタン */}
                      <div className="flex flex-col space-y-3 min-w-[200px]">
                        <button
                          onClick={() => handleApproval(approval.id, 'approve')}
                          disabled={processingId === approval.id}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === approval.id ? '処理中...' : '承認する'}
                        </button>
                        
                        <button
                          onClick={() => {
                            const comment = prompt('却下理由を入力してください（任意）:');
                            handleApproval(approval.id, 'reject', comment || undefined);
                          }}
                          disabled={processingId === approval.id}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          却下する
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 border border-[#778DA9] text-center">
            <p className="text-[#778DA9] text-lg">承認待ちの申請はありません</p>
          </div>
        )}
      </div>
    </div>
  );
}