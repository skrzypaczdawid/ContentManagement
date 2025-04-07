// apps/web/src/pages/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import '../styles/UsersPage.css';
import { useAuth } from '../contexts/AuthContext';

// Define user interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
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
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userImages, setUserImages] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');

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

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>User Management</h1>
        <div className="header-actions">
          {user?.role === 'admin' && (
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
                        <button 
                          className="action-btn"
                          onClick={() => setSelectedUser(user)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {selectedUser && (
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