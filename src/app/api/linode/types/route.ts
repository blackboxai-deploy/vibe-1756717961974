import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, getUserByToken } from '@/lib/auth';
import { linodeApi } from '@/lib/api/linode';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const token = extractTokenFromRequest(request);
    const user = token ? await getUserByToken(token) : null;
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch Linode types from API
    const result = await linodeApi.getTypes();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Linode types retrieved successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Get Linode types API error:', error);
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