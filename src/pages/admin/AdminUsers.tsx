import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import AdminLoadingSpinner from '@/components/admin/AdminLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Users, Shield, ShieldOff } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/');
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*')
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (rolesRes.data) setRoles(rolesRes.data);
  };

  const isUserAdmin = (userId: string) => {
    return roles.some(r => r.user_id === userId && r.role === 'admin');
  };

  const toggleAdmin = async (userId: string) => {
    const userIsAdmin = isUserAdmin(userId);
    
    if (userIsAdmin) {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      toast.success('Rôle admin retiré');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      toast.success('Rôle admin ajouté');
    }
    loadData();
  };

  if (loading) return <AdminLoadingSpinner />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>

        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" /> Gestion des Utilisateurs
        </h1>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name || 'Non renseigné'}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      {isUserAdmin(profile.id) ? (
                        <Badge className="bg-primary">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">Utilisateur</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant={isUserAdmin(profile.id) ? "destructive" : "outline"}
                        onClick={() => toggleAdmin(profile.id)}
                      >
                        {isUserAdmin(profile.id) ? (
                          <><ShieldOff className="h-4 w-4 mr-1" /> Retirer Admin</>
                        ) : (
                          <><Shield className="h-4 w-4 mr-1" /> Rendre Admin</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUsers;
