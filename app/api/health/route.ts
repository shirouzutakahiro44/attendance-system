import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    // 環境変数のチェック
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      SESSION_PASSWORD: !!process.env.SESSION_PASSWORD,
    };
    
    // データベース接続テスト
    const dbConnection = await testDatabaseConnection();
    
    // すべての環境変数が設定されているかチェック
    const allEnvSet = Object.values(envCheck).every(val => val === true);
    
    return NextResponse.json({
      status: allEnvSet && dbConnection.success ? 'healthy' : 'unhealthy',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        variables: envCheck,
      },
      database: dbConnection,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}