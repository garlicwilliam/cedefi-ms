import { httpPost } from '../util/http.ts';
import { ONE_TOKEN_API_URL } from '../const/const.ts';
import { PARENT_FUND } from '../const/one_token_funds.ts';
import { map } from 'rxjs/operators';
import { SldDecimal } from '../util/decimal.ts';
import { Observable, zip } from 'rxjs';
import { ENV, SUBQUERY_URL_CONFIG } from '../const/env.ts';
import { chain } from 'lodash';
import { E18 } from '../util/big-number.ts';
import { THE_GRAPH_API_KEY } from '../const/keys.ts';

type Body = {
  success: boolean;
  data: {
    code: string;
    message: string;
    request_time: number;
    response_time: number;
    result: {
      historical_nav: {
        fund_name: string;
        fund_alias: string;
        valuation_currency: string;
        snapshot_time: number;
        snapshot_time_str: string;
        net_assets: string;
        net_assets_str: string;
        accum_nav: string;
        accum_nav_str: string;
        accum_pnl: string;
        accum_pnl_str: string;
      }[];
    };
  };
};

type Body2 = {
  data: {
    accDepositSnapshots: {
      id: string;
      hourIndex: string;
      snapshotAt: string;
      totalUsdValue: string;
    }[];
    accWithdrawalSnapshots: {
      id: string;
      hourIndex: string;
      snapshotAt: string;
      totalUsdValue: string;
    }[];
    lpSupplySnapshots: {
      id: string;
      hourIndex: string;
      lpActive: string;
      snapshotAt: string;
      usdValLocked: string;
    }[];
  };
};

type OnChainSnapshot = {
  totalDeposit: SldDecimal;
  totalWithdraw: SldDecimal;
  lpAmount: SldDecimal;
  lpLockValue: SldDecimal;
};

export class OneTokenService {
  private readonly BaseRate: bigint = BigInt(10000); // 100%
  private readonly UserAllocationRate: bigint = BigInt(7000); // 70%

  public getAccPnlSnapshot(snapshotAt: number): Observable<SldDecimal | null> {
    const snapshotTime: number = snapshotAt * 1000000000;
    const param = {
      portfolio_name: PARENT_FUND,
      start_time: snapshotTime,
      end_time: snapshotTime,
      frequency: 'hourly',
    };

    return httpPost(ONE_TOKEN_API_URL, param).pipe(
      map((res) => {
        if (res.status === 200) {
          const body: Body = res.body as any;
          const hourPnl = body.data.result.historical_nav.find((one) => one.snapshot_time === snapshotTime);

          if (hourPnl) {
            return SldDecimal.fromNumeric(hourPnl.accum_pnl, 18);
          }
        }

        return null;
      }),
    );
  }

  public getOnChainSnapshot(snapshotAt: number): Observable<OnChainSnapshot | null> {
    const url: string = SUBQUERY_URL_CONFIG[ENV.Prod];
    //
    const param = {
      query: `query MyQuery($snapshotAt: BigInt) {
        accDepositSnapshots(
          where: {
            snapshotAt: $snapshotAt
          }
        ){
          id
          snapshotAt
          hourIndex
          totalUsdValue
        },
        accWithdrawalSnapshots(
          where: {
            snapshotAt: $snapshotAt
          }
        ){
          id
          snapshotAt
          hourIndex
          totalUsdValue
        },
        lpSupplySnapshots(
          where: {
            snapshotAt: $snapshotAt
          }
        ){
          id
          hourIndex
          snapshotAt
          usdValLocked
          lpActive
        }
      }`,
      variables: {
        snapshotAt: snapshotAt, // 快照时间，即小时的结束时刻，
      },
    };

    return httpPost(url, param, {
      header: {
        Authorization: `Bearer ${THE_GRAPH_API_KEY}`,
      },
    }).pipe(
      map((res) => {
        if (res.status === 200) {
          return res.body as Body2;
        }
        return null;
      }),
      map((body: Body2 | null) => {
        if (body === null) {
          return null;
        }

        const accDeposits = body.data.accDepositSnapshots;
        const accWithdraws = body.data.accWithdrawalSnapshots;
        const lps = body.data.lpSupplySnapshots;

        if (accDeposits.length > 0 && accWithdraws.length > 0 && lps.length > 0) {
          const deposit = accDeposits[0];
          const withdraw = accWithdraws[0];
          const lp = lps[0];

          if (
            deposit.snapshotAt.toString() === snapshotAt.toString() &&
            withdraw.snapshotAt.toString() === snapshotAt.toString() &&
            lp.snapshotAt.toString() === snapshotAt.toString()
          ) {
            const totalDeposit: SldDecimal = SldDecimal.fromOrigin(BigInt(deposit.totalUsdValue), 18);
            const totalWithdraw: SldDecimal = SldDecimal.fromOrigin(BigInt(withdraw.totalUsdValue), 18);
            const lpAmount: SldDecimal = SldDecimal.fromOrigin(BigInt(lp.lpActive), 18);
            const lpLockValue: SldDecimal = SldDecimal.fromOrigin(BigInt(lp.usdValLocked), 18);

            return {
              totalDeposit,
              totalWithdraw,
              lpAmount,
              lpLockValue,
            };
          }
        }

        return null;
      }),
    );
  }

  public getUserAccProfit(snapshotAt: number): Observable<SldDecimal | null> {
    return this.getAccPnlSnapshot(snapshotAt).pipe(
      map((pnl: SldDecimal | null): SldDecimal | null => {
        if (pnl == null) {
          return null;
        }

        return pnl.mul(this.UserAllocationRate).div(this.BaseRate);
      }),
    );
  }

  public getExchangeRate(snapshotAt: number): Observable<SldDecimal | null> {
    return zip(this.getOnChainSnapshot(snapshotAt), this.getUserAccProfit(snapshotAt)).pipe(
      map(([chainData, accProfit]) => {
        // 计算 Exchange Rate
        if (chainData == null || accProfit == null) {
          return null;
        }
        const totalValue: SldDecimal = chainData.totalDeposit.sub(chainData.totalWithdraw).add(accProfit).sub(chainData.lpLockValue);
        const totalLp: SldDecimal = chainData.lpAmount;

        if (totalLp.isZero()) {
          return null;
        }

        return totalValue.mul(E18).div(totalLp.toOrigin());
      }),
    );
  }
}

export const oneTokenService = new OneTokenService();
