// 共通従業員マスタデータ
export interface Employee {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  skills: {
    press_operation: number;
    welding: number;
    quality_inspection: number;
    assembly: number;
    equipment_maintenance: number;
    material_handling: number;
  };
  department: string;
  email?: string;
  phone?: string;
  hiredDate?: string;
  position?: string;
}

// 基本従業員データ
export const EMPLOYEES: Employee[] = [
  {
    id: 'hakusui',
    name: '白水貴太',
    level: 4,
    skills: {
      press_operation: 4,
      welding: 3,
      quality_inspection: 4,
      assembly: 3,
      equipment_maintenance: 2,
      material_handling: 3
    },
    department: '第一工場',
    email: 'hakusui@company.com',
    position: '主任'
  },
  {
    id: 'yashiro_a',
    name: '八城彰仁',
    level: 5,
    skills: {
      press_operation: 2,
      welding: 5,
      quality_inspection: 5,
      assembly: 3,
      equipment_maintenance: 4,
      material_handling: 2
    },
    department: '第一工場',
    email: 'yashiro.a@company.com',
    position: 'リーダー'
  },
  {
    id: 'yashiro_m',
    name: '八城実恵',
    level: 3,
    skills: {
      press_operation: 3,
      welding: 2,
      quality_inspection: 3,
      assembly: 5,
      equipment_maintenance: 3,
      material_handling: 4
    },
    department: '第二工場',
    email: 'yashiro.m@company.com',
    position: '作業者'
  }
];

// 従業員データ管理クラス
export class EmployeeManager {
  private static employees: Employee[] = [...EMPLOYEES];

  static getAllEmployees(): Employee[] {
    return [...this.employees];
  }

  static getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(emp => emp.id === id);
  }

  static getEmployeesByDepartment(department: string): Employee[] {
    return this.employees.filter(emp => emp.department === department);
  }

  static addEmployee(employee: Employee): void {
    this.employees.push(employee);
  }

  static updateEmployee(id: string, updatedEmployee: Partial<Employee>): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...updatedEmployee };
      return true;
    }
    return false;
  }

  static deleteEmployee(id: string): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees.splice(index, 1);
      return true;
    }
    return false;
  }

  static getDepartments(): string[] {
    const departments = new Set(this.employees.map(emp => emp.department));
    return Array.from(departments).sort();
  }

  static getEmployeeCount(): number {
    return this.employees.length;
  }

  static searchEmployees(query: string): Employee[] {
    const lowerQuery = query.toLowerCase();
    return this.employees.filter(emp => 
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.department.toLowerCase().includes(lowerQuery) ||
      emp.id.toLowerCase().includes(lowerQuery)
    );
  }
}

// デフォルトエクスポート
export default EmployeeManager;