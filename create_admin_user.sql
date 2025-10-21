-- Admin kullanıcısı oluşturma script'i
-- Şifre: admin123 (hash'lenmiş hali)

INSERT INTO users (
    id, 
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    status, 
    email_verified, 
    created_at, 
    updated_at
) VALUES (
    uuid_generate_v4(), 
    'admin@tesvik360.com', 
    '$2b$12$LQv3c1yqBwEHFl5aBLx/ue5YjgTAlzXRlhHkqJ3swEfRvQjDbHUtW', 
    'Admin', 
    'User', 
    'admin', 
    'active', 
    true, 
    NOW(), 
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Test üye kullanıcısı oluşturma
INSERT INTO users (
    id, 
    email, 
    password, 
    first_name, 
    last_name, 
    role, 
    status, 
    email_verified, 
    created_at, 
    updated_at
) VALUES (
    uuid_generate_v4(), 
    'test@example.com', 
    '$2b$12$LQv3c1yqBwEHFl5aBLx/ue5YjgTAlzXRlhHkqJ3swEfRvQjDbHUtW', 
    'Test', 
    'User', 
    'member', 
    'active', 
    true, 
    NOW(), 
    NOW()
) ON CONFLICT (email) DO NOTHING;