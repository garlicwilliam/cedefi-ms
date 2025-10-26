import { finalize, Subscription, take, timer } from 'rxjs';
import { useCallback, useEffect, useState } from 'react';
import { tap } from 'rxjs/operators';

export function doMultiRefresh(func: () => void, interval: number = 3000, times: number = 6): Subscription {
  return timer(0, interval)
    .pipe(take(times))
    .subscribe({ next: () => func() });
}

export function useMultiTimesCall(func: () => void, interval: number = 3000, times: number = 10) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pending, setPending] = useState(false);

  const doRefresh = useCallback(() => {
    const sub = timer(0, interval)
      .pipe(
        tap(() => setPending(true)),
        take(times),
        finalize(() => setPending(false)),
      )
      .subscribe({ next: () => func() });

    setSubscription(sub);
  }, [func, interval, times]);

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [subscription]);

  return {
    refresh: doRefresh,
    isPending: pending,
  };
}
