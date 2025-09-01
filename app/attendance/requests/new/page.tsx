'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RequestType = 'correction' | 'overtime' | 'leave' | 'vacation';

interface CorrectionRequest {
  date: string;
  originalClockIn?: string;
  requestedClockIn: string;
  originalClockOut?: string;
  requestedClockOut: string;
  reason: string;
}

interface OvertimeRequest {
  date: string;
  plannedStart: string;
  plannedEnd: string;
  estimatedHours: number;
  reason: string;
}

interface LeaveRequest {
  startDate: string;
  endDate: string;
  leaveType: 'sick' | 'personal' | 'family';
  reason: string;
}

interface VacationRequest {
  startDate: string;
  endDate: string;
  reason: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [requestType, setRequestType] = useState<RequestType>('correction');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // フォームデータ
  const [correctionData, setCorrectionData] = useState<CorrectionRequest>({
    date: new Date().toISOString().split('T')[0],
    requestedClockIn: '08:30',
    requestedClockOut: '17:30',
    reason: ''
  });

  const [overtimeData, setOvertimeData] = useState<OvertimeRequest>({
    date: new Date().toISOString().split('T')[0],
    plannedStart: '17:30',
    plannedEnd: '20:00',
    estimatedHours: 2.5,
    reason: ''
  });

