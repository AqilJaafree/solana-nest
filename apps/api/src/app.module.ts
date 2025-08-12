import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlocksModule } from './blocks/blocks.module';

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        SOLANA_RPC_URL: Joi.string().uri().default('https://api.mainnet-beta.solana.com'),
        REDIS_URL: Joi.string().uri().optional().allow(''),
        FRONTEND_URL: Joi.string().uri().default('http://localhost:3001'),
        CACHE_TTL: Joi.number().min(1).default(300),
        THROTTLE_TTL: Joi.number().min(1).default(60),
        THROTTLE_LIMIT: Joi.number().min(1).default(10),
      }),
    }),
    
    // Caching (memory-based for now, Redis optional)
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL || '300') * 1000, // Convert to milliseconds
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
      limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
    }]),
    
    // HTTP client for external APIs
    HttpModule,
    
    // Feature modules
    BlocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
