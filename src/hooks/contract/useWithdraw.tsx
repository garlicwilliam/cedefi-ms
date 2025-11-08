import { useCallback, useEffect, useState } from 'react';
import { Asset } from '../../service/types.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { UseWriteParamType } from '../wallet-write/useCallContract.tsx';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { AbiWithdrawController } from '../../const/abis/WithdrawController.ts';
import { writeCallContract } from '../../service/wallet.ts';
import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { MAX_APPROVE } from '../../const/contract.ts';
import { filter, finalize, of, Subscription, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { App as AntdApp } from 'antd';
import { parseErrorMessage } from '../../util/error.ts';

function genWithdrawParam(asset: Asset, amount: SldDecimal): UseWriteParamType {
  return {
    address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
    abi: AbiWithdrawController,
    function: 'requestWithdrawal',
    args: [asset.id, amount.toOrigin()],
  };
}

function genApproveParam() {
  return {
    address: DEPLOYED_CONTRACTS.ADDR_LP,
    abi: AbiErc20,
    function: 'approve',
    args: [DEPLOYED_CONTRACTS.ADDR_WITHDRAW, MAX_APPROVE],
  };
}

function genCancelParam(orderId: string) {
  return {
    address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
    abi: AbiWithdrawController,
    function: 'cancelWithdrawal',
    args: [BigInt(orderId)],
  };
}

function genClaimParam(orderId: string) {
  return {
    address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
    abi: AbiWithdrawController,
    function: 'completeWithdrawal',
    args: [BigInt(orderId)],
  };
}

export function useWithdraw() {
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

  const mutate = useCallback((needApprove: boolean, asset: Asset | undefined, lpAmount: SldDecimal | null) => {
    setIsSuccess(null);
    setApproved(false);
    setError(null);
    setIsFinal(false);

    if (!asset || !lpAmount) {
      return;
    }

    const doApprove$ = writeCallContract(genApproveParam(), {}).pipe(
      map((rs) => {
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
    const doWithdraw$ = writeCallContract(genWithdrawParam(asset, lpAmount), {});
    //
    setIsPending(true);
    const sub = of(needApprove)
      .pipe(
        switchMap((need: boolean) => {
          return need ? doApprove$ : of(true);
        }),
        filter(Boolean),
        switchMap(() => {
          setApproved(true);
          return doWithdraw$;
        }),
        tap((rs) => {
          setIsFinal(rs.isFinal);
          setIsSuccess(rs.isSuccess);
          if (rs.error) {
            setError(rs.error);
          }
        }),
        finalize(() => setIsPending(false)),
      )
      .subscribe();

    //
    setSub((prevState: Subscription | null) => {
      if (prevState) {
        prevState.unsubscribe();
      }

      return sub;
    });
  }, []);

  return {
    mutate,
    isFinal,
    isPending,
    isSuccess,
    approved,
    error,
  };
}

export function useCancelWithdraw() {
  const [curCancelId, setCurCancelId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

  const mutate = useCallback((orderId: string) => {
    setIsSuccess(null);
    setError(null);
    setIsFinal(false);
    setCurCancelId(orderId);

    const cancel$ = writeCallContract(genCancelParam(orderId), {});

    setIsPending(true);
    const sub = cancel$
      .pipe(
        tap((rs) => {
          setIsFinal(rs.isFinal);
          setIsSuccess(rs.isSuccess);
          if (rs.error) {
            setError(rs.error);
          }
        }),
        finalize(() => {
          setIsPending(false);
          setCurCancelId(null);
        }),
      )
      .subscribe();

    setSub((prevState: Subscription | null) => {
      if (prevState) {
        prevState.unsubscribe();
      }

      return sub;
    });
  }, []);

  return {
    mutate,
    curCancelId,
    isFinal,
    isPending,
    isSuccess,
    error,
  };
}

export function useClaimWithdraw() {
  const [curClaimId, setCurClaimId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

  const mutate = useCallback((orderId: string) => {
    setIsSuccess(null);
    setError(null);
    setIsFinal(false);
    setCurClaimId(orderId);

    const claim$ = writeCallContract(genClaimParam(orderId), {});

    setIsPending(true);
    const sub = claim$
      .pipe(
        tap((rs) => {
          setIsFinal(rs.isFinal);
          setIsSuccess(rs.isSuccess);
          if (rs.error) {
            setError(rs.error);
          }
        }),
        finalize(() => {
          setIsPending(false);
          setCurClaimId(null);
        }),
      )
      .subscribe();

    setSub((prevState: Subscription | null) => {
      if (prevState) {
        prevState.unsubscribe();
      }

      return sub;
    });
  }, []);

  return {
    mutate,
    curClaimId,
    isSuccess,
    isPending,
    isFinal,
  };
}
