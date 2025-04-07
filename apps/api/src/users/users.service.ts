// apps/api/src/users/users.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PoolClient } from 'pg';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Define user profile update DTO
export interface UpdateUserProfileDto {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get the total count of users
   */
  async getUsersCount() {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Query users count
      const result = await client?.query(
        'SELECT COUNT(*) as count FROM cmdb.users'
      );
      
      return { count: parseInt(result?.rows[0].count) || 0 };
    } catch (error) {
      this.logger.error(`Failed to fetch users count: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Get the count of users created this week
   */
  async getUsersCountThisWeek() {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Query users count for this week
      const result = await client?.query(
        "SELECT COUNT(*) as countWeek FROM cmdb.users WHERE created_at >= NOW() - INTERVAL '1 week'"
      );
      
      // Log the raw query result for debugging
      this.logger.log(`Raw query result: ${JSON.stringify(result?.rows[0])}`);
      
      return { count: parseInt(result?.rows[0].countweek) || 0 };
    } catch (error) {
      this.logger.error(`Failed to fetch users count for this week: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Query all users with department name
      const result = await client?.query(`
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, 
               u.status, d.name as department_name
        FROM cmdb.users u
        LEFT JOIN cmdb.departments d ON u.department_id = d.id
        ORDER BY u.first_name, u.last_name
      `);
      
      // Map the database result to user objects
      return result?.rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        role: row.role,
        department: row.department_name || 'Unassigned',
        status: row.status || 'active'
      })) || [];
    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, profileData: UpdateUserProfileDto) {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rowCount === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Update user profile
      const result = await client.query(
        `UPDATE cmdb.users 
         SET first_name = $1, last_name = $2, email = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, username, email, first_name, last_name, role, department_id`,
        [
          profileData.firstName,
          profileData.lastName,
          profileData.email,
          userId
        ]
      );
      
      // Map the database result to a user object
      const updatedUser = result.rows[0];
      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        departmentId: updatedUser.department_id
      };
    } catch (error) {
      this.logger.error(`Failed to update user profile: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Upload a profile picture for a user
   * @param userId The ID of the user
   * @param file The uploaded file
   * @returns The updated user object
   */
  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Generate a unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExtension}`;
      
      // Define the upload directory
      const uploadDir = path.join(process.cwd(), 'uploads/profile-pictures');
      
      // Ensure the directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, fileName);
      
      // Write the file to disk
      fs.writeFileSync(filePath, file.buffer);
      
      // Update the user's profile picture in the database
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: `/uploads/profile-pictures/${fileName}`,
          updatedAt: new Date(),
        },
      });
      
      return {
        success: true,
        message: 'Profile picture uploaded successfully',
        user: {
          id: updatedUser.id,
          profilePicture: updatedUser.profilePicture,
        },
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  /**
   * Delete a user's profile picture
   * @param userId The ID of the user
   * @returns Success message
   */
  async deleteProfilePicture(userId: string) {
    try {
      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if the user has a profile picture
      if (!user.profilePicture) {
        return {
          success: true,
          message: 'User does not have a profile picture',
        };
      }

      // Get the file path
      const filePath = path.join(
        process.cwd(),
        user.profilePicture.replace(/^\//, '')
      );

      // Delete the file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update the user in the database
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          profilePicture: null,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Profile picture deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }

  /**
   * Get user profile picture
   */
  async getProfilePicture(userId: string): Promise<{ data: Buffer; contentType: string } | null> {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rowCount === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Get the profile picture
      const result = await client.query(
        'SELECT profile_picture, profile_picture_type FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (!result.rows[0].profile_picture) {
        return null; // No profile picture set
      }
      
      return { 
        data: result.rows[0].profile_picture, 
        contentType: result.rows[0].profile_picture_type || 'image/jpeg' 
      };
    } catch (error) {
      this.logger.error(`Failed to get profile picture: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Get all available user roles
   */
  async getUserRoles() {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Query distinct roles from users table
      const result = await client?.query(
        "SELECT DISTINCT role FROM cmdb.users WHERE role IS NOT NULL"
      );
      
      // If no roles found, return default roles
      if (!result?.rows.length) {
        return [
          { id: 'admin', name: 'Admin' },
          { id: 'standard_user', name: 'Standard User' }
        ];
      }
      
      // Map the database result to role objects
      return result?.rows.map(row => ({
        id: row.role,
        name: row.role.replace('_', ' ')
      })) || [];
    } catch (error) {
      this.logger.error(`Failed to fetch user roles: ${error.message}`);
      // Return default roles on error
      return [
        { id: 'admin', name: 'Admin' },
        { id: 'standard_user', name: 'Standard User' }
      ];
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Update a user by ID (admin only)
   */
  async updateUser(userId: string, userData: any) {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rowCount === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Update user
      const result = await client.query(
        `UPDATE cmdb.users 
         SET first_name = $1, last_name = $2, email = $3, role = $4, 
             department_id = $5, status = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING id, username, email, first_name, last_name, role, department_id, status`,
        [
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.role,
          userData.departmentId,
          userData.status,
          userId
        ]
      );
      
      // Map the database result to a user object
      const updatedUser = result.rows[0];
      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        departmentId: updatedUser.department_id,
        status: updatedUser.status
      };
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Delete a user by ID (admin only)
   */
  async deleteUser(userId: string) {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Check if user exists
      const userCheck = await client.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rowCount === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Delete the user
      await client.query(
        'DELETE FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }
}
