// apps/api/src/users/users.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
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
  private data: Buffer | null = null;
  private contentType: string | null = null;

  constructor(
    @Inject('DATABASE_SERVICE') private readonly databaseService: any
  ) {}

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
      
      // Update user profile
      const result = await client?.query(
        `UPDATE cmdb.users 
         SET first_name = $1, 
             last_name = $2, 
             email = $3,
             updated_at = NOW()
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
      const updatedUser = result?.rows[0];
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
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
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Check if user exists
      const userResult = await client?.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (!userResult?.rows?.[0]) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Store the file in memory
      this.data = file.buffer;
      this.contentType = file.mimetype;
      
      // Update user with profile picture reference
      await client?.query(
        'UPDATE cmdb.users SET profile_picture = $1, profile_picture_type = $2, updated_at = NOW() WHERE id = $3',
        [file.buffer, file.mimetype, userId]
      );
      
      return {
        success: true,
        message: 'Profile picture uploaded successfully',
        user: {
          id: userId,
          profilePicture: file.originalname
        }
      };
    } catch (error) {
      this.logger.error('Error uploading profile picture:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }

  /**
   * Delete a user's profile picture
   * @param userId The ID of the user
   * @returns Success message
   */
  async deleteProfilePicture(userId: string) {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()!.connect();
      
      // Check if user exists
      const userResult = await client?.query(
        'SELECT id, profile_picture FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      const user = userResult?.rows?.[0];
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Update user to remove profile picture
      await client?.query(
        'UPDATE cmdb.users SET profile_picture = NULL, profile_picture_type = NULL, updated_at = NOW() WHERE id = $1',
        [userId]
      );

      return {
        success: true,
        message: 'Profile picture deleted successfully'
      };
    } catch (error) {
      this.logger.error('Error deleting profile picture:', error);
      throw error;
    } finally {
      if (client) client.release();
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
      
      // Get user's profile picture
      const result = await client?.query(
        'SELECT profile_picture, profile_picture_type FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      const user = result?.rows?.[0];
      if (!user || !user.profile_picture) {
        return null;
      }
      
      return { 
        data: user.profile_picture as Buffer, 
        contentType: user.profile_picture_type || 'image/jpeg' 
      };
    } catch (error) {
      this.logger.error('Error getting profile picture:', error);
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
      
      // Get all roles
      const result = await client?.query(
        'SELECT DISTINCT role FROM cmdb.users'
      );
      
      return result?.rows?.map(row => row.role) || [];
    } catch (error) {
      this.logger.error('Error getting user roles:', error);
      throw error;
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
      const userResult = await client?.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (!userResult?.rows?.[0]) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Update user
      const updateFields = Object.keys(userData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
      
      const values = Object.values(userData);
      values.push(userId);
      
      const result = await client?.query(
        `UPDATE cmdb.users 
         SET ${updateFields}, 
             updated_at = NOW()
         WHERE id = $${values.length}
         RETURNING id, username, email, first_name, last_name, role, department_id`,
        values
      );
      
      const updatedUser = result?.rows?.[0];
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
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
      this.logger.error('Error updating user:', error);
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
      const userResult = await client?.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (!userResult?.rows?.[0]) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Delete user
      await client?.query(
        'DELETE FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      throw error;
    } finally {
      if (client) client.release();
    }
  }
}
