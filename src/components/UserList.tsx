import { useState } from 'react';
import { Search, Filter, Users as UsersIcon } from 'lucide-react';
import { User, UserRole } from '@/interface/User';
import UserCard from './UserCard';

interface UserListProps {
  users: User[];
}

const UserList = ({ users }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getUserStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: users.length,
      farmer: stats.farmer || 0,
      consumer: stats.consumer || 0,
      driver: stats.driver || 0,
    };
  };

  const stats = getUserStats();

  const containerStyle: React.CSSProperties = { marginBottom: 32 };
  const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', marginBottom: 24 };
  const iconStyle: React.CSSProperties = { marginRight: 12, color: '#2563eb' };
  const statsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 };
  const statCardStyle: React.CSSProperties = { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' };
  const statTitleStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', marginBottom: 8 };
  const statNumberStyle = (color: string): React.CSSProperties => ({ fontSize: 28, fontWeight: 700, color });

  const searchRowStyle: React.CSSProperties = { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' };
  const searchInputWrapper: React.CSSProperties = { position: 'relative', flex: '1' };
  const searchInputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14 };
  const filterSelectStyle: React.CSSProperties = { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 10, minWidth: 150 };

  const noUsersStyle: React.CSSProperties = { textAlign: 'center', padding: 48, color: '#6b7280' };
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 };

  return (
    <div>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <UsersIcon size={28} style={iconStyle} />
          <h2 style={{fontSize: 20, fontWeight: 700, color: '#111827'}}>User Management</h2>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Total Users</h3>
            <p style={statNumberStyle('#2563eb')}>{stats.total}</p>
          </div>
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Farmers</h3>
            <p style={statNumberStyle('#10b981')}>{stats.farmer}</p>
          </div>
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Consumers</h3>
            <p style={statNumberStyle('#2563eb')}>{stats.consumer}</p>
          </div>
          <div style={statCardStyle}>
            <h3 style={statTitleStyle}>Drivers</h3>
            <p style={statNumberStyle('#f97316')}>{stats.driver}</p>
          </div>
        </div>

        <div style={searchRowStyle}>
          <div style={searchInputWrapper}>
            <Search size={16} style={{position: 'absolute', left: 12, top: 12, color: '#9ca3af'}} />
            <input type="text" placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={searchInputStyle} />
          </div>
          <div>
            <Filter size={16} style={{position: 'absolute', left: 12, top: 12, color: '#9ca3af'}} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')} style={filterSelectStyle}>
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="consumer">Consumers</option>
              <option value="driver">Drivers</option>
            </select>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={noUsersStyle}>
          <UsersIcon size={56} color="#d1d5db" />
          <h3 style={{fontSize: 18, fontWeight: 600, color: '#111827', marginTop: 12}}>No users found</h3>
          <p style={{color: '#6b7280'}}>{searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first user.'}</p>
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;