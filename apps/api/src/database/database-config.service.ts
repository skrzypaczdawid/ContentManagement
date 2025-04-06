// apps/api/src/database/database-config.service.ts
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

export interface DatabaseConfig {
  hostname: string;
  port: number;
  database: string;
  username: string;
  password: string;
  isConfigured: boolean;
}

@Injectable()
export class DatabaseConfigService {
  private readonly configPath = path.join(process.cwd(), 'db-config.json');

  /**
   * Save database configuration to a file
   */
  saveConfig(config: DatabaseConfig): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save database config:', error);
    }
  }

  /**
   * Get database configuration from file
   */
  getConfig(): DatabaseConfig | null {
    try {
      if (!fs.existsSync(this.configPath)) {
        return null;
      }

      const configStr = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configStr) as DatabaseConfig;
    } catch (error) {
      console.error('Failed to read database config:', error);
      return null;
    }
  }

  /**
   * Check if database is configured
   */
  isDatabaseConfigured(): boolean {
    const config = this.getConfig();
    return !!config?.isConfigured;
  }
}