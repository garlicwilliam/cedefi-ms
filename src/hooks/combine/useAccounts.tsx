import { DataProvider, useDataProvider } from "@refinedev/core";
import { getFirst } from "./getFirst.tsx";
import { usePortfolios } from "../usePortfolios.tsx";
import {
  PlatformAccProfit,
  Portfolio,
  ProfitBalance,
  TeamAccProfit,
  UserAccProfit,
} from "../../service/types.ts";
import { from, Observable, zip } from "rxjs";
import { map, tap } from "rxjs/operators";
import { useEffect, useState } from "react";
import { useTeamMap } from "../useTeamMap.tsx";

// 虚拟账号余额
export const useAccounts = () => {
  const dataProvider: DataProvider = useDataProvider()();
  const { arr: portfolios, map: portfolioMap } = usePortfolios();
  const [refreshId, setRefreshId] = useState<number>(0);
  const { map: teamMap } = useTeamMap();
  const [accounts, setAccounts] = useState<ProfitBalance[]>([]);
  const refresh = () => setRefreshId(refreshId + 1);

  useEffect(() => {
    const ports: Observable<TeamAccProfit | null>[] = portfolios.map(
      (p: Portfolio) => {
        const portfolio$ = from(
          getFirst(dataProvider, "acc_profit_team", [
            { field: "portfolioId", operator: "eq", value: p.id },
          ]) as Promise<TeamAccProfit | null>,
        );

        return portfolio$;
      },
    );

    const user$: Observable<UserAccProfit | null> = from(
      getFirst(
        dataProvider,
        "acc_profit_user",
      ) as Promise<UserAccProfit | null>,
    );

    const platform$: Observable<PlatformAccProfit | null> = from(
      getFirst(
        dataProvider,
        "acc_profit_platform",
      ) as Promise<PlatformAccProfit | null>,
    );

    zip(user$, platform$, ...ports)
      .pipe(
        map(([user, platform, ...rest]): ProfitBalance[] => {
          const portfolioRows: ProfitBalance[] = rest
            .filter((a) => a !== null)
            .map((teamPortfolioAcc: TeamAccProfit): ProfitBalance => {
              const portfolio = portfolioMap.get(teamPortfolioAcc.portfolioId);
              const teamId = portfolio?.teamId;
              const team = teamId ? teamMap.get(teamId) : undefined;
              const row: ProfitBalance = {
                key: `team_portfolio_${teamPortfolioAcc.id}`,
                accountType: "team_portfolio",
                accountName: portfolio?.fundAlias || "Unknown",

                team: team || null,
                portfolio: portfolio || null,

                accProfit: teamPortfolioAcc.accProfit,
                snapshotAt: teamPortfolioAcc.snapshotAt,
              };

              return row;
            });
          const grouped = portfolioRows.reduce((acc, item) => {
            const teamId = item.team?.id || null;
            if (!teamId) {
              return acc;
            }

            if (!acc[teamId]) {
              acc[teamId] = [];
            }

            acc[teamId].push(item);

            return acc;
          }, {} as any);
          const teamRows: ProfitBalance[] = Array.from(
            Object.keys(grouped),
          ).map((tid) => {
            const teamId: number = Number(tid);

            const teamRow: ProfitBalance = {
              key: `team_${teamId}`,
              accountType: "team",
              accountName: teamMap.get(teamId)?.name || "团队未知",

              //
              team: teamMap.get(teamId) || null,
              portfolio: null,
              //
              accProfit: "",
              snapshotAt: 0,
              //

              children: grouped[teamId],
            };

            return teamRow;
          });

          const userRow: ProfitBalance = {
            key: "user",
            accountType: "user",
            accountName: "用户",

            team: null,
            portfolio: null,

            accProfit: user ? String(user.accProfit) : "0",
            snapshotAt: user ? user.snapshotAt : 0,
          };

          const platformRow: ProfitBalance = {
            key: "platform",
            accountType: "platform",
            accountName: "平台",

            team: null,
            portfolio: null,

            accProfit: platform ? String(platform.accProfit) : "0",
            snapshotAt: platform ? platform.snapshotAt : 0,
          };

          return [userRow, platformRow, ...teamRows];
        }),
        tap((rows: ProfitBalance[]) => {
          setAccounts(rows);
        }),
      )
      .subscribe();
  }, [portfolios, refreshId, portfolioMap, teamMap, dataProvider]);

  return { accounts, refresh };
};
