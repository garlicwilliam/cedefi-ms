import { useLatestSnapshotAt } from '../useLatestSnapshotAt.tsx';
import { useList } from '@refinedev/core';
import { useMemo } from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { TeamProfits, useProfitAccountsByTime } from './useProfitAccountsByTime.tsx';
import { useStatisticsByTime } from '../graph/useStatistics.tsx';
import { E18 } from '../../util/big-number.ts';
import { NetAssetSnapshot } from '../../service/types.ts';

function toDecimal(num: string): SldDecimal {
  return SldDecimal.fromNumeric(num, 18);
}

export function useEstimateLiabilities(
  newRate?: SldDecimal | null, // 更新后的 exchange rate
  newProcessingLps?: { amount: SldDecimal; rate: SldDecimal } | null, // 新锁定的处理中 LPs
) {
  const { snapshotAt } = useLatestSnapshotAt();
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

  //
  return useMemo(() => {
    const platformProfit: SldDecimal = toDecimal(platform?.accProfit || '0');
    const teamProfit: SldDecimal = Array.from(teams.entries()).reduce(
      (acc: SldDecimal, entry: [number, TeamProfits]) => {
        return toDecimal(entry[1].totalAccProfit.toString()).add(acc);
      },
      SldDecimal.ZERO,
    );
    const noTeamProfit: SldDecimal = toDecimal(noTeam.totalAccProfit.toString());
    const allReserved: SldDecimal = platformProfit.add(teamProfit).add(noTeamProfit);

    //
    const assetsVal = assets.data[0] as NetAssetSnapshot | undefined;
    const totalNetAsset: SldDecimal = toDecimal(assetsVal?.netAssetValue || '0');

    //
    const usedLpPrice = newRate ? newRate : lpPrice;
    const usedLpActive = newProcessingLps ? lpActive?.sub(newProcessingLps.amount) : lpActive;

    const appendLpLockedValue = newProcessingLps
      ? newProcessingLps.amount.mul(newProcessingLps.rate.toE18()).div(E18)
      : SldDecimal.ZERO;
    const usedLpLockedValue = lpLockedUsdValue?.add(appendLpLockedValue);

    const usedActiveValue =
      !!usedLpPrice && !!usedLpActive ? usedLpActive.mul(usedLpPrice.toE18()).div(E18) : null;

    const expectedBalance =
      usedLpLockedValue && usedActiveValue ? usedLpLockedValue.add(usedActiveValue) : usedActiveValue;

    let liabilities = SldDecimal.ZERO;
    if (totalNetAsset && expectedBalance && totalNetAsset) {
      liabilities = totalNetAsset.sub(expectedBalance).sub(allReserved);
    }

    return {
      liabilities,
      totalAsset: totalNetAsset,
      expectedBalance, // lp 价值
      allReserved, // 所有留存收益
      time: snapshotAt,
    };
  }, [
    assets,
    lpActive,
    lpPrice,
    lpLockedUsdValue,
    noTeam,
    platform,
    teams,
    newProcessingLps,
    newRate,
    snapshotAt,
  ]);
}
