import React, { useState } from 'react';
import '../styles/DatabaseSetup.css';

const DatabaseSetup: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    hostname: 'localhost',
    port: '5432',
    database: '',
    username: 'postgres',
    password: '',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    confirmPassword: ''
  });

  // Error state
  const [errors, setErrors] = useState({
    database: '',
    username: '',
    password: '',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    confirmPassword: ''
  });

  // Step state (1 = Database Connection, 2 = Admin User)
  const [currentStep, setCurrentStep] = useState(1);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for the field being edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate database connection form
  const validateDatabaseForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.database.trim()) {
      newErrors.database = 'Database name is required';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate admin user form
  const validateAdminForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.adminUsername.trim()) {
      newErrors.adminUsername = 'Admin username is required';
      isValid = false;
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Email is invalid';
      isValid = false;
    }

    if (!formData.adminPassword.trim()) {
      newErrors.adminPassword = 'Password is required';
      isValid = false;
    } else if (formData.adminPassword.length < 8) {
      newErrors.adminPassword = 'Password must be at least 8 characters long';
      isValid = false;
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle next step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDatabaseForm()) {
      setCurrentStep(2);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAdminForm()) {
      // In a real application, you would submit the form data to your API
      // For demonstration purposes, we'll just show an alert
      alert('Database and admin user setup submitted successfully!');
      
      // Here you would make an API call to set up the database and create the admin user
      // For example: await api.post('/api/setup', formData);
      
      // Redirect to the dashboard or show a success message
      console.log('Form submitted:', formData);
    }
  };

  // Handle back button
  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="setup-container">
      <header className="setup-header">
        <div className="logo-container">
          <img src="./logo-small.svg" alt="logo" width="60px" />
          <h1 className="app-title">CMDB</h1>
          <p className="app-subtitle">Setup Wizard</p>
        </div>
      </header>

      <main className="setup-content">
        <div className="setup-card">
          <div className="setup-steps">
            <div className={`setup-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Database Connection</div>
            </div>
            <div className="step-connector"></div>
            <div className={`setup-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Admin User</div>
            </div>
          </div>

          {currentStep === 1 ? (
            <form onSubmit={handleNextStep} className="setup-form">
              <h2>Database Connection</h2>
              <p className="form-description">
                Enter your PostgreSQL database connection details. This database will be used to store all your CMDB information.
              </p>

              <div className="form-group">
                <label htmlFor="hostname">Hostname</label>
                <input
                  type="text"
                  id="hostname"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  placeholder="e.g., localhost or db.example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="port">Port</label>
                <input
                  type="text"
                  id="port"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  placeholder="5432"
                />
              </div>

              <div className="form-group">
                <label htmlFor="database">Database Name*</label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                  placeholder="e.g., cmdb"
                  className={errors.database ? 'error' : ''}
                />
                {errors.database && <div className="error-message">{errors.database}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="username">Username*</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g., postgres"
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <div className="error-message">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password*</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter database password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="form-note">
                <strong>Note:</strong> Make sure your database user has permission to create tables and schemas.
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">Next</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="setup-form">
              <h2>Create Admin User</h2>
              <p className="form-description">
                Create your administrator account. This account will have full access to the CMDB system.
              </p>

              <div className="form-group">
                <label htmlFor="adminUsername">Username*</label>
                <input
                  type="text"
                  id="adminUsername"
                  name="adminUsername"
                  value={formData.adminUsername}
                  onChange={handleChange}
                  placeholder="Enter admin username"
                  className={errors.adminUsername ? 'error' : ''}
                />
                {errors.adminUsername && <div className="error-message">{errors.adminUsername}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="adminEmail">Email*</label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="Enter admin email"
                  className={errors.adminEmail ? 'error' : ''}
                />
                {errors.adminEmail && <div className="error-message">{errors.adminEmail}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Password*</label>
                <input
                  type="password"
                  id="adminPassword"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className={errors.adminPassword ? 'error' : ''}
                />
                {errors.adminPassword && <div className="error-message">{errors.adminPassword}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password*</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>

              <div className="form-note">
                This account will have full administrative privileges. Keep these credentials secure.
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={handleBack}>Back</button>
                <button type="submit" className="primary-btn">Create Account</button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="setup-footer">
        <p>&copy; {new Date().getFullYear()} Witold Mikołajczak & Dawid Skrzypacz. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DatabaseSetup;