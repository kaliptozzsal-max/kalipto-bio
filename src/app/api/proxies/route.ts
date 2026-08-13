import { NextResponse } from 'next/server';
import { fetchProxies } from '@/lib/proxy';

export async function GET() {
  try {
    const proxies = await fetchProxies();
    return NextResponse.json({
      success: true,
      count: proxies.length,
      proxies: proxies.slice(0, 500), // Limit to top 500 for performance
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch proxies' },
      { status: 500 }
    );
  }
}
