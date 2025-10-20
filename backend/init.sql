-- PostgreSQL Initialization Script for Teşvik360
-- This script will be executed when the database container starts for the first time

-- Create database if not exists (handled by POSTGRES_DB environment variable)
-- CREATE DATABASE tesvik360;

-- Create user if not exists (handled by POSTGRES_USER environment variable)
-- CREATE USER tesvik360_user WITH PASSWORD 'secure_password_123';

-- Grant privileges
-- GRANT ALL PRIVILEGES ON DATABASE tesvik360 TO tesvik360_user;

-- Connect to the database
\c tesvik360;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic tables structure (if your application doesn't handle migrations)
-- Note: If your application handles database migrations, you can remove the table creation below

-- Example: Users table
-- CREATE TABLE IF NOT EXISTS users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     first_name VARCHAR(100),
--     last_name VARCHAR(100),
--     role VARCHAR(50) DEFAULT 'user',
--     is_active BOOLEAN DEFAULT true,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Example: Applications table
-- CREATE TABLE IF NOT EXISTS applications (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id),
--     title VARCHAR(255) NOT NULL,
--     description TEXT,
--     status VARCHAR(50) DEFAULT 'pending',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
-- CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Insert default admin user (optional)
-- INSERT INTO users (email, password, first_name, last_name, role) 
-- VALUES ('admin@tesvik360.com', '$2b$12$hashed_password_here', 'Admin', 'User', 'admin')
-- ON CONFLICT (email) DO NOTHING;

COMMIT;