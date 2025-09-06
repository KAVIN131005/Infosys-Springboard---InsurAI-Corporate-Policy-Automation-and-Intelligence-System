-- Insert default roles only if they don't exist
INSERT INTO role (name) 
SELECT 'USER' 
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'USER');

INSERT INTO role (name) 
SELECT 'BROKER' 
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'BROKER');

INSERT INTO role (name) 
SELECT 'ADMIN' 
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'ADMIN');

-- Insert sample users (password is encrypted 'password123')
INSERT INTO user (username, email, password, first_name, last_name, role_id, created_at, updated_at) 
SELECT 'admin', 'admin@insur.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'System', 'Administrator', r.id, NOW(), NOW()
FROM role r 
WHERE r.name = 'ADMIN' 
AND NOT EXISTS (SELECT 1 FROM user WHERE username = 'admin');

INSERT INTO user (username, email, password, first_name, last_name, role_id, created_at, updated_at) 
SELECT 'broker1', 'broker1@insur.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'John', 'Broker', r.id, NOW(), NOW()
FROM role r 
WHERE r.name = 'BROKER' 
AND NOT EXISTS (SELECT 1 FROM user WHERE username = 'broker1');

INSERT INTO user (username, email, password, first_name, last_name, role_id, created_at, updated_at) 
SELECT 'broker2', 'broker2@insur.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Sarah', 'Johnson', r.id, NOW(), NOW()
FROM role r 
WHERE r.name = 'BROKER' 
AND NOT EXISTS (SELECT 1 FROM user WHERE username = 'broker2');

INSERT INTO user (username, email, password, first_name, last_name, role_id, created_at, updated_at) 
SELECT 'user1', 'user1@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Alice', 'Smith', r.id, NOW(), NOW()
FROM role r 
WHERE r.name = 'USER' 
AND NOT EXISTS (SELECT 1 FROM user WHERE username = 'user1');

INSERT INTO user (username, email, password, first_name, last_name, role_id, created_at, updated_at) 
SELECT 'user2', 'user2@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Bob', 'Wilson', r.id, NOW(), NOW()
FROM role r 
WHERE r.name = 'USER' 
AND NOT EXISTS (SELECT 1 FROM user WHERE username = 'user2');

INSERT INTO user (username, email, password, first_name, last_name, role_id, created_at, updated_at) 
SELECT 'user3', 'user3@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Emma', 'Davis', r.id, NOW(), NOW()
FROM role r 
WHERE r.name = 'USER' 
AND NOT EXISTS (SELECT 1 FROM user WHERE username = 'user3');

-- Insert sample policies
INSERT INTO policy (name, description, type, sub_type, monthly_premium, yearly_premium, coverage, deductible, status, risk_level, requires_approval, uploaded_by, created_at, updated_at)
SELECT 'Comprehensive Health Plan', 'Complete health insurance with medical, dental, and vision coverage', 'HEALTH', 'COMPREHENSIVE', 299.99, 3499.88, 'Medical: $500K, Dental: $5K, Vision: $2K', 1000.00, 'ACTIVE', 'LOW', false, u.id, NOW() - INTERVAL 30 DAY, NOW()
FROM user u WHERE u.username = 'broker1'
AND NOT EXISTS (SELECT 1 FROM policy WHERE name = 'Comprehensive Health Plan');

INSERT INTO policy (name, description, type, sub_type, monthly_premium, yearly_premium, coverage, deductible, status, risk_level, requires_approval, uploaded_by, created_at, updated_at)
SELECT 'Auto Full Coverage', 'Complete auto insurance with collision and comprehensive', 'AUTO', 'FULL_COVERAGE', 149.99, 1799.88, 'Liability: $100K, Collision: $50K, Comprehensive: $25K', 500.00, 'ACTIVE', 'MEDIUM', false, u.id, NOW() - INTERVAL 25 DAY, NOW()
FROM user u WHERE u.username = 'broker1'
AND NOT EXISTS (SELECT 1 FROM policy WHERE name = 'Auto Full Coverage');

INSERT INTO policy (name, description, type, sub_type, monthly_premium, yearly_premium, coverage, deductible, status, risk_level, requires_approval, uploaded_by, created_at, updated_at)
SELECT 'Home Protection Plus', 'Comprehensive home insurance with additional riders', 'HOME', 'COMPREHENSIVE', 89.99, 1079.88, 'Dwelling: $300K, Personal Property: $150K, Liability: $100K', 1000.00, 'ACTIVE', 'LOW', false, u.id, NOW() - INTERVAL 20 DAY, NOW()
FROM user u WHERE u.username = 'broker2'
AND NOT EXISTS (SELECT 1 FROM policy WHERE name = 'Home Protection Plus');

