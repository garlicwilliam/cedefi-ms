import { useAccount, useReadContracts } from 'wagmi';
import { Asset } from '../../service/types.ts';
import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { useMemo } from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export const useUserDepositBalance = (assets: Asset[]) => {
  const { address, isConnected } = useAccount();
  //
  const contracts = useMemo(() => {
    return assets.map((asset: Asset) => {
      return {
        address: asset.id as `0x${string}`,
        abi: AbiErc20,
        functionName: 'balanceOf',
        args: [address],
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
  const balances: { asset: Asset; balance: SldDecimal }[] = useMemo(() => {
    return (data || [])
      .map((one, index) => {
        if (one.status === 'success') {
          const asset: Asset = assets[index];

          const balance = one.result as bigint;
          const balanceDec: SldDecimal = SldDecimal.fromOrigin(balance, asset.decimals);

          return {
            asset,
            balance: balanceDec,
          };
        }

        return null;
      })
      .filter((v) => v !== null);
  }, [data, assets]);
  //

  const balanceMap = useMemo(() => {
    return balances.reduce(
      (acc, cur) => {
        acc[cur.asset.id] = cur.balance;
        return acc;
      },
      {} as { [k: string]: SldDecimal },
    );
  }, [balances]);

  //
  return {
    assetBalances: balances,
    balanceMap: balanceMap,
    refresh: refetch,
    isPending,
    isLoading,
  };
};

export const useUserDepositApproved = (assets: Asset[]) => {
  const { address, isConnected } = useAccount();
  //
  const contracts = useMemo(() => {
    return assets.map((asset: Asset) => {
      return {
        address: asset.id as `0x${string}`,
        abi: AbiErc20,
        functionName: 'allowance',
        args: [address, DEPLOYED_CONTRACTS.ADDR_DEPOSIT],
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

  return {
    assetAllowances: allowance,
    refresh: refetch,
    isPending,
    isLoading,
  };
};
