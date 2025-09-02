import React, { useState, useRef } from 'react';
import { userAPI } from '../services/api';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarUpdate,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (currentAvatar) {
      // Handle both relative and absolute URLs
      if (currentAvatar.startsWith('http')) {
        return currentAvatar;
      }
      // Construct full URL for uploaded avatars
      const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
      return `${baseUrl}/${currentAvatar}`;
    }
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await userAPI.uploadAvatar(formData);
      
      // Update parent component with new avatar URL
      onAvatarUpdate(response.data.avatar);
      setPreviewUrl(null); // Clear preview since we now have the actual uploaded image
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.response?.data?.error || 'Failed to upload avatar');
      setPreviewUrl(null); // Clear preview on error
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div 
          className={`w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 ${
            !disabled ? 'cursor-pointer hover:border-primary-300 transition-colors' : 'cursor-default'
          }`}
          onClick={handleClick}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                // Fallback to default avatar on error
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NCA2NEMxMDQuMzMgNjQgMTIwIDQ4LjMzIDEyMCAyOEMxMjAgNy42NyAxMDQuMzMgLTggODQgLThDNjMuNjcgLTggNDggNy42NyA0OCAyOEM0OCA0OC4zMyA2My42NyA2NCA4NCA2NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTg0IDc2QzU2IDc2IDMyIDEwMCAzMiAxMjhIMTM2QzEzNiAxMDAgMTEyIDc2IDg0IDc2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Camera icon overlay */}
        {!disabled && !isUploading && (
          <div className="absolute bottom-2 right-2 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">Profile Picture</p>
        {!disabled && (
          <p className="text-xs text-gray-500 mt-1">
            Click to upload • Max 2MB • JPG, PNG, GIF
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default AvatarUpload;