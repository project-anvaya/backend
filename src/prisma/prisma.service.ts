import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Optional: configure logging levels
    });
  }

  async onModuleInit() {
    // Attempt to connect to the database when the module initializes
    await this.$connect();
    console.log('Prisma Client connected successfully.');
  }

  async onModuleDestroy() {
    // Disconnect from the database when the application shuts down
    await this.$disconnect();
    console.log('Prisma Client disconnected.');
  }

  // Optional: Add a simple method to test connectivity if needed
  async testConnection() {
    try {
      // $queryRaw is suitable for simple pings or checks
      await this.$queryRaw`SELECT 1`; 
      console.log('Database connectivity test successful.');
      return true;
    } catch (error) {
      console.error('Database connectivity test failed:', error);
      return false;
    }
  }
} 