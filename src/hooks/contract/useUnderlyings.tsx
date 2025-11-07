import { useReadContract, useReadContracts } from 'wagmi';
import { AbiDepositVault } from '../../const/abis/DepositVault.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { AbiWithdrawController } from '../../const/abis/WithdrawController.ts';
import { useAssets } from '../graph/useAssets.tsx';
import { Asset } from '../../service/types.ts';
import { useMemo } from 'react';

export const useDepositUnderlyingAssets = () => {
  const { map: assetMap } = useAssets();
  const { data, isPending, error, isLoading, refetch } = useReadContract({
    address: DEPLOYED_CONTRACTS.ADDR_DEPOSIT,
    abi: AbiDepositVault,
    functionName: 'getUnderlyings',
    args: [],
  });

  const depositAssets: Asset[] = useMemo(() => {
    return data
      ? (data
          .map((one) => one.toLowerCase())
          .map((one: string) => {
            if (assetMap.has(one)) {
              return assetMap.get(one.toLowerCase() as string);
            }
          })
          .filter((one) => one !== undefined) as Asset[])
      : [];
  }, [data, assetMap]);

  return {
    underlyingAssets: depositAssets,
    isPending,
    isLoading,
    refetch,
    error,
  };
};

export const useWithdrawUnderlyingAssets = () => {
  const { arr: assets } = useAssets();
  const contracts = useMemo(() => {
    return assets.map((asset) => {
      return {
        address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
        abi: AbiWithdrawController,
        functionName: 'isWithdrawalAsset',
        args: [asset.id],
      };
    });
  }, [assets]);

  const { data, isPending, error, refetch, isLoading } = useReadContracts({
    contracts: contracts,
  });

  const assetList: Asset[] = useMemo(() => {
    return (data || [])
      .map((r, index) => {
        if (r.status === 'success') {
          if (r.result[0] as boolean) {
            return assets[index];
          }
        }

        return null;
      })
      .filter((one) => one !== undefined) as Asset[];
  }, [data, assets]);

  return {
    underlyingAssets: assetList,
    isPending,
    isLoading,
    refetch,
    error,
  };
};
