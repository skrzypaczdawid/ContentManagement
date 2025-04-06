// apps/api/src/database/database-config.service.ts
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
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
  // Simple encryption key - in production, you'd want this in an environment variable
  private readonly encryptionKey = 'inventrack-db-encryption-key-2025!';
  private readonly algorithm = 'aes-256-cbc';

  /**
   * Encrypt sensitive data
   */
  private encrypt(text: string): string {
    // Create an initialization vector
    const iv = crypto.randomBytes(16);
    // Create cipher
    const cipher = crypto.createCipheriv(
      this.algorithm, 
      Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)), 
      iv
    );
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return IV + encrypted data as a single string
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedText: string): string {
    try {
      // Split IV and encrypted data
      const parts = encryptedText.split(':');
      if (parts.length !== 2) return ''; // Invalid format
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm, 
        Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)), 
        iv
      );
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return ''; // Return empty string on error
    }
  }

  /**
   * Save database configuration to a file
   */
  saveConfig(config: DatabaseConfig): void {
    try {
      // Create a copy to avoid modifying the original
      const configToSave = { ...config };
      
      // Encrypt the password
      if (configToSave.password) {
        configToSave.password = this.encrypt(configToSave.password);
      }
      
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(configToSave, null, 2),
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
      const config = JSON.parse(configStr) as DatabaseConfig;
      
      // Decrypt the password if it exists
      if (config.password) {
        config.password = this.decrypt(config.password);
      }
      
      return config;
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