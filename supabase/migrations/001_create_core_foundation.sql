-- Migration: 001_create_core_foundation.sql (Version 1.2)
-- Description: Core schema definition for HospitalityOS including hotels, branches, roles, permissions, role_permissions, and hotel_users with production-ready constraints.

-- Reusable update trigger function to keep updated_at in sync
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 1. HOTELS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    hotel_type TEXT NOT NULL
        CHECK (
            hotel_type IN (
                'Hotel',
                'Guest House',
                'Hostel',
                'Apartment',
                'Resort',
                'Lodge'
            )
        ),
    registration_number TEXT,
    tax_number TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    website TEXT,
    logo_url TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    currency TEXT NOT NULL
        DEFAULT 'GHS'
        CHECK (
            currency IN (
                'GHS',
                'USD',
                'EUR',
                'GBP',
                'NGN',
                'KES'
            )
        ),
    timezone TEXT NOT NULL
        DEFAULT 'Africa/Accra',
    created_by UUID
        REFERENCES auth.users(id)
        ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER update_hotels_updated_at
    BEFORE UPDATE ON public.hotels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 2. BRANCHES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    is_head_office BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_branch_code_per_hotel
        UNIQUE (hotel_id, code),
    CONSTRAINT unique_branch_name_per_hotel
        UNIQUE (hotel_id, name)
);

CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON public.branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 3. ROLES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT unique_hotel_role_name UNIQUE (hotel_id, name)
);

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 4. PERMISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    module TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ==========================================
-- 5. ROLE_PERMISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL
        REFERENCES public.roles(id)
        ON DELETE CASCADE,
    permission_id UUID NOT NULL
        REFERENCES public.permissions(id)
        ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT now()
        NOT NULL,
    CONSTRAINT unique_role_permission
        UNIQUE(role_id, permission_id)
);

-- ==========================================
-- 6. HOTEL_USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.hotel_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_number TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    profile_photo TEXT,
    employment_status TEXT NOT NULL
        DEFAULT 'ACTIVE'
        CHECK (
            employment_status IN (
                'ACTIVE',
                'INACTIVE',
                'SUSPENDED',
                'RESIGNED'
            )
        ),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_employee_number
        UNIQUE (hotel_id, employee_number),
    CONSTRAINT unique_hotel_email
        UNIQUE (hotel_id, email)
);

CREATE TRIGGER update_hotel_users_updated_at
    BEFORE UPDATE ON public.hotel_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==========================================
-- Indexes for Hotels
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON public.hotels(slug);
CREATE INDEX IF NOT EXISTS idx_hotels_created_by ON public.hotels(created_by);

-- Indexes for Branches
CREATE INDEX IF NOT EXISTS idx_branches_hotel_id ON public.branches(hotel_id);
CREATE INDEX IF NOT EXISTS idx_branches_code ON public.branches(code);

-- Indexes for Roles
CREATE INDEX IF NOT EXISTS idx_roles_hotel_id ON public.roles(hotel_id);

-- Indexes for Permissions
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);

-- Indexes for Role Permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- Indexes for Hotel Users
CREATE INDEX IF NOT EXISTS idx_hotel_users_hotel_id ON public.hotel_users(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_users_branch_id ON public.hotel_users(branch_id);
CREATE INDEX IF NOT EXISTS idx_hotel_users_role_id ON public.hotel_users(role_id);
CREATE INDEX IF NOT EXISTS idx_hotel_users_auth_user_id ON public.hotel_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_users_email ON public.hotel_users(email);
