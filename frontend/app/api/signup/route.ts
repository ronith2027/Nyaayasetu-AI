import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for AWS API Gateway signup endpoint
 * Browser -> /api/signup -> AWS API Gateway /auth/signup
 */
export async function POST(request: NextRequest) {
  // Base URL from env
  const AUTH_API_BASE_URL = (process.env.NEXT_PUBLIC_AUTH_API_URL || '').replace(/\/+$/, '');
  
  if (!AUTH_API_BASE_URL) {
    console.error('[Signup Proxy Error] NEXT_PUBLIC_AUTH_API_URL is not defined');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Ensure we use the correct AWS endpoint without /prod
  const backendUrl = `${AUTH_API_BASE_URL}/auth/signup`;

  console.log(`[Signup Proxy] Forwarding request to: ${backendUrl}`);

  try {
    const body = await request.json();
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[Signup Proxy Error] Backend responded with ${response.status}:`, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Signup Proxy Error] Failed to proxy signup request:', error);
    return NextResponse.json(
      { error: error.message || 'Signup request failed' },
      { status: 500 }
    );
  }
}
