import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Solana Block Transaction Counter API is running! 🚀';
  }
}
