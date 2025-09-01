// 技能・資格管理の型定義

export interface Qualification {
  id: string;
  name: string;
  category: QualificationCategory;
  description: string;
  isRequired: boolean;
  validityPeriod: number; // 有効期間（年）
  renewalRequired: boolean;
  regulatoryBody: string; // 監督官庁
  createdAt: string;
  updatedAt: string;
}

export type QualificationCategory = 
  | 'safety' // 安全関連
  | 'technical' // 技術関連
  | 'equipment' // 設備関連
  | 'quality' // 品質関連
  | 'management' // 管理関連
  | 'other'; // その他

export interface UserQualification {
  id: string;
  userId: string;
  qualificationId: string;
  qualification?: Qualification;
  certificateNumber: string;
  obtainedDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  documentUrl?: string;
  status: QualificationStatus;
  createdAt: string;
  updatedAt: string;
}

export type QualificationStatus = 
  | 'active' // 有効
  | 'expired' // 期限切れ
  | 'expiring_soon' // 期限間近
  | 'suspended' // 停止中
  | 'pending_renewal'; // 更新手続き中

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  relatedQualifications: string[]; // 関連資格ID
  assessmentCriteria: SkillAssessmentCriteria[];
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory = 
  | 'press_operation' // プレス操作
  | 'welding' // 溶接
  | 'assembly' // 組立
  | 'quality_inspection' // 品質検査
  | 'equipment_maintenance' // 設備保全
  | 'material_handling' // 運搬作業
  | 'safety_management' // 安全管理
  | 'process_improvement' // 工程改善
  | 'leadership' // リーダーシップ
  | 'communication'; // コミュニケーション

export interface SkillAssessmentCriteria {
  level: SkillLevel;
  description: string;
  requirements: string[];
  timeToAchieve: number; // 習得目安時間（時間）
}

export type SkillLevel = 1 | 2 | 3 | 4 | 5; // 1:初心者 → 5:エキスパート

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skill?: Skill;
  currentLevel: SkillLevel;
  assessedAt: string;
  assessedBy: string;
  notes?: string;
  practiceHours: number; // 実践時間
  certificationDate?: string;
  nextAssessmentDate?: string;
  improvementPlan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillMatrix {
  department: string;
  skills: SkillMatrixEntry[];
  lastUpdated: string;
}

export interface SkillMatrixEntry {
  skillId: string;
  skillName: string;
  required: boolean;
  employees: EmployeeSkillLevel[];
  averageLevel: number;
  gapAnalysis: SkillGap;
}

export interface EmployeeSkillLevel {
  userId: string;
  userName: string;
  level: SkillLevel;
  hasQualification: boolean;
  lastAssessed: string;
}

export interface SkillGap {
  requiredLevel: SkillLevel;
  currentAverageLevel: number;
  gap: number;
  employeesNeedingImprovement: number;
  trainingRecommendations: string[];
}

// レイバー管理との連携用
export interface TaskSkillRequirement {
  taskId: string;
  taskName: string;
  requiredSkills: SkillRequirement[];
  optionalSkills: SkillRequirement[];
  minimumQualifications: string[];
  timeSlot: string; // 30分単位のタイムスロット
  duration: number; // 分単位
}

export interface SkillRequirement {
  skillId: string;
  skillName: string;
  minimumLevel: SkillLevel;
  weight: number; // 重要度（0-1）
  isCritical: boolean;
}

export interface EmployeeSkillProfile {
  userId: string;
  userName: string;
  department: string;
  skills: UserSkill[];
  qualifications: UserQualification[];
  totalSkillScore: number;
  specializations: SkillCategory[];
  availabilityScore: number; // 稼働可能性スコア
  efficiency: EmployeeEfficiency;
}

export interface EmployeeEfficiency {
  overall: number; // 総合効率性（0-1）
  bySkillCategory: Record<SkillCategory, number>;
  byTimeOfDay: Record<string, number>; // 時間帯別効率性
  fatigueFactor: number; // 疲労度（0-1）
  learningCurve: number; // 学習効果（0-1）
}

// アラート・通知用
export interface QualificationAlert {
  id: string;
  type: 'expiring' | 'expired' | 'missing_required' | 'renewal_reminder';
  severity: 'high' | 'medium' | 'low';
  userId: string;
  userName: string;
  qualificationId: string;
  qualificationName: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  message: string;
  actionRequired: string[];
  createdAt: string;
}

// 研修・教育管理
export interface TrainingPlan {
  id: string;
  userId: string;
  targetSkillId: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  estimatedHours: number;
  plannedStartDate: string;
  plannedEndDate: string;
  trainingMethods: TrainingMethod[];
  milestones: TrainingMilestone[];
  status: 'planned' | 'in_progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface TrainingMethod {
  type: ' ojt' | 'classroom' | 'online' | 'external_course' | 'certification_exam';
  description: string;
  duration: number; // 時間
  cost?: number;
  provider?: string;
}

export interface TrainingMilestone {
  id: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  assessmentScore?: number;
  notes?: string;
}