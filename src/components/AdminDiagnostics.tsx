import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const AdminDiagnostics = () => {
  const { user, isAdmin, adminRole, loading } = useAdmin();
  const [dbRole, setDbRole] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabase();
  }, [user]);

  const checkDatabase = async () => {
    if (!user) return;
    
    console.log('🔍 [AdminDiagnostics] Starting DB check for user:', user.id);
    setDbLoading(true);
    setError(null);
    
    try {
      console.log('📝 [AdminDiagnostics] Querying user_roles...');
      
      // First try: just select all rows to test basic query
      console.log('🧪 [AdminDiagnostics] Testing basic query...');
      const { data: testData, error: testError } = await supabase
        .from('user_roles')
        .select('*');
      
      console.log('✅ [AdminDiagnostics] Basic test returned:', { count: testData?.length, error: testError?.message });
      
      if (testError) {
        console.error('❌ [AdminDiagnostics] Test error:', testError);
        setError(`DB Test Error: ${testError.message}`);
        return;
      }

      // Second try: now filter by user_id
      console.log('🔍 [AdminDiagnostics] Now filtering by user_id...');
      const { data: roles, error: queryError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .limit(10);
      
      console.log('✅ [AdminDiagnostics] Filtered query returned:', { roles, error: queryError?.message });
      
      if (queryError) {
        console.error('❌ [AdminDiagnostics] Query error:', queryError.message);
        setError(`DB Error: ${queryError.message}`);
        return;
      }

      if (roles && roles.length > 0) {
        console.log('✅ [AdminDiagnostics] Found roles:', roles);
        let highestRole: string = roles[0].role as string;
        if (roles.some((r: any) => r.role === 'admin_principal')) {
          highestRole = 'admin_principal';
        }
        console.log('🎯 [AdminDiagnostics] Setting DB role to:', highestRole);
        setDbRole(highestRole);
      } else {
        console.log('⚠️  [AdminDiagnostics] No roles found');
        setDbRole('NO_ROLE');
      }
    } catch (err) {
      console.error('❌ [AdminDiagnostics] Exception:', err);
      setError(`Error: ${String(err)}`);
    } finally {
      console.log('✅ [AdminDiagnostics] DB check complete');
      setDbLoading(false);
    }
  };

  const forceResetCache = () => {
    if (typeof window !== 'undefined' && (window as any).__DEBUG_resetAdminCache) {
      (window as any).__DEBUG_resetAdminCache();
      toast.success('Cache cleared - page will refresh');
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error('Debug function not available');
    }
  };

  const copyDiagnosis = () => {
    const text = `
=== ADMIN DIAGNOSIS ===
User Email: ${user?.email || 'N/A'}
User ID: ${user?.id || 'N/A'}

CACHE STATE: ${adminRole || 'null'}
DB STATE: ${dbRole || 'loading...'}
Is Admin (hook): ${isAdmin}
Role Match: ${adminRole === dbRole ? '✅ YES' : '❌ NO'}

Loading: ${loading}
DB Loading: ${dbLoading}
Error: ${error || 'none'}
`;
    navigator.clipboard.writeText(text);
    toast.success('Diagnosis copied to clipboard');
  };

  if (!user) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-2xl z-50 border-amber-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Admin Diagnostics
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={forceResetCache}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 text-xs">
        <div>
          <div className="font-semibold text-muted-foreground">Email:</div>
          <div className="font-mono break-all">{user.email}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-muted-foreground">Cache Role:</div>
            <Badge variant={adminRole === 'admin_principal' ? 'default' : 'secondary'}>
              {adminRole || 'null'}
            </Badge>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">DB Role:</div>
            <Badge variant={dbRole === 'admin_principal' ? 'default' : 'secondary'}>
              {dbLoading ? 'Loading...' : (dbRole || 'none')}
            </Badge>
          </div>
        </div>

        {adminRole !== dbRole && (
          <div className="bg-amber-50 dark:bg-amber-950 p-2 rounded border border-amber-200">
            <div className="text-amber-900 dark:text-amber-100 font-semibold">
              ⚠️ Mismatch detected!
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-200">
              Cache and DB don't match. Click refresh to reload.
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 p-2 rounded border border-red-200">
            <div className="text-red-900 dark:text-red-100">{error}</div>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={copyDiagnosis}
          className="w-full text-xs"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy Diagnosis
        </Button>

        <div className="text-xs text-muted-foreground">
          <div>🔄 Refresh clears local cache</div>
          <div>Copy sends info to clipboard</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDiagnostics;
