// apps/web/src/pages/UsersPage.tsx
import React, { useState } from 'react';
import '../styles/UsersPage.css';
import { useAuth } from '../contexts/AuthContext';

// Mock data for users
const MOCK_USERS = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    department: 'IT',
    status: 'active'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    role: 'standard_user',
    department: 'Sales',
    status: 'active'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    role: 'standard_user',
    department: 'Finance',
    status: 'inactive'
  }
];

const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
              />
              <select className="filter-select">
                <option>All Roles</option>
                <option>Admin</option>
                <option>Standard User</option>
              </select>
            </div>
          </div>

          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map(user => (
                <tr key={user.id}>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
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
              ))}
            </tbody>
          </table>

          {selectedUser && (
            <div className="user-details-modal">
              <div className="modal-content">
                <h2>User Details</h2>
                <div className="user-details">
                  <p><strong>Name:</strong> {`${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role.replace('_', ' ')}</p>
                  <p><strong>Department:</strong> {selectedUser.department}</p>
                  <p><strong>Status:</strong> {selectedUser.status}</p>
                </div>
                <div className="modal-actions">
                  <button 
                    className="secondary-btn" 
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
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