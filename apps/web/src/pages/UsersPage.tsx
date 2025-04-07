// apps/web/src/pages/UsersPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/UsersPage.css';
import { useAuth } from '../contexts/AuthContext';

// Define interfaces
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  departmentId?: string;
  status: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
}

// Helper function to fetch profile image
const fetchProfileImage = async (userId: string): Promise<string | null> => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    // Create a URL with the user ID and timestamp to prevent caching
    const timestamp = new Date().getTime();
    const url = new URL(`http://localhost:3001/users/profile-picture/${userId}`);
    url.searchParams.append('t', timestamp.toString());
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile image:', error);
    return null;
  }
};

const UsersPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  
  // New state for edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<{title: string, text: string, type: string} | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // State for profile picture upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError('Authentication token not found');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:3001/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch departments from the API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await fetch('http://localhost:3001/departments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch departments: ${response.status}`);
        }
        
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  // Fetch roles from the API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await fetch('http://localhost:3001/users/roles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`);
        }
        
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Set default roles if API fails
        setRoles([
          { id: 'admin', name: 'Admin' },
          { id: 'standard_user', name: 'Standard User' }
        ]);
      }
    };
    
    fetchRoles();
  }, []);

  // Fetch profile images for all users
  useEffect(() => {
    const loadUserImages = async () => {
      const images: Record<string, string | null> = {};
      
      for (const user of users) {
        images[user.id] = await fetchProfileImage(user.id);
      }
      
      setUserImages(images);
    };
    
    if (users.length > 0) {
      loadUserImages();
    }
  }, [users]);

  // Handle search and filtering
  useEffect(() => {
    let result = [...users];
    
    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.department.toLowerCase().includes(search)
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'All Roles') {
      const filterValue = roleFilter === 'Admin' ? 'admin' : 'standard_user';
      result = result.filter(user => user.role === filterValue);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditedUser({...user});
    setIsEditMode(true);
  };

  // Handle input change in edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editedUser) return;
    
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };

  // Handle save edited user
  const handleSaveUser = async () => {
    if (!editedUser) return;
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setModalMessage({
          title: 'Error',
          text: 'Authentication token not found',
          type: 'error'
        });
        return;
      }
      
      // Get department ID from selected department name
      const selectedDept = departments.find(d => d.name === editedUser.department);
      const departmentId = selectedDept?.id || null;
      
      // Prepare user data for update
      const userData = {
        ...editedUser,
        departmentId
      };
      
      const response = await fetch(`http://localhost:3001/users/${editedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      
      // Update users list
      setUsers(users.map(u => u.id === updatedUser.id ? {
        ...updatedUser,
        department: departments.find(d => d.id === updatedUser.departmentId)?.name || 'Unassigned'
      } : u));
      
      // Close modal and reset state
      setModalMessage({
        title: 'Success',
        text: 'User updated successfully',
        type: 'success'
      });
      setIsEditMode(false);
      setSelectedUser(null);
      setEditedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setModalMessage({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to update user',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setModalMessage({
          title: 'Error',
          text: 'Authentication token not found',
          type: 'error'
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3001/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
      
      // Update users list
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      // Close modal and reset state
      setModalMessage({
        title: 'Success',
        text: 'User deleted successfully',
        type: 'success'
      });
      setShowConfirmDelete(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setModalMessage({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to delete user',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setModalMessage({
        title: 'Error',
        text: 'Profile picture must be less than 5MB',
        type: 'error'
      });
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setModalMessage({
        title: 'Error',
        text: 'Only JPEG, PNG, and GIF images are allowed',
        type: 'error'
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async () => {
    if (!selectedFile || !editedUser) return;
    
    try {
      setUploadProgress(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setModalMessage({
          title: 'Error',
          text: 'Authentication token not found',
          type: 'error'
        });
        return;
      }
      
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      
      // Use the user ID from the edited user
      const response = await fetch(`http://localhost:3001/users/${editedUser.id}/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload profile picture: ${response.status}`);
      }
      
      // Update user images
      const newImageUrl = await fetchProfileImage(editedUser.id);
      setUserImages(prev => ({
        ...prev,
        [editedUser.id]: newImageUrl
      }));
      
      setModalMessage({
        title: 'Success',
        text: 'Profile picture uploaded successfully',
        type: 'success'
      });
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setModalMessage({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to upload profile picture',
        type: 'error'
      });
    } finally {
      setUploadProgress(false);
    }
  };

  // Handle profile picture delete
  const handleProfilePictureDelete = async () => {
    if (!editedUser) return;
    
    try {
      setUploadProgress(true);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setModalMessage({
          title: 'Error',
          text: 'Authentication token not found',
          type: 'error'
        });
        return;
      }
      
      const response = await fetch(`http://localhost:3001/users/${editedUser.id}/profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete profile picture: ${response.status}`);
      }
      
      // Update user images
      setUserImages(prev => ({
        ...prev,
        [editedUser.id]: null
      }));
      
      setModalMessage({
        title: 'Success',
        text: 'Profile picture deleted successfully',
        type: 'success'
      });
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      setModalMessage({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to delete profile picture',
        type: 'error'
      });
    } finally {
      setUploadProgress(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setModalMessage(null);
    setSelectedUser(null);
    setEditedUser(null);
    setIsEditMode(false);
    setShowConfirmDelete(false);
  };

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>User Management</h1>
        <div className="header-actions">
          {authUser?.role === 'admin' && (
            <button className="primary-btn">+ Add New User</button>
          )}
        </div>
      </header>

      <div className="users-content">
        <div className="users-list">
          <div className="users-table-header">
            <h2>Current Users</h2>
            <div className="table-controls">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="search-input" 
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <select 
                className="filter-select"
                value={roleFilter}
                onChange={handleRoleFilterChange}
              >
                <option>All Roles</option>
                <option>Admin</option>
                <option>Standard User</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-results">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {userImages[user.id] ? (
                              <img 
                                src={userImages[user.id] || ''} 
                                alt={`${user.firstName} ${user.lastName}`} 
                                className="user-profile-image" 
                              />
                            ) : (
                              <div className="user-profile-placeholder">
                                {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                              </div>
                            )}
                          </div>
                          <span>{`${user.firstName} ${user.lastName}`}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role.replace('_', ' ')}</td>
                      <td>{user.department}</td>
                      <td>
                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn"
                            onClick={() => setSelectedUser(user)}
                            title="View user details"
                          >
                            View
                          </button>
                          {authUser?.role === 'admin' && (
                            <>
                              <button 
                                className="action-btn warning"
                                onClick={() => handleEditUser(user)}
                                title="Edit user"
                              >
                                Edit
                              </button>
                              <button 
                                className="action-btn destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowConfirmDelete(true);
                                }}
                                title="Delete user"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* View User Modal */}
          {selectedUser && !isEditMode && !showConfirmDelete && (
            <div className="user-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>User Details</h2>
                  <button 
                    className="close-btn" 
                    onClick={() => setSelectedUser(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="user-details">
                  <div className="user-details-header">
                    <div className="user-avatar large">
                      {userImages[selectedUser.id] ? (
                        <img 
                          src={userImages[selectedUser.id] || ''} 
                          alt={`${selectedUser.firstName} ${selectedUser.lastName}`} 
                          className="user-profile-image" 
                        />
                      ) : (
                        <div className="user-profile-placeholder">
                          {`${selectedUser.firstName.charAt(0)}${selectedUser.lastName.charAt(0)}`}
                        </div>
                      )}
                    </div>
                    <h3>{`${selectedUser.firstName} ${selectedUser.lastName}`}</h3>
                  </div>
                  <div className="user-details-info">
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {selectedUser.role.replace('_', ' ')}</p>
                    <p><strong>Department:</strong> {selectedUser.department}</p>
                    <p><strong>Status:</strong> {selectedUser.status}</p>
                  </div>
                  {authUser?.role === 'admin' && (
                    <div className="modal-actions">
                      <button 
                        className="secondary-btn" 
                        onClick={() => setSelectedUser(null)}
                      >
                        Close
                      </button>
                      <button 
                        className="warning-btn" 
                        onClick={() => handleEditUser(selectedUser)}
                      >
                        Edit User
                      </button>
                      <button 
                        className="destructive-btn" 
                        onClick={() => setShowConfirmDelete(true)}
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {isEditMode && editedUser && (
            <div className="user-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Edit User</h2>
                  <button 
                    className="close-btn" 
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedUser(null);
                      setEditedUser(null);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="user-edit-form">
                <div className="profile-picture-section">
  <div className="current-picture">
    <h3>Profile Picture</h3>
    <div className="profile-picture-container">
      <div className="user-avatar large">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="user-profile-image" 
          />
        ) : userImages[editedUser.id] ? (
          <img 
            src={userImages[editedUser.id] || ''} 
            alt={`${editedUser.firstName} ${editedUser.lastName}`} 
            className="user-profile-image" 
          />
        ) : (
          <div className="user-profile-placeholder">
            {`${editedUser.firstName.charAt(0)}${editedUser.lastName.charAt(0)}`}
          </div>
        )}
      </div>
      <label htmlFor="profilePicture" className="profile-picture-edit-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </label>
    </div>
    <input
      type="file"
      id="profilePicture"
      name="profilePicture"
      accept="image/jpeg,image/png,image/gif"
      onChange={handleProfilePictureChange}
      className="hidden-file-input"
      ref={fileInputRef}
    />
  </div>
  <div className="picture-actions">
    {(previewUrl || userImages[editedUser.id]) && (
      <button 
        type="button" 
        className="profile-picture-delete-btn"
        onClick={handleProfilePictureDelete}
        disabled={uploadProgress}
      >
        Remove Picture
      </button>
    )}
    {previewUrl && (
      <button
        type="button"
        className="profile-picture-upload-btn"
        onClick={handleProfilePictureUpload}
        disabled={uploadProgress}
      >
        {uploadProgress ? 'Uploading...' : 'Save Picture'}
      </button>
    )}
  </div>
</div>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={editedUser.firstName}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={editedUser.lastName}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={editedUser.role}
                      onChange={handleEditInputChange}
                      required
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={editedUser.department}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={editedUser.status}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="secondary-btn" 
                      onClick={() => {
                        setIsEditMode(false);
                        setSelectedUser(null);
                        setEditedUser(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-btn" 
                      onClick={handleSaveUser}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Modal */}
          {showConfirmDelete && selectedUser && (
            <div className="user-details-modal">
              <div className="modal-content confirm-delete">
                <div className="modal-header">
                  <h2>Confirm Delete</h2>
                  <button 
                    className="close-btn" 
                    onClick={() => setShowConfirmDelete(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="confirm-message">
                  <p>Are you sure you want to delete the user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
                <div className="modal-actions">
                  <button 
                    className="secondary-btn" 
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="destructive-btn" 
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Modal */}
          {modalMessage && (
            <div className="user-details-modal">
              <div className="modal-content message-modal">
                <div className="modal-header">
                  <h2>{modalMessage.title}</h2>
                  <button 
                    className="close-btn" 
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>
                <div className={`message-content ${modalMessage.type}`}>
                  <p>{modalMessage.text}</p>
                </div>
                <div className="modal-actions">
                  <button 
                    className="primary-btn" 
                    onClick={handleCloseModal}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;