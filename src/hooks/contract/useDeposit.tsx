import { Asset } from '../../service/types.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { useCallback, useEffect, useState } from 'react';
import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { MAX_APPROVE } from '../../const/contract.ts';
import { filter, finalize, Observable, of, Subscription, switchMap } from 'rxjs';
import { writeCallContract } from '../../service/wallet.ts';
import { map, tap } from 'rxjs/operators';
import { AbiDepositVault } from '../../const/abis/DepositVault.ts';
import { App as AntdApp } from 'antd';
import { parseErrorMessage } from '../../util/error.ts';

function genApproveParam(assetId: string | undefined) {
  return {
    abi: AbiErc20,
    address: assetId as `0x${string}`,
    function: 'approve',
    args: [DEPLOYED_CONTRACTS.ADDR_DEPOSIT, MAX_APPROVE],
  };
}

function genDepositParam(asset: Asset, amount: SldDecimal) {
  return {
    abi: AbiDepositVault,
    address: DEPLOYED_CONTRACTS.ADDR_DEPOSIT,
    function: 'deposit',
    args: [asset.id as `0x${string}`, amount.toOrigin()],
  };
}

export const useDeposit = (needApprove: boolean, asset: Asset | undefined, amount: SldDecimal | null) => {
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);
  const { message } = AntdApp.useApp();

  useEffect(() => {
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [sub]);

  useEffect(() => {
    if (error) {
      message.error(parseErrorMessage(error));
    }
  }, [error, message]);

  const mutate = useCallback(() => {
    setIsSuccess(null);
    setApproved(false);
    setError(null);
    setIsFinal(false);

    if (!asset || !amount) {
      return;
    }

    // approve
    const doApprove$: Observable<boolean> = writeCallContract(genApproveParam(asset?.id), {}).pipe(
      map((rs): boolean => {
        if (rs.isFinal && rs.isSuccess === false) {
          setIsFinal(rs.isFinal);
          setIsSuccess(false);
          setApproved(false);

          if (rs.error) {
            setError(rs.error);
          }
        }

        return rs.isFinal && rs.isSuccess === true;
      }),
    );

    const doDeposit$ = writeCallContract(genDepositParam(asset!, amount!), {});

    setIsPending(true);
    const sub = of(needApprove)
      .pipe(
        switchMap((need: boolean): Observable<boolean> => {
          return need ? doApprove$ : of(true);
        }),
        filter(Boolean),
        switchMap(() => {
          setApproved(true);
          return doDeposit$;
        }),
        tap((rs) => {
          setIsFinal(rs.isFinal);
          setIsSuccess(rs.isSuccess);
          if (rs.error) {
            setError(rs.error);
          }
        }),
        finalize(() => {
          setIsPending(false);
        }),
      )
      .subscribe();

    setSub((prevState: Subscription | null) => {
      if (prevState) {
        prevState.unsubscribe();
      }

      return sub;
    });

    // deposit
  }, [asset, amount, needApprove]);

  return {
    mutate,
    isFinal,
    isPending,
    isSuccess,
    approved,
    error,
  };
};
