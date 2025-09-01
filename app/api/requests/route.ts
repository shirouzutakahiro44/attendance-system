import { NextRequest, NextResponse } from 'next/server';

// GET: 申請一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId') || 'current-user';

    // Phase 1: モックデータを返す
    let mockRequests = [
      {
        id: 'req_001',
        userId,
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
        userId,
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
        userId,
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
        userId,
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

    // ステータスでフィルタリング
    if (status && status !== 'all') {
      mockRequests = mockRequests.filter(req => req.status === status);
    }

    return NextResponse.json({
      success: true,
      data: mockRequests
    });

  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json(
      { error: '申請データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: 新規申請作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, reason } = body;

    // バリデーション
    if (!type || !data) {
      return NextResponse.json(
        { error: '申請タイプとデータが必要です' },
        { status: 400 }
      );
    }

    const validTypes = ['correction', 'overtime', 'leave', 'vacation'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '無効な申請タイプです' },
        { status: 400 }
      );
    }

    // 新しい申請を作成
    const newRequest = {
      id: `req_${Date.now()}`,
      userId: 'current-user',
      type,
      date: data.date || data.startDate,
      status: 'pending',
      reason: reason || data.reason,
      requestDetails: data,
      createdAt: new Date().toISOString()
    };

    // Phase 1: ローカル処理のみ
    console.log('新規申請:', newRequest);

    return NextResponse.json({
      success: true,
      message: '申請が送信されました',
      data: newRequest
    });

  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: '申請の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}