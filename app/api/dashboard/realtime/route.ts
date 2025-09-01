import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Phase 1: リアルタイムモックデータを生成
    const now = new Date();
    const currentHour = now.getHours();
    
    // 時間帯に応じて出勤状況を調整
    let baseAttendanceRate = 85;
    let overtimeCount = 5;
    
    if (currentHour < 9) {
      baseAttendanceRate = 60; // 朝の時間帯
    } else if (currentHour >= 18) {
      baseAttendanceRate = 40; // 夕方以降
      overtimeCount = 15;
    }

    const totalEmployees = 156;
    const presentEmployees = Math.floor(totalEmployees * (baseAttendanceRate / 100));
    const absentEmployees = totalEmployees - presentEmployees - 6; // 6人は遅刻者
    
    const realtimeData = {
      timestamp: now.toISOString(),
      attendance: {
        totalEmployees,
        presentEmployees,
        absentEmployees,
        lateEmployees: 6,
        overtimeEmployees: overtimeCount,
        attendanceRate: (presentEmployees / totalEmployees * 100).toFixed(1)
      },
      departments: [
        {
          name: '第一工場',
          totalEmployees: 45,
          presentEmployees: Math.floor(45 * (baseAttendanceRate / 100)),
          attendanceRate: (Math.floor(45 * (baseAttendanceRate / 100)) / 45 * 100).toFixed(1),
          currentOvertimeCount: Math.floor(overtimeCount * 0.3)
        },
        {
          name: '第二工場',
          totalEmployees: 38,
          presentEmployees: Math.floor(38 * (baseAttendanceRate / 100)),
          attendanceRate: (Math.floor(38 * (baseAttendanceRate / 100)) / 38 * 100).toFixed(1),
          currentOvertimeCount: Math.floor(overtimeCount * 0.25)
        },
        {
          name: 'プレス部門',
          totalEmployees: 28,
          presentEmployees: Math.floor(28 * (baseAttendanceRate / 100)),
          attendanceRate: (Math.floor(28 * (baseAttendanceRate / 100)) / 28 * 100).toFixed(1),
          currentOvertimeCount: Math.floor(overtimeCount * 0.2)
        },
        {
          name: '溶接部門',
          totalEmployees: 32,
          presentEmployees: Math.floor(32 * (baseAttendanceRate / 100)),
          attendanceRate: (Math.floor(32 * (baseAttendanceRate / 100)) / 32 * 100).toFixed(1),
          currentOvertimeCount: Math.floor(overtimeCount * 0.15)
        },
        {
          name: '間接部門',
          totalEmployees: 13,
          presentEmployees: Math.floor(13 * (baseAttendanceRate / 100)),
          attendanceRate: (Math.floor(13 * (baseAttendanceRate / 100)) / 13 * 100).toFixed(1),
          currentOvertimeCount: Math.floor(overtimeCount * 0.1)
        }
      ],
      alerts: generateCurrentAlerts(),
      pendingApprovals: Math.floor(Math.random() * 15) + 5,
      systemStatus: {
        nfcReaders: {
          total: 12,
          online: 11,
          offline: 1
        },
        lastHeartbeat: now.toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: realtimeData
    });

  } catch (error) {
    console.error('Realtime dashboard error:', error);
    return NextResponse.json(
      { error: 'リアルタイムデータの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateCurrentAlerts() {
  const now = new Date();
  const alerts = [];

  // 時間帯に応じてアラートを生成
  const currentHour = now.getHours();
  
  if (currentHour >= 22 || currentHour < 6) {
    // 深夜帯のアラート
    alerts.push({
      id: `alert_night_${now.getTime()}`,
      type: 'overtime_limit',
      severity: 'high',
      message: '深夜労働者が10名を超えています',
      createdAt: now.toISOString()
    });
  }
  
  if (currentHour >= 9 && currentHour < 12) {
    // 朝の時間帯のアラート
    alerts.push({
      id: `alert_late_${now.getTime()}`,
      type: 'absence',
      severity: 'medium',
      message: '連絡なし欠勤者が3名います',
      createdAt: now.toISOString()
    });
  }
  
  if (currentHour >= 18) {
    // 夕方以降のアラート
    alerts.push({
      id: `alert_overtime_${now.getTime()}`,
      type: 'overtime_limit',
      severity: 'medium',
      message: '田中太郎の今月残業時間が80時間を超過',
      employeeName: '田中太郎',
      department: '第一工場',
      createdAt: now.toISOString()
    });
  }

  return alerts;
}