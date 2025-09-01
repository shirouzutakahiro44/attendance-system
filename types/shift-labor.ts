// シフト・レイバー統合管理の型定義

export interface ShiftPattern {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  breakPeriods: BreakPeriod[];
  isNightShift: boolean;
  category: 'day' | 'night' | 'early' | 'late' | 'custom';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BreakPeriod {
  startTime: string;
  duration: number; // 分単位
  type: 'lunch' | 'rest' | 'maintenance';
  isRequired: boolean;
}

// 30分刻みのタイムスロット
export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  duration: number;  // 分単位（通常30分）
  date: string;      // YYYY-MM-DD format
}

// レイバー（作業配置）
export interface LaborAssignment {
  id: string;
  timeSlot: TimeSlot;
  employeeId: string;
  taskId: string;
  department: string;
  location: string;
  status: LaborStatus;
  efficiency: number; // 0-1 効率性スコア
  skillMatch: number; // 0-1 スキル適合度
  assignedBy: string;
  assignedAt: string;
  completedAt?: string;
  actualEfficiency?: number;
  notes?: string;
}

export type LaborStatus = 
  | 'planned'    // 計画済み
  | 'assigned'   // 割当済み
  | 'in_progress' // 実行中
  | 'completed'  // 完了
  | 'cancelled'  // キャンセル
  | 'delayed';   // 遅延

// 作業タスク定義
export interface LaborTask {
  id: string;
  name: string;
  category: TaskCategory;
  description: string;
  estimatedDuration: number; // 分単位
  requiredSkills: TaskSkillRequirement[];
  requiredQualifications: string[];
  department: string;
  location: string;
  isHazardous: boolean; // 危険作業
  maxContinuousHours: number; // 連続作業可能時間
  restRequiredAfter: number; // 作業後必要休憩時間（分）
  equipmentRequired: string[];
  priority: TaskPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskCategory = 
  | 'setup_preparation'    // 開始準備
  | 'manufacturing'        // 製造作業
  | 'quality_inspection'   // 品質検査
  | 'equipment_maintenance' // 設備保全
  | 'material_handling'    // 運搬作業
  | 'cleaning_organizing'  // 清掃・整理整頓
  | 'break_time'          // 休憩時間
  | 'closing_preparation'; // 終了準備

export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskSkillRequirement {
  skillId: string;
  skillName: string;
  minimumLevel: number; // 1-5
  weight: number; // 重要度 0-1
  isCritical: boolean;
}

// シフト割当
export interface ShiftAssignment {
  id: string;
  userId: string;
  date: string;
  shiftPatternId: string;
  department: string;
  status: ShiftStatus;
  laborAssignments: LaborAssignment[];
  plannedWorkHours: number;
  actualWorkHours?: number;
  plannedBreakTime: number;
  actualBreakTime?: number;
  notes?: string;
  assignedBy: string;
  assignedAt: string;
  confirmedAt?: string;
}

export type ShiftStatus = 
  | 'draft'      // 下書き
  | 'planned'    // 計画済み
  | 'confirmed'  // 確定
  | 'in_progress' // 実行中
  | 'completed'  // 完了
  | 'cancelled'; // キャンセル

// 統合管理用のデイリーグリッド
export interface DailyLaborGrid {
  date: string;
  department: string;
  timeSlots: TimeSlot[];
  assignments: LaborGridAssignment[];
  employees: EmployeeAvailability[];
  tasks: LaborTask[];
  constraints: LaborConstraint[];
  optimization: OptimizationResult;
}

export interface LaborGridAssignment {
  timeSlotId: string;
  employeeId: string;
  taskId: string;
  efficiency: number;
  skillMatch: number;
  isOptimal: boolean;
  conflicts: any[];
}

export interface EmployeeAvailability {
  userId: string;
  userName: string;
  shiftPattern?: ShiftPattern;
  skills: EmployeeSkillSummary[];
  qualifications: string[];
  currentFatigue: number; // 0-1 疲労度
  maxContinuousWork: number; // 連続作業可能時間（分）
  preferredTasks: string[];
  unavailableSlots: string[];
  efficiencyByTimeOfDay: Record<string, number>;
}

export interface EmployeeSkillSummary {
  skillId: string;
  skillName: string;
  category: string;
  level: number;
  practiceHours: number;
  efficiency: number;
}

// 制約条件
export interface LaborConstraint {
  id: string;
  type: ConstraintType;
  description: string;
  parameters: Record<string, any>;
  severity: 'hard' | 'soft'; // ハード制約/ソフト制約
  isActive: boolean;
}

export type ConstraintType = 
  | 'skill_requirement'     // スキル要件
  | 'qualification_requirement' // 資格要件
  | 'max_continuous_work'   // 連続作業時間制限
  | 'minimum_rest'         // 最低休憩時間
  | 'equipment_availability' // 設備稼働状況
  | 'employee_preference'   // 従業員希望
  | 'safety_regulation'    // 安全規制
  | 'labor_law_compliance'; // 労働法準拠

// 最適化結果
export interface OptimizationResult {
  totalEfficiency: number; // 0-1 総合効率性
  skillUtilization: number; // 0-1 スキル活用率
  constraintViolations: ConstraintViolation[];
  improvements: OptimizationSuggestion[];
  calculatedAt: string;
  algorithm: string;
  parameters: Record<string, any>;
}

export interface ConstraintViolation {
  constraintId: string;
  severity: 'hard' | 'soft';
  description: string;
  affectedAssignments: string[];
  suggestedFix: string;
}

export interface OptimizationSuggestion {
  type: 'swap_assignment' | 'add_break' | 'change_task' | 'skill_training';
  description: string;
  expectedImprovement: number; // 効率性向上予測値
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

// レイバー統計・分析
export interface LaborAnalytics {
  period: string;
  department: string;
  metrics: LaborMetrics;
  trends: LaborTrend[];
  skillGaps: SkillGapAnalysis[];
  recommendations: AnalyticsRecommendation[];
}

export interface LaborMetrics {
  totalAssignments: number;
  averageEfficiency: number;
  skillUtilizationRate: number;
  taskCompletionRate: number;
  overtimeRate: number;
  safetyIncidents: number;
  employeeSatisfaction: number;
}

export interface LaborTrend {
  date: string;
  efficiency: number;
  skillUtilization: number;
  taskCompletion: number;
  employeeCount: number;
}

export interface SkillGapAnalysis {
  skillId: string;
  skillName: string;
  requiredLevel: number;
  currentAverageLevel: number;
  gap: number;
  employeesAffected: number;
  impactOnEfficiency: number;
  trainingRecommendation: string;
}

export interface AnalyticsRecommendation {
  id: string;
  type: 'skill_development' | 'process_improvement' | 'resource_allocation' | 'safety_enhancement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedBenefit: string;
  estimatedCost: number;
  implementationTime: number; // 日数
  dependencies: string[];
}

// PDF出力用の詳細データ
export interface DetailedAttendanceRecord {
  // 基本情報
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  
  // 時刻情報（PDF準拠）
  scheduledClockIn: string;
  actualClockIn: string;
  scheduledClockOut: string;
  actualClockOut: string;
  
