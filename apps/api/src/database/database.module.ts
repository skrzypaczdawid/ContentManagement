// apps/api/src/database/database.module.ts
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { DatabaseConfigService } from './database-config.service';

@Module({
  controllers: [DatabaseController],
  providers: [
    DatabaseService,
    DatabaseConfigService,
    {
      provide: 'DATABASE_SERVICE',
      useExisting: DatabaseService
    }
  ],
  exports: [
    DatabaseService,
    DatabaseConfigService,
    'DATABASE_SERVICE'
  ],
})
export class DatabaseModule {}