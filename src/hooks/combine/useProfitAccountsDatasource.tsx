import { useLatestSnapshotAt } from '../useLatestSnapshotAt.tsx';
import { useProfitAccountsByTime } from './useProfitAccountsByTime.tsx';
import { useMemo } from 'react';
import { ProfitBalance, TeamAccProfit } from '../../service/types.ts';
import { useTeamMap } from '../useTeamMap.tsx';
import { usePortfolios } from '../usePortfolios.tsx';

export function useProfitAccountsDatasource() {
  const { snapshotAt } = useLatestSnapshotAt();
  const { map: teamMap } = useTeamMap();
  const { map: portfolioMap } = usePortfolios();
  const { user, platform, teams, noTeamPortfolios } = useProfitAccountsByTime(snapshotAt);

  const accountRows = useMemo(() => {
    const userBalance: ProfitBalance = {
      key: 'user',
      accountType: 'user',
      accountName: '用户',
      accProfit: user ? user.accProfit : '',
      snapshotAt: user ? user.snapshotAt : 0,

      team: null,
      portfolio: null,
    };
    const platformBalance: ProfitBalance = {
      key: 'platform',
      accountType: 'platform',
      accountName: '平台',
      accProfit: platform ? platform.accProfit : '',
      snapshotAt: platform ? platform.snapshotAt : 0,

      team: null,
      portfolio: null,
    };
    const teamPortfolios: ProfitBalance[] = Array.from(teams.entries()).map(([teamId, profitObj]): ProfitBalance => {
      return {
        key: `team_${teamId}`,
        accountType: 'team',
        accountName: teamMap.get(teamId)?.name || '未知团队',
        accProfit: profitObj.totalAccProfit.toString(),
        snapshotAt: 0,
        team: teamMap.get(teamId) || null,
        portfolio: null,
        children: profitObj.portfolioProfits.map((portfolioProfit: TeamAccProfit) => {
          return {
            key: `team_portfolio_${portfolioProfit.id}`,
            accountType: 'team_portfolio',
            accountName: portfolioMap.get(portfolioProfit.portfolioId)?.fundAlias || '未知组合',
            accProfit: portfolioProfit.accProfit,
            snapshotAt: portfolioProfit.snapshotAt,
            team: teamMap.get(teamId) || null,
            portfolio: portfolioMap.get(portfolioProfit.portfolioId) || null,
          };
        }),
      };
    });

    const noTeamBalances: ProfitBalance[] = [];
    if (noTeamPortfolios.portfolioProfits.length > 0) {
      const noTeam: ProfitBalance = {
        key: 'no_team',
        accountType: 'team',
        accountName: '未分配团队',
        accProfit: noTeamPortfolios.totalAccProfit.toString(),
        snapshotAt: 0,
        team: null,
        portfolio: null,
        children: noTeamPortfolios.portfolioProfits.map((portfolioProfit: TeamAccProfit) => {
          return {
            key: `team_portfolio_${portfolioProfit.id}`,
            accountType: 'team_portfolio',
            accountName: portfolioMap.get(portfolioProfit.portfolioId)?.fundAlias || '未知组合',
            accProfit: portfolioProfit.accProfit,
            snapshotAt: portfolioProfit.snapshotAt,
            team: null,
            portfolio: portfolioMap.get(portfolioProfit.portfolioId) || null,
          };
        }),
      };
      noTeamBalances.push(noTeam);
    }

    return [userBalance, platformBalance, ...teamPortfolios, ...noTeamBalances];
  }, [teamMap, portfolioMap, user, platform, teams, noTeamPortfolios]);

  return { accountRows, snapshotAt };
}
