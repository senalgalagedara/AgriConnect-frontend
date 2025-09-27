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

  const container: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '8px 0' };
  const headerTitle: React.CSSProperties = { fontSize: 32, fontWeight: 800, color: '#0f172a', marginBottom: 6 };
  const headerSubtitle: React.CSSProperties = { color: '#475569', marginBottom: 18 };
  const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 20 };
  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 20px rgba(2,6,23,0.04)', border: '1px solid #eef2f7' };
  const iconBadgeStyle = (bg: string): React.CSSProperties => ({ padding: 10, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const quickGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 };
  const actionBtn: React.CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', padding: 14, borderRadius: 10, textAlign: 'left', border: '1px solid #eef2f7', background: '#fcfeff', cursor: 'pointer' };
  const recentItem: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: 12, borderRadius: 10, background: '#fbfdff', border: '1px solid #f1f5f9', marginBottom: 8 };
  const roleGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 };

  return (
    <div style={container}>
      <div style={{marginBottom: 18}}>
        <h1 style={headerTitle}>Welcome to UserHub</h1>
        <p style={headerSubtitle}>Manage your users efficiently with our comprehensive dashboard.</p>
      </div>

      <div style={statsGrid}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} style={cardStyle}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <p style={{fontSize: 13, color: '#64748b', marginBottom: 6}}>{card.title}</p>
                  <p style={{fontSize: 24, fontWeight: 700, color: '#0b1220'}}>{card.value}</p>
                </div>
                <div style={iconBadgeStyle(index % 2 === 0 ? '#eef2ff' : '#fef3ff')}>
                  <Icon size={22} color={index % 2 === 0 ? '#2563eb' : '#7c3aed'} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={quickGrid}>
        <div style={cardStyle}>
          <h3 style={{fontSize: 16, fontWeight: 700, color: '#0b1220', marginBottom: 10}}>Quick Actions</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <button onClick={() => onNavigate('add-user')} style={actionBtn}>
              <UserPlus size={18} style={{marginRight: 12, color: '#2563eb'}} />
              <div>
                <p style={{fontWeight: 600, color: '#0b1220'}}>Add New User</p>
                <p style={{fontSize: 13, color: '#2563eb'}}>Create farmer, consumer, or driver accounts</p>
              </div>
            </button>

            <button onClick={() => onNavigate('users')} style={{...actionBtn, background: '#fff'}}> 
              <Users size={18} style={{marginRight: 12, color: '#475569'}} />
              <div>
                <p style={{fontWeight: 600, color: '#0b1220'}}>Manage Users</p>
                <p style={{fontSize: 13, color: '#64748b'}}>View and manage all registered users</p>
              </div>
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={{fontSize: 16, fontWeight: 700, color: '#0b1220', marginBottom: 10}}>Recent Users</h3>
          {recentUsers.length === 0 ? (
            <p style={{color: '#64748b', textAlign: 'center', padding: 18}}>No users added yet</p>
          ) : (
            <div>
              {recentUsers.map((user) => (
                <div key={user.id} style={recentItem}>
                  <div style={{flex: 1}}>
                    <p style={{fontWeight: 600, color: '#0b1220'}}>{user.name}</p>
                    <p style={{fontSize: 13, color: '#64748b', textTransform: 'capitalize'}}>{user.role}</p>
                  </div>
                  <span style={{padding: '6px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: user.status === 'active' ? '#166534' : '#991b1b', background: user.status === 'active' ? '#dcfce7' : '#fee2e2'}}>
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{...cardStyle}}>
        <h3 style={{fontSize: 16, fontWeight: 700, color: '#0b1220', marginBottom: 12}}>User Distribution by Role</h3>
        <div style={roleGrid}>
          <div style={{textAlign: 'center'}}>
            <div style={{width: 84, height: 84, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
              <span style={{fontSize: 24, fontWeight: 700, color: '#16a34a'}}>{stats.farmer}</span>
            </div>
            <p style={{fontWeight: 600, color: '#0b1220'}}>Farmers</p>
          </div>

          <div style={{textAlign: 'center'}}>
            <div style={{width: 84, height: 84, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
              <span style={{fontSize: 24, fontWeight: 700, color: '#2563eb'}}>{stats.consumer}</span>
            </div>
            <p style={{fontWeight: 600, color: '#0b1220'}}>Consumers</p>
          </div>

          <div style={{textAlign: 'center'}}>
            <div style={{width: 84, height: 84, background: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
              <span style={{fontSize: 24, fontWeight: 700, color: '#fb923c'}}>{stats.driver}</span>
            </div>
            <p style={{fontWeight: 600, color: '#0b1220'}}>Drivers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;