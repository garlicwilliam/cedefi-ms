import { NativeOrderBookItem } from '../../service/types.ts';
import styles from './MarketPriceValue.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { SldDecimal } from '../../util/decimal.ts';

export function MarketPriceValue({ item }: { item: NativeOrderBookItem }) {
  const levelInfo: [number, number] = item.levels.length > 0 ? item.levels[0] : [0, 0];
  const styleMr = useStyleMr(styles);

  return (
    <div>
      <div className={styleMr(styles.marketSymbolItem)}>
        {item.base_symbol} / {item.quote_symbol}
      </div>

      <div className={styleMr(styles.marketItemRow)}>
        <span className={styleMr(styles.marketLabel)}>Price:</span>
        <span>{SldDecimal.fromNumeric(String(levelInfo[1]), 18).format({ fix: 6 })}</span>
      </div>

      <div className={styleMr(styles.marketItemRow)}>
        <span className={styleMr(styles.marketLabel)}>Liquidity:</span>
        <span>{SldDecimal.fromNumeric(String(levelInfo[0]), 18).format({ fix: 2 })}</span>
      </div>
    </div>
  );
}
