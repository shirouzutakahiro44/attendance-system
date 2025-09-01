import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { yearMonth: string } }
) {
  try {
    const { yearMonth } = params;
    
    // 年月のバリデーション
    const yearMonthRegex = /^\d{4}-\d{2}$/;
    if (!yearMonthRegex.test(yearMonth)) {
      return NextResponse.json(
        { error: '年月の形式が正しくありません (YYYY-MM)' },
        { status: 400 }
      );
    }

    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Phase 1: モックデータを生成
    const dailyRecords = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      
      // 土日は休日
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dailyRecords.push({
          date: dateStr,
          status: 'holiday',
          workHours: 0,
          overtimeHours: 0,
          clockIn: null,
          clockOut: null
        });
        continue;
      }
      
      // 一部の日をランダムに欠勤・遅刻・残業に設定
      if (day === 5) {
        // 遅刻の日
        dailyRecords.push({
          date: dateStr,
          status: 'present',
          workHours: 8,
          overtimeHours: 0,
          clockIn: '09:15',
          clockOut: '17:30',
          isLate: true
        });
      } else if (day === 10) {
        // 欠勤の日
        dailyRecords.push({
          date: dateStr,
          status: 'absent',
          workHours: 0,
          overtimeHours: 0,
          clockIn: null,
          clockOut: null
        });
      } else if (day === 15) {
        // 残業の日
        dailyRecords.push({
          date: dateStr,
          status: 'present',
          workHours: 11,
          overtimeHours: 3,
          clockIn: '08:30',
          clockOut: '20:00'
        });
      } else {
        // 通常の勤務日
        dailyRecords.push({
          date: dateStr,
          status: 'present',
          workHours: 8,
          overtimeHours: 0,
          clockIn: '08:30',
          clockOut: '17:30'
        });
      }
    }

    // 月間集計を計算
    const workDays = dailyRecords.filter(day => day.status === 'present').length;
    const totalWorkHours = dailyRecords.reduce((sum, day) => sum + day.workHours, 0);
    const totalOvertimeHours = dailyRecords.reduce((sum, day) => sum + day.overtimeHours, 0);
    const lateDays = dailyRecords.filter(day => day.isLate).length;
    const absentDays = dailyRecords.filter(day => day.status === 'absent').length;

    const monthlyData = {
      yearMonth,
      workDays,
      totalWorkHours,
      totalOvertimeHours,
      totalNightWorkHours: Math.floor(totalOvertimeHours * 0.3), // 簡易計算
      lateDays,
      earlyLeaveDays: 0,
      absentDays,
      overtimeRate25Hours: Math.min(60, totalOvertimeHours),
      overtimeRate50Hours: Math.max(0, totalOvertimeHours - 60)
    };

    return NextResponse.json({
      success: true,
      data: {
        monthly: monthlyData,
        daily: dailyRecords
      }
    });

  } catch (error) {
    console.error('Monthly attendance error:', error);
    return NextResponse.json(
      { error: '月間勤怠データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}