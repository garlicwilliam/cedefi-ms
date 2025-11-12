import { useMemo } from 'react';
import { useList } from '@refinedev/core';
import { TeamAccProfit } from '../../service/types.ts';
import type { PlatformAccProfit, UserAccProfit, Portfolio } from '../../service/types.ts';
import { usePortfolios } from '../usePortfolios.tsx';

export type TeamProfits = {
  portfolioProfits: TeamAccProfit[];
  totalAccProfit: number;
};

export function useProfitAccountsByTime(timestamp: number | null | undefined) {
  // 1. 确认timestamp是某个小时结束的整点时间，创建snapshotAt变量使 snapshotAt<=timestamp 且是小时结束的整点时间
  const snapshotAt: number | null = timestamp ? Math.floor(timestamp / 3600) * 3600 : null;

  // 2. 使用useList获取资源 acc_profit_user, acc_profit_platform, 以及acc_profit_team 所有条件符合 snapshotAt 等于指定时间点 的数据
  const {
    result: { data: userData },
    query: { isLoading: userLoading, isError: userError },
  } = useList<UserAccProfit>({
    resource: 'acc_profit_user',
    filters: [
      {
        field: 'snapshotAt',
        operator: 'eq',
        value: snapshotAt,
      },
    ],
    queryOptions: {
      enabled: !!snapshotAt,
    },
  });

  const {
    result: { data: platformData },
    query: { isLoading: platformLoading, isError: platformError },
  } = useList<PlatformAccProfit>({
    resource: 'acc_profit_platform',
    filters: [
      {
        field: 'snapshotAt',
        operator: 'eq',
        value: snapshotAt,
      },
    ],
    queryOptions: {
      enabled: !!snapshotAt,
    },
  });

  const {
    result: { data: teamData },
    query: { isLoading: teamLoading, isError: teamError },
  } = useList<TeamAccProfit>({
    resource: 'acc_profit_team',
    filters: [
      {
        field: 'snapshotAt',
        operator: 'eq',
        value: snapshotAt,
      },
    ],
    pagination: { pageSize: 1000 },
    queryOptions: {
      enabled: !!snapshotAt,
    },
  });

  // 4. 用usePortfolios获取portfolios信息，然后按照acc_profit_team 的 portfolioId 字段关联对应的 Portfolio 信息
  const { map: portfolioMap, isLoading: portfoliosLoading, isError: portfoliosError } = usePortfolios(!!snapshotAt);

  const isLoading = userLoading || platformLoading || teamLoading || portfoliosLoading;
  const isError = userError || platformError || teamError || portfoliosError;

  const result = useMemo(() => {
    const user = userData && Array.isArray(userData) && userData.length > 0 ? (userData[0] as UserAccProfit) : null;
    const platform = platformData && Array.isArray(platformData) && platformData.length > 0 ? (platformData[0] as PlatformAccProfit) : null;
    const teamArr: TeamAccProfit[] = teamData && Array.isArray(teamData) ? (teamData as TeamAccProfit[]) : [];

    // 4. 按 teamId 分组 acc_profit_team
    const teamsMap = new Map<number, TeamProfits>();
    const noTeamPortfolios: TeamProfits = {
      portfolioProfits: [],
      totalAccProfit: 0,
    };

    for (const acc of teamArr) {
      const pid = Number(acc.portfolioId);
      const portfolio: Portfolio | undefined = portfolioMap.get(pid);
      const teamId: number | null = portfolio && Boolean(portfolio.teamId) ? portfolio.teamId : null;

      // if portfolio has no teamId, skip grouping by team
      if (teamId === null) {
        noTeamPortfolios.portfolioProfits.push(acc);
        noTeamPortfolios.totalAccProfit += Number(acc.accProfit);
        continue;
      }

      const entry: TeamProfits = teamsMap.get(teamId) ?? { portfolioProfits: [], totalAccProfit: 0 };
      entry.portfolioProfits.push(acc);
      entry.totalAccProfit += Number(acc.accProfit);

      teamsMap.set(teamId, entry);
    }

    return {
      user,
      platform,
      teams: teamsMap,
      noTeamPortfolios,
    };
  }, [userData, platformData, teamData, portfolioMap]);

  return {
    user: result.user,
    platform: result.platform,
    teams: result.teams,
    noTeamPortfolios: result.noTeamPortfolios,
    isLoading,
    isError,
    snapshotAt,
  };
}
