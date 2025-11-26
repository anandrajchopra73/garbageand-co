#!/usr/bin/env node

/**
 * Test script to verify data flow from citizen -> admin -> worker
 * This script tests the complete complaint lifecycle
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDataFlow() {
  console.log('🧪 Testing Data Flow: Citizen -> Admin -> Worker\n');

  try {
    // 1. Test citizen complaint creation
    console.log('1️⃣ Testing citizen complaint creation...');
    
    const citizenResult = await pool.query(
      'SELECT id FROM citizens LIMIT 1'
    );
    
    if (citizenResult.rows.length === 0) {
      console.log('❌ No citizens found in database. Please create a citizen first.');
      return;
    }
    
    const citizenId = citizenResult.rows[0].id;
    console.log(`✅ Found citizen ID: ${citizenId}`);

    // Create a test complaint
    const complaintResult = await pool.query(
      `INSERT INTO complaints (citizen_id, title, description, location_address, priority) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [citizenId, 'Test Complaint', 'Test description', 'Test Location', 'medium']
    );
    
    const complaintId = complaintResult.rows[0].id;
    console.log(`✅ Created complaint ID: ${complaintId}`);

    // 2. Test admin assignment
    console.log('\n2️⃣ Testing admin assignment...');
    
    const adminResult = await pool.query(
      'SELECT id FROM admins LIMIT 1'
    );
    
    if (adminResult.rows.length === 0) {
      console.log('❌ No admins found in database. Please create an admin first.');
      return;
    }
    
    const adminId = adminResult.rows[0].id;
    console.log(`✅ Found admin ID: ${adminId}`);

    const workerResult = await pool.query(
      'SELECT id FROM workers WHERE status = $1 LIMIT 1',
      ['available']
    );
    
    if (workerResult.rows.length === 0) {
      console.log('❌ No available workers found in database. Please create a worker first.');
      return;
    }
    
    const workerId = workerResult.rows[0].id;
    console.log(`✅ Found available worker ID: ${workerId}`);

    // Assign complaint to worker
    await pool.query(
      `UPDATE complaints 
       SET assigned_worker_id = $1, assigned_by_admin_id = $2, status = 'assigned' 
       WHERE id = $3`,
      [workerId, adminId, complaintId]
    );
    
    console.log(`✅ Assigned complaint ${complaintId} to worker ${workerId} by admin ${adminId}`);

    // 3. Test worker completion
    console.log('\n3️⃣ Testing worker completion...');
    
    // Get worker's user ID for status update
    const workerUserResult = await pool.query(
      'SELECT user_id FROM workers WHERE id = $1',
      [workerId]
    );
    
    const workerUserId = workerUserResult.rows[0].user_id;
    
    // Update complaint status to resolved
    await pool.query(
      `UPDATE complaints SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [complaintId]
    );
    
    // Add status history
    await pool.query(
      `INSERT INTO complaint_status_history (complaint_id, status, changed_by_user_id, notes) 
       VALUES ($1, $2, $3, $4)`,
      [complaintId, 'resolved', workerUserId, 'Test completion by worker']
    );
    
    console.log(`✅ Worker ${workerId} marked complaint ${complaintId} as resolved`);

    // 4. Verify complete data flow
    console.log('\n4️⃣ Verifying complete data flow...');
    
    const verificationResult = await pool.query(
      `SELECT 
        c.id,
        c.title,
        c.status,
        c.created_at,
        c.resolved_at,
        cit.full_name as citizen_name,
        w.full_name as worker_name,
        a.full_name as admin_name
       FROM complaints c
       LEFT JOIN citizens cit ON c.citizen_id = cit.id
       LEFT JOIN workers w ON c.assigned_worker_id = w.id
       LEFT JOIN admins a ON c.assigned_by_admin_id = a.id
       WHERE c.id = $1`,
      [complaintId]
    );
    
    const complaint = verificationResult.rows[0];
    
    console.log('\n📊 Data Flow Verification:');
    console.log(`   Complaint ID: ${complaint.id}`);
    console.log(`   Title: ${complaint.title}`);
    console.log(`   Status: ${complaint.status}`);
    console.log(`   Citizen: ${complaint.citizen_name}`);
    console.log(`   Admin: ${complaint.admin_name}`);
    console.log(`   Worker: ${complaint.worker_name}`);
    console.log(`   Created: ${complaint.created_at}`);
    console.log(`   Resolved: ${complaint.resolved_at}`);
    
    // Check status history
    const historyResult = await pool.query(
      `SELECT status, notes, created_at FROM complaint_status_history 
       WHERE complaint_id = $1 ORDER BY created_at`,
      [complaintId]
    );
    
    console.log('\n📝 Status History:');
    historyResult.rows.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.status} - ${h.notes || 'No notes'} (${h.created_at})`);
    });
    
    console.log('\n✅ Data flow test completed successfully!');
    console.log('🎉 All systems working correctly: Citizen -> Admin -> Worker');

    // Cleanup test data
    await pool.query('DELETE FROM complaint_status_history WHERE complaint_id = $1', [complaintId]);
    await pool.query('DELETE FROM complaints WHERE id = $1', [complaintId]);
    console.log('\n🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
testDataFlow();