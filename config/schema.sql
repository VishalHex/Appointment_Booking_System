-- PostgreSQL schema for Appointment Booking System

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'provider', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('booked', 'cancelled', 'completed')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointment_time ON appointments(appointment_time);
CREATE INDEX idx_provider_id ON appointments(provider_id);

-- Sample data
-- password_hash = password123
INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES
('Admin User', 'admin@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'admin', NOW(), NOW()),
('John Doe', 'john@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Jane Smith', 'jane@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Bob Johnson', 'bob@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Alice Brown', 'alice@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'client', NOW(), NOW()),
('Provider 4', 'provider4@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 5', 'provider5@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 6', 'provider6@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 7', 'provider7@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 8', 'provider8@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 9', 'provider9@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 10', 'provider10@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 11', 'provider11@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 12', 'provider12@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 13', 'provider13@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 14', 'provider14@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 15', 'provider15@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 16', 'provider16@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 17', 'provider17@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 18', 'provider18@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 19', 'provider19@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 20', 'provider20@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW()),
('Provider 21', 'provider21@example.com', '$2b$10$8rT.OiWWrCDGhZZ85oOFM.qesNo28LhfnMPUNNsQOCNYOtP1nwhYa', 'provider', NOW(), NOW());

INSERT INTO providers (user_id, service_name, description) VALUES
(1, 'Hair Cutting', 'Professional hair cutting and styling services'),
(2, 'Dental Checkup', 'Comprehensive dental care and cleaning'),
(3, 'Car Repair', 'Auto repair and maintenance services'),
(5, 'Plumbing Services', 'Expert plumbing and pipe repairs'),
(6, 'Electrical Work', 'Electrical installations and repairs'),
(7, 'House Cleaning', 'Deep cleaning and maintenance services'),
(8, 'Tutoring', 'Personalized tutoring for various subjects'),
(9, 'Fitness Training', 'Personal fitness and workout sessions'),
(10, 'Photography', 'Professional photography services'),
(11, 'Web Development', 'Custom website development'),
(12, 'Graphic Design', 'Creative graphic design solutions'),
(13, 'Legal Consultation', 'Legal advice and consultation'),
(14, 'Accounting Services', 'Financial accounting and tax services'),
(15, 'Gardening', 'Lawn care and gardening services'),
(16, 'Pet Care', 'Pet grooming and veterinary services'),
(17, 'Catering', 'Event catering and food services'),
(18, 'Event Planning', 'Professional event planning'),
(19, 'Music Lessons', 'Instrument and vocal lessons'),
(20, 'Massage Therapy', 'Relaxing massage and therapy sessions'),
(21, 'Home Renovation', 'Home improvement and renovation');

INSERT INTO appointments (client_id, provider_id, appointment_time, status) VALUES
(4, 1, '2026-03-10 10:00:00', 'booked'),
(4, 2, '2026-03-15 14:00:00', 'booked'),
(4, 3, '2026-04-05 09:00:00', 'booked'),
(4, 5, '2026-04-12 11:00:00', 'booked'),
(4, 6, '2026-04-20 16:00:00', 'booked'),
(4, 7, '2026-05-03 13:00:00', 'booked'),
(4, 8, '2026-05-15 10:30:00', 'booked'),
(4, 9, '2026-05-25 15:00:00', 'booked'),
(4, 10, '2026-06-08 12:00:00', 'booked'),
(4, 11, '2026-06-20 14:00:00', 'booked'),
(4, 12, '2026-07-02 11:00:00', 'booked'),
(4, 13, '2026-03-25 08:00:00', 'completed'),
(4, 14, '2026-04-18 17:00:00', 'cancelled');
