-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    sender_name VARCHAR(200),
    reply_to VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    theme VARCHAR(20) DEFAULT 'DARK',
    email_signature TEXT,
    gmail_access_token TEXT,
    gmail_refresh_token TEXT,
    gmail_connected BOOLEAN DEFAULT FALSE,
    gmail_email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Resumes
CREATE TABLE resumes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_data BYTEA NOT NULL,
    file_size BIGINT,
    category VARCHAR(50) DEFAULT 'GENERIC',
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Templates
CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_resume_id BIGINT REFERENCES resumes(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'COLD_EMAIL',
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sent Emails
CREATE TABLE sent_emails (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id BIGINT REFERENCES email_templates(id) ON DELETE SET NULL,
    resume_id BIGINT REFERENCES resumes(id) ON DELETE SET NULL,
    recruiter_name VARCHAR(255),
    recruiter_email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    cc VARCHAR(500),
    bcc VARCHAR(500),
    status VARCHAR(30) DEFAULT 'SENT',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Emails
CREATE TABLE scheduled_emails (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id BIGINT REFERENCES email_templates(id) ON DELETE SET NULL,
    resume_id BIGINT REFERENCES resumes(id) ON DELETE SET NULL,
    recruiter_name VARCHAR(255),
    recruiter_email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    cc VARCHAR(500),
    bcc VARCHAR(500),
    scheduled_at TIMESTAMP NOT NULL,
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    error_message TEXT,
    sent_at TIMESTAMP,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Default admin user (password: Admin@123)
INSERT INTO users (email, password, first_name, last_name, sender_name)
VALUES ('admin@resumemailer.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RMkzeNMDzFGBbMHMi', 'Admin', 'User', 'Admin User');
