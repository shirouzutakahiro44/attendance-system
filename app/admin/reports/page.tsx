'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  period: string;
  totalWorkHours: number;
  totalOvertimeHours: number;
  attendanceRate: number;
  averageWorkHours: number;
  departments: DepartmentReport[];
  trends: TrendData[];
}

interface DepartmentReport {
  name: string;
  workHours: number;
  overtimeHours: number;
  attendanceRate: number;
  efficiency: number;
  employeeCount: number;
}

interface TrendData {
  date: string;
  workHours: number;
  overtimeHours: number;
  attendanceRate: number;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [reportType, selectedPeriod]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Phase 1: モックデータを生成
      const mockData: ReportData = {
        period: selectedPeriod,
        totalWorkHours: 3240,
        totalOvertimeHours: 285,
        attendanceRate: 94.2,
        averageWorkHours: 8.1,
        departments: [
          {
            name: '第一工場',
            workHours: 965,
            overtimeHours: 78,
            attendanceRate: 95.1,
            efficiency: 92.3,
            employeeCount: 45
          },
          {
            name: '第二工場',
            workHours: 832,
            overtimeHours: 65,
            attendanceRate: 93.8,
            efficiency: 88.7,
            employeeCount: 38
          },
          {
            name: 'プレス部門',
            workHours: 678,
            overtimeHours: 89,
            attendanceRate: 96.2,
            efficiency: 94.1,
            employeeCount: 28
          },
          {
            name: '溶接部門',
            workHours: 724,
            overtimeHours: 102,
            attendanceRate: 92.5,
            efficiency: 90.8,
            employeeCount: 32
          },
          {
            name: '間接部門',
            workHours: 341,
            overtimeHours: 31,
            attendanceRate: 88.9,
            efficiency: 85.2,
            employeeCount: 13
          }
        ],
        trends: generateTrendData()
      };

