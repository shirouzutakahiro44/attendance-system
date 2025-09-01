import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, location, device } = body;

    // バリデーション
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 現在時刻を取得
    const now = new Date();
    
    // 打刻記録を作成
    const timeRecord = {
      id: `record_${now.getTime()}`,
      userId,
      type: 'clock-out',
      timestamp: now.toISOString(),
      location: location || '未指定',
      device: device || 'unknown',
      createdAt: now.toISOString()
    };

    return NextResponse.json({
      success: true,
      message: '退勤打刻が完了しました',
      data: timeRecord
    });

  } catch (error) {
    console.error('Clock-out error:', error);
    return NextResponse.json(
      { error: '打刻処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}