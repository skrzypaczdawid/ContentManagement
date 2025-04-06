// apps/api/src/departments/departments.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PoolClient } from 'pg';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Find all departments
   */
  async findAll() {
    let client: PoolClient | null = null;
    
    try {
      // Get database connection
      if (!this.databaseService.getPool()) {
        throw new Error('Database not configured');
      }
      
      client = await this.databaseService.getPool()?.connect();
      
      // Query all departments
      const result = await client?.query(
        'SELECT id, name, description, parent_id FROM cmdb.departments ORDER BY name'
      );
      
      return result?.rows || [];
    } catch (error) {
      this.logger.error(`Failed to fetch departments: ${error.message}`);
      throw error;
    } finally {
      if (client) client.release();
    }
  }
}