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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');

    // Fetch instances from Linode API
    const result = await linodeApi.getInstances(page, pageSize);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Instances retrieved successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Get instances API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const instanceData = await request.json();

    // Validate required fields
    if (!instanceData.label || !instanceData.type || !instanceData.region || !instanceData.image) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: label, type, region, image' },
        { status: 400 }
      );
    }

    // Create instance via Linode API
    const result = await linodeApi.createInstance(instanceData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Instance created successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Create instance API error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}