  // 休憩・作業時間（30分刻み）
  breakPeriods: DetailedBreakPeriod[];
  workPeriods: DetailedWorkPeriod[];
  
  // 計算結果
  scheduledWorkHours: number;
  actualWorkHours: number;
  breakTime: number;
  overtimeHours: number;
  nightWorkHours: number;
  holidayWorkHours: number;
  
  // ステータス
  isLate: boolean;
  lateMinutes: number;
  isEarlyLeave: boolean;
  earlyLeaveMinutes: number;
  
  // 割増計算
  regularHours: number;
  overtimeRate25Hours: number;
  overtimeRate50Hours: number;
  nightWorkRate: number;
  holidayRate: number;
  
  // レイバー情報
  assignedTasks: string[];
  skillsUsed: string[];
  efficiency: number;
  
  // 承認情報
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  corrections?: AttendanceCorrection[];
}

export interface DetailedBreakPeriod {
  startTime: string;
  endTime: string;
  duration: number; // 分
  type: 'lunch' | 'rest' | 'maintenance';
  location: string;
}

export interface DetailedWorkPeriod {
  startTime: string;
  endTime: string;
  duration: number; // 分
  taskId: string;
  taskName: string;
  location: string;
  efficiency: number;
  skillsUsed: string[];
}

export interface AttendanceCorrection {
  id: string;
  field: string;
  originalValue: string;
  correctedValue: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}