  const [leaveData, setLeaveData] = useState<LeaveRequest>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    leaveType: 'sick',
    reason: ''
  });

  const [vacationData, setVacationData] = useState<VacationRequest>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const calculateOvertimeHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    const diffMs = endTime.getTime() - startTime.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const handleOvertimeTimeChange = (field: 'plannedStart' | 'plannedEnd', value: string) => {
    const newData = { ...overtimeData, [field]: value };
    newData.estimatedHours = calculateOvertimeHours(newData.plannedStart, newData.plannedEnd);
    setOvertimeData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Phase 1: 仮の処理（実際のAPI送信は後のフェーズで実装）
      const requestData = {
        type: requestType,
        data: (() => {
          switch (requestType) {
            case 'correction': return correctionData;
            case 'overtime': return overtimeData;
            case 'leave': return leaveData;
            case 'vacation': return vacationData;
          }
        })(),
        timestamp: new Date().toISOString()
      };

      console.log('申請データ:', requestData);

      // 成功メッセージ
      setMessage('申請が送信されました。承認をお待ちください。');
      
      // 2秒後に申請一覧へリダイレクト
      setTimeout(() => {
        router.push('/attendance/requests');
      }, 2000);

    } catch (error) {
      setMessage('申請の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormContent = () => {
    switch (requestType) {
      case 'correction':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="correction-date" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                対象日付 *
              </label>
              <input
                id="correction-date"
                type="date"
                value={correctionData.date}
                onChange={(e) => setCorrectionData({...correctionData, date: e.target.value})}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="correction-clock-in" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  出勤時刻 *
                </label>
                <input
                  id="correction-clock-in"
                  type="time"
                  value={correctionData.requestedClockIn}
                  onChange={(e) => setCorrectionData({...correctionData, requestedClockIn: e.target.value})}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>

              <div>
                <label htmlFor="correction-clock-out" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  退勤時刻 *
                </label>
                <input
                  id="correction-clock-out"
                  type="time"
                  value={correctionData.requestedClockOut}
                  onChange={(e) => setCorrectionData({...correctionData, requestedClockOut: e.target.value})}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="correction-reason" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                修正理由 *
              </label>
              <textarea
                id="correction-reason"
                value={correctionData.reason}
                onChange={(e) => setCorrectionData({...correctionData, reason: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                placeholder="打刻忘れの理由や状況を詳しく記入してください"
                required
              />
            </div>
          </div>
        );

      case 'overtime':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="overtime-date" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                対象日付 *
              </label>
              <input
                id="overtime-date"
                type="date"
                value={overtimeData.date}
                onChange={(e) => setOvertimeData({...overtimeData, date: e.target.value})}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="overtime-start" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  残業開始時刻 *
                </label>
                <input
                  id="overtime-start"
                  type="time"
                  value={overtimeData.plannedStart}
                  onChange={(e) => handleOvertimeTimeChange('plannedStart', e.target.value)}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>

              <div>
                <label htmlFor="overtime-end" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  残業終了予定時刻 *
                </label>
                <input
                  id="overtime-end"
                  type="time"
                  value={overtimeData.plannedEnd}
                  onChange={(e) => handleOvertimeTimeChange('plannedEnd', e.target.value)}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">
                予定残業時間
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-[#778DA9] rounded-lg">
                <span className="text-[#415A77] font-bold text-lg">
                  {overtimeData.estimatedHours.toFixed(1)}時間
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="overtime-reason" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                残業理由 *
              </label>
              <textarea
                id="overtime-reason"
                value={overtimeData.reason}
                onChange={(e) => setOvertimeData({...overtimeData, reason: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                placeholder="残業が必要な理由や作業内容を記入してください"
                required
              />
            </div>
          </div>
        );

      case 'leave':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="leave-start" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  開始日 *
                </label>
                <input
                  id="leave-start"
                  type="date"
                  value={leaveData.startDate}
                  onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>

              <div>
                <label htmlFor="leave-end" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  終了日 *
                </label>
                <input
                  id="leave-end"
                  type="date"
                  value={leaveData.endDate}
                  onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="leave-type" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                欠勤種別 *
              </label>
              <select
                id="leave-type"
                value={leaveData.leaveType}
                onChange={(e) => setLeaveData({...leaveData, leaveType: e.target.value as any})}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                required
              >
                <option value="sick">病気</option>
                <option value="personal">私用</option>
                <option value="family">家族の事情</option>
              </select>
            </div>

            <div>
              <label htmlFor="leave-reason" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                欠勤理由 *
              </label>
              <textarea
                id="leave-reason"
                value={leaveData.reason}
                onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                placeholder="欠勤の理由を記入してください"
                required
              />
            </div>
          </div>
        );

      case 'vacation':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vacation-start" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  開始日 *
                </label>
                <input
                  id="vacation-start"
                  type="date"
                  value={vacationData.startDate}
                  onChange={(e) => setVacationData({...vacationData, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>

              <div>
                <label htmlFor="vacation-end" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                  終了日 *
                </label>
                <input
                  id="vacation-end"
                  type="date"
                  value={vacationData.endDate}
                  onChange={(e) => setVacationData({...vacationData, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="vacation-reason" className="block text-sm font-medium text-[#0D1B2A] mb-2">
                取得理由
              </label>
              <textarea
                id="vacation-reason"
                value={vacationData.reason}
                onChange={(e) => setVacationData({...vacationData, reason: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-[#778DA9] rounded-lg focus:outline-none focus:border-[#415A77]"
                placeholder="有給休暇を取得する理由（任意）"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#E0E1DD]">
      <div className="max-w-4xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">新規申請</h1>
          <p className="text-[#778DA9]">勤怠に関する申請を行います</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
            {/* 申請タイプ選択 */}
            <div className="mb-8">
              <label className="block text-lg font-medium text-[#0D1B2A] mb-4">
                申請タイプ *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'correction', label: '勤怠修正', desc: '打刻の修正' },
                  { value: 'overtime', label: '残業申請', desc: '残業の事前申請' },
                  { value: 'leave', label: '欠勤届', desc: '欠勤の届出' },
                  { value: 'vacation', label: '有給申請', desc: '有給休暇の申請' }
                ].map((type) => (
                  <div key={type.value}>
                    <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                      requestType === type.value 
                        ? 'border-[#415A77] bg-[#415A77] text-white' 
                        : 'border-[#778DA9] bg-white text-[#0D1B2A] hover:border-[#415A77]'
                    }`}>
                      <input
                        type="radio"
                        name="requestType"
                        value={type.value}
                        checked={requestType === type.value}
                        onChange={(e) => setRequestType(e.target.value as RequestType)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-sm mt-1 opacity-80">{type.desc}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* フォーム内容 */}
            {renderFormContent()}

            {/* メッセージ */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg ${
                message.includes('失敗') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#F4A261] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#E8956A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '申請を送信'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-[#778DA9] text-white rounded-lg font-semibold hover:bg-[#5A6B7D] transition-colors duration-200"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}