import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, getUserByToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Get user by token
    const user = await getUserByToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'User retrieved successfully'
    });
  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}