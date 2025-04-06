// apps/api/src/database/database.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { DatabaseService, DatabaseConnectionConfig, AdminUserConfig } from './database.service';
import { DatabaseConfigService } from './database-config.service';

@Controller('database')
export class DatabaseController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly databaseConfigService: DatabaseConfigService
  ) {}

  @Get('status')
  async getStatus() {
    return {
      isConfigured: this.databaseConfigService.isDatabaseConfigured()
    };
  }

  @Post('test-connection')
  async testConnection(@Body() config: DatabaseConnectionConfig) {
    const result = await this.databaseService.testConnection(config);
    
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    
    return result;
  }

  @Post('execute-schema')
  async executeSchema(@Body() config: DatabaseConnectionConfig) {
    const result = await this.databaseService.executeDatabaseSchema(config);
    
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    
    return result;
  }

  @Post('create-admin')
  async createAdminUser(
    @Body() payload: { dbConfig: DatabaseConnectionConfig, adminConfig: AdminUserConfig }
  ) {
    const result = await this.databaseService.createAdminUser(
      payload.dbConfig, 
      payload.adminConfig
    );
    
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    
    // Save the database configuration
    this.databaseConfigService.saveConfig({
      ...payload.dbConfig,
      isConfigured: true
    });
    
    return result;
  }
}