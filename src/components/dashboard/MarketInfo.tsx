import { NativeOrderBookItem } from '../../service/types.ts';
import { MarketPriceValue } from './MarketPriceValue.tsx';
import styles from './MarketInfo.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { cssPick, StyleMerger } from '../../util/css.ts';
import { useMemo } from 'react';
import { SldDecimal, SldDecPercent } from '../../util/decimal.ts';

export type MarketInfoProps = {
  items: NativeOrderBookItem[];
  chainRate: SldDecimal | null;
};

export function MarketInfo({ items, chainRate }: MarketInfoProps) {
  const styleMr: StyleMerger = useStyleMr(styles);

  const { percent, isWarning } = useMemo(() => {
    if (items.length === 0 || !chainRate || chainRate.isZero()) {
      return {
        percent: '0',
        isWarning: false,
      };
    }

    const items1 = items.filter((item) => item.base_symbol === 'STONEUSD');
    const levelItem = items1.length > 0 ? items1[0] : null;

    const marketRateNum: number = levelItem?.levels[0]?.[1] || 1;

    const marketRate = SldDecimal.fromNumeric(String(marketRateNum), 18);
    const deltaRate = marketRate.sub(chainRate);
    const sldPercent = SldDecPercent.fromArgs(chainRate, deltaRate);
    const warningLine = SldDecimal.fromNumeric('0.01', 18);
    const percent = SldDecPercent.fromArgs(chainRate, deltaRate).percentFormat({ fix: 4 });
    const isWarning = sldPercent.toDecimal().abs().gte(warningLine);

    return {
      percent,
      isWarning,
    };
  }, [chainRate, items]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {items.map((item) => {
          return (
            <div>
              <MarketPriceValue item={item} />
            </div>
          );
        })}
      </div>

      <div className={styleMr(styles.deltaBox)}>
        <span className={styleMr(styles.deltaLabel)}>Market-Chain Delta: </span>
        <span className={styleMr(styles.deltaValue, cssPick(isWarning, styles.warn))}>{percent}%</span>
      </div>
    </div>
  );
}
