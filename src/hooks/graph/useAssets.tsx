import { useList } from '@refinedev/core';
import { Asset } from '../../service/types.ts';
import { useMemo } from 'react';
import { ADDR_LP } from '../../const/contract.ts';

export const useAssets = () => {
  const { result } = useList({
    resource: 'assets',
  });

  const assetList: Asset[] = result.data as Asset[];

  const assetMap = useMemo(() => {
    return assetList.reduce((acc, cur: Asset) => {
      acc.set(cur.id, cur);
      return acc;
    }, new Map<string, Asset>());
  }, [assetList]);

  return { arr: assetList, map: assetMap };
};

export const useLp = () => {
  const { map } = useAssets();
  return map.get(ADDR_LP);
};
