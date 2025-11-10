import { NextRequest, NextResponse } from 'next/server';
import { createComplaint, getAllComplaints } from '@/lib/db-operations';

// GET all complaints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const filters = {
      status: status || undefined,
      priority: priority || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const complaints = await getAllComplaints(filters);

    return NextResponse.json({
      success: true,
      data: complaints,
      count: complaints.length
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST new complaint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      citizenId,
      title,
      description,
      locationAddress,
      latitude,
      longitude,
      priority,
      imagesData,
      metadata
    } = body;

    // Validation
    if (!citizenId || !title || !locationAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const complaintId = await createComplaint({
      citizenId,
      title,
      description,
      locationAddress,
      latitude,
      longitude,
      priority: priority || 'medium',
      imagesData,
      metadata
    });

    return NextResponse.json({
      success: true,
      data: { id: complaintId },
      message: 'Complaint created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}