import { Users, UserPlus, BarChart3, Settings, Home } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const UserSidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'add-user', label: 'Add User', icon: UserPlus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
  <div style={{background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', minHeight: '100vh', flex: '0 0 256px', position: 'sticky', top: 0, zIndex: 20}}>
      <div style={{padding: 24, borderBottom: '1px solid #e5e7eb'}}>
        <h1 style={{fontSize: 20, fontWeight: 700, color: '#111827'}}>User Management</h1>
        <p style={{fontSize: 12, color: '#6b7280'}}>Management Dashboard</p>
      </div>

  <nav style={{marginTop: 18}}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const btnStyle: React.CSSProperties = {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            textAlign: 'left',
            background: isActive ? '#eff6ff' : 'transparent',
            borderRight: isActive ? '4px solid #3b82f6' : undefined,
            color: isActive ? '#1e40af' : '#374151',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
          };

          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={btnStyle}>
              <Icon size={18} style={{marginRight: 12}} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default UserSidebar;