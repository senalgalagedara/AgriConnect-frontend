'use client';

import { useState } from 'react';
import { User, CreateUserData } from '@/interface/User';
import Sidebar from '@/components/UserSidebar';
import Dashboard from '@/components/Dashboard';
import UserList from '@/components/UserList';
import UserForm from '@/components/UserForm';

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
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <Dashboard users={users} onNavigate={setActiveTab} />;
    }
  };

  const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#f8fafc' };
  const contentWrapperStyle: React.CSSProperties = { marginLeft: 256 };
  const mainStyle: React.CSSProperties = { padding: 32 };
  const successStyle: React.CSSProperties = { marginBottom: 24, background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: 8, boxShadow: '0 4px 10px rgba(16,185,129,0.06)' };

  return (
    <div style={pageStyle}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={contentWrapperStyle}>
        <main style={mainStyle}>
          {showSuccessMessage && (
            <div style={successStyle}>
              <p style={{fontWeight: 600}}>Success! User has been added successfully.</p>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
}