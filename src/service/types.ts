import { SldDecimal } from '../util/decimal.ts';

export type RestResponseBody = {
  isOK: boolean;
  message: string | null;
  data: ({ obj: object | null } | { list: object[]; total: number }) & Record<string, any | undefined>;
};

export type AdminUser = {
  id: number;
  email: string;
  permissions: string[];
};

export type Permission = {
  id: string; // user, team ...
  label: string;
  description: string;
};

export type PermissionCache = {
  arr: Permission[];
  map: Map<string, Permission>;
};

export type Team = {
  id: number;
  name: string;
};

export type PortfolioAllocationRatio = {
  id: number;
  portfolioId: number;
  version: number;
  toTeamRatio: number;
  toPlatformRatio: number;
  toUserRatio: number;
  createdAt: number;
};

export type Portfolio = {
  id: number;
  fundName: string;
  fundAlias: string;
  inceptionTime: number;
  accountName: string;
  accountAlias: string;
  ceffuWalletId: string;
  ceffuWalletName: string;

  teamId: number | null;
};

export type PlatformAccProfit = {
  id: number;
  snapshotAt: number;
  accProfit: string;
  createdAt: number;
};

export type UserAccProfit = {
  id: number;
  snapshotAt: number;
  accProfit: string;
  createdAt: number;
};

export type TeamAccProfit = {
  id: number;
  portfolioId: number;
  snapshotAt: number;
  accProfit: string;
  createdAt: number;
};

export type PortfolioAccProfit = {
  id: number;
  portfolioId: number;
  snapshotAt: number;
  accProfit: string;
  createdAt: number;
};

export type ProfitBalance = {
  key: string;
  accountType: 'platform' | 'user' | 'team' | 'team_portfolio';
  accountName: string;
  //
  team: Team | null;
  portfolio: Portfolio | null;
  //
  snapshotAt: number;
  accProfit: string;

  children?: ProfitBalance[];
};

export type GraphListResponseBody = {
  data?: {
    [key: string]: any[];
  };
  errors?: { message: string }[];
};

export type GraphOneResponseBody = {
  data: { [key: string]: any | null };
  errors?: { message: string }[];
};

export type TimeLockExecute = {
  id: string;
  type: 0 | 1 | 2;
  exHash: `0x${string}`;
  status: 'scheduled' | '';
  predecessorId: string;
  salt: `0x${string}`;
  delay: string; // bigint
  batchSize: number;
  executeDone: boolean[];
  target: string[]; // address
  value: string[]; // bigint
  callData: `0x${string}`[]; //
  createdAt: string; //
  createdBlock: string; //
  updatedAt: string; //
  updatedBlock: string; //
};

export type Price = {
  id: string;
  idx: number;
  price: string;
  token: string;
  tokenSymbol: string;
  timestamp: string;
  blockNumber: number;
};

export type RequestOrder = {
  id: string;
  round: string;
  status: RequestOrderStatus;
  requestShares: string;
  sharePrice: string;

  assetAmount: string;
  assetPrice: string;
  cancelledAt: string;
  completedAt: string;
  forfeitedAt: string;
  processedAt: string;
  processingAt: string;
  rejectedAt: string;
  requestedAt: string;
  requester: string;
  reviewedAt: string;
  updatedAt: string;
  usdValue: string;

  requestAsset: Asset;
};

export enum RequestOrderStatus {
  Requested = 'Requested',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected',
  Processing = 'Processing',
  Reviewing = 'Reviewing',
  Processed = 'Processed',
  Completed = 'Completed',
  Forfeited = 'Forfeited',
}

export type Asset = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type RoundAsset = {
  id: string;
  processingAmount: string;
  processedAmount: string;
  forfeitedAmount: string;
  asset: Asset;
};

export type Round = {
  id: string;
  startedAt: string;
  closedAt: string;
  updatedAt: string;

  sumForfeitedLpAmount: string;
  sumForfeitedOrderCount: number;
  sumForfeitedUsdValue: string;
  sumProcessedLpAmount: string;
  sumProcessedOrderCount: number;
  sumProcessedUsdValue: string;
  sumProcessingLpAmount: string;
  sumProcessingOrderCount: number;
  sumProcessingUsdValue: string;

  sumAssets: RoundAsset[];
};

export type RateSnapshot = {
  id: number;
  snapshotAt: number;
  exchangeRate: number;
  userDeposit: string;
  userWithdraw: string;
  userProfit: string;
  lpLockedValue: string;
  lpActive: string;
  createdAt: number;
};

export type NetAssetSnapshot = {
  id: string;
  snapshotAt: number;
  netAssetValue: string;
  valueCefi: string;
  valueContract: string;
  valueSafeWallet: string;
  valueCeffu: string;
  detailContract: string;
  detailSafeWallet: string;
  detailCeffu: string;
};

export type AssetCutOffPrice = {
  index: number;
  updateTime: number;
  assets: Record<string, SldDecimal | null>;
};
