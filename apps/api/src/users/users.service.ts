// apps/api/src/users/users.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PoolClient } from 'pg';
import { Express } from 'express';

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
   * Upload and save user profile picture
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
      const userCheck = await client.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rowCount === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // First, check if we need to add a profile_picture column to the users table
      const checkColumnExists = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'cmdb' 
        AND table_name = 'users' 
        AND column_name = 'profile_picture'
      `);
      
      if (checkColumnExists.rowCount === 0) {
        // Add profile_picture column if it doesn't exist
        await client.query(`
          ALTER TABLE cmdb.users 
          ADD COLUMN profile_picture BYTEA,
          ADD COLUMN profile_picture_type VARCHAR(50)
        `);
      } else {
        // Check if profile_picture_type column exists
        const checkTypeColumnExists = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'cmdb' 
          AND table_name = 'users' 
          AND column_name = 'profile_picture_type'
        `);
        
        if (checkTypeColumnExists.rowCount === 0) {
          // Add profile_picture_type column if it doesn't exist
          await client.query(`
            ALTER TABLE cmdb.users 
            ADD COLUMN profile_picture_type VARCHAR(50)
          `);
        }
      }
      
      // Update the user's profile picture
      await client.query(
        `UPDATE cmdb.users 
         SET profile_picture = $1, profile_picture_type = $2, updated_at = NOW()
         WHERE id = $3`,
        [file.buffer, file.mimetype, userId]
      );
      
      this.logger.log(`Profile picture updated for user ${userId}, size: ${file.size} bytes, type: ${file.mimetype}`);
      
      return { success: true, message: 'Profile picture updated successfully' };
    } catch (error) {
      this.logger.error(`Failed to upload profile picture: ${error.message}`);
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
   * Delete user profile picture
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
      const userCheck = await client.query(
        'SELECT id FROM cmdb.users WHERE id = $1',
        [userId]
      );
      
      if (userCheck.rowCount === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Delete the profile picture
      await client.query(
        'UPDATE cmdb.users SET profile_picture = NULL, profile_picture_type = NULL, updated_at = NOW() WHERE id = $1',
        [userId]
      );
      
      return { success: true, message: 'Profile picture deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete profile picture: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }
}
