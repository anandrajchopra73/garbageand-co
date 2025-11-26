#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

async function seedData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🌱 Seeding test data...');
    
    // Check if data already exists
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('✅ Data already exists, skipping seed');
      return;
    }

    // Create test users
    const citizenUser = await pool.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      ['citizen@test.com', '$2a$10$test', 'citizen']
    );

    const adminUser = await pool.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      ['admin@test.com', '$2a$10$test', 'admin']
    );

    const workerUser = await pool.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id',
      ['worker@test.com', '$2a$10$test', 'worker']
    );

    // Create citizen
    await pool.query(
      'INSERT INTO citizens (user_id, full_name, phone, address) VALUES ($1, $2, $3, $4)',
      [citizenUser.rows[0].id, 'Test Citizen', '123-456-7890', 'Test Address']
    );

    // Create admin
    await pool.query(
      'INSERT INTO admins (user_id, full_name, phone) VALUES ($1, $2, $3)',
      [adminUser.rows[0].id, 'Test Admin', '123-456-7891']
    );

    // Create worker
    await pool.query(
      'INSERT INTO workers (user_id, full_name, phone, vehicle_number, area_assigned) VALUES ($1, $2, $3, $4, $5)',
      [workerUser.rows[0].id, 'Test Worker', '123-456-7892', 'VH001', 'Downtown']
    );

    console.log('✅ Test data seeded successfully');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
}

seedData();