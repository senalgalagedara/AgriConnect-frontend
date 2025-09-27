import { Users, UserPlus, BarChart3, Settings, Home } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'add-user', label: 'Add User', icon: UserPlus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">UserHub</h1>
        <p className="text-sm text-gray-600">Management Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-100 border-r-4 border-blue-500 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;