      setReportData(mockData);
    } catch (error) {
      console.error('レポートデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (): TrendData[] => {
    const trends: TrendData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        workHours: 1200 + Math.random() * 400,
        overtimeHours: 50 + Math.random() * 100,
        attendanceRate: 85 + Math.random() * 15
      });
    }
    
    return trends;
  };

  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        format,
        type: reportType,
        period: selectedPeriod
      });

      window.open(`/api/admin/reports/export?${params.toString()}`, '_blank');
    } catch (error) {
      console.error('レポートエクスポートに失敗しました:', error);
    }
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
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
          <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">レポート・分析</h1>
          <p className="text-[#778DA9]">勤怠データの分析とレポート生成</p>
        </div>

        {/* 設定パネル */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">レポート種別</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              >
                <option value="daily">日次レポート</option>
                <option value="weekly">週次レポート</option>
                <option value="monthly">月次レポート</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">対象期間</label>
              <input
                type={reportType === 'monthly' ? 'month' : 'date'}
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-[#778DA9] rounded focus:outline-none focus:border-[#415A77]"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={() => exportReport('csv')}
                className="px-4 py-2 bg-[#415A77] text-white rounded hover:bg-[#2E4057] transition-colors duration-200"
              >
                CSV
              </button>
              <button
                onClick={() => exportReport('excel')}
                className="px-4 py-2 bg-[#778DA9] text-white rounded hover:bg-[#5A6B7D] transition-colors duration-200"
              >
                Excel
              </button>
              <button
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-[#F4A261] text-white rounded hover:bg-[#E8956A] transition-colors duration-200"
              >
                PDF
              </button>
            </div>
          </div>
        </div>

        {reportData && (
          <>
            {/* サマリー統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0D1B2A]">{formatHours(reportData.totalWorkHours)}</div>
                  <div className="text-[#778DA9]">総労働時間</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F4A261]">{formatHours(reportData.totalOvertimeHours)}</div>
                  <div className="text-[#778DA9]">総残業時間</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#415A77]">{reportData.attendanceRate.toFixed(1)}%</div>
                  <div className="text-[#778DA9]">出勤率</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0D1B2A]">{formatHours(reportData.averageWorkHours)}</div>
                  <div className="text-[#778DA9]">平均労働時間</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* 部署別分析 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">部署別分析</h2>
                <div className="space-y-4">
                  {reportData.departments.map((dept) => (
                    <div key={dept.name} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-[#0D1B2A]">{dept.name}</h3>
                        <span className="text-[#415A77] font-bold">
                          効率性: {dept.efficiency.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#778DA9]">労働時間: </span>
                          <span className="font-medium">{formatHours(dept.workHours)}</span>
                        </div>
                        <div>
                          <span className="text-[#778DA9]">残業時間: </span>
                          <span className="font-medium text-orange-600">{formatHours(dept.overtimeHours)}</span>
                        </div>
                        <div>
                          <span className="text-[#778DA9]">出勤率: </span>
                          <span className="font-medium">{dept.attendanceRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-[#778DA9]">従業員数: </span>
                          <span className="font-medium">{dept.employeeCount}人</span>
                        </div>
                      </div>

                      {/* 効率性バー */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#415A77] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${dept.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* トレンド分析 */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
                <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">30日間のトレンド</h2>
                
                {/* 簡易チャート（SVGベース） */}
                <div className="space-y-6">
                  {/* 出勤率トレンド */}
                  <div>
                    <h3 className="font-medium text-[#0D1B2A] mb-3">出勤率推移</h3>
                    <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                      {reportData.trends.slice(-7).map((trend, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div 
                            className="bg-[#415A77] rounded-t"
                            style={{ 
                              height: `${trend.attendanceRate}px`,
                              width: '20px'
                            }}
                          ></div>
                          <div className="text-xs text-[#778DA9] transform rotate-45">
                            {new Date(trend.date).getDate()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 残業時間トレンド */}
                  <div>
                    <h3 className="font-medium text-[#0D1B2A] mb-3">残業時間推移</h3>
                    <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                      {reportData.trends.slice(-7).map((trend, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div 
                            className="bg-[#F4A261] rounded-t"
                            style={{ 
                              height: `${trend.overtimeHours}px`,
                              width: '20px'
                            }}
                          ></div>
                          <div className="text-xs text-[#778DA9] transform rotate-45">
                            {new Date(trend.date).getDate()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 統計サマリー */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-[#0D1B2A] mb-3">期間統計</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#778DA9]">最高出勤率: </span>
                      <span className="font-medium text-green-600">
                        {Math.max(...reportData.trends.map(t => t.attendanceRate)).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[#778DA9]">最低出勤率: </span>
                      <span className="font-medium text-red-600">
                        {Math.min(...reportData.trends.map(t => t.attendanceRate)).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[#778DA9]">最大残業時間: </span>
                      <span className="font-medium text-orange-600">
                        {formatHours(Math.max(...reportData.trends.map(t => t.overtimeHours)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#778DA9]">平均残業時間: </span>
                      <span className="font-medium">
                        {formatHours(reportData.trends.reduce((sum, t) => sum + t.overtimeHours, 0) / reportData.trends.length)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細データテーブル */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-[#778DA9]">
              <h2 className="text-xl font-bold text-[#0D1B2A] mb-6">詳細データ</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-[#0D1B2A]">部署</th>
                      <th className="text-right py-3 px-4 font-medium text-[#0D1B2A]">従業員数</th>
                      <th className="text-right py-3 px-4 font-medium text-[#0D1B2A]">労働時間</th>
                      <th className="text-right py-3 px-4 font-medium text-[#0D1B2A]">残業時間</th>
                      <th className="text-right py-3 px-4 font-medium text-[#0D1B2A]">出勤率</th>
                      <th className="text-right py-3 px-4 font-medium text-[#0D1B2A]">効率性</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.departments.map((dept) => (
                      <tr key={dept.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#0D1B2A]">{dept.name}</td>
                        <td className="py-3 px-4 text-right">{dept.employeeCount}人</td>
                        <td className="py-3 px-4 text-right">{formatHours(dept.workHours)}</td>
                        <td className="py-3 px-4 text-right text-orange-600">{formatHours(dept.overtimeHours)}</td>
                        <td className="py-3 px-4 text-right">{dept.attendanceRate.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            dept.efficiency >= 90 ? 'text-green-600' : 
                            dept.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {dept.efficiency.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 font-semibold">
                      <td className="py-3 px-4 text-[#0D1B2A]">合計</td>
                      <td className="py-3 px-4 text-right text-[#0D1B2A]">
                        {reportData.departments.reduce((sum, d) => sum + d.employeeCount, 0)}人
                      </td>
                      <td className="py-3 px-4 text-right text-[#0D1B2A]">{formatHours(reportData.totalWorkHours)}</td>
                      <td className="py-3 px-4 text-right text-orange-600">{formatHours(reportData.totalOvertimeHours)}</td>
                      <td className="py-3 px-4 text-right text-[#0D1B2A]">{reportData.attendanceRate.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-[#0D1B2A]">
                        {(reportData.departments.reduce((sum, d) => sum + d.efficiency, 0) / reportData.departments.length).toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}