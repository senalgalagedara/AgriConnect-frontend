'use client';

import { useState } from 'react';
import { User, CreateUserData } from '@/interface/User';
import UserSidebar from '@/components/UserSidebar';
import Dashboard from '@/components/Dashboard';
import UserList from '@/components/UserList';
import UserForm from '@/components/UserForm';
import Sidebar from "@/components/sidebar";

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      role: 'farmer',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      address: '123 Farm Road, Green Valley, CA 94534',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 987-6543',
      role: 'consumer',
      status: 'active',
      createdAt: new Date('2024-01-20'),
      address: '456 Oak Street, Downtown, CA 94105',
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      role: 'driver',
      status: 'active',
      createdAt: new Date('2024-01-25'),
      address: '789 Pine Avenue, Riverside, CA 92501',
    },
  ]);
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddUser = (userData: CreateUserData) => {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      status: 'active',
      createdAt: new Date(),
    };
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    setShowSuccessMessage(true);
    setActiveTab('users');
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard users={users} onNavigate={setActiveTab} />;
      case 'users':
        return <UserList users={users} />;
      case 'add-user':
        return (
          <UserForm 
            onSubmit={handleAddUser}
            onCancel={() => setActiveTab('dashboard')}
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