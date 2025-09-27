import { Users, UserPlus, TrendingUp, Activity } from 'lucide-react';
import { User } from '@/interface/User';

interface DashboardProps {
  users: User[];
  onNavigate: (tab: string) => void;
}

const Dashboard = ({ users, onNavigate }: DashboardProps) => {
  const getUserStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      acc.active += user.status === 'active' ? 1 : 0;
      return acc;
    }, { farmer: 0, consumer: 0, driver: 0, active: 0 } as Record<string, number>);
    
    return {
      total: users.length,
      farmer: stats.farmer,
      consumer: stats.consumer,
      driver: stats.driver,
      active: stats.active,
    };
  };

  const stats = getUserStats();
  const recentUsers = users.slice(-5).reverse();

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Farmers',
      value: stats.farmer,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Growth Rate',
      value: '12%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to UserHub</h1>
        <p className="text-gray-600">Manage your users efficiently with our comprehensive dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('add-user')}
              className="w-full flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <UserPlus className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-800">Add New User</p>
                <p className="text-sm text-blue-600">Create farmer, consumer, or driver accounts</p>
              </div>
            </button>
            <button
              onClick={() => onNavigate('users')}
              className="w-full flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Users className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-800">Manage Users</p>
                <p className="text-sm text-gray-600">View and manage all registered users</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users added yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Distribution by Role</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">{stats.farmer}</span>
            </div>
            <p className="font-medium text-gray-800">Farmers</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">{stats.consumer}</span>
            </div>
            <p className="font-medium text-gray-800">Consumers</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-600">{stats.driver}</span>
            </div>
            <p className="font-medium text-gray-800">Drivers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;