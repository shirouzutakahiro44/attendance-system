import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Find and delete session
    const sessionToken = request.headers.get('x-session-token');
    
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: {
          userId: payload.userId,
          token: sessionToken,
        },
      });
    }
    
    // Log the logout
    await prisma.auditLog.create({
      data: {
        userId: payload.userId,
        action: 'LOGOUT',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });
    
    return NextResponse.json({ message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}