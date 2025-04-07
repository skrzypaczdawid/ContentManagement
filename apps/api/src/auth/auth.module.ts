// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, RolesGuard } from './auth.guard';

@Module({
    imports: [
      DatabaseModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET || 'inventrack-secret-key-2025', // In production, use environment variable
        signOptions: { expiresIn: '8h' },
      }),
    ],
    controllers: [AuthController],
    providers: [
      AuthService,
      JwtAuthGuard,
      RolesGuard
    ],
    exports: [
      AuthService,
      JwtModule,
      JwtAuthGuard,
      RolesGuard
    ],
  })
  export class AuthModule {}