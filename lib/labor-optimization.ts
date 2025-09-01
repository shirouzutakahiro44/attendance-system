// スキルベースレイバー配置最適化ロジック

import {
  DailyLaborGrid,
  LaborGridAssignment,
  EmployeeAvailability,
  LaborTask,
  LaborConstraint,
  OptimizationResult,
  ConstraintViolation,
  OptimizationSuggestion,
  TimeSlot
} from '@/types/shift-labor';

export interface OptimizationConfig {
  algorithm: 'greedy' | 'genetic' | 'simulated_annealing' | 'hybrid';
  objectives: {
    efficiency: number;
    skillUtilization: number;
    employeeSatisfaction: number;
    costOptimization: number;
    safetyCompliance: number;
  };
  parameters: {
    maxIterations: number;
    convergenceThreshold: number;
    populationSize: number;
    mutationRate: number;
    timeLimit: number;
  };
  advanced: {
    enableFatigueModeling: boolean;
    enableSkillDecay: boolean;
    enableLearningCurve: boolean;
    enableSeasonalAdjustment: boolean;
  };
}

export class LaborOptimizer {
  private config: OptimizationConfig;

  constructor(config: OptimizationConfig) {
    this.config = config;
  }

  /**
   * メイン最適化実行関数
   */
  async optimize(grid: DailyLaborGrid): Promise<DailyLaborGrid> {
    const startTime = Date.now();
    
    let optimizedGrid = { ...grid };
    let bestScore = this.evaluateGrid(optimizedGrid);
    
    switch (this.config.algorithm) {
      case 'greedy':
        optimizedGrid = this.greedyOptimization(optimizedGrid);
        break;
      case 'genetic':
        optimizedGrid = await this.geneticAlgorithm(optimizedGrid);
        break;
      case 'simulated_annealing':
        optimizedGrid = this.simulatedAnnealing(optimizedGrid);
        break;
      case 'hybrid':
        optimizedGrid = await this.hybridOptimization(optimizedGrid);
        break;
    }

    // 最適化結果の評価
    const finalScore = this.evaluateGrid(optimizedGrid);
    const violations = this.checkConstraintViolations(optimizedGrid);
    const suggestions = this.generateSuggestions(optimizedGrid);

    optimizedGrid.optimization = {
      totalEfficiency: finalScore.efficiency,
      skillUtilization: finalScore.skillUtilization,
      constraintViolations: violations,
      improvements: suggestions,
      calculatedAt: new Date().toISOString(),
      algorithm: this.config.algorithm + '_optimization_v2',
      parameters: this.config.parameters
    };

    return optimizedGrid;
  }

  /**
   * 貪欲法による最適化
   */
  private greedyOptimization(grid: DailyLaborGrid): DailyLaborGrid {
    const optimizedGrid = { ...grid };
    const newAssignments: LaborGridAssignment[] = [];

    // 各タイムスロットについて
    for (const timeSlot of grid.timeSlots) {
      const availableEmployees = this.getAvailableEmployees(grid.employees, timeSlot, newAssignments);
      const requiredTasks = this.getRequiredTasks(grid.tasks, timeSlot);

      // タスクを優先度順でソート
      const sortedTasks = requiredTasks.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });

