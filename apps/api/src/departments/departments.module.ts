// apps/api/src/departments/departments.module.ts
import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DepartmentsController],
  providers: [
    DepartmentsService,
    {
      provide: 'DATABASE_SERVICE',
      useClass: DatabaseModule
    }
  ],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}