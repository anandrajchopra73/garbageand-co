import pool, { query, getClient } from './db';
import { compressData, decompressData } from './compression';
import bcrypt from 'bcryptjs';

// ============= CITIZEN OPERATIONS =============

export async function createCitizen(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  profileData?: any;
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      [data.email, passwordHash, 'citizen']
    );
    const userId = userResult.rows[0].id;

    // Compress profile data if provided
    const compressedProfile = data.profileData 
      ? await compressData(data.profileData) 
      : null;

    // Create citizen
    const citizenResult = await client.query(
      'INSERT INTO citizens (user_id, full_name, phone, address, profile_data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, data.fullName, data.phone, data.address, compressedProfile]
    );

    await client.query('COMMIT');
    return { userId, citizenId: citizenResult.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getCitizenById(citizenId: number) {
  const result = await query(
    `SELECT c.*, u.email, u.created_at as user_created_at 
     FROM citizens c 
     JOIN users u ON c.user_id = u.id 
     WHERE c.id = $1`,
    [citizenId]
  );

  if (result.rows.length === 0) return null;

  const citizen = result.rows[0];
  
  // Decompress profile data if exists
  if (citizen.profile_data) {
    citizen.profile_data = await decompressData(citizen.profile_data);
  }

  return citizen;
}

// ============= ADMIN OPERATIONS =============

export async function createAdmin(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
  permissions?: string[];
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      [data.email, passwordHash, 'admin']
    );
    const userId = userResult.rows[0].id;

    const compressedPermissions = data.permissions 
      ? await compressData(data.permissions) 
      : null;

    const adminResult = await client.query(
      'INSERT INTO admins (user_id, full_name, phone, role, permissions) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, data.fullName, data.phone, data.role || 'admin', compressedPermissions]
    );

    await client.query('COMMIT');
    return { userId, adminId: adminResult.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAdminById(adminId: number) {
  const result = await query(
    `SELECT a.*, u.email, u.created_at as user_created_at 
     FROM admins a 
     JOIN users u ON a.user_id = u.id 
     WHERE a.id = $1`,
    [adminId]
  );

  if (result.rows.length === 0) return null;

  const admin = result.rows[0];
  
  if (admin.permissions) {
    admin.permissions = await decompressData(admin.permissions);
  }

  return admin;
}

// ============= WORKER OPERATIONS =============

export async function createWorker(data: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  vehicleNumber?: string;
  areaAssigned?: string;
  profileData?: any;
}) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      [data.email, passwordHash, 'worker']
    );
    const userId = userResult.rows[0].id;

    const compressedProfile = data.profileData 
      ? await compressData(data.profileData) 
      : null;

    const workerResult = await client.query(
      'INSERT INTO workers (user_id, full_name, phone, vehicle_number, area_assigned, profile_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, data.fullName, data.phone, data.vehicleNumber, data.areaAssigned, compressedProfile]
    );

    await client.query('COMMIT');
    return { userId, workerId: workerResult.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getWorkerById(workerId: number) {
  const result = await query(
    `SELECT w.*, u.email, u.created_at as user_created_at 
     FROM workers w 
     JOIN users u ON w.user_id = u.id 
     WHERE w.id = $1`,
    [workerId]
  );

  if (result.rows.length === 0) return null;

  const worker = result.rows[0];
  
  if (worker.profile_data) {
    worker.profile_data = await decompressData(worker.profile_data);
  }

  return worker;
}

export async function getAvailableWorkers() {
  const result = await query(
    `SELECT w.*, u.email 
     FROM workers w 
     JOIN users u ON w.user_id = u.id 
     WHERE w.status = 'available' 
     ORDER BY w.full_name`,
    []
  );

  return result.rows;
}

// ============= COMPLAINT OPERATIONS =============

export async function createComplaint(data: {
  citizenId: number;
  title: string;
  description?: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  priority?: string;
  imagesData?: any[];
  metadata?: any;
}) {
  const compressedImages = data.imagesData 
    ? await compressData(data.imagesData) 
    : null;
  
  const compressedMetadata = data.metadata 
    ? await compressData(data.metadata) 
    : null;

  const result = await query(
    `INSERT INTO complaints 
     (citizen_id, title, description, location_address, latitude, longitude, priority, images_data, metadata) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     RETURNING id`,
    [
      data.citizenId,
      data.title,
      data.description,
      data.locationAddress,
      data.latitude,
      data.longitude,
      data.priority || 'medium',
      compressedImages,
      compressedMetadata
    ]
  );

  return result.rows[0].id;
}

export async function getComplaintById(complaintId: number) {
  const result = await query(
    `SELECT c.*, 
     cit.full_name as citizen_name, cit.phone as citizen_phone,
     w.full_name as worker_name, w.phone as worker_phone,
     a.full_name as admin_name
     FROM complaints c
     LEFT JOIN citizens cit ON c.citizen_id = cit.id
     LEFT JOIN workers w ON c.assigned_worker_id = w.id
     LEFT JOIN admins a ON c.assigned_by_admin_id = a.id
     WHERE c.id = $1`,
    [complaintId]
  );

  if (result.rows.length === 0) return null;

  const complaint = result.rows[0];
  
  if (complaint.images_data) {
    complaint.images_data = await decompressData(complaint.images_data);
  }
  
  if (complaint.metadata) {
    complaint.metadata = await decompressData(complaint.metadata);
  }

  return complaint;
}

export async function getComplaintsByCitizenId(citizenId: number) {
  const result = await query(
    `SELECT c.*, w.full_name as worker_name, w.phone as worker_phone
     FROM complaints c
     LEFT JOIN workers w ON c.assigned_worker_id = w.id
     WHERE c.citizen_id = $1
     ORDER BY c.created_at DESC`,
    [citizenId]
  );

  // Decompress data for each complaint
  const complaints = await Promise.all(
    result.rows.map(async (complaint) => {
      if (complaint.images_data) {
        complaint.images_data = await decompressData(complaint.images_data);
      }
      if (complaint.metadata) {
        complaint.metadata = await decompressData(complaint.metadata);
      }
      return complaint;
    })
  );

  return complaints;
}

export async function getComplaintsByWorkerId(workerId: number) {
  const result = await query(
    `SELECT c.*, cit.full_name as citizen_name, cit.phone as citizen_phone
     FROM complaints c
     JOIN citizens cit ON c.citizen_id = cit.id
     WHERE c.assigned_worker_id = $1
     ORDER BY c.created_at DESC`,
    [workerId]
  );

  const complaints = await Promise.all(
    result.rows.map(async (complaint) => {
      if (complaint.images_data) {
        complaint.images_data = await decompressData(complaint.images_data);
      }
      if (complaint.metadata) {
        complaint.metadata = await decompressData(complaint.metadata);
      }
      return complaint;
    })
  );

  return complaints;
}

export async function getAllComplaints(filters?: {
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
}) {
  let queryText = `
    SELECT c.*, 
    cit.full_name as citizen_name,
    w.full_name as worker_name
    FROM complaints c
    LEFT JOIN citizens cit ON c.citizen_id = cit.id
    LEFT JOIN workers w ON c.assigned_worker_id = w.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 1;

  if (filters?.status) {
    queryText += ` AND c.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  if (filters?.priority) {
    queryText += ` AND c.priority = $${paramCount}`;
    params.push(filters.priority);
    paramCount++;
  }

  queryText += ` ORDER BY c.created_at DESC`;

  if (filters?.limit) {
    queryText += ` LIMIT $${paramCount}`;
    params.push(filters.limit);
    paramCount++;
  }

  if (filters?.offset) {
    queryText += ` OFFSET $${paramCount}`;
    params.push(filters.offset);
  }

  const result = await query(queryText, params);

  const complaints = await Promise.all(
    result.rows.map(async (complaint) => {
      if (complaint.images_data) {
        complaint.images_data = await decompressData(complaint.images_data);
      }
      if (complaint.metadata) {
        complaint.metadata = await decompressData(complaint.metadata);
      }
      return complaint;
    })
  );

  return complaints;
}

export async function assignComplaintToWorker(
  complaintId: number,
  workerId: number,
  adminId: number
) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE complaints 
       SET assigned_worker_id = $1, assigned_by_admin_id = $2, status = 'assigned' 
       WHERE id = $3`,
      [workerId, adminId, complaintId]
    );

    await client.query(
      `INSERT INTO complaint_status_history (complaint_id, status, changed_by_user_id, notes) 
       SELECT $1, 'assigned', u.id, 'Assigned to worker'
       FROM admins a JOIN users u ON a.user_id = u.id WHERE a.id = $2`,
      [complaintId, adminId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateComplaintStatus(
  complaintId: number,
  status: string,
  userId: number,
  notes?: string
) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const updates: any = { status };
    if (status === 'resolved') {
      updates.resolved_at = new Date();
    }

    await client.query(
      `UPDATE complaints SET status = $1, resolved_at = $2 WHERE id = $3`,
      [status, updates.resolved_at || null, complaintId]
    );

    await client.query(
      `INSERT INTO complaint_status_history (complaint_id, status, changed_by_user_id, notes) 
       VALUES ($1, $2, $3, $4)`,
      [complaintId, status, userId, notes]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// ============= AUTHENTICATION =============

export async function authenticateUser(email: string, password: string) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    return null;
  }

  // Get additional user details based on type
  let userDetails;
  if (user.user_type === 'citizen') {
    const citizenResult = await query('SELECT * FROM citizens WHERE user_id = $1', [user.id]);
    userDetails = citizenResult.rows[0];
  } else if (user.user_type === 'admin') {
    const adminResult = await query('SELECT * FROM admins WHERE user_id = $1', [user.id]);
    userDetails = adminResult.rows[0];
  } else if (user.user_type === 'worker') {
    const workerResult = await query('SELECT * FROM workers WHERE user_id = $1', [user.id]);
    userDetails = workerResult.rows[0];
  }

  return {
    userId: user.id,
    email: user.email,
    userType: user.user_type,
    details: userDetails
  };
}