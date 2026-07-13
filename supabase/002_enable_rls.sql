-- Migration: 002_enable_rls.sql (Version 1.1)
-- Description: Implement production-grade Row Level Security (RLS) policies, force RLS, secure helper functions, and configure role-based access control for HospitalityOS.

-- =========================================================================
-- FORCE ROW LEVEL SECURITY
-- =========================================================================
-- Enabling and forcing RLS ensures that even table owners or superusers (except bypassrls roles) 
-- are bound by these security rules, preventing accidental leaks in all execution contexts.

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels FORCE ROW LEVEL SECURITY;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches FORCE ROW LEVEL SECURITY;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.hotel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_users FORCE ROW LEVEL SECURITY;


-- =========================================================================
-- HELPER FUNCTIONS
-- =========================================================================
-- These functions are created as SECURITY DEFINER to safely read security-related
-- state (such as roles and current active hotel) without causing infinite RLS recursion.
-- They are marked as STABLE for performance optimization within query plans.

-- Function: current_hotel_id()
-- Retrieve the hotel_id of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.current_hotel_id()
RETURNS UUID AS $$
DECLARE
    v_hotel_id UUID;
BEGIN
    SELECT u.hotel_id INTO v_hotel_id
    FROM public.hotel_users u
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1;
    RETURN v_hotel_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function: current_user_role()
-- Retrieve the role name of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role_name TEXT;
BEGIN
    SELECT r.name INTO v_role_name
    FROM public.hotel_users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.auth_user_id = auth.uid()
    LIMIT 1;
    RETURN v_role_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function: is_platform_admin()
-- Check if the current user is a global platform administrator. Returns FALSE as a placeholder.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Placeholder implementation.
    -- This function will query the platform_admins table in a future migration.
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;


-- =========================================================================
-- FUNCTION PERMISSIONS (Hardening)
-- =========================================================================
-- Restrict execution permissions strictly to authenticated users.
-- This prevents anonymous public access to core database session attributes.

REVOKE ALL ON FUNCTION public.current_hotel_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_hotel_id() TO authenticated;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;


-- =========================================================================
-- HOTELS POLICIES
-- =========================================================================

-- SELECT: Authenticated users can view only their own hotel or if they are platform admin.
CREATE POLICY select_hotels_policy ON public.hotels
    FOR SELECT
    TO authenticated
    USING (
        id = public.current_hotel_id()
        OR public.is_platform_admin()
    );

-- UPDATE: Only owners or platform admins can update their hotel.
CREATE POLICY update_hotels_policy ON public.hotels
    FOR UPDATE
    TO authenticated
    USING (
        (id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    )
    WITH CHECK (
        (id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );


-- =========================================================================
-- BRANCHES POLICIES
-- =========================================================================

-- SELECT: Authenticated users can view branches belonging to their hotel.
CREATE POLICY select_branches_policy ON public.branches
    FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.current_hotel_id()
        OR public.is_platform_admin()
    );

-- INSERT: Only Owners and Managers can insert branches into their hotel.
CREATE POLICY insert_branches_policy ON public.branches
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() IN ('Owner', 'Manager'))
        OR public.is_platform_admin()
    );

-- UPDATE: Only Owners and Managers can update branches in their hotel.
CREATE POLICY update_branches_policy ON public.branches
    FOR UPDATE
    TO authenticated
    USING (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() IN ('Owner', 'Manager'))
        OR public.is_platform_admin()
    )
    WITH CHECK (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() IN ('Owner', 'Manager'))
        OR public.is_platform_admin()
    );

-- DELETE: Only Owners or Platform Admins can delete branches.
CREATE POLICY delete_branches_policy ON public.branches
    FOR DELETE
    TO authenticated
    USING (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );


-- =========================================================================
-- ROLES POLICIES
-- =========================================================================

-- SELECT: Authenticated users can view roles belonging to their hotel.
CREATE POLICY select_roles_policy ON public.roles
    FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.current_hotel_id()
        OR public.is_platform_admin()
    );

-- INSERT: Only Owners can insert roles into their hotel.
CREATE POLICY insert_roles_policy ON public.roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );

-- UPDATE: Only Owners can update roles within their hotel.
CREATE POLICY update_roles_policy ON public.roles
    FOR UPDATE
    TO authenticated
    USING (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    )
    WITH CHECK (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );

-- DELETE: Only Owners can delete roles.
CREATE POLICY delete_roles_policy ON public.roles
    FOR DELETE
    TO authenticated
    USING (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );


