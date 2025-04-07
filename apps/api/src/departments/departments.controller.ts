// apps/api/src/departments/departments.controller.ts
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { Public } from '../auth/auth.guard';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Public() // Make this endpoint public for registration
  @Get()
  async getAllDepartments() {
    try {
      return await this.departmentsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch departments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Public() // Make this endpoint public for dashboard
  @Get('count')
  async getDepartmentsCount() {
    try {
      return await this.departmentsService.getDepartmentsCount();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch departments count',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}