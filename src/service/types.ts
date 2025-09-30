export type RestResponseBody = {
  isOK: boolean;
  message: string | null;
  data: ({ obj: object | null } | { list: object[]; total: number }) &
    Record<string, any | undefined>;
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
  toTeam: number;
  toPlatform: number;
  toUser: number;
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
  accProfit: number;
  createdAt: number;
};

export type UserAccProfit = {
  id: number;
  snapshotAt: number;
  accProfit: number;
  createdAt: number;
};

export type TeamAccProfit = {
  id: number;
  portfolioId: number;
  snapshotAt: number;
  accProfit: string;
  createdAt: number;
};

export type ProfitBalance = {
  key: string;
  accountType: "platform" | "user" | "team" | "team_portfolio";
  accountName: string;
  //
  team: Team | null;
  portfolio: Portfolio | null;
  //
  snapshotAt: number;
  accProfit: string;

  children?: ProfitBalance[];
};
