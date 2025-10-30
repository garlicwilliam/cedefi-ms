import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Abi, encodeFunctionData } from 'viem';
import Safe, { Eip1193Provider } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { filter, finalize, from, Observable, of, startWith, Subscription, switchMap, take, takeWhile, timer, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MetaTransactionData, SafeMultisigTransactionResponse } from '@safe-global/types-kit';
import { useIsSafeWallet } from './useIsSafeWallet.tsx';
import { useSetAtom } from 'jotai';
import { S } from '../../state/global.ts';
import { App as AntdApp } from 'antd';
import { parseErrorMessage } from '../../util/error.ts';
import { DEPLOYED_NETWORK, SAFE_TX_SERVICE_URL } from '../../const/env.ts';

export type UseWriteParamType = {
  abi: Abi;
  address: `0x${string}`;
  function: string;
  args: any[];
  value?: string;
};
export type UseWriteResultType = {
  isSubmitting: boolean;
  hasSubmitted: boolean;
  isEoaPending: boolean;
  isEoaSuccess: boolean;
  isEoaError: boolean;
  eoaError: Error | null;
  eoaMutate: (p: UseWriteParamType, opt?: { gasLimit?: bigint }) => void;
};
export type UseWriteBySafeParamType = {
  isSafe: boolean;
  safeAddress: string | null | undefined;
  safeProvider: Eip1193Provider | null | undefined;
};

