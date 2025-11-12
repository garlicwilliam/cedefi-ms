import { useLatestSnapshotAt } from '../useLatestSnapshotAt.tsx';
import { useProfitAccountsByTime } from './useProfitAccountsByTime.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { useMemo } from 'react';

export function useProfitAccountsReserve24h() {
  const { snapshotAt } = useLatestSnapshotAt();
  const dayAgoTimestamp: number | null = snapshotAt ? snapshotAt - 24 * 3600 : null;
  const { user, platform, teams, noTeamPortfolios: noTeam } = useProfitAccountsByTime(snapshotAt);
  const {
    user: user24,
    platform: platform24,
    teams: teams24,
    noTeamPortfolios: noTeam24,
  } = useProfitAccountsByTime(dayAgoTimestamp);

  const result = useMemo(() => {
    const userProfit: SldDecimal = SldDecimal.fromNumeric(user?.accProfit || '0', 18);
    const user24Profit: SldDecimal = SldDecimal.fromNumeric(user24?.accProfit || '0', 18);
    const userDelta: SldDecimal = userProfit.sub(user24Profit);

    const platformProfit: SldDecimal = SldDecimal.fromNumeric(platform?.accProfit || '0', 18);
    const platform24Profit: SldDecimal = SldDecimal.fromNumeric(platform24?.accProfit || '0', 18);
    const platformDelta: SldDecimal = platformProfit.sub(platform24Profit);

    const teamReserve = Array.from(teams.entries()).reduce((acc, [, teamProfit]) => {
      const addition: SldDecimal =
        teamProfit.totalAccProfit > 0
          ? SldDecimal.fromNumeric(teamProfit.totalAccProfit.toString(), 18)
          : SldDecimal.ZERO;

      return acc.add(addition);
    }, SldDecimal.ZERO);
    const teamReserve24 = Array.from(teams24.entries()).reduce((acc, [, teamProfit]) => {
      const addition: SldDecimal =
        teamProfit.totalAccProfit > 0
          ? SldDecimal.fromNumeric(teamProfit.totalAccProfit.toString(), 18)
          : SldDecimal.ZERO;

      return acc.add(addition);
    }, SldDecimal.ZERO);

    if (noTeam.totalAccProfit > 0) {
      teamReserve.add(SldDecimal.fromNumeric(noTeam.totalAccProfit.toString(), 18));
    }

    if (noTeam24.totalAccProfit > 0) {
      teamReserve24.add(SldDecimal.fromNumeric(noTeam24.totalAccProfit.toString(), 18));
    }
    const teamDelta: SldDecimal = teamReserve.sub(teamReserve24);

    return {
      userProfit,
      userDelta,
      platformProfit,
      platformDelta,
      teamReserve,
      teamDelta,
    };
  }, [user, user24, platform, platform24, teams, teams24, noTeam, noTeam24]);

  return { ...result, snapshotAt };
}
