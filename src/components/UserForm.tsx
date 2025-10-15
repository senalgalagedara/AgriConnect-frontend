import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, UserCheck, Lock } from 'lucide-react';
import { CreateUserData, UserRole  } from '@/interface/User';


interface UserFormProps {
  onSubmit: (userData: CreateUserData) => void;
  onCancel: () => void;
  initialValues?: Partial<CreateUserData>;
  submitLabel?: string;
}

const UserForm = ({ onSubmit, onCancel, initialValues, submitLabel }: UserFormProps) => {
  const [formData, setFormData] = useState<CreateUserData>({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    role: 'consumer',
    address: '',
    password: '', // not exposed in this admin form but required by type; keep empty
  });

  // initialize with provided values for edit mode
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
        role: (initialValues.role as any) || 'consumer',
      }));
    }
  }, [initialValues]);
  
  const [errors, setErrors] = useState<Partial<CreateUserData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserData> = {};
    
    if (!formData.firstName.trim()) (newErrors as any).firstName = 'First name is required';
    if (!formData.lastName.trim()) (newErrors as any).lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.contactNumber?.trim()) (newErrors as any).contactNumber = 'Contact number is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    
    // Password validation - only required when adding new user (not editing)
    if (!initialValues && !formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const roleOptions: { value: UserRole; label: string; color: string }[] = [
    { value: 'farmer', label: 'Farmer', color: 'text-green-600' },
    { value: 'consumer', label: 'Consumer', color: 'text-blue-600' },
    { value: 'driver', label: 'Driver', color: 'text-orange-600' },
  ];

  const containerStyle: React.CSSProperties = { background: '#fff', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: 24 };
  const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', marginBottom: 20 };
  const titleStyle: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: '#111827' };
  const formGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 };
  const inputStyle = (hasError = false): React.CSSProperties => ({ width: '100%', padding: '10px 12px', border: `1px solid ${hasError ? '#fecaca' : '#d1d5db'}`, borderRadius: 8, fontSize: 14, background: hasError ? '#fff7f7' : 'white' });
  const textareaStyle = (hasError = false): React.CSSProperties => ({ width: '100%', padding: '10px 12px', border: `1px solid ${hasError ? '#fecaca' : '#d1d5db'}`, borderRadius: 8, fontSize: 14, resize: 'none', background: hasError ? '#fff7f7' : 'white' });
  const actionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12 };
  const cancelBtnStyle: React.CSSProperties = { padding: '10px 18px', border: '1px solid #d1d5db', color: '#374151', borderRadius: 8, background: 'white', cursor: 'pointer' };
  const submitBtnStyle: React.CSSProperties = { padding: '10px 18px', background: '#2563eb', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(37,99,235,0.12)' };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <UserCheck size={28} style={{color: '#2563eb', marginRight: 12}} />
        <h2 style={titleStyle}>{submitLabel || 'Add New User'}</h2>
      </div>

      <form onSubmit={handleSubmit} style={{display: 'grid', gap: 16}}>
        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}><User size={14} style={{marginRight: 8}} /> First Name</label>
            <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} style={inputStyle(Boolean((errors as any).firstName))} placeholder="Enter first name" />
            {(errors as any).firstName && <p style={{marginTop: 6, fontSize: 13, color: '#dc2626'}}>{(errors as any).firstName}</p>}
          </div>
          <div>
            <label style={labelStyle}><User size={14} style={{marginRight: 8}} /> Last Name</label>
            <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} style={inputStyle(Boolean((errors as any).lastName))} placeholder="Enter last name" />
            {(errors as any).lastName && <p style={{marginTop: 6, fontSize: 13, color: '#dc2626'}}>{(errors as any).lastName}</p>}
          </div>

          <div>
            <label style={labelStyle}><Mail size={14} style={{marginRight: 8}} /> Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} style={inputStyle(Boolean(errors.email))} placeholder="Enter email address" />
            {errors.email && <p style={{marginTop: 6, fontSize: 13, color: '#dc2626'}}>{errors.email}</p>}
          </div>

          <div>
            <label style={labelStyle}><Phone size={14} style={{marginRight: 8}} /> Contact Number</label>
            <input type="tel" value={formData.contactNumber} onChange={(e) => handleInputChange('contactNumber', e.target.value)} style={inputStyle(Boolean((errors as any).contactNumber))} placeholder="Enter contact number" />
            {(errors as any).contactNumber && <p style={{marginTop: 6, fontSize: 13, color: '#dc2626'}}>{(errors as any).contactNumber}</p>}
          </div>

          <div>
            <label style={labelStyle}><UserCheck size={14} style={{marginRight: 8}} /> User Role</label>
            <select value={formData.role} onChange={(e) => handleInputChange('role', e.target.value as UserRole)} style={inputStyle()}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}><Lock size={14} style={{marginRight: 8}} /> Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => handleInputChange('password', e.target.value)} 
              style={inputStyle(Boolean(errors.password))} 
              placeholder={initialValues ? "Leave blank to keep current password" : "Enter password"} 
            />
            {errors.password && <p style={{marginTop: 6, fontSize: 13, color: '#dc2626'}}>{errors.password}</p>}
          </div>
        </div>

        <div>
          <label style={labelStyle}><MapPin size={14} style={{marginRight: 8}} /> Address</label>
          <textarea value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} style={textareaStyle(Boolean(errors.address))} placeholder="Enter complete address" />
          {errors.address && <p style={{marginTop: 6, fontSize: 13, color: '#dc2626'}}>{errors.address}</p>}
        </div>

        <div style={actionsStyle}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" style={submitBtnStyle}>{submitLabel || 'Add User'}</button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;