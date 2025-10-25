CREATE TABLE IF NOT EXISTS incentive_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incentive_id UUID NOT NULL REFERENCES "Incentives"(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    regulations TEXT,
    required_documents JSONB DEFAULT '[]',
    application_steps JSONB DEFAULT '[]',
    eligibility_criteria JSONB DEFAULT '{}',
    deadlines JSONB DEFAULT '{}',
    contact_info JSONB DEFAULT '{}',
    faqs JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    published_at TIMESTAMP,
    created_by UUID REFERENCES "Users"(id),
    updated_by UUID REFERENCES "Users"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS incentive_guides_incentive_id_idx ON incentive_guides(incentive_id);
CREATE INDEX IF NOT EXISTS incentive_guides_is_active_idx ON incentive_guides(is_active);
CREATE INDEX IF NOT EXISTS incentive_guides_published_at_idx ON incentive_guides(published_at);