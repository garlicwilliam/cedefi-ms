import { StyleMerger } from '../../util/css.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './index.module.scss';
import { IndexCard } from '../../components/dashboard/IndexCard.tsx';
import { IndexCardTitle } from '../../components/dashboard/IndexCardTitle.tsx';
import { IndexCardAction } from '../../components/dashboard/IndexCardAction.tsx';
import { usePrices } from '../../hooks/graph/usePrices.tsx';
import { SldDecimal, SldDecPercent } from '../../util/decimal.ts';
import { Price } from '../../service/types.ts';
import { useLiabilities } from '../../hooks/combine/useLiabilities.tsx';
import { IndexCardValue } from '../../components/dashboard/IndexCardValue.tsx';
import { useMemo } from 'react';
import { PercentValue } from '../../components/value/PercentValue.tsx';
import { DecimalValue } from '../../components/value/DecimalValue.tsx';

function rate7DayApy(prices: Price[]): SldDecPercent {
  if (prices.length < 2) {
    return SldDecPercent.ZERO;
  }

  const period: number = 7 * 24 * 3600;

  const last: Price = prices[0];

  let from: Price = prices[prices.length - 1];
  for (let i = 1; i < prices.length; i++) {
    const cur = prices[i];
    const timeDiff = Number(last.timestamp) - Number(cur.timestamp);
    if (timeDiff >= period) {
      from = cur;
      break;
    }
  }

  const startPrice: SldDecimal = SldDecimal.fromOrigin(BigInt(from.price), 18);
  const endPrice: SldDecimal = SldDecimal.fromOrigin(BigInt(last.price), 18);
  const rate: SldDecPercent = SldDecPercent.fromArgs(startPrice, endPrice.sub(startPrice));
  const timeDiff: number = Number(last.timestamp) - Number(from.timestamp);
  const apy: SldDecimal = rate
    .toDecimal()
    .mul(BigInt(365 * 24 * 3600))
    .div(BigInt(timeDiff));

  return SldDecPercent.fromDecimal(apy);
}

function useLpPrice() {
  const { data: lpRates } = usePrices();

  const apy: SldDecPercent = useMemo(() => {
    return rate7DayApy(lpRates);
  }, [lpRates]);

  const { rate, time } = useMemo(() => {
    const rateItem: Price | null = lpRates[0] || null;
    const rateVal: SldDecimal | null = rateItem ? SldDecimal.fromOrigin(BigInt(rateItem.price), 18) : null;
    const timestamp: number | undefined = rateItem ? Number(rateItem.timestamp) : undefined;

    return { rate: rateVal, time: timestamp };
  }, [lpRates]);

  return { rate, rateTime: time, rateApy: apy };
}

export const TopCards = () => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const { rate, rateTime, rateApy } = useLpPrice();

  const { liabilities, totalAsset, time: assetTime, expectedBalance: lpValues } = useLiabilities(rate || SldDecimal.ZERO);

  return (
    <div className={styleMr(styles.cards)}>
      <IndexCard
        title={<IndexCardTitle title={'今日RATE'} desc={'On Chain for User'} />}
        actions={[<IndexCardAction route={'/rate_history'} text={'更多'} />]}
      >
        <IndexCardValue
          value={
            <div>
              <span className={styleMr(styles.secondaryText)}>1 LP = </span>
              <DecimalValue value={rate} fix={3} noneStr={''} /> <span className={styleMr(styles.secondaryText)}>USD</span>
            </div>
          }
          time={rateTime}
        />
      </IndexCard>

      <IndexCard
        title={<IndexCardTitle title={'7日APY'} desc={'On Chain for User'} />}
        actions={[<IndexCardAction route={'/rate_history'} text={'更多'} />]}
      >
        <IndexCardValue value={<PercentValue value={rateApy} />} time={rateTime} />
      </IndexCard>

      <IndexCard
        title={<IndexCardTitle title={'当前总资产'} desc={'Total Managed Assets'} />}
        actions={[<IndexCardAction route={'/net_asset_snapshots'} text={'更多'} />]}
      >
        <IndexCardValue
          value={
            <div>
              <DecimalValue value={totalAsset} /> <span className={styleMr(styles.secondaryText)}>USD</span>
            </div>
          }
          time={assetTime}
        />
      </IndexCard>

      <IndexCard title={<IndexCardTitle title={'当前负债'} desc={''} />} actions={[]}>
        <IndexCardValue
          value={
            <div>
              <DecimalValue value={liabilities} sign={true} /> <span className={styleMr(styles.secondaryText)}>USD</span>
            </div>
          }
          time={assetTime}
        />
      </IndexCard>
    </div>
  );
};
