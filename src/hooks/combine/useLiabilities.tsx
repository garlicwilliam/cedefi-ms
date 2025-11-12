import { useStatisticsByTime } from '../graph/useStatistics.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { E18 } from '../../util/big-number.ts';
import { useList } from '@refinedev/core';
import { useMemo } from 'react';
import { NetAssetSnapshot } from '../../service/types.ts';
import { TeamProfits, useProfitAccountsByTime } from './useProfitAccountsByTime.tsx';

function toDecimal(num: string): SldDecimal {
  return SldDecimal.fromNumeric(num, 18);
}

export function useLiabilities(snapshotAt: number | null) {
  const { platform, teams, noTeamPortfolios: noTeam } = useProfitAccountsByTime(snapshotAt);
  const { statistic } = useStatisticsByTime(snapshotAt);
  const { lpActive, lpPrice, lpLockedUsdValue } = statistic || {};
  // 获取与snapshot时间最近的资产快照
  const { result: assets } = useList({
    resource: 'net_asset_snapshots',
    pagination: { pageSize: 1 },
    filters: [{ field: 'snapshotAt', operator: 'lt', value: snapshotAt }],
    sorters: [{ field: 'snapshotAt', order: 'desc' }],
  });

  return useMemo(() => {
    const platformProfit: SldDecimal = toDecimal(platform?.accProfit || '0');
    const teamProfit: SldDecimal = Array.from(teams.entries()).reduce(
      (acc: SldDecimal, entry: [number, TeamProfits]) => {
        return toDecimal(entry[1].totalAccProfit.toString()).add(acc);
      },
      SldDecimal.ZERO,
    );
    const noTeamProfit: SldDecimal = toDecimal(noTeam.totalAccProfit.toString());
    //
    const allReserved: SldDecimal = platformProfit.add(teamProfit).add(noTeamProfit);
    const assetsVal = assets.data[0] as NetAssetSnapshot | undefined;
    const totalNetAsset: SldDecimal = toDecimal(assetsVal?.netAssetValue || '0');

    // lp价值 = lpActive * lpPrice + lp Locked Value
    const activeValue = !!lpActive && !!lpPrice ? lpActive.mul(lpPrice.toE18()).div(E18) : null;
    const expectedBalance = lpLockedUsdValue && activeValue ? lpLockedUsdValue.add(activeValue) : activeValue;

    let liabilities = SldDecimal.ZERO;
    if (totalNetAsset && expectedBalance && totalNetAsset) {
      liabilities = totalNetAsset.sub(expectedBalance).sub(allReserved);
    }

    return { liabilities, totalAsset: totalNetAsset, expectedBalance, time: assetsVal?.snapshotAt };
  }, [lpActive, lpPrice, assets, platform, teams, noTeam, lpLockedUsdValue]);
}