INSERT INTO policy (name, description, type, sub_type, monthly_premium, yearly_premium, coverage, deductible, status, risk_level, requires_approval, uploaded_by, created_at, updated_at)
SELECT 'Life Term 20', '20-year term life insurance policy', 'LIFE', 'TERM', 45.99, 551.88, 'Death Benefit: $250K', 0.00, 'PENDING', 'HIGH', true, u.id, NOW() - INTERVAL 15 DAY, NOW()
FROM user u WHERE u.username = 'broker2'
AND NOT EXISTS (SELECT 1 FROM policy WHERE name = 'Life Term 20');

INSERT INTO policy (name, description, type, sub_type, monthly_premium, yearly_premium, coverage, deductible, status, risk_level, requires_approval, uploaded_by, created_at, updated_at)
SELECT 'Business Liability', 'General liability insurance for small businesses', 'BUSINESS', 'LIABILITY', 199.99, 2399.88, 'General Liability: $1M, Professional Liability: $500K', 2500.00, 'ACTIVE', 'MEDIUM', false, u.id, NOW() - INTERVAL 10 DAY, NOW()
FROM user u WHERE u.username = 'broker1'
AND NOT EXISTS (SELECT 1 FROM policy WHERE name = 'Business Liability');

INSERT INTO policy (name, description, type, sub_type, monthly_premium, yearly_premium, coverage, deductible, status, risk_level, requires_approval, uploaded_by, created_at, updated_at)
SELECT 'Travel Protection', 'International travel insurance with medical coverage', 'TRAVEL', 'INTERNATIONAL', 25.99, 311.88, 'Medical: $100K, Trip Cancellation: $10K, Baggage: $2K', 100.00, 'PENDING', 'LOW', true, u.id, NOW() - INTERVAL 5 DAY, NOW()
FROM user u WHERE u.username = 'broker2'
AND NOT EXISTS (SELECT 1 FROM policy WHERE name = 'Travel Protection');

-- Insert user policies (relationships between users and policies)
INSERT INTO user_policy (user_id, policy_id, status, enrollment_date, premium_amount, coverage_start_date, coverage_end_date, created_at, updated_at)
SELECT u.id, p.id, 'ACTIVE', NOW() - INTERVAL 25 DAY, 299.99, NOW() - INTERVAL 25 DAY, NOW() + INTERVAL 340 DAY, NOW() - INTERVAL 25 DAY, NOW()
FROM user u, policy p 
WHERE u.username = 'user1' AND p.name = 'Comprehensive Health Plan'
AND NOT EXISTS (SELECT 1 FROM user_policy up WHERE up.user_id = u.id AND up.policy_id = p.id);

INSERT INTO user_policy (user_id, policy_id, status, enrollment_date, premium_amount, coverage_start_date, coverage_end_date, created_at, updated_at)
SELECT u.id, p.id, 'ACTIVE', NOW() - INTERVAL 20 DAY, 149.99, NOW() - INTERVAL 20 DAY, NOW() + INTERVAL 345 DAY, NOW() - INTERVAL 20 DAY, NOW()
FROM user u, policy p 
WHERE u.username = 'user1' AND p.name = 'Auto Full Coverage'
AND NOT EXISTS (SELECT 1 FROM user_policy up WHERE up.user_id = u.id AND up.policy_id = p.id);

INSERT INTO user_policy (user_id, policy_id, status, enrollment_date, premium_amount, coverage_start_date, coverage_end_date, created_at, updated_at)
SELECT u.id, p.id, 'ACTIVE', NOW() - INTERVAL 15 DAY, 89.99, NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 350 DAY, NOW() - INTERVAL 15 DAY, NOW()
FROM user u, policy p 
WHERE u.username = 'user2' AND p.name = 'Home Protection Plus'
AND NOT EXISTS (SELECT 1 FROM user_policy up WHERE up.user_id = u.id AND up.policy_id = p.id);

INSERT INTO user_policy (user_id, policy_id, status, enrollment_date, premium_amount, coverage_start_date, coverage_end_date, created_at, updated_at)
SELECT u.id, p.id, 'ACTIVE', NOW() - INTERVAL 12 DAY, 199.99, NOW() - INTERVAL 12 DAY, NOW() + INTERVAL 353 DAY, NOW() - INTERVAL 12 DAY, NOW()
FROM user u, policy p 
WHERE u.username = 'user3' AND p.name = 'Business Liability'
AND NOT EXISTS (SELECT 1 FROM user_policy up WHERE up.user_id = u.id AND up.policy_id = p.id);

