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
    lpAccBurned: string;
    lpAccDestroyed: string;
    lpAccForfeited: string;
    lpAccMinted: string;
    lpAccProcessed: string;
    lpActive: string;
    lpLocked: string;
    lpSupply: string;
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
          lpAccBurned
          lpAccDestroyed
          lpAccForfeited
          lpAccMinted
          lpAccProcessed
          lpActive
          lpLocked
          lpSupply
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
          const deposit: SldDecimal = SldDecimal.fromOrigin(BigInt(data.accDeposit.totalUsdValue), 18);
          const withdraw: SldDecimal = SldDecimal.fromOrigin(BigInt(data.accWithdrawal.totalUsdValue), 18);
          const lpActive: SldDecimal = SldDecimal.fromOrigin(BigInt(data.lpSupply.lpActive), 18);
          const lpPrice: SldDecimal = SldDecimal.fromOrigin(BigInt(data.prices[0].price), 18);
          const lpLocked: SldDecimal = SldDecimal.fromOrigin(BigInt(data.lpSupply.lpLocked), 18);
          const lpLockedUsdValue: SldDecimal = SldDecimal.fromOrigin(BigInt(data.lpSupply.usdValLocked), 18);
          const lpProcessed: SldDecimal = SldDecimal.fromOrigin(BigInt(data.lpSupply.lpAccProcessed), 18);
          const lpForfeited: SldDecimal = SldDecimal.fromOrigin(BigInt(data.lpSupply.lpAccForfeited), 18);

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
}

export const subgraphService = new SubgraphService();
