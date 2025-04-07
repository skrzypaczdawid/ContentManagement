// apps/api/src/users/users.controller.ts
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public() // Make this endpoint public for dashboard
  @Get('count')
  async getUsersCount() {
    try {
      return await this.usersService.getUsersCount();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users count',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Public() // Make this endpoint public for dashboard
  @Get('countWeek')
  async getUsersCountThisWeek() {
    try {
      return await this.usersService.getUsersCountThisWeek();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users count',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}