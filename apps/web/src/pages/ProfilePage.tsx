import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, uploadProfilePicture, deleteProfilePicture, getProfilePictureUrl } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.departmentId ? `Department ${user.departmentId}` : '',
        role: user.role || ''
      });
      
      // Set profile picture URL if available
      setPreviewUrl(getProfilePictureUrl());
    }
  }, [user, getProfilePictureUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return;
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await uploadProfilePicture(profilePicture);
      setMessage({ 
        text: 'Profile picture uploaded successfully!', 
        type: 'success' 
      });
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfilePicture(null);
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to upload profile picture', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureDelete = async () => {
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await deleteProfilePicture();
      setMessage({ 
        text: 'Profile picture deleted successfully!', 
        type: 'success' 
      });
      setPreviewUrl('');
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to delete profile picture', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Only send the fields that can be updated
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
      // If there's a profile picture to upload, do it after profile update
      if (profilePicture) {
        await uploadProfilePicture(profilePicture);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setProfilePicture(null);
      }
      
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="profile-loading">Loading user data...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile Information</h2>
        <p>Update your personal information</p>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-picture-section">
        <div className="profile-picture-container">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              {user.firstName && user.lastName 
                ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` 
                : 'User'}
            </div>
          )}
        </div>
        
        <div className="profile-picture-controls">
          <input
            type="file"
            id="profilePicture"
            accept="image/jpeg, image/png, image/gif"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="profile-picture-input"
          />
          <label htmlFor="profilePicture" className="profile-picture-label">
            Choose Picture
          </label>
          
          {profilePicture && (
            <button 
              type="button" 
              className="profile-picture-upload-btn"
              onClick={handleProfilePictureUpload}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Picture'}
            </button>
          )}
          
          {previewUrl && !profilePicture && (
            <button 
              type="button" 
              className="profile-picture-delete-btn"
              onClick={handleProfilePictureDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Picture'}
            </button>
          )}
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled
          />
          <small>Department can only be changed by administrators</small>
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled
          />
          <small>Role can only be changed by administrators</small>
        </div>

        <button 
          type="submit" 
          className="profile-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
