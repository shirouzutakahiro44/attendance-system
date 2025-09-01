import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');

    // バリデーション
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '開始日と終了日が必要です' },
        { status: 400 }
      );
    }

    // Phase 1: モックデータを生成
    const mockData = generateMockAttendanceData(startDate, endDate, department);

    if (format === 'csv') {
      const csvContent = generateCSV(mockData);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="attendance_${startDate}_${endDate}.csv"`
        }
      });
    } else if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: mockData,
        period: { startDate, endDate },
        exportedAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: 'サポートされていないフォーマットです' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'エクスポート処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateMockAttendanceData(startDate: string, endDate: string, department?: string | null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];

  // モック従業員データ
  const employees = [
    { id: 'emp_001', name: '田中太郎', department: '第一工場', position: '作業員' },
    { id: 'emp_002', name: '佐藤花子', department: 'プレス部門', position: '班長' },
    { id: 'emp_003', name: '鈴木次郎', department: '溶接部門', position: '作業員' },
    { id: 'emp_004', name: '山田美咲', department: '間接部門', position: '事務員' },
    { id: 'emp_005', name: '高橋一郎', department: '第二工場', position: '主任' }
  ];

  // 部門フィルタリング
  const filteredEmployees = department 
    ? employees.filter(emp => emp.department === department)
    : employees;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    
    // 土日はスキップ
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    filteredEmployees.forEach((employee, index) => {
      // ランダムに欠勤・遅刻を設定
      const isAbsent = Math.random() < 0.05; // 5%の確率で欠勤
      const isLate = Math.random() < 0.1; // 10%の確率で遅刻
      const hasOvertime = Math.random() < 0.2; // 20%の確率で残業

      if (isAbsent) {
        data.push({
          date: dateStr,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          clockIn: null,
          clockOut: null,
          workHours: 0,
          breakTime: 1,
          overtimeHours: 0,
          nightWorkHours: 0,
          status: '欠勤',
          lateMinutes: 0,
          earlyLeaveMinutes: 0
        });
      } else {
        const baseClockIn = isLate ? '09:15' : '08:30';
        const baseClockOut = hasOvertime ? '20:00' : '17:30';
        const workHours = hasOvertime ? 10.5 : 8;
        const overtimeHours = hasOvertime ? 2.5 : 0;
        const lateMinutes = isLate ? 45 : 0;

        data.push({
          date: dateStr,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          clockIn: baseClockIn,
          clockOut: baseClockOut,
          workHours,
          breakTime: 1,
          overtimeHours,
          nightWorkHours: hasOvertime ? 0.5 : 0,
          status: isLate ? '遅刻' : '出勤',
          lateMinutes,
          earlyLeaveMinutes: 0
        });
      }
    });
  }

  return data;
}

function generateCSV(data: any[]): string {
  const headers = [
    '日付',
    '従業員ID',
    '従業員名',
    '部署',
    '役職',
    '出勤時刻',
    '退勤時刻',
    '労働時間',
    '休憩時間',
    '残業時間',
    '深夜労働時間',
    'ステータス',
    '遅刻分',
    '早退分'
  ];

  let csvContent = '\ufeff'; // BOM for UTF-8
  csvContent += headers.join(',') + '\n';

  data.forEach(row => {
    const csvRow = [
      row.date,
      row.employeeId,
      `"${row.employeeName}"`,
      `"${row.department}"`,
      `"${row.position}"`,
      row.clockIn || '',
      row.clockOut || '',
      row.workHours,
      row.breakTime,
      row.overtimeHours,
      row.nightWorkHours,
      `"${row.status}"`,
      row.lateMinutes,
      row.earlyLeaveMinutes
    ];
    csvContent += csvRow.join(',') + '\n';
  });

  return csvContent;
}