import { DataSource } from 'typeorm';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DatabaseLoggerService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('✅ Database connected successfully');
    } else {
      console.error('❌ Database connection NOT initialized');
    }
  }
}
