import { NextRequest, NextResponse } from 'next/server';
import {
  getComplaintById,
  updateComplaintStatus,
  assignComplaintToWorker
} from '@/lib/db-operations';

// GET specific complaint
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const complaintId = parseInt(params.id);
    const complaint = await getComplaintById(complaintId);

    if (!complaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaint' },
      { status: 500 }
    );
  }
}

// PATCH update complaint (status, assignment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const complaintId = parseInt(params.id);
    const body = await request.json();
    const { status, workerId, adminId, userId, notes } = body;

    if (workerId && adminId) {
      // Assign to worker
      await assignComplaintToWorker(complaintId, workerId, adminId);
    } else if (status && userId) {
      // Update status
      await updateComplaintStatus(complaintId, status, userId, notes);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid update parameters' },
        { status: 400 }
      );
    }

    const updatedComplaint = await getComplaintById(complaintId);

    return NextResponse.json({
      success: true,
      data: updatedComplaint,
      message: 'Complaint updated successfully'
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}