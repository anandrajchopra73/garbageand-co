-- Drop existing tables if they exist
DROP TABLE IF EXISTS complaint_status_history CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (base table for all user types)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('citizen', 'admin', 'worker')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create citizens table
CREATE TABLE citizens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_data BYTEA, -- Compressed JSON data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin',
    permissions BYTEA, -- Compressed JSON array of permissions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workers table
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    vehicle_number VARCHAR(50),
    area_assigned TEXT,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    profile_data BYTEA, -- Compressed JSON data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create complaints/reports table
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    citizen_id INTEGER REFERENCES citizens(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'rejected')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_worker_id INTEGER REFERENCES workers(id) ON DELETE SET NULL,
    assigned_by_admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    images_data BYTEA, -- Compressed JSON array of image URLs/base64
    metadata BYTEA, -- Compressed additional metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create complaint status history table
CREATE TABLE complaint_status_history (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    changed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata BYTEA, -- Compressed JSON data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_citizens_user_id ON citizens(user_id);
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_workers_user_id ON workers(user_id);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_assigned_worker ON complaints(assigned_worker_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaint_history_complaint_id ON complaint_status_history(complaint_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citizens_updated_at BEFORE UPDATE ON citizens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();