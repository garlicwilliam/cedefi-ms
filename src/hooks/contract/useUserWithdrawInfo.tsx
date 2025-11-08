import { useAccount, useReadContracts } from 'wagmi';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { useMemo } from 'react';
import { SldDecimal } from '../../util/decimal.ts';

export function useLpBalanceAndApprove() {
  const { address, isConnected } = useAccount();
  const contracts = useMemo(() => {
    return [
      {
        address: DEPLOYED_CONTRACTS.ADDR_LP,
        abi: AbiErc20,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: DEPLOYED_CONTRACTS.ADDR_LP,
        abi: AbiErc20,
        functionName: 'allowance',
        args: [address, DEPLOYED_CONTRACTS.ADDR_WITHDRAW],
      },
    ];
  }, [address]);

  const { data, refetch: refresh } = useReadContracts({ contracts: contracts, query: { enabled: isConnected } });

  const state = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const balanceResult: bigint = data[0].result as bigint;
    const balance: SldDecimal = SldDecimal.fromOrigin(balanceResult, 18);
    //
    const allowance: bigint = data[1].result as bigint;
    const approved: SldDecimal = SldDecimal.fromOrigin(allowance, 18);

    return { balance, approved };
  }, [data]);

  return {
    balance: state?.balance,
    approved: state?.approved,
    refresh,
  };
}
