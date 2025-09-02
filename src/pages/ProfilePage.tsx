import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import Button from '../components/Button';
import Input from '../components/Input';
import AvatarUpload from '../components/AvatarUpload';
import { userAPI } from '../services/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  contactPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const ProfilePage: React.FC = () => {
  const { } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    contactPreferences: {
      emailNotifications: true,
      smsNotifications: false
    }
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', icon: '🏠', onClick: () => navigate('/dashboard') },
      { label: 'Profile Settings', icon: '👤' }
    ]);
    fetchProfile();
  }, [setBreadcrumbs, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        contactPreferences: response.data.contactPreferences || {
          emailNotifications: true,
          smsNotifications: false
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('contactPreferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPreferences: {
          ...prev.contactPreferences,
          [prefKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await userAPI.updateProfile(formData);
      setProfile(response.data.user);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        contactPreferences: profile.contactPreferences || {
          emailNotifications: true,
          smsNotifications: false
        }
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar: newAvatarUrl });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'tester': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6">
          <Breadcrumb />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
            </div>
            {!isEditing ? (
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Profile Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <AvatarUpload
                  currentAvatar={profile.avatar}
                  onAvatarUpdate={handleAvatarUpdate}
                  disabled={!isEditing}
                />
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2 space-y-4">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="input-field bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile.role)}`}>
                      {profile.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    maxLength={300}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/300 characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-600">Receive project updates and notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  name="contactPreferences.emailNotifications"
                  checked={formData.contactPreferences.emailNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                  <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                </div>
                <input
                  type="checkbox"
                  name="contactPreferences.smsNotifications"
                  checked={formData.contactPreferences.smsNotifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;