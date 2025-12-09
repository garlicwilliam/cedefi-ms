import { httpPost } from '../util/http.ts';
import { SUBQUERY_ST_URL } from '../const/env.ts';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { SldDecimal } from '../util/decimal.ts';
import { Observable } from 'rxjs';
import { THE_GRAPH_API_KEY } from '../const/keys.ts';
import { Asset } from './types.ts';

export type WithdrawAssetAccount = {
  asset: Asset;
  accProcessedAmount: SldDecimal;
  accForfeitedAmount: SldDecimal;
  accProcessedUsdVal: SldDecimal;
  accForfeitedUsdVal: SldDecimal;
  //
  requiredAmount: SldDecimal;
  requiredUsdVal: SldDecimal;
  realAmount: SldDecimal;
  netAmount: SldDecimal;
};
export type DepositAssetAccount = {
  asset: Asset;
  accDepositedAmount: SldDecimal;
  accDepositedShares: SldDecimal;
  accDepositedUsdVal: SldDecimal;
};
type StatisticResponseData = {
  lpSupply: {
    id: string;
    lpAccDestroyed: string;
    lpAccForfeited: string;
    lpAccProcessed: string;
    lpActive: string;
    lpLocked: string;
    updatedAt: string;
    usdValLocked: string;
  };
  accWithdrawal: {
    id: string;
    totalUsdValue: string;
  };
  accDeposit: {
    id: string;
    totalUsdValue: string;
  };
  withdrawAssetsAccounts: {
    id: string;
    accProcessedUsdVal: string;
    accProcessedAmount: string;
    accForfeitedUsdVal: string;
    accForfeitedAmount: string;
    accForceRoutedAmount: string;
    accClaimedUsdVal: string;
    accClaimedAmount: string;
    netAmount: string;
    realAmount: string;
    requiredAmount: string;
    requiredUsdVal: string;
  }[];
  depositAssetsAccounts: {
    id: string;
    accDepositedUsdVal: string;
    accDepositedShares: string;
    accDepositedAmount: string;
  }[];
  assets: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  }[];
  prices: {
    price: string;
  }[];
};
type StatisticResponseData2 = {
  lpSupplySnapshots: {
    lpAccDestroyed: string;
    lpAccForfeited: string;
    lpAccProcessed: string;
    lpActive: string;
    lpLocked: string;
    usdValLocked: string;
    snapshotAt: string;
  }[];
  accWithdrawalSnapshots: {
    snapshotAt: string;
    totalUsdValue: string;
  }[];
  accDepositSnapshots: {
    snapshotAt: string;
    totalUsdValue: string;
  }[];
  depositAssetsAccountSnapshots: {
    snapshotAt: string;
    asset: string;
    accDepositedUsdVal: string;
    accDepositedShares: string;
    accDepositedAmount: string;
  }[];
  withdrawAssetsAccountSnapshots: {
    asset: string;
    snapshotAt: string;
    accProcessedUsdVal: string;
    accProcessedAmount: string;
    accForfeitedUsdVal: string;
    accForfeitedAmount: string;
    accForceRoutedAmount: string;
    accClaimedUsdVal: string;
    accClaimedAmount: string;
    netAmount: string;
    realAmount: string;
    requiredAmount: string;
    requiredUsdVal: string;
  }[];
  assets: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  }[];
  prices: {
    price: string;
  }[];
};
export type StatisticData = {
  accDeposit: SldDecimal;
  accWithdrawal: SldDecimal;
  lpActive: SldDecimal;
  lpPrice: SldDecimal;
  lpLocked: SldDecimal;
  lpLockedUsdValue: SldDecimal;
  lpProcessed: SldDecimal;
  lpForfeited: SldDecimal;
  //
  accounts: WithdrawAssetAccount[];
  deposits: DepositAssetAccount[];
};

function toDecimal(val: string): SldDecimal {
  return SldDecimal.fromOrigin(BigInt(val), 18);
}

