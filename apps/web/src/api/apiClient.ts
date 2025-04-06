// apps/web/src/api/apiClient.ts

// Base API URL - in a real app, this would be from environment variables
const API_BASE_URL = 'http://localhost:3001';

// Define the database connection configuration interface
export interface DatabaseConnectionConfig {
  hostname: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Define the admin user configuration interface
export interface AdminUserConfig {
  username: string;
  email: string;
  password: string;
}



/**
 * Check database configuration status
 */
export const checkDatabaseStatus = async (): Promise<{
    isConfigured: boolean;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
  
      if (!response.ok) {
        return { isConfigured: false };
      }
  
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      return { isConfigured: false };
    }
  };
/**
 * Test the database connection with provided credentials
 */
export const testDatabaseConnection = async (config: DatabaseConnectionConfig): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Connection test failed',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Execute the database schema SQL
 */
export const executeDatabaseSchema = async (config: DatabaseConnectionConfig): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/execute-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Schema execution failed',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Create the admin user in the database
 */
export const createAdminUser = async (
  dbConfig: DatabaseConnectionConfig,
  adminConfig: AdminUserConfig
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/database/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dbConfig,
        adminConfig,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Admin user creation failed',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};