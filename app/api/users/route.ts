import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hashPassword, excludePassword } from '@/lib/auth';
import { createUserSchema } from '@/lib/validations/auth';
import { z } from 'zod';

async function checkPermission(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await checkPermission(request);
    
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      deletedAt: null,
    };
    
    if (department) {
      where.department = department;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // If manager, only show users from their departments
    if (currentUser.role === 'MANAGER') {
      const managedDepartments = await prisma.departmentManager.findMany({
        where: {
          userId: currentUser.id,
          unassignedAt: null,
        },
      });
      
      const departments = managedDepartments.map(dm => dm.department);
      where.department = { in: departments };
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          employeeId: true,
          email: true,
          firstName: true,
          lastName: true,
          firstNameKana: true,
          lastNameKana: true,
          department: true,
          role: true,
          employmentType: true,
          hireDate: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { employeeId: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await checkPermission(request);
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);
    
    // Check if employee ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { employeeId: validatedData.employeeId },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      );
    }
    
    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }
    
    // Hash password
    const passwordHash = await hashPassword(validatedData.password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        passwordHash,
        hireDate: new Date(validatedData.hireDate),
        email: validatedData.email || null,
      },
    });
    
    // Log the creation
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        targetTable: 'users',
        targetId: user.id,
        newValue: { ...excludePassword(user) },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });
    
    return NextResponse.json(excludePassword(user), { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}