export interface TransactionCountResponse {
  blockNumber: number;
  transactionCount: number;
  blockTime?: number;
  success: boolean;
  cached?: boolean;
  timestamp: string;
}

export interface BlockResponse {
  blockNumber: number;
  blockTime: number;
  blockhash: string;
  parentSlot: number;
  transactionCount: number;
  success: boolean;
  cached?: boolean;
  timestamp: string;
}
