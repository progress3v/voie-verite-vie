import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AdminRole = 'admin_principal' | 'admin' | 'moderator' | null;

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkUserRoles = async (userId: string, email?: string) => {
      try {
        console.log('🔍 [useAdmin] Checking roles for user:', userId);
        
        // Query user roles first
        console.log('📝 [useAdmin] Querying user_roles table...');
        const { data: roles, error: queryError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        if (!mounted) return;
        
        if (!mounted) return;
        
        console.log('✅ [useAdmin] Query returned');
        
        if (queryError) {
          console.error('❌ [useAdmin] Query error:', queryError.message);
          setIsAdmin(false);
          setAdminRole(null);
        } else {
          // If superadmin with user role, fix it
          if (email === 'ahdybau@gmail.com' && roles && roles.some((r: any) => r.role === 'user')) {
            console.log('👑 [useAdmin] Superadmin detected with "user" role, fixing to admin_principal...');
            
            const { error: updateError } = await supabase
              .from('user_roles')
              .update({ role: 'admin_principal' })
              .eq('user_id', userId);
            
            if (updateError) {
              console.warn('⚠️ [useAdmin] Update failed:', updateError.message);
            } else {
              console.log('✅ [useAdmin] Role updated to admin_principal');
              // Update local state to reflect the change
              roles[0].role = 'admin_principal';
            }
          }
          
          handleRoles(roles);
        }
      } catch (err) {
        console.error('❌ [useAdmin] Exception:', err);
        setIsAdmin(false);
        setAdminRole(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
      }
    };

    const handleRoles = (roles: any[]) => {
      console.log('📋 [useAdmin] Found', roles?.length || 0, 'role(s)');
      
      if (!roles || roles.length === 0) {
        console.log('⚠️ [useAdmin] No roles');
        setIsAdmin(false);
        setAdminRole(null);
        return;
      }

      console.log('📋 [useAdmin] Roles:', roles.map((r: any) => r.role).join(', '));
      
      let foundRole: AdminRole = null;

      if (roles.some((r: any) => r.role === 'admin_principal')) {
        foundRole = 'admin_principal';
        console.log('👑 [useAdmin] Has admin_principal');
      } else if (roles.some((r: any) => r.role === 'admin')) {
        foundRole = 'admin';
        console.log('🛡️ [useAdmin] Has admin');
      } else if (roles.some((r: any) => r.role === 'moderator')) {
        foundRole = 'moderator';
        console.log('📢 [useAdmin] Has moderator');
      }

      if (foundRole) {
        console.log('🎉 [useAdmin] isAdmin = TRUE, role = ' + foundRole);
        setIsAdmin(true);
        setAdminRole(foundRole);
      } else {
        console.log('❌ [useAdmin] No admin role found');
        setIsAdmin(false);
        setAdminRole(null);
      }
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await checkUserRoles(currentUser.id, currentUser.email);
      } else {
        setLoading(false);
        setChecked(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          setLoading(true);
          await checkUserRoles(currentUser.id, currentUser.email);
        } else {
          setIsAdmin(false);
          setAdminRole(null);
          setLoading(false);
          setChecked(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, adminRole, loading, checked };
};
