// apps/api/src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService, UpdateUserProfileDto } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/auth.guard';
import { Response } from 'express';

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
  @Get()
  async getAllUsers() {
    try {
      return await this.usersService.getAllUsers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch users',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('roles')
  async getUserRoles() {
    try {
      return await this.usersService.getUserRoles();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch user roles',
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

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() userData: any, @Request() req) {
    try {
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can update other users',
          HttpStatus.FORBIDDEN
        );
      }
      
      return await this.usersService.updateUser(id, userData);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB in bytes
      },
      fileFilter: (req, file, callback) => {
        // Log the incoming file
        console.log(`Received file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);

        // Check file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new HttpException(
              'Invalid file type. Only JPEG, PNG, and GIF images are allowed.',
              HttpStatus.BAD_REQUEST
            ),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadProfilePicture(
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      const userId = req.user.sub;
      
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      console.log(`Processing file for user ${userId}: ${file.originalname}, size: ${file.size}`);
      
      return await this.usersService.uploadProfilePicture(userId, file);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw new HttpException(
        error.message || 'Failed to upload profile picture',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile-picture')
  async getProfilePicture(@Request() req, @Res() res: Response) {
    try {
      const userId = req.user.sub;
      const profilePicture = await this.usersService.getProfilePicture(userId);
      
      if (!profilePicture) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'No profile picture found'
        });
      }
      
      // Set appropriate content type from the database
      res.set('Content-Type', profilePicture.contentType);
      // Set cache control headers to prevent caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      // Add CORS headers to ensure the image can be accessed from the frontend
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      return res.send(profilePicture.data);
    } catch (error) {
      console.error('Error retrieving profile picture:', error);
      throw new HttpException(
        error.message || 'Failed to get profile picture',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile-picture/:userId')
  async getUserProfilePicture(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const profilePicture = await this.usersService.getProfilePicture(userId);
      
      if (!profilePicture) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'No profile picture found'
        });
      }
      
      // Set appropriate content type from the database
      res.set('Content-Type', profilePicture.contentType);
      // Set cache control headers to prevent caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      // Add CORS headers to ensure the image can be accessed from the frontend
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      return res.send(profilePicture.data);
    } catch (error) {
      console.error('Error retrieving user profile picture:', error);
      throw new HttpException(
        error.message || 'Failed to get user profile picture',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile-picture')
  async deleteProfilePicture(@Request() req) {
    try {
      const userId = req.user.sub;
      return await this.usersService.deleteProfilePicture(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete profile picture',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB in bytes
      },
      fileFilter: (req, file, callback) => {
        // Log the incoming file
        console.log(`Received file: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);

        // Check file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new HttpException(
              'Invalid file type. Only JPEG, PNG, and GIF images are allowed.',
              HttpStatus.BAD_REQUEST
            ),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadUserProfilePicture(
    @Param('id') userId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can update user profile pictures',
          HttpStatus.FORBIDDEN
        );
      }
      
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      console.log(`Processing file for user ${userId}: ${file.originalname}, size: ${file.size}`);
      
      return await this.usersService.uploadProfilePicture(userId, file);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw new HttpException(
        error.message || 'Failed to upload profile picture',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/profile-picture')
  async deleteUserProfilePicture(@Param('id') userId: string, @Request() req) {
    try {
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can delete user profile pictures',
          HttpStatus.FORBIDDEN
        );
      }
      
      return await this.usersService.deleteProfilePicture(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete profile picture',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    try {
      // Check if user has admin role
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can delete users',
          HttpStatus.FORBIDDEN
        );
      }
      
      // Prevent self-deletion
      if (req.user.sub === id) {
        throw new HttpException(
          'You cannot delete your own account',
          HttpStatus.BAD_REQUEST
        );
      }
      
      return await this.usersService.deleteUser(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}