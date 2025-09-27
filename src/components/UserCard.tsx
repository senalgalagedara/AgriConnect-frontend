import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { User } from '@/interface/User';


interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
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

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{user.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <Mail className="w-4 h-4 mr-3" />
          <span className="text-sm">{user.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-3" />
          <span className="text-sm">{user.phone}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-3" />
          <span className="text-sm">{user.address}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-3" />
          <span className="text-sm">Joined {user.createdAt.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;