export class SubgraphService {
  public getStatistics(): Observable<StatisticData | null> {
    const param = {
      query: `
      {
        assets {
          id
          name
          symbol
          decimals
        }
        lpSupply(id: "1") {
          id
          lpAccDestroyed
          lpAccForfeited
          lpAccProcessed
          lpActive
          lpLocked
          updatedAt
          usdValLocked
        }
        accWithdrawal(id: "1") {
          id
          totalUsdValue
        }
        accDeposit(id: "1") {
          id
          totalUsdValue
        }
        depositAssetsAccounts {
          id
          accDepositedUsdVal
          accDepositedShares
          accDepositedAmount
        }
        withdrawAssetsAccounts {
          id
          accProcessedUsdVal
          accProcessedAmount
          accForfeitedUsdVal
          accForfeitedAmount
          accForceRoutedAmount
          accClaimedUsdVal
          accClaimedAmount
          netAmount
          realAmount
          requiredAmount
          requiredUsdVal
        },
        prices(
          orderBy: idx,
          orderDirection: desc,
          first:1,
          where: {
            token: "0x6a6e3a4396993a4ec98a6f4a654cc0819538721e"
          }
        ) {
          price
        }
      }
      `,
    };

    return httpPost(SUBQUERY_ST_URL, param, {
      header: {
        Authorization: `Bearer ${THE_GRAPH_API_KEY}`,
      },
    }).pipe(
      map((res) => {
        if (res.status === 200 && res.body && _.has(res.body, 'data')) {
          const body = res.body as { data: StatisticResponseData };
          const data = body.data;

          const deposit: SldDecimal = toDecimal(data.accDeposit.totalUsdValue);
          const withdraw: SldDecimal = toDecimal(data.accWithdrawal.totalUsdValue);
          const lpActive: SldDecimal = toDecimal(data.lpSupply.lpActive);
          const lpPrice: SldDecimal = toDecimal(data.prices[0].price);
          const lpLocked: SldDecimal = toDecimal(data.lpSupply.lpLocked);
          const lpLockedUsdValue: SldDecimal = toDecimal(data.lpSupply.usdValLocked);
          const lpProcessed: SldDecimal = toDecimal(data.lpSupply.lpAccProcessed);
          const lpForfeited: SldDecimal = toDecimal(data.lpSupply.lpAccForfeited);

          const assetsMap = new Map<string, Asset>();
          data.assets.forEach((asset: Asset) => {
            assetsMap.set(asset.id, asset);
          });

          const withdrawAccounts = data.withdrawAssetsAccounts;
          const accounts = withdrawAccounts.map((account) => {
            const asset: Asset = assetsMap.get(account.id)!;
            const withdrawAsset: WithdrawAssetAccount = {} as WithdrawAssetAccount;
            withdrawAsset.asset = asset;
            withdrawAsset.accProcessedAmount = SldDecimal.fromOrigin(BigInt(account.accProcessedAmount), 18);
            withdrawAsset.accForfeitedAmount = SldDecimal.fromOrigin(BigInt(account.accForfeitedAmount), 18);
            withdrawAsset.accProcessedUsdVal = SldDecimal.fromOrigin(BigInt(account.accProcessedUsdVal), 18);
            withdrawAsset.accForfeitedUsdVal = SldDecimal.fromOrigin(BigInt(account.accForfeitedUsdVal), 18);
            withdrawAsset.requiredAmount = SldDecimal.fromOrigin(BigInt(account.requiredAmount), 18);
            withdrawAsset.requiredUsdVal = SldDecimal.fromOrigin(BigInt(account.requiredUsdVal), 18);
            withdrawAsset.realAmount = SldDecimal.fromOrigin(BigInt(account.realAmount), 18);
            withdrawAsset.netAmount = SldDecimal.fromOrigin(BigInt(account.netAmount), 18);

            return withdrawAsset;
          });

          const depositAccounts = data.depositAssetsAccounts;
          const deposits = depositAccounts.map((account) => {
            const asset: Asset = assetsMap.get(account.id)!;
            const depositAsset: DepositAssetAccount = {} as DepositAssetAccount;
            depositAsset.asset = asset;
            depositAsset.accDepositedAmount = SldDecimal.fromOrigin(BigInt(account.accDepositedAmount), 18);
            depositAsset.accDepositedShares = SldDecimal.fromOrigin(BigInt(account.accDepositedShares), 18);
            depositAsset.accDepositedUsdVal = SldDecimal.fromOrigin(BigInt(account.accDepositedUsdVal), 18);

            return depositAsset;
          });

          return {
            accDeposit: deposit,
            accWithdrawal: withdraw,
            lpActive: lpActive,
            lpPrice,
            lpLocked: lpLocked,
            lpLockedUsdValue,
            lpProcessed,
            lpForfeited,
            accounts,
            deposits,
          } as StatisticData;
        }

        return null;
      }),
    );
  }

