import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { User, getUserDisplayName } from '@/interface/User';


interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-100 text-green-800';
      case 'consumer': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const containerStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: 18, border: '1px solid #f3f4f6', transition: 'box-shadow 0.2s' };
  const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 };
  const nameStyle: React.CSSProperties = { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 6 };
  const badgeStyle = (bg: string, color: string): React.CSSProperties => ({ padding: '6px 10px', borderRadius: 9999, fontSize: 13, fontWeight: 600, background: bg, color });
  const infoRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', color: '#6b7280', gap: 10, marginBottom: 8 };
  const actionsRowStyle: React.CSSProperties = { display: 'flex', gap: 10, marginTop: 12 };
  const btnStyle = (bg: string, color: string): React.CSSProperties => ({ padding: '8px 12px', borderRadius: 8, background: bg, color, border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' });

  // Be tolerant of backend returning ISO strings for dates
  const joinedDate: Date | null = (() => {
    const raw: unknown = (user as any).createdAt;
    const date = raw instanceof Date ? raw : new Date(raw as any);
    return isNaN(date.getTime()) ? null : date;
  })();

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={nameStyle}>{getUserDisplayName(user)}</h3>
          <div style={{display: 'flex', gap: 8}}>
            <span style={badgeStyle(user.role === 'farmer' ? '#ecfdf5' : user.role === 'consumer' ? '#eff6ff' : '#fff7ed', user.role === 'farmer' ? '#166534' : user.role === 'consumer' ? '#1e40af' : '#ea580c')}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span style={badgeStyle(user.status === 'active' ? '#ecfdf5' : '#fff1f2', user.status === 'active' ? '#166534' : '#991b1b')}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div style={infoRowStyle}><Mail size={14} /> <span style={{fontSize: 13}}>{user.email}</span></div>
  <div style={infoRowStyle}><Phone size={14} /> <span style={{fontSize: 13}}>{user.contactNumber}</span></div>
        <div style={infoRowStyle}><MapPin size={14} /> <span style={{fontSize: 13}}>{user.address}</span></div>
        {joinedDate && (
          <div style={infoRowStyle}><Calendar size={14} /> <span style={{fontSize: 13}}>Joined {joinedDate.toLocaleDateString()}</span></div>
        )}
        <div style={actionsRowStyle}>
          <button onClick={() => onEdit?.(user)} style={btnStyle('#eff6ff', '#1e40af')}>Edit</button>
          <button onClick={() => onDelete?.(user)} style={btnStyle('#fef2f2', '#991b1b')}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;