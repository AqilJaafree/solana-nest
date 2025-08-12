export interface TransactionCountResponse {
  blockNumber: number;
  transactionCount: number;
  blockTime?: number;
  success: boolean;
  cached?: boolean;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

export interface CurrentSlotResponse {
  currentSlot: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
