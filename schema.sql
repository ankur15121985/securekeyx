-- Chakravyuh Tactical Database Schema
-- Use this to initialize your MySQL database

CREATE DATABASE IF NOT EXISTS chakravyuh_db;
USE chakravyuh_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cryptographic Keys table
CREATE TABLE IF NOT EXISTS crypto_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    encrypted_key TEXT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Initial Admin User (Optional, can be handled in code)
-- INSERT INTO users (id, username, password_hash, role) 
-- VALUES ('admin-id', 'ankur15121985', 'M@thur24', 'admin');
