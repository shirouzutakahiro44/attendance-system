import { NextRequest, NextResponse } from 'next/server';
import { LaborOptimizer, OptimizationConfig } from '@/lib/labor-optimization';
import { DailyLaborGrid } from '@/types/shift-labor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grid, config }: { grid: DailyLaborGrid; config: OptimizationConfig } = body;

    // 入力検証
    if (!grid || !config) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    // 最適化実行
    const optimizer = new LaborOptimizer(config);
    const optimizedGrid = await optimizer.optimize(grid);

    return NextResponse.json({
      success: true,
      data: optimizedGrid,
      message: '最適化が完了しました'
    });

  } catch (error) {
    console.error('最適化処理でエラーが発生しました:', error);
    
    return NextResponse.json(
      { 
        error: '最適化処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

// デフォルト設定を取得
export async function GET() {
  try {
    const defaultConfig: OptimizationConfig = {
      algorithm: 'hybrid',
      objectives: {
        efficiency: 0.4,
        skillUtilization: 0.25,
        employeeSatisfaction: 0.15,
        costOptimization: 0.15,
        safetyCompliance: 0.05
      },
      parameters: {
        maxIterations: 1000,
        convergenceThreshold: 0.001,
        populationSize: 50,
        mutationRate: 0.1,
        timeLimit: 300
      },
      advanced: {
        enableFatigueModeling: true,
        enableSkillDecay: false,
        enableLearningCurve: true,
        enableSeasonalAdjustment: false
      }
    };

    return NextResponse.json({
      success: true,
      data: defaultConfig,
      message: 'デフォルト設定を取得しました'
    });

  } catch (error) {
    console.error('設定取得でエラーが発生しました:', error);
    
    return NextResponse.json(
      { 
        error: '設定取得中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}