// apps/api/src/users/users.controller.ts
import { Controller, Get, Put, Body, Param, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { UsersService, UpdateUserProfileDto } from '../users/users.service';
import { Public, JwtAuthGuard } from '../auth/auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateUserProfileDto) {
    try {
      // Get user ID from JWT token payload
      // The JWT payload uses 'sub' for the user ID as per the JwtPayload interface in auth.service.ts
      const userId = req.user.sub;
      
      // Update user profile
      const updatedUser = await this.usersService.updateUserProfile(userId, updateProfileDto);
      
      return {
        message: 'Profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}