      // 各タスクに最適な従業員を割り当て
      for (const task of sortedTasks) {
        const bestEmployee = this.findBestEmployeeForTask(availableEmployees, task, timeSlot);
        
        if (bestEmployee) {
          const assignment = this.createAssignment(timeSlot.id, bestEmployee.userId, task.id, bestEmployee, task, timeSlot);
          newAssignments.push(assignment);
          
          // この従業員を利用可能リストから削除（連続作業制限チェック後）
          const remainingWork = this.getRemainingContinuousWork(bestEmployee, newAssignments);
          if (remainingWork <= 0) {
            availableEmployees.splice(availableEmployees.indexOf(bestEmployee), 1);
          }
        }
      }
    }

    optimizedGrid.assignments = newAssignments;
    return optimizedGrid;
  }

  /**
   * 遺伝的アルゴリズムによる最適化
   */
  private async geneticAlgorithm(grid: DailyLaborGrid): Promise<DailyLaborGrid> {
    const populationSize = this.config.parameters.populationSize;
    const maxGenerations = this.config.parameters.maxIterations;
    const mutationRate = this.config.parameters.mutationRate;

    // 初期世代を生成
    let population = this.generateInitialPopulation(grid, populationSize);
    
    for (let generation = 0; generation < maxGenerations; generation++) {
      // 評価とソート
      const evaluatedPopulation = population.map(individual => ({
        grid: individual,
        score: this.evaluateGrid(individual)
      })).sort((a, b) => b.score.overall - a.score.overall);

      // エリート選択（上位20%を保持）
      const eliteCount = Math.floor(populationSize * 0.2);
      const elites = evaluatedPopulation.slice(0, eliteCount).map(x => x.grid);

      // 新世代を生成
      const newPopulation = [...elites];
      
      while (newPopulation.length < populationSize) {
        // 親選択（トーナメント選択）
        const parent1 = this.tournamentSelection(evaluatedPopulation, 3);
        const parent2 = this.tournamentSelection(evaluatedPopulation, 3);

        // 交叉
        const child = this.crossover(parent1.grid, parent2.grid);

        // 突然変異
        if (Math.random() < mutationRate) {
          this.mutate(child);
        }

        newPopulation.push(child);
      }

      population = newPopulation;

      // 収束判定
      if (generation > 10) {
        const recentBestScores = evaluatedPopulation.slice(0, 5).map(x => x.score.overall);
        const variance = this.calculateVariance(recentBestScores);
        if (variance < this.config.parameters.convergenceThreshold) {
          break;
        }
      }
    }

    // 最良個体を返す
    const finalEvaluation = population.map(individual => ({
      grid: individual,
      score: this.evaluateGrid(individual)
    })).sort((a, b) => b.score.overall - a.score.overall);

    return finalEvaluation[0].grid;
  }

  /**
   * 焼きなまし法による最適化
   */
  private simulatedAnnealing(grid: DailyLaborGrid): DailyLaborGrid {
    let currentGrid = { ...grid };
    let bestGrid = { ...grid };
    let currentScore = this.evaluateGrid(currentGrid);
    let bestScore = currentScore;

    const maxIterations = this.config.parameters.maxIterations;
    const initialTemperature = 100.0;
    const coolingRate = 0.995;

    let temperature = initialTemperature;

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 近傍解を生成
      const neighborGrid = this.generateNeighbor(currentGrid);
      const neighborScore = this.evaluateGrid(neighborGrid);

      // 解の採択判定
      const deltaScore = neighborScore.overall - currentScore.overall;
      const probability = deltaScore > 0 ? 1 : Math.exp(deltaScore / temperature);

      if (Math.random() < probability) {
        currentGrid = neighborGrid;
        currentScore = neighborScore;

        // 最良解の更新
        if (neighborScore.overall > bestScore.overall) {
          bestGrid = neighborGrid;
          bestScore = neighborScore;
        }
      }

      // 温度の更新
      temperature *= coolingRate;

      // 温度が十分低くなったら終了
      if (temperature < 0.01) {
        break;
      }
    }

    return bestGrid;
  }

  /**
   * ハイブリッド最適化（複数アルゴリズムの組み合わせ）
   */
  private async hybridOptimization(grid: DailyLaborGrid): Promise<DailyLaborGrid> {
    // Phase 1: 貪欲法で初期解を生成
    let optimizedGrid = this.greedyOptimization(grid);

    // Phase 2: 焼きなまし法で局所改善
    optimizedGrid = this.simulatedAnnealing(optimizedGrid);

    // Phase 3: 遺伝的アルゴリズムで大域最適化
    const reducedConfig = {
      ...this.config,
      parameters: {
        ...this.config.parameters,
        maxIterations: Math.floor(this.config.parameters.maxIterations * 0.5),
        populationSize: Math.floor(this.config.parameters.populationSize * 0.7)
      }
    };
    const tempOptimizer = new LaborOptimizer(reducedConfig);
    optimizedGrid = await tempOptimizer.geneticAlgorithm(optimizedGrid);

    return optimizedGrid;
  }

  /**
   * グリッドの評価関数
   */
  private evaluateGrid(grid: DailyLaborGrid): {
    efficiency: number;
    skillUtilization: number;
    employeeSatisfaction: number;
    costOptimization: number;
    safetyCompliance: number;
    overall: number;
  } {
    const efficiency = this.calculateEfficiency(grid);
    const skillUtilization = this.calculateSkillUtilization(grid);
    const employeeSatisfaction = this.calculateEmployeeSatisfaction(grid);
    const costOptimization = this.calculateCostOptimization(grid);
    const safetyCompliance = this.calculateSafetyCompliance(grid);

    const overall = 
      this.config.objectives.efficiency * efficiency +
      this.config.objectives.skillUtilization * skillUtilization +
      this.config.objectives.employeeSatisfaction * employeeSatisfaction +
      this.config.objectives.costOptimization * costOptimization +
      this.config.objectives.safetyCompliance * safetyCompliance;

    return {
      efficiency,
      skillUtilization,
      employeeSatisfaction,
      costOptimization,
      safetyCompliance,
      overall
    };
  }

  /**
   * 作業効率性の計算
   */
  private calculateEfficiency(grid: DailyLaborGrid): number {
    if (grid.assignments.length === 0) return 0;

    let totalEfficiency = 0;
    let validAssignments = 0;

    for (const assignment of grid.assignments) {
      const employee = grid.employees.find(e => e.userId === assignment.employeeId);
      const task = grid.tasks.find(t => t.id === assignment.taskId);
      const timeSlot = grid.timeSlots.find(t => t.id === assignment.timeSlotId);

      if (employee && task && timeSlot) {
        let efficiency = this.calculateTaskEfficiency(employee, task, timeSlot);

        // 疲労モデルの適用
        if (this.config.advanced.enableFatigueModeling) {
          efficiency *= (1 - employee.currentFatigue);
        }

        // 学習効果の適用
        if (this.config.advanced.enableLearningCurve) {
          const learningBonus = this.calculateLearningBonus(employee, task);
          efficiency *= (1 + learningBonus);
        }

        totalEfficiency += efficiency;
        validAssignments++;
      }
    }

    return validAssignments > 0 ? totalEfficiency / validAssignments : 0;
  }

  /**
   * スキル活用率の計算
   */
  private calculateSkillUtilization(grid: DailyLaborGrid): number {
    let totalSkillPoints = 0;
    let usedSkillPoints = 0;

    for (const employee of grid.employees) {
      for (const skill of employee.skills) {
        totalSkillPoints += skill.level * skill.efficiency;

        // この従業員のこのスキルが使われているか確認
        const assignments = grid.assignments.filter(a => a.employeeId === employee.userId);
        for (const assignment of assignments) {
          const task = grid.tasks.find(t => t.id === assignment.taskId);
          if (task) {
            const requiredSkill = task.requiredSkills.find(rs => rs.skillId === skill.skillId);
            if (requiredSkill) {
              usedSkillPoints += skill.level * skill.efficiency * requiredSkill.weight;
            }
          }
        }
      }
    }

    return totalSkillPoints > 0 ? usedSkillPoints / totalSkillPoints : 0;
  }

  /**
   * 従業員満足度の計算
   */
  private calculateEmployeeSatisfaction(grid: DailyLaborGrid): number {
    let totalSatisfaction = 0;
    let employeeCount = 0;

    for (const employee of grid.employees) {
      const assignments = grid.assignments.filter(a => a.employeeId === employee.userId);
      let employeeSatisfaction = 0.5; // ベース満足度

      // 希望作業への配置
      let preferredTaskCount = 0;
      for (const assignment of assignments) {
        const task = grid.tasks.find(t => t.id === assignment.taskId);
        if (task && employee.preferredTasks.includes(task.category)) {
          preferredTaskCount++;
        }
      }
      
      if (assignments.length > 0) {
        employeeSatisfaction += (preferredTaskCount / assignments.length) * 0.3;
      }

      // 適切なスキルレベルでの配置
      let skillMatchSum = 0;
      for (const assignment of assignments) {
        skillMatchSum += assignment.skillMatch;
      }
      
      if (assignments.length > 0) {
        employeeSatisfaction += (skillMatchSum / assignments.length) * 0.2;
      }

      totalSatisfaction += Math.min(employeeSatisfaction, 1.0);
      employeeCount++;
    }

    return employeeCount > 0 ? totalSatisfaction / employeeCount : 0;
  }

  /**
   * コスト最適化の計算
   */
  private calculateCostOptimization(grid: DailyLaborGrid): number {
    // 簡素化された人件費計算
    let totalCost = 0;
    let minPossibleCost = 0;

    for (const assignment of grid.assignments) {
      const employee = grid.employees.find(e => e.userId === assignment.employeeId);
      const task = grid.tasks.find(t => t.id === assignment.taskId);

      if (employee && task) {
        // 実際のコスト（スキルレベルベース）
        const averageSkillLevel = employee.skills.reduce((sum, skill) => sum + skill.level, 0) / employee.skills.length;
        const actualCost = averageSkillLevel * 1000; // 仮の単価

        // 最低限必要なコスト
        const minRequiredLevel = Math.max(...task.requiredSkills.map(rs => rs.minimumLevel));
        const minCost = minRequiredLevel * 1000;

        totalCost += actualCost;
        minPossibleCost += minCost;
      }
    }

    // コスト効率性（低いほど良い）
    return minPossibleCost > 0 ? Math.max(0, 2 - (totalCost / minPossibleCost)) : 0;
  }

  /**
   * 安全コンプライアンスの計算
   */
  private calculateSafetyCompliance(grid: DailyLaborGrid): number {
    let totalAssignments = 0;
    let compliantAssignments = 0;

    for (const assignment of grid.assignments) {
      const employee = grid.employees.find(e => e.userId === assignment.employeeId);
      const task = grid.tasks.find(t => t.id === assignment.taskId);

      if (employee && task) {
        totalAssignments++;

        // 危険作業の資格チェック
        if (task.isHazardous) {
          const hasRequiredQualifications = task.requiredQualifications.every(
            qual => employee.qualifications.includes(qual)
          );
          if (hasRequiredQualifications) {
            compliantAssignments++;
          }
        } else {
          compliantAssignments++;
        }
      }
    }

    return totalAssignments > 0 ? compliantAssignments / totalAssignments : 1;
  }

  /**
   * 制約違反のチェック
   */
  private checkConstraintViolations(grid: DailyLaborGrid): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    for (const constraint of grid.constraints) {
      if (!constraint.isActive) continue;

      switch (constraint.type) {
        case 'skill_requirement':
          violations.push(...this.checkSkillRequirementViolations(grid, constraint));
          break;
        case 'qualification_requirement':
          violations.push(...this.checkQualificationRequirementViolations(grid, constraint));
          break;
        case 'max_continuous_work':
          violations.push(...this.checkMaxContinuousWorkViolations(grid, constraint));
          break;
        case 'minimum_rest':
          violations.push(...this.checkMinimumRestViolations(grid, constraint));
          break;
      }
    }

    return violations;
  }

  /**
   * 改善提案の生成
   */
  private generateSuggestions(grid: DailyLaborGrid): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // スキル配置の改善提案
    suggestions.push(...this.generateSkillAssignmentSuggestions(grid));

    // 連続作業の改善提案
    suggestions.push(...this.generateContinuousWorkSuggestions(grid));

    // スキル向上の提案
    suggestions.push(...this.generateSkillTrainingSuggestions(grid));

    return suggestions.slice(0, 5); // 上位5件のみ返却
  }

  // ユーティリティメソッド群

  private calculateTaskEfficiency(employee: EmployeeAvailability, task: LaborTask, timeSlot: TimeSlot): number {
    const skillMatch = this.calculateSkillMatchScore(employee, task);
    const timeEfficiency = employee.efficiencyByTimeOfDay[timeSlot.startTime] || 0.8;
    return skillMatch * timeEfficiency;
  }

  private calculateSkillMatchScore(employee: EmployeeAvailability, task: LaborTask): number {
    if (task.requiredSkills.length === 0) return 0.5;

    let totalMatch = 0;
    let totalWeight = 0;

    for (const requiredSkill of task.requiredSkills) {
      const employeeSkill = employee.skills.find(s => s.skillId === requiredSkill.skillId);
      if (employeeSkill) {
        const levelRatio = Math.min(employeeSkill.level / requiredSkill.minimumLevel, 2.0);
        const match = Math.min(levelRatio * employeeSkill.efficiency, 1.0);
        totalMatch += match * requiredSkill.weight;
      }
      totalWeight += requiredSkill.weight;
    }

    return totalWeight > 0 ? totalMatch / totalWeight : 0;
  }

  private calculateLearningBonus(employee: EmployeeAvailability, task: LaborTask): number {
    // 実践時間に基づく学習効果ボーナス
    const relevantSkill = employee.skills.find(s => 
      task.requiredSkills.some(rs => rs.skillId === s.skillId)
    );

    if (relevantSkill && relevantSkill.practiceHours > 500) {
      return Math.min((relevantSkill.practiceHours - 500) / 1000 * 0.1, 0.2);
    }

    return 0;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  private getAvailableEmployees(employees: EmployeeAvailability[], timeSlot: TimeSlot, assignments: LaborGridAssignment[]): EmployeeAvailability[] {
    return employees.filter(emp => {
      // 利用不可時間帯をチェック
      const isUnavailable = emp.unavailableSlots.some(slot => slot.includes(timeSlot.startTime));
      if (isUnavailable) return false;

      // 連続作業時間制限をチェック
      const continuousWork = this.getRemainingContinuousWork(emp, assignments);
      return continuousWork > 0;
    });
  }

  private getRequiredTasks(tasks: LaborTask[], timeSlot: TimeSlot): LaborTask[] {
    // すべてのアクティブなタスクを返す（時間帯による制限は今回は実装しない）
    return tasks.filter(task => task.isActive);
  }

  private findBestEmployeeForTask(employees: EmployeeAvailability[], task: LaborTask, timeSlot: TimeSlot): EmployeeAvailability | null {
    if (employees.length === 0) return null;

    let bestEmployee = null;
    let bestScore = -1;

    for (const employee of employees) {
      const skillMatch = this.calculateSkillMatchScore(employee, task);
      const timeEfficiency = employee.efficiencyByTimeOfDay[timeSlot.startTime] || 0.8;
      const fatigueFactor = 1 - employee.currentFatigue;
      
      const score = skillMatch * timeEfficiency * fatigueFactor;

      if (score > bestScore) {
        bestScore = score;
        bestEmployee = employee;
      }
    }

    return bestEmployee;
  }

  private createAssignment(timeSlotId: string, employeeId: string, taskId: string, employee: EmployeeAvailability, task: LaborTask, timeSlot: TimeSlot): LaborGridAssignment {
    const skillMatch = this.calculateSkillMatchScore(employee, task);
    const efficiency = this.calculateTaskEfficiency(employee, task, timeSlot);

    return {
      timeSlotId,
      employeeId,
      taskId,
      efficiency,
      skillMatch,
      isOptimal: efficiency >= 0.8 && skillMatch >= 0.8,
      conflicts: []
    };
  }

  private getRemainingContinuousWork(employee: EmployeeAvailability, assignments: LaborGridAssignment[]): number {
    // 簡素化: 基本的に最大連続作業時間を返す
    return employee.maxContinuousWork;
  }

  private generateInitialPopulation(grid: DailyLaborGrid, size: number): DailyLaborGrid[] {
    const population: DailyLaborGrid[] = [];

    for (let i = 0; i < size; i++) {
      const individual = this.createRandomIndividual(grid);
      population.push(individual);
    }

    return population;
  }

  private createRandomIndividual(grid: DailyLaborGrid): DailyLaborGrid {
    // ランダムな配置を生成（貪欲法をベースにランダム性を追加）
    const randomGrid = { ...grid };
    const shuffledTasks = [...grid.tasks].sort(() => Math.random() - 0.5);
    const shuffledEmployees = [...grid.employees].sort(() => Math.random() - 0.5);

    // 簡素化されたランダム配置生成
    const assignments: LaborGridAssignment[] = [];
    
    for (const timeSlot of grid.timeSlots.slice(0, 20)) { // 作業時間のみ
      for (let i = 0; i < Math.min(shuffledEmployees.length, shuffledTasks.length); i++) {
        const employee = shuffledEmployees[i];
        const task = shuffledTasks[i % shuffledTasks.length];
        
        assignments.push(this.createAssignment(timeSlot.id, employee.userId, task.id, employee, task, timeSlot));
      }
    }

    randomGrid.assignments = assignments;
    return randomGrid;
  }

  private tournamentSelection(population: Array<{grid: DailyLaborGrid, score: any}>, tournamentSize: number): {grid: DailyLaborGrid, score: any} {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    return tournament.reduce((best, current) => 
      current.score.overall > best.score.overall ? current : best
    );
  }

  private crossover(parent1: DailyLaborGrid, parent2: DailyLaborGrid): DailyLaborGrid {
    const child = { ...parent1 };
    const crossoverPoint = Math.floor(parent1.assignments.length / 2);
    
    child.assignments = [
      ...parent1.assignments.slice(0, crossoverPoint),
      ...parent2.assignments.slice(crossoverPoint)
    ];

    return child;
  }

  private mutate(individual: DailyLaborGrid): void {
    if (individual.assignments.length < 2) return;

    // ランダムに2つの配置を交換
    const index1 = Math.floor(Math.random() * individual.assignments.length);
    const index2 = Math.floor(Math.random() * individual.assignments.length);

    if (index1 !== index2) {
      const temp = individual.assignments[index1].taskId;
      individual.assignments[index1].taskId = individual.assignments[index2].taskId;
      individual.assignments[index2].taskId = temp;
    }
  }

  private generateNeighbor(grid: DailyLaborGrid): DailyLaborGrid {
    const neighbor = { ...grid };
    
    if (neighbor.assignments.length < 2) return neighbor;

    // 近傍解生成: ランダムに配置を変更
    const assignments = [...neighbor.assignments];
    const randomIndex = Math.floor(Math.random() * assignments.length);
    const randomTask = grid.tasks[Math.floor(Math.random() * grid.tasks.length)];
    
    assignments[randomIndex] = {
      ...assignments[randomIndex],
      taskId: randomTask.id
    };

    neighbor.assignments = assignments;
    return neighbor;
  }

  // 制約チェックメソッド群（簡素化）
  private checkSkillRequirementViolations(grid: DailyLaborGrid, constraint: LaborConstraint): ConstraintViolation[] {
    return []; // 簡素化のため空配列を返す
  }

  private checkQualificationRequirementViolations(grid: DailyLaborGrid, constraint: LaborConstraint): ConstraintViolation[] {
    return [];
  }

  private checkMaxContinuousWorkViolations(grid: DailyLaborGrid, constraint: LaborConstraint): ConstraintViolation[] {
    return [];
  }

  private checkMinimumRestViolations(grid: DailyLaborGrid, constraint: LaborConstraint): ConstraintViolation[] {
    return [];
  }

  // 改善提案生成メソッド群（簡素化）
  private generateSkillAssignmentSuggestions(grid: DailyLaborGrid): OptimizationSuggestion[] {
    return [];
  }

  private generateContinuousWorkSuggestions(grid: DailyLaborGrid): OptimizationSuggestion[] {
    return [];
  }

  private generateSkillTrainingSuggestions(grid: DailyLaborGrid): OptimizationSuggestion[] {
    return [];
  }
}