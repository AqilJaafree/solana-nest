import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SolanaService } from './solana.service';

@Module({
  imports: [HttpModule],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
