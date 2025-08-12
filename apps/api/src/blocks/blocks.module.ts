import { Module } from '@nestjs/common';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [SolanaModule],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}
