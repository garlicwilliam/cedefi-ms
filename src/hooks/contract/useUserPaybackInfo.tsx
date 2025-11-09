import { Asset } from '../../service/types.ts';
import { useAccount, useReadContracts } from 'wagmi';
import { useMemo } from 'react';
import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { SldDecimal } from '../../util/decimal.ts';

export const useUserTokenApproved = (assets: Asset[]) => {
  const { address, isConnected } = useAccount();
  //
  const contracts = useMemo(() => {
    return assets.map((asset: Asset) => {
      return {
        address: asset.id as `0x${string}`,
        abi: AbiErc20,
        functionName: 'allowance',
        args: [address, DEPLOYED_CONTRACTS.ADDR_WITHDRAW],
      };
    });
  }, [assets, address]);
  //
  const { data, refetch, isPending, isLoading } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: isConnected,
    },
  });
  //

  const allowance = useMemo(() => {
    return (data || [])
      .map((one, index) => {
        if (one.status === 'success') {
          const asset: Asset = assets[index];
          const allowance = one.result as bigint;
          const allowanceDec: SldDecimal = SldDecimal.fromOrigin(allowance, asset.decimals);

          return {
            asset,
            allowance: allowanceDec,
          };
        }

        return null;
      })
      .filter((v) => v !== null);
  }, [assets, data]);

  const allowanceMap = useMemo(() => {
    return allowance.reduce(
      (acc, allowance) => {
        acc[allowance.asset.id] = allowance.allowance;
        return acc;
      },
      {} as { [s: string]: SldDecimal },
    );
  }, [allowance]);

  return {
    assetAllowances: allowance,
    allowanceMap,
    refresh: refetch,
    isPending,
    isLoading,
  };
};
