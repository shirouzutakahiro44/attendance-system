import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E0E1DD]">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-[#0D1B2A] mb-6">
            勤怠管理システム
          </h1>
          <p className="text-xl text-[#1B263B] mb-4">
            Manufacturing Industry Attendance Management System
          </p>
          <p className="text-lg text-[#778DA9] max-w-2xl mx-auto">
            製造業に特化した包括的な勤怠管理システム。<br />
            NFC打刻、シフト管理、労働基準法準拠の時間計算に対応。
          </p>
        </div>

        {/* 機能概要 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md border border-[#778DA9]">
            <h3 className="text-xl font-semibold text-[#0D1B2A] mb-3">多様な打刻方法</h3>
            <p className="text-[#778DA9]">Web、モバイル、NFCカード対応で、工場の現場に最適化</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-[#778DA9]">
            <h3 className="text-xl font-semibold text-[#0D1B2A] mb-3">シフト管理</h3>
            <p className="text-[#778DA9]">24時間稼働対応、複数工場・部門での柔軟なシフト運用</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-[#778DA9]">
            <h3 className="text-xl font-semibold text-[#0D1B2A] mb-3">法令準拠</h3>
            <p className="text-[#778DA9]">労働基準法に準拠した残業計算、深夜労働管理</p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <Link 
              href="/attendance/clock" 
              className="block bg-[#F4A261] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#E8956A] transition-colors duration-200"
            >
              勤怠打刻
            </Link>
            <Link 
              href="/attendance/daily" 
              className="block bg-[#415A77] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#2E4057] transition-colors duration-200"
            >
              日次勤怠
            </Link>
            <Link 
              href="/attendance/monthly" 
              className="block bg-[#415A77] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#2E4057] transition-colors duration-200"
            >
              月次勤怠
            </Link>
            <Link 
              href="/shift-labor-integrated" 
              className="block bg-[#F4A261] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#E8956A] transition-colors duration-200"
            >
              📊 シフト・レイバー統合管理
            </Link>
            <Link 
              href="/qualifications/my" 
              className="block bg-[#415A77] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#2E4057] transition-colors duration-200"
            >
              保有資格・スキル
            </Link>
            <Link 
              href="/shifts-labor/labor-grid-new" 
              className="block bg-[#778DA9] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#5A6B7D] transition-colors duration-200"
            >
              旧レイバーグリッド
            </Link>
            <Link 
              href="/attendance/requests" 
              className="block bg-[#778DA9] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#5A6B7D] transition-colors duration-200"
            >
              申請・承認
            </Link>
            <Link 
              href="/admin/dashboard" 
              className="block bg-[#778DA9] text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-[#5A6B7D] transition-colors duration-200"
            >
              管理ダッシュボード
            </Link>
            <Link 
              href="/demo" 
              className="block bg-gray-500 text-white px-6 py-4 rounded-lg font-semibold text-center hover:bg-gray-600 transition-colors duration-200"
            >
              システムデモ
            </Link>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-16 text-[#778DA9]">
          <p>© 2024 Manufacturing Attendance Management System</p>
        </div>
      </div>
    </div>
  );
}