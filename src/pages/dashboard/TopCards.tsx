import { StyleMerger } from '../../util/css.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './index.module.scss';
import { useList } from '@refinedev/core';
import { formatDateHour } from '../../util/time.ts';
import { IndexCard } from '../../components/dashboard/IndexCard.tsx';
import { IndexCardTitle } from '../../components/dashboard/IndexCardTitle.tsx';
import { IndexCardAction } from '../../components/dashboard/IndexCardAction.tsx';
import { useCurNav } from '../../hooks/one-token/useCurNav.tsx';
import { usePrices } from '../../hooks/graph/usePrices.tsx';
import { SldDecimal, SldDecPercent } from '../../util/decimal.ts';
import { Price } from '../../service/types.ts';

function rate7DayApy(prices: Price[]): SldDecPercent {
  if (prices.length < 2) {
    return SldDecPercent.ZERO;
  }

  const period: number = 7 * 24 * 3600;

  const last = prices[0];
  let from = prices[prices.length - 1];
  for (let i = 1; i < prices.length; i++) {
    const cur = prices[i];
    const timeDiff = Number(last.timestamp) - Number(cur.timestamp);
    if (timeDiff >= period) {
      from = cur;
      break;
    }
  }

  const startPrice = SldDecimal.fromOrigin(BigInt(from.price), 18);
  const endPrice = SldDecimal.fromOrigin(BigInt(last.price), 18);
  const rate = SldDecPercent.fromArgs(startPrice, endPrice.sub(startPrice));
  const timeDiff = Number(last.timestamp) - Number(from.timestamp);
  const apy: SldDecimal = rate
    .toDecimal()
    .mul(BigInt(365 * 24 * 3600))
    .div(BigInt(timeDiff));

  return SldDecPercent.fromDecimal(apy);
}

export const TopCards = () => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const { nav, snapshotAt: navSnapshotAt } = useCurNav();
  const { data: lpRates } = usePrices();

  const { result: assets } = useList({
    resource: 'assets_snapshots',
    pagination: { pageSize: 1 },
  });

  const navText: string = nav ? `${nav.format({ fix: 6, removeZero: true })} (${formatDateHour(navSnapshotAt || 0)})` : 'N/A';

  const rateItem = lpRates[0];
  const rateVal = rateItem ? SldDecimal.fromOrigin(BigInt(rateItem.price), 18) : null;
  const rateText: string = rateVal
    ? `1 LP = ${rateVal.format({ fix: 6, removeZero: true })} USD  (Updated At ${formatDateHour(Number(rateItem.timestamp))})`
    : 'N/A';

  const assetsVal = assets.data[0];
  const assetsText: string = assetsVal ? `${assetsVal.assetsValue} USD  (${formatDateHour(assetsVal?.snapshotAt)})` : 'N/A';

  const apy = rate7DayApy(lpRates);
  const apyText = (
    <span>
      {apy.percentFormat()}% (Updated At {formatDateHour(Number(rateItem.timestamp))})
    </span>
  );

  return (
    <div className={styleMr(styles.cards)}>
      <IndexCard
        title={<IndexCardTitle title={'今日NAV'} desc={'From 1token'} />}
        value={`${navText}`}
        actions={[<IndexCardAction route={'/nav_snapshots'} text={'更多'} />]}
      />

      <IndexCard
        title={<IndexCardTitle title={'今日Rate'} desc={'On Chain for User'} />}
        value={`${rateText}`}
        actions={[<IndexCardAction route={'/rate_history'} text={'更多'} />]}
      />

      <IndexCard
        title={<IndexCardTitle title={'7日APY'} desc={'On Chain for User'} />}
        value={apyText}
        actions={[<IndexCardAction route={'/rate_history'} text={'更多'} />]}
      />

      <IndexCard
        title={<IndexCardTitle title={'今日总资产'} desc={''} />}
        value={`${assetsText}`}
        actions={[<IndexCardAction route={'/assets_snapshots'} text={'更多'} />]}
      />
    </div>
  );
};
