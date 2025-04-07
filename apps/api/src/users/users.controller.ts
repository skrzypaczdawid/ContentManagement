// apps/api/src/users/users.controller.ts
import { 
  Controller, 
  Get, 
  Put, 
  Post,
  Delete,
  Body, 
  Param, 
  HttpException, 
  HttpStatus, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService, UpdateUserProfileDto } from '../users/users.service';
import { Public, JwtAuthGuard } from '../auth/auth.guard';
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
  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB in bytes
      },
      fileFilter: (req, file, callback) => {
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
      
      return await this.usersService.uploadProfilePicture(userId, file);
    } catch (error) {
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
      return res.send(profilePicture.data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get profile picture',
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
}