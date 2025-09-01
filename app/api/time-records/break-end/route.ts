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
      type: 'break-end',
      timestamp: now.toISOString(),
      location: location || '未指定',
      device: device || 'unknown',
      createdAt: now.toISOString()
    };

    return NextResponse.json({
      success: true,
      message: '休憩終了が記録されました',
      data: timeRecord
    });

  } catch (error) {
    console.error('Break-end error:', error);
    return NextResponse.json(
      { error: '打刻処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}