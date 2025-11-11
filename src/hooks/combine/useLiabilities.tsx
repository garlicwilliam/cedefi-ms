import { useStatistics } from '../graph/useStatistics.tsx';
import { useProfitAccounts } from './useProfitAccounts.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { E18 } from '../../util/big-number.ts';
import { useList } from '@refinedev/core';
import { formatDateHour } from '../../util/time.ts';
import { useMemo } from 'react';

export function useLiabilities(rateVal: SldDecimal) {
  const { statistic } = useStatistics();
  const { lpActive } = statistic || {};
  const { platform, team } = useProfitAccounts();
  const { result: assets } = useList({
    resource: 'net_asset_snapshots',
    pagination: { pageSize: 1 },
  });

  const liabilities = useMemo(() => {
    const platformProfit = Math.max(platform?.accProfit || 0, 0);
    const teamTotal = team.reduce((acc, cur) => {
      return Number(cur.accProfit) + acc;
    }, 0);
    const teamFinal = Math.max(teamTotal, 0);
    const profitReserved = teamFinal + platformProfit;
    const reserved = SldDecimal.fromNumeric(String(profitReserved), 18);

    const assetsVal = assets.data[0];
    const totalAsset = SldDecimal.fromNumeric(assetsVal?.netAssetValue || '0', 18);
    const assetsText: string = assetsVal ? `${totalAsset.format()} USD  (${formatDateHour(assetsVal?.snapshotAt)})` : 'N/A';

    const expectedBalance = !!lpActive && !!rateVal ? lpActive.mul(rateVal.toE18()).div(E18) : null;

    const liabilities = !!expectedBalance && !!totalAsset ? totalAsset.sub(expectedBalance).sub(reserved) : SldDecimal.ZERO;
    const liabilitiesText = `${liabilities.format({ sign: true })} USD`;

    return { liabilitiesText, assetsText };
  }, [lpActive, assets, platform, rateVal, team]);

  return liabilities;
}
