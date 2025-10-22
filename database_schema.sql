-- =====================================================
-- TEŞVIK360 VERİTABANI ŞEMASI
-- PostgreSQL Database Schema for Tesvik360 Application
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE - Kullanıcılar
-- =====================================================
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'company' CHECK (role IN ('admin', 'company', 'consultant', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    avatar VARCHAR(255),
    company_name VARCHAR(100),
    tax_number VARCHAR(20),
    tax_office VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    district VARCHAR(50),
    postal_code VARCHAR(10),
    website VARCHAR(255),
    sector_id UUID,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    refresh_token VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTORS TABLE - Sektörler
-- =====================================================
CREATE TABLE IF NOT EXISTS "Sectors" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INCENTIVE CATEGORIES TABLE - Teşvik Kategorileri
-- =====================================================
CREATE TABLE IF NOT EXISTS "IncentiveCategories" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INCENTIVE TYPES TABLE - Teşvik Türleri
-- =====================================================
CREATE TABLE IF NOT EXISTS "IncentiveTypes" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id UUID,
    code VARCHAR(20) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES "IncentiveCategories"(id)
);

-- =====================================================
-- DOCUMENT TYPES TABLE - Belge Türleri
-- =====================================================
CREATE TABLE IF NOT EXISTS "DocumentTypes" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(20) UNIQUE,
    is_required BOOLEAN DEFAULT FALSE,
    file_types TEXT[], -- JSON array of allowed file types
    max_file_size INTEGER DEFAULT 10485760, -- 10MB in bytes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INCENTIVES TABLE - Teşvikler
-- =====================================================
CREATE TABLE IF NOT EXISTS "Incentives" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    category_id UUID,
    type_id UUID,
    sector_id UUID,
    min_investment_amount DECIMAL(15,2),
    max_investment_amount DECIMAL(15,2),
    support_rate DECIMAL(5,2), -- Percentage
    max_support_amount DECIMAL(15,2),
    application_start_date DATE,
    application_end_date DATE,
    implementation_period INTEGER, -- in months
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'expired')),
    priority INTEGER DEFAULT 0,
    tags TEXT[], -- JSON array of tags
    requirements TEXT,
    benefits TEXT,
    application_process TEXT,
    contact_info JSONB,
    created_by UUID,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES "IncentiveCategories"(id),
    FOREIGN KEY (type_id) REFERENCES "IncentiveTypes"(id),
    FOREIGN KEY (sector_id) REFERENCES "Sectors"(id),
    FOREIGN KEY (created_by) REFERENCES "Users"(id)
);

-- =====================================================
-- APPLICATIONS TABLE - Başvurular
-- =====================================================
CREATE TABLE IF NOT EXISTS "Applications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    incentive_id UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_summary TEXT,
    investment_amount DECIMAL(15,2),
    requested_support_amount DECIMAL(15,2),
    implementation_period INTEGER, -- in months
    expected_start_date DATE,
    expected_completion_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled', 'completed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    submission_date TIMESTAMP,
    review_date TIMESTAMP,
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    admin_notes TEXT,
    consultant_id UUID,
    consultant_notes TEXT,
    consultant_assigned_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0,
    metadata JSONB, -- Additional flexible data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id),
    FOREIGN KEY (incentive_id) REFERENCES "Incentives"(id),
    FOREIGN KEY (consultant_id) REFERENCES "Users"(id)
);

-- =====================================================
-- APPLICATION INCENTIVES TABLE - Başvuru Teşvikleri (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS "ApplicationIncentives" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    incentive_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, incentive_id),
    FOREIGN KEY (application_id) REFERENCES "Applications"(id) ON DELETE CASCADE,
    FOREIGN KEY (incentive_id) REFERENCES "Incentives"(id) ON DELETE CASCADE
);

-- =====================================================
-- DOCUMENTS TABLE - Belgeler
-- =====================================================
CREATE TABLE IF NOT EXISTS "Documents" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    application_id UUID,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) DEFAULT 'other' CHECK (document_type IN (
        'identity', 'tax_certificate', 'trade_registry', 'financial_statement',
        'project_proposal', 'business_plan', 'contract', 'invoice', 'receipt',
        'certificate', 'permit', 'license', 'other'
    )),
    document_type_id UUID,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'archived')),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,
    notes TEXT,
    uploaded_by UUID,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    version INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id),
    FOREIGN KEY (application_id) REFERENCES "Applications"(id),
    FOREIGN KEY (document_type_id) REFERENCES "DocumentTypes"(id),
    FOREIGN KEY (uploaded_by) REFERENCES "Users"(id),
    FOREIGN KEY (reviewed_by) REFERENCES "Users"(id)
);

