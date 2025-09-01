import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // Phase 1: モックデータを返す
    // 実際のデータベースからの取得は後のフェーズで実装
    const today = new Date().toISOString().split('T')[0];
    
    const mockRecords = [
      {
        id: 'record_1',
        userId,
        type: 'clock-in',
        timestamp: `${today}T08:30:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: 'record_2',
        userId,
        type: 'break-start',
        timestamp: `${today}T12:00:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      },
      {
        id: 'record_3',
        userId,
        type: 'break-end',
        timestamp: `${today}T13:00:00.000Z`,
        location: '第一工場',
        device: 'web-browser'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockRecords,
      date: today
    });

  } catch (error) {
    console.error('Get today records error:', error);
    return NextResponse.json(
      { error: '記録の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}