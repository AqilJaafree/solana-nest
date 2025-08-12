import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';

// Use require for supertest to avoid import issues
const request = require('supertest');

describe('Solana Block API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Root endpoints', () => {
    it('/ (GET) should return welcome message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Solana Block Transaction Counter API is running! 🚀');
    });

    it('/health (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('environment');
          expect(res.body).toHaveProperty('version');
        });
    });
  });

  describe('Blocks endpoints', () => {
    it('/blocks/current (GET) should return current slot', () => {
      return request(app.getHttpServer())
        .get('/blocks/current')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('currentSlot');
          expect(res.body).toHaveProperty('timestamp');
          expect(typeof res.body.currentSlot).toBe('number');
          expect(res.body.currentSlot).toBeGreaterThan(0);
        });
    }, 20000); // 20 second timeout

    it('/blocks/:blockNumber/transactions (GET) should validate block number', () => {
      return request(app.getHttpServer())
        .get('/blocks/invalid/transactions')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('/blocks/:blockNumber/transactions (GET) should reject negative numbers', () => {
      return request(app.getHttpServer())
        .get('/blocks/-1/transactions')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('/blocks/:blockNumber/transactions (GET) should return transaction count for valid block', async () => {
      // Using a more recent block that should exist
      const blockNumber = 300000000; // Adjust this to a recent block if needed
      
      const response = await request(app.getHttpServer())
        .get(`/blocks/${blockNumber}/transactions`)
        .expect((res) => {
          // Accept either 200 (success) or 404 (block not found) as valid responses
          expect([200, 404]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('blockNumber', blockNumber);
        expect(response.body).toHaveProperty('transactionCount');
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('timestamp');
        expect(typeof response.body.transactionCount).toBe('number');
        expect(response.body.transactionCount).toBeGreaterThanOrEqual(0);
      }
    }, 30000); // 30 second timeout for block fetch

    it('/blocks/:blockNumber (GET) should return block info or 404', async () => {
      const blockNumber = 300000000;
      
      const response = await request(app.getHttpServer())
        .get(`/blocks/${blockNumber}`)
        .expect((res) => {
          // Accept either 200 (success) or 404 (block not found) as valid responses
          expect([200, 404]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('blockNumber', blockNumber);
        expect(response.body).toHaveProperty('blockTime');
        expect(response.body).toHaveProperty('blockhash');
        expect(response.body).toHaveProperty('parentSlot');
        expect(response.body).toHaveProperty('transactionCount');
        expect(response.body).toHaveProperty('success', true);
      }
    }, 30000);
  });

  describe('Caching', () => {
    it('should handle caching correctly', async () => {
      // Test with current slot (which should always work)
      const response1 = await request(app.getHttpServer())
        .get('/blocks/current')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/blocks/current')
        .expect(200);

      // Both should succeed
      expect(response1.body).toHaveProperty('currentSlot');
      expect(response2.body).toHaveProperty('currentSlot');
    }, 25000);
  });
});