  public getStatisticsByTime(snapshotAt: string): Observable<StatisticData | null> {
    const param = {
      query: `
      {
        assets {
          id
          name
          symbol
          decimals
        }
        lpSupplySnapshots(
          where: { snapshotAt: "${snapshotAt}" }
        ) {
          lpAccDestroyed
          lpAccForfeited
          lpAccProcessed
          lpActive
          lpLocked
          usdValLocked
          snapshotAt
        }
        accWithdrawalSnapshots(
          where: {snapshotAt: "${snapshotAt}"}
        ) {
          snapshotAt
          totalUsdValue
        }
        accDepositSnapshots(
          where: {
            snapshotAt: "${snapshotAt}"
          }
        ) {
          snapshotAt
          totalUsdValue
        }
        depositAssetsAccountSnapshots (
          where: {
            snapshotAt: "${snapshotAt}"
          }
        ) {
          snapshotAt
          asset
          accDepositedUsdVal
          accDepositedShares
          accDepositedAmount
        }
        withdrawAssetsAccountSnapshots(
          where: {
            snapshotAt: "${snapshotAt}"
          }
        ) {
          asset
          snapshotAt
          accProcessedUsdVal
          accProcessedAmount
          accForfeitedUsdVal
          accForfeitedAmount
          accForceRoutedAmount
          accClaimedUsdVal
          accClaimedAmount
          netAmount
          realAmount
          requiredAmount
          requiredUsdVal
        },
        prices(
          orderBy: idx,
          orderDirection: desc,
          first:1,
          where: {
            token: "0x6a6e3a4396993a4ec98a6f4a654cc0819538721e",
            timestamp_lte: "${snapshotAt}"
          }
        ) {
          price
        }
      }
      `,
    };

    return httpPost(SUBQUERY_ST_URL, param, {
      header: {
        Authorization: `Bearer ${THE_GRAPH_API_KEY}`,
      },
    }).pipe(
      map((res) => {
        if (res.status === 200 && res.body && _.has(res.body, 'data')) {
          const body = res.body as { data: StatisticResponseData2 };
          const data = body.data;

          const deposit: SldDecimal = toDecimal(data.accDepositSnapshots[0].totalUsdValue);
          const withdraw: SldDecimal = toDecimal(data.accWithdrawalSnapshots[0].totalUsdValue);
          const lpActive: SldDecimal = toDecimal(data.lpSupplySnapshots[0].lpActive);
          const lpPrice: SldDecimal = toDecimal(data.prices[0].price);
          const lpLocked: SldDecimal = toDecimal(data.lpSupplySnapshots[0].lpLocked);
          const lpLockedUsdValue: SldDecimal = toDecimal(data.lpSupplySnapshots[0].usdValLocked);
          const lpProcessed: SldDecimal = toDecimal(data.lpSupplySnapshots[0].lpAccProcessed);
          const lpForfeited: SldDecimal = toDecimal(data.lpSupplySnapshots[0].lpAccForfeited);

          const assetsMap = new Map<string, Asset>();
          data.assets.forEach((asset: Asset) => {
            assetsMap.set(asset.id, asset);
          });

          const withdrawAccounts = data.withdrawAssetsAccountSnapshots;
          const accounts: WithdrawAssetAccount[] = withdrawAccounts.map((account) => {
            const asset: Asset = assetsMap.get(account.asset)!;
            const withdrawAsset: WithdrawAssetAccount = {} as WithdrawAssetAccount;
            withdrawAsset.asset = asset;
            withdrawAsset.accProcessedAmount = toDecimal(account.accProcessedAmount);
            withdrawAsset.accForfeitedAmount = toDecimal(account.accForfeitedAmount);
            withdrawAsset.accProcessedUsdVal = toDecimal(account.accProcessedUsdVal);
            withdrawAsset.accForfeitedUsdVal = toDecimal(account.accForfeitedUsdVal);
            withdrawAsset.requiredAmount = toDecimal(account.requiredAmount);
            withdrawAsset.requiredUsdVal = toDecimal(account.requiredUsdVal);
            withdrawAsset.realAmount = toDecimal(account.realAmount);
            withdrawAsset.netAmount = toDecimal(account.netAmount);

            return withdrawAsset;
          });

          const depositAccounts = data.depositAssetsAccountSnapshots;
          const deposits = depositAccounts.map((account) => {
            const asset: Asset = assetsMap.get(account.asset)!;
            const depositAsset: DepositAssetAccount = {} as DepositAssetAccount;
            depositAsset.asset = asset;
            depositAsset.accDepositedAmount = toDecimal(account.accDepositedAmount);
            depositAsset.accDepositedShares = toDecimal(account.accDepositedShares);
            depositAsset.accDepositedUsdVal = toDecimal(account.accDepositedUsdVal);

            return depositAsset;
          });

          return {
            accDeposit: deposit,
            accWithdrawal: withdraw,
            lpActive: lpActive,
            lpPrice,
            lpLocked: lpLocked,
            lpLockedUsdValue,
            lpProcessed,
            lpForfeited,
            accounts,
            deposits,
          } as StatisticData;
        }

        return null;
      }),
    );
  }
}

export const subgraphService = new SubgraphService();
