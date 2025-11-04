import { hourEndAt } from '../../util/time.ts';
import { useCallback, useEffect, useState } from 'react';
import { NavResultType, oneTokenService } from '../../service/one_token.service.ts';
import { PARENT_FUND } from '../../const/one_token_funds.ts';
import { tap } from 'rxjs/operators';

export const useCurNav = (timestamp?: number) => {
  const snapshotAt: number = timestamp ? timestamp : hourEndAt(0, 120);
  const [navResult, setNavResult] = useState<NavResultType | null>(null);

  const [flag, setFlag] = useState(0);

  useEffect(() => {
    const sub = oneTokenService
      .getNavAndAssets(snapshotAt, PARENT_FUND)
      .pipe(
        tap((nav) => {
          if (nav === null) {
            return;
          }

          setNavResult(nav);
        }),
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [snapshotAt, flag]);

  const refresh = useCallback(() => {
    setFlag((f) => f + 1);
  }, []);

  const { nav, netAssets, snapshotTime } = navResult || {};

  return { nav, assets: netAssets, snapshotAt: snapshotTime, refresh };
};
