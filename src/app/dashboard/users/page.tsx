'use client';

import { useEffect, useState } from 'react';
import { User, CreateUserData } from '@/interface/User';
import UserSidebar from '@/components/UserSidebar';
import Dashboard from '@/components/Dashboard';
import UserList from '@/components/UserList';
import UserForm from '@/components/UserForm';
import Sidebar from "@/components/sidebar";

// Use relative /api by default (proxied via next.config.ts rewrites)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const normalizeUser = (raw: any): User => {
    // NOTE: backend now returns numeric id and separate name fields (first_name/last_name)
    const id = typeof raw.id === 'number' ? raw.id : parseInt(raw.id, 10);
    const firstName = raw.first_name || raw.firstName || (raw.name ? String(raw.name).split(' ')[0] : '');
    const lastName = raw.last_name || raw.lastName || (raw.name ? String(raw.name).split(' ').slice(1).join(' ') : '');
    return {
      id: Number.isNaN(id) ? 0 : id,
      email: String(raw.email ?? ''),
      firstName,
      lastName,
      contactNumber: String(raw.phone ?? raw.contact_number ?? raw.contactNumber ?? ''),
      role: (raw.role ?? 'consumer') as User['role'],
      status: (raw.status ?? 'active') as User['status'],
      createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.created_at ?? raw.createdAt ?? Date.now()),
      address: String(raw.address ?? ''),
    };
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/users`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load users');
        const data = await res.json();
        const list = Array.isArray(data?.data ?? data) ? (data.data ?? data) : [];
        setUsers(list.map(normalizeUser));
      } catch (e: any) {
        setError(e?.message || 'Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddUser = async (userData: CreateUserData) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || 'Failed to create user');
      }

      const created = await res.json();
      const createdUser = normalizeUser(created?.data ?? created);
      setUsers(prev => [...prev, createdUser]);
      setShowSuccessMessage(true);
      setActiveTab('users');
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'Failed to create user');
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setActiveTab('edit-user');
  };

  const handleUpdateUser = async (userId: number, updates: CreateUserData) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Failed to update user');
      }
      const updated = await res.json();
      const updUser = normalizeUser(updated?.data ?? updated);
      setUsers(prev => prev.map(u => (u.id === userId ? updUser : u)));
      setEditingUser(null);
      setActiveTab('users');
    } catch (e: any) {
      setError(e?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Failed to delete user');
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      setError(e?.message || 'Failed to delete user');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard users={users} onNavigate={setActiveTab} />;
      case 'users':
        return <UserList users={users} onEdit={handleStartEdit} onDelete={(u) => handleDeleteUser(u.id)} />;
      case 'add-user':
        return (
          <UserForm 
            onSubmit={handleAddUser}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'edit-user':
        return (
          <UserForm
            onSubmit={(data) => editingUser && handleUpdateUser(editingUser.id, data)}
            onCancel={() => { setEditingUser(null); setActiveTab('users'); }}
            initialValues={editingUser ? {
              firstName: editingUser.firstName,
              lastName: editingUser.lastName,
              email: editingUser.email,
              contactNumber: editingUser.contactNumber,
              role: editingUser.role,
              address: editingUser.address,
            } : undefined}
            submitLabel="Update User"
          />
        );
      case 'analytics':
        return (
          <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: 24, textAlign: 'center'}}>
            <h2 style={{fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12}}>Analytics</h2>
            <p style={{color: '#6b7280'}}>Analytics dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: 24, textAlign: 'center'}}>
            <h2 style={{fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12}}>Settings</h2>
            <p style={{color: '#6b7280'}}>Settings panel coming soon...</p>
          </div>
        );
      default:
        return <Dashboard users={users} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc', display: 'flex', gap: 24}}>
      {/* Main app sidebar on the very left */}
      <div style={{flex: '0 0 240px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'}}>
        <Sidebar />
      </div>

      {/* Mini user sidebar next to the main sidebar */}
      <div style={{flex: '0 0 280px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'}}>
        <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div style={{flex: 1}}>
        <main style={{padding: 32}}>
          {loading && (
            <div style={{marginBottom: 16, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '10px 14px', borderRadius: 8}}>Loading users...</div>
          )}
          {error && (
            <div style={{marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 8}}>{error}</div>
          )}
          {showSuccessMessage && (
            <div style={{marginBottom: 24, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#065f46', padding: '12px 16px', borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.04)'}}>
              <p style={{fontWeight: 600}}>Success! User has been added successfully.</p>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
}