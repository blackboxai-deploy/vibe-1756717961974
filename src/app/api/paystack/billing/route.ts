import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, getUserByToken } from '@/lib/auth';
import { paystackApi } from '@/lib/api/paystack';

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

    // For demo purposes, use a mock customer ID based on user email
    const customerCode = `cus_${user.email.replace('@', '_').replace('.', '_')}`;

    try {
      // Get billing overview from Paystack
      const result = await paystackApi.getBillingOverview(customerCode);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
          message: 'Billing overview retrieved successfully'
        });
      } else {
        // Return demo data if Paystack API fails (for development)
        const demoBillingData = {
          currentBalance: 0,
          monthToDateSpend: 127.50,
          projectedMonthlySpend: 145.00,
          lastPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastPaymentAmount: 98.20,
          nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethods: [
            {
              id: 'pm_demo_card',
              type: 'card' as const,
              last4: '4242',
              brand: 'visa',
              exp_month: '12',
              exp_year: '2025',
              is_default: true
            }
          ]
        };

        return NextResponse.json({
          success: true,
          data: demoBillingData,
          message: 'Demo billing data retrieved (Paystack not configured)',
          demo: true
        });
      }
    } catch (apiError) {
      console.error('Paystack API error:', apiError);
      
      // Return demo data as fallback
      const demoBillingData = {
        currentBalance: 0,
        monthToDateSpend: 127.50,
        projectedMonthlySpend: 145.00,
        lastPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastPaymentAmount: 98.20,
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethods: []
      };

      return NextResponse.json({
        success: true,
        data: demoBillingData,
        message: 'Demo billing data (API error)',
        demo: true
      });
    }
  } catch (error) {
    console.error('Get billing API error:', error);
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