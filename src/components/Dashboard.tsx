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

  const containerStyle: React.CSSProperties = {};
  const headerStyle: React.CSSProperties = { marginBottom: 32 };
  const titleStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 };
  const subtitleStyle: React.CSSProperties = { color: '#6b7280' };

  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 };
  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
  const cardHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const cardTitleStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', marginBottom: 6 };
  const cardValueStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, color: '#111827' };
  const iconWrapStyle = (bg: string): React.CSSProperties => ({ padding: 10, borderRadius: 8, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' });

  const actionsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 };
  const actionBtnStyle = (bg: string): React.CSSProperties => ({ width: '100%', display: 'flex', alignItems: 'center', padding: 16, background: bg, borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left' });
  const actionTitleStyle: React.CSSProperties = { fontWeight: 700, color: '#0f172a' };
  const actionDescStyle: React.CSSProperties = { fontSize: 13, color: '#2563eb' };

  const recentListStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };
  const recentItemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: 12, background: '#f8fafc', borderRadius: 10 };
  const statusBadgeStyle = (active: boolean): React.CSSProperties => ({ padding: '6px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: active ? '#ecfdf5' : '#fff1f2', color: active ? '#166534' : '#991b1b' });

  const distributionStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' };
  const distributionGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 };
  const distributionCircleStyle = (bg: string): React.CSSProperties => ({ width: 80, height: 80, borderRadius: 9999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Welcome to UserHub</h1>
        <p style={subtitleStyle}>Manage your users efficiently with our comprehensive dashboard.</p>
      </div>

      <div style={gridStyle}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const bg = card.bgColor === 'bg-blue-50' ? '#eff6ff' : card.bgColor === 'bg-green-50' ? '#ecfdf5' : '#f5f3ff';
          const color = card.color === 'text-blue-600' ? '#2563eb' : card.color === 'text-green-600' ? '#10b981' : '#7c3aed';

          return (
            <div key={index} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <p style={cardTitleStyle}>{card.title}</p>
                  <p style={cardValueStyle}>{card.value}</p>
                </div>
                <div style={iconWrapStyle(bg)}>
                  <Icon size={20} color={color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={actionsGridStyle}>
        <div style={cardStyle}>
          <h3 style={{fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12}}>Quick Actions</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <button onClick={() => onNavigate('add-user')} style={actionBtnStyle('#eff6ff')}>
              <UserPlus size={18} color="#2563eb" style={{marginRight: 12}} />
              <div>
                <p style={actionTitleStyle}>Add New User</p>
                <p style={actionDescStyle}>Create farmer, consumer, or driver accounts</p>
              </div>
            </button>
            <button onClick={() => onNavigate('users')} style={actionBtnStyle('#f8fafc')}>
              <Users size={18} color="#374151" style={{marginRight: 12}} />
              <div>
                <p style={{fontWeight: 700, color: '#0f172a'}}>Manage Users</p>
                <p style={{fontSize: 13, color: '#6b7280'}}>View and manage all registered users</p>
              </div>
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12}}>Recent Users</h3>
          {recentUsers.length === 0 ? (
            <p style={{color: '#6b7280', textAlign: 'center', padding: '12px 0'}}>No users added yet</p>
          ) : (
            <div style={recentListStyle}>
              {recentUsers.map((user) => (
                <div key={user.id} style={recentItemStyle}>
                  <div style={{flex: 1}}>
                    <p style={{fontWeight: 700, color: '#0f172a'}}>{user.name}</p>
                    <p style={{fontSize: 13, color: '#6b7280', textTransform: 'capitalize'}}>{user.role}</p>
                  </div>
                  <span style={statusBadgeStyle(user.status === 'active')}>{user.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={distributionStyle}>
        <h3 style={{fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12}}>User Distribution by Role</h3>
        <div style={distributionGrid}>
          <div style={{textAlign: 'center'}}>
            <div style={distributionCircleStyle('#ecfdf5')}>
              <span style={{fontSize: 20, fontWeight: 700, color: '#10b981'}}>{stats.farmer}</span>
            </div>
            <p style={{fontWeight: 700, color: '#111827'}}>Farmers</p>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={distributionCircleStyle('#eff6ff')}>
              <span style={{fontSize: 20, fontWeight: 700, color: '#2563eb'}}>{stats.consumer}</span>
            </div>
            <p style={{fontWeight: 700, color: '#111827'}}>Consumers</p>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={distributionCircleStyle('#fff7ed')}>
              <span style={{fontSize: 20, fontWeight: 700, color: '#f97316'}}>{stats.driver}</span>
            </div>
            <p style={{fontWeight: 700, color: '#111827'}}>Drivers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;