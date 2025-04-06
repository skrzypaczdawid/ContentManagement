// apps/api/src/database/database.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService, DatabaseConnectionConfig, AdminUserConfig } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

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
    
    return result;
  }
}