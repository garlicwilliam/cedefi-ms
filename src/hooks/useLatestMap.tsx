import { RefObject, useLayoutEffect, useRef } from 'react';

export function useLatestMap<T, S>(value: T, mapFun: (v: T) => S): RefObject<S> {
  const init: S = mapFun(value);

  const ref: RefObject<S> = useRef<S>(init);

  useLayoutEffect(() => {
    ref.current = mapFun(value);
  }, [value, mapFun]);

  return ref;
}
