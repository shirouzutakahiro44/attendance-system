'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AttendanceRequest {
  id: string;
  type: 'correction' | 'overtime' | 'leave' | 'vacation';
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  requestDetails: any;
  createdAt: string;
  approvedAt?: string;
  approverComment?: string;
}

export default function AttendanceRequestsPage() {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Phase 1: モックデータを表示
      const mockRequests: AttendanceRequest[] = [
        {
          id: 'req_001',
          type: 'correction',
          date: '2024-08-30',
          status: 'pending',
          reason: '打刻忘れのため出勤時刻を修正',
          requestDetails: {
            originalClockIn: null,
            requestedClockIn: '08:30',
            originalClockOut: '17:30',
            requestedClockOut: '17:30'
          },
          createdAt: '2024-08-30T18:00:00.000Z'
        },
        {
          id: 'req_002',
          type: 'overtime',
          date: '2024-08-29',
          status: 'approved',
          reason: 'システムメンテナンス対応',
          requestDetails: {
            plannedOvertimeHours: 3,
            actualOvertimeHours: 2.5
          },
          createdAt: '2024-08-29T15:00:00.000Z',
          approvedAt: '2024-08-29T16:30:00.000Z',
          approverComment: '承認します'
        },
        {
          id: 'req_003',
          type: 'leave',
          date: '2024-08-28',
          status: 'rejected',
          reason: '体調不良による欠勤',
          requestDetails: {
            leaveType: 'sick',
            startDate: '2024-08-28',
            endDate: '2024-08-28'
          },
          createdAt: '2024-08-27T20:00:00.000Z',
          approvedAt: '2024-08-28T09:00:00.000Z',
          approverComment: '医師の診断書が必要です'
        },
        {
          id: 'req_004',
          type: 'vacation',
          date: '2024-09-02',
          status: 'pending',
          reason: '有給休暇取得',
          requestDetails: {
            startDate: '2024-09-02',
            endDate: '2024-09-02',
            vacationDays: 1
          },
          createdAt: '2024-08-25T14:00:00.000Z'
        }
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error('申請データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: AttendanceRequest['type']) => {
    const labels = {
      correction: '勤怠修正',
      overtime: '残業申請',
      leave: '欠勤届',
      vacation: '有給申請'
    };
    return labels[type];
  };

  const getStatusColor = (status: AttendanceRequest['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: AttendanceRequest['status']) => {
    const labels = {
      pending: '承認待ち',
      approved: '承認済み',
      rejected: '却下'
    };
    return labels[status];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const renderRequestDetails = (request: AttendanceRequest) => {
    switch (request.type) {
      case 'correction':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>出勤: {request.requestDetails.originalClockIn || '未打刻'} → {request.requestDetails.requestedClockIn}</div>
            <div>退勤: {request.requestDetails.originalClockOut || '未打刻'} → {request.requestDetails.requestedClockOut}</div>
          </div>
        );
      
      case 'overtime':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>予定残業時間: {request.requestDetails.plannedOvertimeHours}時間</div>
            {request.requestDetails.actualOvertimeHours && (
              <div>実際の残業時間: {request.requestDetails.actualOvertimeHours}時間</div>
            )}
          </div>
        );
      
      case 'leave':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>期間: {formatDate(request.requestDetails.startDate)} 〜 {formatDate(request.requestDetails.endDate)}</div>
            <div>種別: {request.requestDetails.leaveType === 'sick' ? '病気' : '私用'}</div>
          </div>
        );
      
      case 'vacation':
        return (
          <div className="text-sm text-[#778DA9] space-y-1">
            <div>期間: {formatDate(request.requestDetails.startDate)} 〜 {formatDate(request.requestDetails.endDate)}</div>
            <div>取得日数: {request.requestDetails.vacationDays}日</div>
          </div>
        );
      
      default:
        return null;
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
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">申請一覧</h1>
          <p className="text-[#778DA9]">勤怠に関する申請の状況を確認できます</p>
        </div>

        {/* アクションバー */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* フィルター */}
            <div className="flex space-x-4">
              <label className="text-[#0D1B2A] font-medium">表示:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                <option value="all">すべて</option>
                <option value="pending">承認待ち</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
              </select>
            </div>

            {/* 新規申請ボタン */}
            <Link
              href="/attendance/requests/new"
              className="bg-[#F4A261] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200"
            >
              新規申請
            </Link>
          </div>
        </div>

        {/* 申請リスト */}
        <div className="space-y-4">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="inline-block px-3 py-1 bg-[#415A77] text-white text-sm rounded-full font-medium">
                        {getTypeLabel(request.type)}
                      </span>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                      <span className="text-[#778DA9] text-sm">
                        {formatDate(request.date)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-[#0D1B2A] mb-2">申請理由</h3>
                      <p className="text-[#1B263B]">{request.reason}</p>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-[#0D1B2A] mb-2">詳細</h4>
                      {renderRequestDetails(request)}
                    </div>

                    {request.approverComment && (
                      <div className="mb-3">
                        <h4 className="font-medium text-[#0D1B2A] mb-2">承認者コメント</h4>
                        <p className="text-[#778DA9] text-sm">{request.approverComment}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right text-sm text-[#778DA9] space-y-1">
                    <div>申請日時: {formatDateTime(request.createdAt)}</div>
                    {request.approvedAt && (
                      <div>処理日時: {formatDateTime(request.approvedAt)}</div>
                    )}
                    <div className="pt-2">
                      {request.status === 'pending' && (
                        <button className="text-[#415A77] hover:text-[#2E4057] font-medium">
                          編集
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 border border-[#778DA9] text-center">
              <p className="text-[#778DA9] text-lg">該当する申請がありません</p>
            </div>
          )}
        </div>

        {/* 統計情報 */}
        {requests.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
            <h3 className="text-lg font-bold text-[#0D1B2A] mb-4">申請状況</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0D1B2A]">{requests.length}</div>
                <div className="text-[#778DA9] text-sm">総申請数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'pending').length}</div>
                <div className="text-[#778DA9] text-sm">承認待ち</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'approved').length}</div>
                <div className="text-[#778DA9] text-sm">承認済み</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === 'rejected').length}</div>
                <div className="text-[#778DA9] text-sm">却下</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}