-- =====================================================
-- INCENTIVE DOCUMENTS TABLE - Teşvik Belgeleri (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS "IncentiveDocuments" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incentive_id UUID NOT NULL,
    document_type_id UUID NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incentive_id, document_type_id),
    FOREIGN KEY (incentive_id) REFERENCES "Incentives"(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES "DocumentTypes"(id) ON DELETE CASCADE
);

-- =====================================================
-- NOTIFICATIONS TABLE - Bildirimler
-- =====================================================
CREATE TABLE IF NOT EXISTS "Notifications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    category VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    related_id UUID, -- Related entity ID (application, incentive, etc.)
    related_type VARCHAR(50), -- Related entity type
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id)
);

-- =====================================================
-- TICKETS TABLE - Destek Talepleri
-- =====================================================
CREATE TABLE IF NOT EXISTS "Tickets" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID,
    resolution TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id),
    FOREIGN KEY (assigned_to) REFERENCES "Users"(id)
);

-- =====================================================
-- INDEXES - Performans için indeksler
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON "Users"(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON "Users"(status);
CREATE INDEX IF NOT EXISTS idx_users_sector_id ON "Users"(sector_id);

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON "Applications"(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_incentive_id ON "Applications"(incentive_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON "Applications"(status);
CREATE INDEX IF NOT EXISTS idx_applications_consultant_id ON "Applications"(consultant_id);
CREATE INDEX IF NOT EXISTS idx_applications_submission_date ON "Applications"(submission_date);

-- ApplicationIncentives table indexes
CREATE INDEX IF NOT EXISTS idx_application_incentives_application_id ON "ApplicationIncentives"(application_id);
CREATE INDEX IF NOT EXISTS idx_application_incentives_incentive_id ON "ApplicationIncentives"(incentive_id);

-- Incentives table indexes
CREATE INDEX IF NOT EXISTS idx_incentives_category_id ON "Incentives"(category_id);
CREATE INDEX IF NOT EXISTS idx_incentives_type_id ON "Incentives"(type_id);
CREATE INDEX IF NOT EXISTS idx_incentives_sector_id ON "Incentives"(sector_id);
CREATE INDEX IF NOT EXISTS idx_incentives_status ON "Incentives"(status);
CREATE INDEX IF NOT EXISTS idx_incentives_application_dates ON "Incentives"(application_start_date, application_end_date);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON "Documents"(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON "Documents"(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON "Documents"(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON "Documents"(status);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "Notifications"(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON "Notifications"(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON "Notifications"(type);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Users table foreign keys
ALTER TABLE "Users" ADD CONSTRAINT fk_users_sector 
    FOREIGN KEY (sector_id) REFERENCES "Sectors"(id);

-- =====================================================
-- SAMPLE DATA - Örnek Veriler
-- =====================================================

-- Insert default sectors
INSERT INTO "Sectors" (id, name, description, code) VALUES
    (uuid_generate_v4(), 'Teknoloji', 'Bilişim ve teknoloji sektörü', 'TECH'),
    (uuid_generate_v4(), 'Sağlık', 'Sağlık ve tıbbi hizmetler', 'HEALTH'),
    (uuid_generate_v4(), 'Eğitim', 'Eğitim ve öğretim hizmetleri', 'EDU'),
    (uuid_generate_v4(), 'Turizm', 'Turizm ve otelcilik', 'TOUR'),
    (uuid_generate_v4(), 'İmalat', 'İmalat ve üretim sektörü', 'MFG'),
    (uuid_generate_v4(), 'Tarım', 'Tarım ve hayvancılık', 'AGR'),
    (uuid_generate_v4(), 'Enerji', 'Enerji ve yenilenebilir enerji', 'ENERGY'),
    (uuid_generate_v4(), 'İnşaat', 'İnşaat ve gayrimenkul', 'CONST')
ON CONFLICT (name) DO NOTHING;

-- Insert incentive categories
INSERT INTO "IncentiveCategories" (id, name, description, code) VALUES
    (uuid_generate_v4(), 'Yatırım Teşvikleri', 'Yatırım projelerine yönelik teşvikler', 'INV'),
    (uuid_generate_v4(), 'İstihdam Teşvikleri', 'İstihdam artırımına yönelik teşvikler', 'EMP'),
    (uuid_generate_v4(), 'Ar-Ge Teşvikleri', 'Araştırma ve geliştirme projelerine yönelik teşvikler', 'RND'),
    (uuid_generate_v4(), 'İhracat Teşvikleri', 'İhracat artırımına yönelik teşvikler', 'EXP'),
    (uuid_generate_v4(), 'Bölgesel Teşvikler', 'Bölgesel kalkınmaya yönelik teşvikler', 'REG')
ON CONFLICT (name) DO NOTHING;

-- Insert document types
INSERT INTO "DocumentTypes" (id, name, description, code, is_required) VALUES
    (uuid_generate_v4(), 'Kimlik Belgesi', 'T.C. Kimlik kartı veya pasaport', 'ID', true),
    (uuid_generate_v4(), 'Vergi Levhası', 'Vergi levhası fotokopisi', 'TAX_CERT', true),
    (uuid_generate_v4(), 'Ticaret Sicil Gazetesi', 'Ticaret sicil gazetesi', 'TRADE_REG', true),
    (uuid_generate_v4(), 'Mali Tablo', 'Son 3 yıla ait mali tablolar', 'FIN_STMT', false),
    (uuid_generate_v4(), 'Proje Teklifi', 'Detaylı proje teklifi', 'PROJECT', true),
    (uuid_generate_v4(), 'İş Planı', 'İş planı ve fizibilite raporu', 'BUSINESS_PLAN', false)
ON CONFLICT (name) DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO "Users" (
    id, email, password, first_name, last_name, role, status, email_verified
) VALUES (
    uuid_generate_v4(),
    'admin@tesvik360.com',
    '$2b$12$LQv3c1yqBwEHFl5aBLx/ue5YjgTAlzXRlhHkqJ3swEfRvQjDbHUtW',
    'Admin',
    'User',
    'admin',
    'active',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert test member user (password: test123)
INSERT INTO "Users" (
    id, email, password, first_name, last_name, role, status, email_verified
) VALUES (
    uuid_generate_v4(),
    'test@example.com',
    '$2b$12$LQv3c1yqBwEHFl5aBLx/ue5YjgTAlzXRlhHkqJ3swEfRvQjDbHUtW',
    'Test',
    'User',
    'member',
    'active',
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- TRIGGERS - Otomatik güncelleme tetikleyicileri
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON "Sectors" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incentive_categories_updated_at BEFORE UPDATE ON "IncentiveCategories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incentive_types_updated_at BEFORE UPDATE ON "IncentiveTypes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON "DocumentTypes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incentives_updated_at BEFORE UPDATE ON "Incentives" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON "Applications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_incentives_updated_at BEFORE UPDATE ON "ApplicationIncentives" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON "Documents" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incentive_documents_updated_at BEFORE UPDATE ON "IncentiveDocuments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON "Notifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON "Tickets" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS - Kullanışlı görünümler
-- =====================================================

-- Active incentives with category and sector info
CREATE OR REPLACE VIEW active_incentives_view AS
SELECT 
    i.id,
    i.title,
    i.description,
    i.min_investment_amount,
    i.max_investment_amount,
    i.support_rate,
    i.max_support_amount,
    i.application_start_date,
    i.application_end_date,
    ic.name as category_name,
    s.name as sector_name,
    i.view_count,
    i.application_count,
    i.created_at
FROM "Incentives" i
LEFT JOIN "IncentiveCategories" ic ON i.category_id = ic.id
LEFT JOIN "Sectors" s ON i.sector_id = s.id
WHERE i.status = 'active'
AND (i.application_end_date IS NULL OR i.application_end_date >= CURRENT_DATE);

-- User applications with incentive info
CREATE OR REPLACE VIEW user_applications_view AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.status,
    a.investment_amount,
    a.requested_support_amount,
    a.submission_date,
    u.first_name || ' ' || u.last_name as user_name,
    u.email as user_email,
    u.company_name,
    i.title as incentive_title,
    c.first_name || ' ' || c.last_name as consultant_name,
    a.created_at
FROM "Applications" a
JOIN "Users" u ON a.user_id = u.id
LEFT JOIN "Incentives" i ON a.incentive_id = i.id
LEFT JOIN "Users" c ON a.consultant_id = c.id;

COMMIT;