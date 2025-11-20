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
    // 平台累计收益
    let platformProfit: SldDecimal = toDecimal(platform?.accProfit || '0');
    if (platformProfit.lt(SldDecimal.ZERO)) {
      platformProfit = SldDecimal.ZERO;
    }

    // 计算各团队存留的收益，只累加>0的，负数不计入存留收益，不会抵消其他团队的正收益
    const teamProfit: SldDecimal = Array.from(teams.entries()).reduce(
      (acc: SldDecimal, entry: [number, TeamProfits]): SldDecimal => {
        const profit: SldDecimal = toDecimal(entry[1].totalAccProfit.toString());
        // 仅累加正收益
        if (profit.gtZero()) {
          return profit.add(acc);
        }
        return acc;
      },
      SldDecimal.ZERO,
    );

    // 无团队关联的投资组合累计收益
    let noTeamProfit: SldDecimal = toDecimal(noTeam.totalAccProfit.toString());
    if (noTeamProfit.lt(SldDecimal.ZERO)) {
      noTeamProfit = SldDecimal.ZERO;
    }

    // 所有留存收益 = 平台 + 各团队 + 无团队
    const allReserved: SldDecimal = platformProfit.add(teamProfit).add(noTeamProfit);

    // 总资产 = 最新资产快照的净资产值
    const assetsVal = assets.data[0] as NetAssetSnapshot | undefined;
    const totalNetAsset: SldDecimal = toDecimal(assetsVal?.netAssetValue || '0');

    // lp价值 = lpActive * lpPrice + lp Locked Value
    const activeValue: SldDecimal | null =
      !!lpActive && !!lpPrice ? lpActive.mul(lpPrice.toE18()).div(E18) : null;
    const expectedBalance: SldDecimal | null =
      lpLockedUsdValue && activeValue ? lpLockedUsdValue.add(activeValue) : activeValue;

    //
    let liabilities = SldDecimal.ZERO;
    if (totalNetAsset && expectedBalance && totalNetAsset) {
      liabilities = totalNetAsset.sub(expectedBalance).sub(allReserved);
    }

    //
    return {
      liabilities,
      totalAsset: totalNetAsset,
      expectedBalance, // lp 价值
      allReserved, // 所有留存收益
      time: assetsVal?.snapshotAt,
    };
  }, [lpActive, lpPrice, assets, platform, teams, noTeam, lpLockedUsdValue]);
}