function useWriteByEOA(): UseWriteResultType {
  const {
    writeContract,
    data: hash,
    isError: isSubmitError,
    isSuccess: isSubmitSuccess,
    error: submitError,
    isPending: isSubmitPending,
  } = useWriteContract();

  // safe 钱包的时候，无法返回正确的结果isFetching，isFetched等无法更新
  const {
    isFetching,
    isFetched,
    isError: isTxError,
    isSuccess: isTxSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  const eoaMutate = (params: UseWriteParamType, opt?: { gasLimit?: bigint }) => {
    writeContract({
      abi: params.abi,
      address: params.address,
      functionName: params.function,
      value: params.value ? BigInt(params.value) : undefined,
      args: params.args,
      gas: opt?.gasLimit,
    });
  };

  const isEoaPending: boolean = isSubmitPending || isFetching;
  const isEoaSuccess: boolean = isSubmitSuccess && isTxSuccess && isFetched;
  const isEoaError: boolean = isSubmitError || isTxError;
  const eoaError = submitError || txError;

  return {
    isSubmitting: isSubmitPending,
    hasSubmitted: isSubmitSuccess,
    isEoaPending,
    isEoaSuccess,
    isEoaError,
    eoaError,
    eoaMutate,
  } as UseWriteResultType;
}

const safeTxService: SafeApiKit = new SafeApiKit({ chainId: BigInt(DEPLOYED_NETWORK.id), txServiceUrl: SAFE_TX_SERVICE_URL });

function useWriteBySafe(params: UseWriteBySafeParamType) {
  const safeAddressRef = useRef(params.safeAddress);
  const [safeClient, setSafeClient] = useState<Safe | null>(null);
  const safeClientRef: RefObject<Safe | null> = useRef(safeClient);
  const [safeTx, setSafeTx] = useState<SafeMultisigTransactionResponse | null>(null);

  useEffect(() => {
    safeAddressRef.current = params.safeAddress;
  }, [params.safeAddress]);

  // update safe client
  useEffect(() => {
    if (!params.isSafe || !params.safeProvider || !params.safeAddress) {
      return;
    }

    const sub: Subscription = from(Safe.init({ provider: params.safeProvider, safeAddress: params.safeAddress }))
      .pipe(
        tap((safe: Safe) => {
          setSafeClient(safe);
          safeClientRef.current = safe;
        }),
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [params.isSafe, params.safeProvider, params.safeAddress]);

  //
  const mutateFunc = useCallback((meta: MetaTransactionData): Subscription => {
    // dependence
    const account: string | null | undefined = safeAddressRef.current;
    const client: Safe | null = safeClientRef.current;
    //
    if (!account || !client) {
      return Subscription.EMPTY;
    }
    //
    const nextNonce$: Observable<string> = from(safeTxService.getNextNonce(account));
    //
    return nextNonce$
      .pipe(
        take(1),
        switchMap((nonce: string) => {
          const tx$ = from(client.createTransaction({ transactions: [meta], options: { nonce: Number(nonce) } }));

          return zip(tx$, of(nonce));
        }),
        switchMap(([tx, nonce]) => {
          const safeHash$ = from(client.getTransactionHash(tx));

          return zip(safeHash$, of(nonce));
        }),
        switchMap(([safeHash, nonce]) => {
          // 3 seconds, 获取正在pending的交易列表，并筛选出当前交易，
          // 确定已经进入的api service 数据库，然后进入下一步
          return timer(0, 3000)
            .pipe(
              switchMap(() => {
                return from(safeTxService.getPendingTransactions(account));
              }),
            )
            .pipe(
              map((pendingTxList) => {
                if (pendingTxList.count == 0) {
                  return null;
                }

                const curTx = pendingTxList.results.find((one) => {
                  return (
                    one.safeTxHash === safeHash &&
                    one.to.toLowerCase() === meta.to.toLowerCase() &&
                    one.nonce === nonce &&
                    one.data === meta.data
                  );
                });

                return curTx || null;
              }),
            );
        }),
        filter(Boolean),
        take(1),
        switchMap((apiTx) => {
          const safeTxHash = apiTx.safeTxHash;
          // 确定已经进入api service 数据库
          return timer(0, 5000).pipe(
            switchMap(() => {
              return safeTxService.getTransaction(safeTxHash);
            }),
            startWith(apiTx),
          );
        }),
        takeWhile((apiTx) => !(apiTx.isExecuted && apiTx.isSuccessful !== null), true),
        tap((tx: SafeMultisigTransactionResponse) => {
          setSafeTx(tx);
        }),
        finalize(() => {}),
      )
      .subscribe();
  }, []);

  return {
    mutate: mutateFunc,
    safeTx,
  };
}

export function useCallContract() {
  const { address: accountAddress } = useAccount();
  const { isSafe, safeProvider } = useIsSafeWallet();
  const { eoaError: error, eoaMutate, isEoaError: isError, isEoaSuccess, isEoaPending, hasSubmitted, isSubmitting } = useWriteByEOA();
  const { safeTx, mutate: safeMutate } = useWriteBySafe({ isSafe, safeAddress: accountAddress, safeProvider });
  const [sub, setSub] = useState<Subscription | null>(null);

  const mutate = useCallback(
    (params: UseWriteParamType, opt?: { gasLimit?: bigint }) => {
      if (isSafe && safeProvider && safeMutate) {
        const safeCallData: `0x${string}` = encodeFunctionData({
          abi: params.abi,
          functionName: params.function,
          args: params.args,
        });

        const metaTx: MetaTransactionData = {
          to: params.address,
          value: params.value || '0',
          data: safeCallData, // You would need to encode the function call data here
          operation: 0,
        };

        eoaMutate(params, opt); // 使用当前provider发起交易，与普通EOA交易一致
        const sub: Subscription = safeMutate(metaTx); // 使用safe API监听safeTx的状态

        setSub((prevSub: Subscription | null) => {
          if (prevSub) {
            prevSub.unsubscribe();
          }

          return sub;
        });
      } else if (!isSafe) {
        eoaMutate(params, opt);
      }
    },
    [isSafe, safeProvider, eoaMutate, safeMutate],
  );
  //

  let isSuccess: boolean;
  let isPending: boolean;

  if (isSafe) {
    isSuccess = !!safeTx && !!safeTx.isSuccessful;
    isPending = isSubmitting || (hasSubmitted && (!safeTx || (!!safeTx && !safeTx.isExecuted)));
  } else {
    isSuccess = isEoaSuccess;
    isPending = isEoaPending;
  }

  //
  return {
    isSafe,
    mutate,
    isError,
    isSuccess,
    isPending,
    error,
    safeTx,
    sub,
  };
}

export function useCallContractState(onSuccess?: () => void) {
  const { isSafe, mutate, isError, isSuccess, isPending, error, safeTx, sub } = useCallContract();
  const setIsSafePending = useSetAtom(S.Wallet.Safe.Pending);
  const setGlobalSafeTx = useSetAtom(S.Wallet.Safe.SafeTx);
  const { message: messageApi } = AntdApp.useApp();

  const isDisabled: boolean = useMemo(() => {
    return !isError && (isPending || (isSuccess && isSafe && (!safeTx || !safeTx.isExecuted)));
  }, [isError, isPending, isSuccess, isSafe, safeTx]);

  // 清理safe状态追踪
  useEffect(() => {
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [sub]);

  useEffect(() => {
    if (safeTx && isSafe) {
      setGlobalSafeTx(safeTx);
      setIsSafePending(true);
    } else {
      setGlobalSafeTx(null);
      setIsSafePending(false);
    }
  }, [safeTx, setGlobalSafeTx, setIsSafePending, isSafe, isPending]);

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  useEffect(() => {
    if (isError && error) {
      messageApi.error(parseErrorMessage(error));
    }
  }, [messageApi, isError, error]);

  return {
    mutate,
    isDisabled,
    isPending,
    isSuccess,
    isSafe,
    safeTx,
  };
}