-- Insert sample claims
INSERT INTO claim (claim_number, user_policy_id, type, status, claim_amount, approved_amount, incident_date, incident_location, incident_description, ai_analysis_result, ai_confidence_score, fraud_score, auto_approved, requires_manual_review, created_at, updated_at)
SELECT 'CLM-2024-001', up.id, 'MEDICAL', 'APPROVED', 2500.00, 2200.00, NOW() - INTERVAL 10 DAY, 'General Hospital, Downtown', 'Emergency room visit for chest pain, tests showed no cardiac issues', 'Low risk claim, standard medical procedure', 0.95, 0.15, true, false, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 2 DAY
FROM user_policy up
JOIN user u ON up.user_id = u.id
JOIN policy p ON up.policy_id = p.id
WHERE u.username = 'user1' AND p.name = 'Comprehensive Health Plan'
AND NOT EXISTS (SELECT 1 FROM claim WHERE claim_number = 'CLM-2024-001');

INSERT INTO claim (claim_number, user_policy_id, type, status, claim_amount, approved_amount, incident_date, incident_location, incident_description, ai_analysis_result, ai_confidence_score, fraud_score, auto_approved, requires_manual_review, created_at, updated_at)
SELECT 'CLM-2024-002', up.id, 'COLLISION', 'PENDING', 8500.00, null, NOW() - INTERVAL 5 DAY, 'Main St & 5th Ave Intersection', 'Rear-end collision during heavy traffic, significant damage to rear bumper and trunk', 'Standard collision claim, waiting for police report verification', 0.78, 0.25, false, true, NOW() - INTERVAL 3 DAY, NOW()
FROM user_policy up
JOIN user u ON up.user_id = u.id
JOIN policy p ON up.policy_id = p.id
WHERE u.username = 'user1' AND p.name = 'Auto Full Coverage'
AND NOT EXISTS (SELECT 1 FROM claim WHERE claim_number = 'CLM-2024-002');

INSERT INTO claim (claim_number, user_policy_id, type, status, claim_amount, approved_amount, incident_date, incident_location, incident_description, ai_analysis_result, ai_confidence_score, fraud_score, auto_approved, requires_manual_review, created_at, updated_at)
SELECT 'CLM-2024-003', up.id, 'WATER_DAMAGE', 'APPROVED', 12000.00, 10800.00, NOW() - INTERVAL 12 DAY, '123 Oak Street, Kitchen Area', 'Burst pipe in kitchen caused flooding, damaged flooring and cabinets', 'Standard water damage claim, plumbing report confirms burst pipe', 0.89, 0.12, false, false, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 1 DAY
FROM user_policy up
JOIN user u ON up.user_id = u.id
JOIN policy p ON up.policy_id = p.id
WHERE u.username = 'user2' AND p.name = 'Home Protection Plus'
AND NOT EXISTS (SELECT 1 FROM claim WHERE claim_number = 'CLM-2024-003');

INSERT INTO claim (claim_number, user_policy_id, type, status, claim_amount, approved_amount, incident_date, incident_location, incident_description, ai_analysis_result, ai_confidence_score, fraud_score, auto_approved, requires_manual_review, created_at, updated_at)
SELECT 'CLM-2024-004', up.id, 'LIABILITY', 'REJECTED', 25000.00, 0.00, NOW() - INTERVAL 20 DAY, 'Client Office Building', 'Customer slip and fall incident, claim for medical expenses and lost wages', 'High fraud indicators detected, inconsistent witness statements', 0.45, 0.87, false, true, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 5 DAY
FROM user_policy up
JOIN user u ON up.user_id = u.id
JOIN policy p ON up.policy_id = p.id
WHERE u.username = 'user3' AND p.name = 'Business Liability'
AND NOT EXISTS (SELECT 1 FROM claim WHERE claim_number = 'CLM-2024-004');

INSERT INTO claim (claim_number, user_policy_id, type, status, claim_amount, approved_amount, incident_date, incident_location, incident_description, ai_analysis_result, ai_confidence_score, fraud_score, auto_approved, requires_manual_review, created_at, updated_at)
SELECT 'CLM-2024-005', up.id, 'DENTAL', 'PENDING', 1800.00, null, NOW() - INTERVAL 3 DAY, 'Downtown Dental Clinic', 'Root canal treatment and crown replacement, routine dental procedure', 'Standard dental claim, waiting for treatment completion verification', 0.92, 0.08, false, false, NOW() - INTERVAL 1 DAY, NOW()
FROM user_policy up
JOIN user u ON up.user_id = u.id
JOIN policy p ON up.policy_id = p.id
WHERE u.username = 'user1' AND p.name = 'Comprehensive Health Plan'
AND NOT EXISTS (SELECT 1 FROM claim WHERE claim_number = 'CLM-2024-005');
