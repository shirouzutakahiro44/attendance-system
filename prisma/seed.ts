import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { employeeId: 'ADMIN001' },
    update: {},
    create: {
      employeeId: 'ADMIN001',
      email: 'admin@company.com',
      passwordHash: adminPassword,
      firstName: '太郎',
      lastName: '管理',
      firstNameKana: 'タロウ',
      lastNameKana: 'カンリ',
      department: 'INDIRECT',
      role: 'ADMIN',
      employmentType: 'FULL_TIME',
      hireDate: new Date('2020-01-01'),
      monthlySalary: 500000,
    },
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { employeeId: 'MGR001' },
    update: {},
    create: {
      employeeId: 'MGR001',
      email: 'manager@company.com',
      passwordHash: managerPassword,
      firstName: '次郎',
      lastName: '班長',
      firstNameKana: 'ジロウ',
      lastNameKana: 'ハンチョウ',
      department: 'FACTORY_1',
      role: 'MANAGER',
      employmentType: 'FULL_TIME',
      hireDate: new Date('2021-01-01'),
      monthlySalary: 400000,
    },
  });

  // Create employee users
  const employeePassword = await bcrypt.hash('employee123', 12);
  
  const employees = [
    {
      employeeId: 'EMP001',
      firstName: '花子',
      lastName: '田中',
      firstNameKana: 'ハナコ',
      lastNameKana: 'タナカ',
      department: 'FACTORY_1',
      email: 'hanako@company.com',
    },
    {
      employeeId: 'EMP002',
      firstName: '一郎',
      lastName: '佐藤',
      firstNameKana: 'イチロウ',
      lastNameKana: 'サトウ',
      department: 'FACTORY_2',
      email: 'ichiro@company.com',
    },
    {
      employeeId: 'EMP003',
      firstName: '美咲',
      lastName: '鈴木',
      firstNameKana: 'ミサキ',
      lastNameKana: 'スズキ',
      department: 'PRESS',
      email: 'misaki@company.com',
    },
    {
      employeeId: 'EMP004',
      firstName: '健太',
      lastName: '高橋',
      firstNameKana: 'ケンタ',
      lastNameKana: 'タカハシ',
      department: 'WELDING',
      email: 'kenta@company.com',
    },
  ];

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { employeeId: emp.employeeId },
      update: {},
      create: {
        ...emp,
        passwordHash: employeePassword,
        role: 'EMPLOYEE',
        employmentType: 'FULL_TIME',
        hireDate: new Date('2022-04-01'),
        hourlyRate: 1500,
      },
    });
  }

  // Create department manager assignment
  await prisma.departmentManager.upsert({
    where: {
      userId_department: {
        userId: manager.id,
        department: 'FACTORY_1',
      },
    },
    update: {},
    create: {
      userId: manager.id,
      department: 'FACTORY_1',
    },
  });

  console.log('Seed data created successfully!');
  console.log('Admin user: ADMIN001 / admin123');
  console.log('Manager user: MGR001 / manager123');
  console.log('Employee users: EMP001-004 / employee123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });