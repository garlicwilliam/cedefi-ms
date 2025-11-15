import { useWithdrawUnderlyingAssets } from './useUnderlyings.tsx';
import { useIdx } from '../graph/useIdxes.tsx';
import { useEffect, useState } from 'react';
import { getCutOffPricesByLength } from '../../service/contract.service.ts';
import { tap } from 'rxjs/operators';
import { AssetCutOffPrice } from '../../service/types.ts';
import { finalize } from 'rxjs';

export function useCutOffPrices() {
  const [cutOffPrices, setCutOffPrices] = useState<AssetCutOffPrice[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const { underlyingAssets } = useWithdrawUnderlyingAssets();
  const { counter } = useIdx('STONEUSD-cut-off-price');

  useEffect(() => {
    if (counter > 0 && underlyingAssets.length > 0) {
      const addresses = underlyingAssets.map((one) => one.id);

      setIsPending(true);
      const sub = getCutOffPricesByLength(counter, addresses)
        .pipe(
          tap((prices) => {
            if (prices.length > 0) {
              setCutOffPrices(prices);
            }
          }),
          finalize(() => setIsPending(false)),
        )
        .subscribe();

      return () => {
        sub.unsubscribe();
      };
    }
  }, [underlyingAssets, counter]);

  return { prices: cutOffPrices, underlyingAssets: underlyingAssets, isPending };
}
