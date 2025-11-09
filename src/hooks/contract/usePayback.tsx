import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { MAX_APPROVE } from '../../const/contract.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { AbiDepositVault } from '../../const/abis/DepositVault.ts';
import { concatMap, filter, finalize, from, Observable, of, Subscription, switchMap, take } from 'rxjs';
import { useCallback, useEffect, useState } from 'react';
import { writeCallContract, WriteCallResultType } from '../../service/wallet.ts';
import { catchError, map, tap, toArray } from 'rxjs/operators';
import { App as AntdApp } from 'antd';
import { parseErrorMessage } from '../../util/error.ts';
import { AbiWithdrawController } from '../../const/abis/WithdrawController.ts';

function genApproveParam(assetId: string | undefined) {
  return {
    abi: AbiErc20,
    address: assetId as `0x${string}`,
    function: 'approve',
    args: [DEPLOYED_CONTRACTS.ADDR_WITHDRAW, MAX_APPROVE],
  };
}

function genPaybackParam(inputMap: { [key: string]: SldDecimal }) {
  const inputs = Object.keys(inputMap)
    .map((key) => ({ asset: key, amount: inputMap[key] }))
    .filter((one) => one.amount.gtZero());

  const assets = inputs.map((a) => a.asset);
  const amounts = inputs.map((a) => a.amount.toOrigin());

  return {
    abi: AbiWithdrawController,
    address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
    function: 'repayAssets',
    args: [assets, amounts],
  };
}

export function usePayback() {
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

  const mutate = useCallback(
    (needApproveMap: { [s: string]: boolean }, inputMap: { [s: string]: SldDecimal }) => {
      setIsSuccess(null);
      setApproved(false);
      setError(null);
      setIsFinal(false);

      //
      const needApproveAssets: string[] = Object.keys(needApproveMap).filter((assetId) => needApproveMap[assetId]);

      const doApprove$: Observable<boolean> = from(needApproveAssets).pipe(
        concatMap((assetId: string) => {
          return writeCallContract(genApproveParam(assetId), {}).pipe(
            filter((rs: WriteCallResultType) => rs.isFinal && rs.isSuccess !== null),
            take(1),
            map((rs: WriteCallResultType) => {
              if (rs.error) {
                throw rs.error;
              }

              return rs.isFinal && (rs.isSuccess as boolean);
            }),
          );
        }),
        toArray(),
        map((approved: boolean[]) => {
          return approved.every((one) => Boolean(one));
        }),
        catchError((err: Error) => {
          setError(err);
          message.error(parseErrorMessage(err));
          return of(false);
        }),
        tap((approved: boolean) => {
          setApproved(approved);
          if (!approved) {
            setIsFinal(true);
            setIsSuccess(false);
          }
        }),
      );
      //

      const doPayback$ = writeCallContract(genPaybackParam(inputMap), {}).pipe(
        tap((rs) => {
          setIsFinal(rs.isFinal);
          setIsSuccess(rs.isSuccess);

          if (rs.error) {
            throw rs.error;
          }
        }),
        catchError((err) => {
          setError(err);
          message.error(parseErrorMessage(err));
          return of(false);
        }),
      );
      //

      const approve$: Observable<boolean> = needApproveAssets.length === 0 ? of(true) : doApprove$;

      setIsPending(true);
      const sub = approve$
        .pipe(
          filter(Boolean),
          switchMap((a) => {
            console.log('approved ==', a);
            return doPayback$;
          }),
          finalize(() => setIsPending(false)),
        )
        .subscribe();

      setSub((prevSub) => {
        if (prevSub) {
          prevSub.unsubscribe();
        }

        return sub;
      });
    },
    [message],
  );

  //
  return {
    mutate,
    isFinal,
    isSuccess,
    isPending,
    error,
    approved,
  };
}