-- =========================================================================
-- PERMISSIONS POLICIES
-- =========================================================================

-- SELECT: Authenticated users can read the system-wide permissions catalogue.
CREATE POLICY select_permissions_policy ON public.permissions
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated'
        OR public.is_platform_admin()
    );

-- INSERT/UPDATE/DELETE: Restricted purely to Platform Admins.
CREATE POLICY insert_permissions_policy ON public.permissions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_platform_admin());

CREATE POLICY update_permissions_policy ON public.permissions
    FOR UPDATE
    TO authenticated
    USING (public.is_platform_admin())
    WITH CHECK (public.is_platform_admin());

CREATE POLICY delete_permissions_policy ON public.permissions
    FOR DELETE
    TO authenticated
    USING (public.is_platform_admin());


-- =========================================================================
-- ROLE PERMISSIONS POLICIES
-- =========================================================================

-- SELECT: Authenticated users can view role permissions linked to roles in their hotel.
CREATE POLICY select_role_permissions_policy ON public.role_permissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND (r.hotel_id = public.current_hotel_id() OR public.is_platform_admin())
        )
    );

-- INSERT: Only Owners can add permissions to roles in their hotel.
CREATE POLICY insert_role_permissions_policy ON public.role_permissions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND r.hotel_id = public.current_hotel_id()
        )
        AND (public.current_user_role() = 'Owner' OR public.is_platform_admin())
    );

-- UPDATE: Only Owners can update permissions of roles in their hotel.
CREATE POLICY update_role_permissions_policy ON public.role_permissions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND r.hotel_id = public.current_hotel_id()
        )
        AND (public.current_user_role() = 'Owner' OR public.is_platform_admin())
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND r.hotel_id = public.current_hotel_id()
        )
        AND (public.current_user_role() = 'Owner' OR public.is_platform_admin())
    );

-- DELETE: Only Owners can delete role permissions of roles in their hotel.
CREATE POLICY delete_role_permissions_policy ON public.role_permissions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND r.hotel_id = public.current_hotel_id()
        )
        AND (public.current_user_role() = 'Owner' OR public.is_platform_admin())
    );


-- =========================================================================
-- HOTEL USERS POLICIES
-- =========================================================================

-- SELECT: Authenticated users can view other hotel users belonging to their hotel.
CREATE POLICY select_hotel_users_policy ON public.hotel_users
    FOR SELECT
    TO authenticated
    USING (
        hotel_id = public.current_hotel_id()
        OR public.is_platform_admin()
    );

-- INSERT: Only Owners can invite/create hotel users in their hotel.
CREATE POLICY insert_hotel_users_policy ON public.hotel_users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );

-- UPDATE: Own profile update, Manager update on employees, Owner update on anyone in hotel.
CREATE POLICY update_hotel_users_policy ON public.hotel_users
    FOR UPDATE
    TO authenticated
    USING (
        -- Update own profile
        (auth_user_id = auth.uid())
        -- Managers can update employees in their hotel (i.e., users with non-Owner & non-Manager roles)
        OR (
            hotel_id = public.current_hotel_id()
            AND public.current_user_role() = 'Manager'
            AND role_id NOT IN (
                SELECT id FROM public.roles 
                WHERE hotel_id = public.current_hotel_id() 
                  AND name IN ('Owner', 'Manager')
            )
        )
        -- Owners can update any user in their hotel
        OR (
            hotel_id = public.current_hotel_id()
            AND public.current_user_role() = 'Owner'
        )
        -- Platform Admins
        OR public.is_platform_admin()
    )
    WITH CHECK (
        -- Update own profile
        (auth_user_id = auth.uid())
        -- Managers can update employees in their hotel (i.e., users with non-Owner & non-Manager roles)
        OR (
            hotel_id = public.current_hotel_id()
            AND public.current_user_role() = 'Manager'
            AND role_id NOT IN (
                SELECT id FROM public.roles 
                WHERE hotel_id = public.current_hotel_id() 
                  AND name IN ('Owner', 'Manager')
            )
        )
        -- Owners can update any user in their hotel
        OR (
            hotel_id = public.current_hotel_id()
            AND public.current_user_role() = 'Owner'
        )
        -- Platform Admins
        OR public.is_platform_admin()
    );

-- DELETE: Only Owners can delete hotel users.
CREATE POLICY delete_hotel_users_policy ON public.hotel_users
    FOR DELETE
    TO authenticated
    USING (
        (hotel_id = public.current_hotel_id() AND public.current_user_role() = 'Owner')
        OR public.is_platform_admin()
    );
