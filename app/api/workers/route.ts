import { NextRequest, NextResponse } from 'next/server';
import { getAvailableWorkers } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    const workers = await getAvailableWorkers();

    return NextResponse.json({
      success: true,
      data: workers,
      count: workers.length
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}