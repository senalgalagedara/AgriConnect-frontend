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

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <UsersIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Farmers</h3>
            <p className="text-3xl font-bold text-green-600">{stats.farmer}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Consumers</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.consumer}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Drivers</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.driver}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="consumer">Consumers</option>
              <option value="driver">Drivers</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm || roleFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first user.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;