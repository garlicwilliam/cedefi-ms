import { config } from '../wallet';
import { writeContract, getAccount, waitForTransactionReceipt, Connector } from '@wagmi/core';
import { from, Observable, of, switchMap, take, throwError, zip } from 'rxjs';
import { encodeFunctionData, TransactionReceipt } from 'viem';
import { catchError, map } from 'rxjs/operators';
import { IUniversalProvider } from '@walletconnect/universal-provider';
import { UseWriteParamType } from '../hooks/wallet-write/useCallContract.tsx';
import Safe, { Eip1193Provider } from '@safe-global/protocol-kit';
import { MetaTransactionData, SafeMultisigTransactionResponse } from '@safe-global/types-kit';
import { initSafeClient, nextSafeNonce, watchSafeTxStatus } from './safe.ts';
import { S } from '../state/global.ts';
import { getDefaultStore } from 'jotai';

export type WriteCallResultType = {
  isFinal: boolean;
  isSafe: boolean;
  isSuccess: boolean | null;
  safeTx?: SafeMultisigTransactionResponse;
  error?: Error;
};

/**
 * 使用wagmi与智能合约进行写操作，使用引入的config配置，同时将wagmi的writeContract的操作参数映射到这里定义的函数上
 * 返回交易hash的Observable
 */
export function writeCallContract(param: UseWriteParamType, opt: { gasLimit?: bigint }): Observable<WriteCallResultType> {
  const accountInfo = getAccount(config as any);
  if (!accountInfo.isConnected || !accountInfo.address) {
    return throwError(() => new Error('Wallet not connected'));
  }

  return isUseSafeWallet().pipe(
    switchMap(({ isSafe, safeProvider }) => {
      if (isSafe && safeProvider) {
        const safeCallData: `0x${string}` = encodeFunctionData({
          abi: param.abi,
          functionName: param.function,
          args: param.args,
        });
        const metaTx: MetaTransactionData = {
          to: param.address,
          value: param.value || '0',
          data: safeCallData, // You would need to encode the function call data here
          operation: 0,
        };

        const account = accountInfo.address as `0x${string}`;
        const safe$ = initSafeClient(safeProvider, account);
        const nonce$ = nextSafeNonce(account);
        const hash$ = doCall(param, opt);

        // 必须在call之前先获得nonce
        return zip(safe$, nonce$)
          .pipe(
            switchMap(([safe, nonce]: [Safe, string]) => {
              return zip([of(safe), of(nonce), hash$]);
            }),
          )
          .pipe(
            switchMap(([safe, nonce]) => {
              return watchSafeTxStatus(account, safe, metaTx, nonce);
            }),
            map((safeTxStatus: SafeMultisigTransactionResponse) => {
              //
              const isFinal: boolean = safeTxStatus.isExecuted && safeTxStatus.isSuccessful !== null;

              // update global state
              const defaultStore = getDefaultStore();
              console.log('set S.Wallet.Safe.SafeTx', safeTxStatus);
              defaultStore.set(S.Wallet.Safe.SafeTx, safeTxStatus);
              defaultStore.set(S.Wallet.Safe.Pending, !isFinal);

              //
              return {
                isSafe: true,
                isSuccess: safeTxStatus.isSuccessful,
                safeTx: safeTxStatus,
                isFinal,
              };
            }),
          );
      } else {
        return doCall(param, opt).pipe(
          switchMap((hash: `0x${string}`) => {
            return watchWriteRecept(hash);
          }),
          map((isSuccess: boolean) => {
            return {
              isSafe: false,
              isSuccess: isSuccess,
              isFinal: true,
            };
          }),
        );
      }
    }),
    catchError((err: Error) => {
      return of({
        isFinal: true,
        isSafe: false,
        isSuccess: false,
        error: err,
      });
    }),
  );
}

/**
 * @param hash
 */
export function watchWriteRecept(hash: `0x${string}`): Observable<boolean> {
  return from(waitForTransactionReceipt(config as any, { hash })).pipe(
    map((receipt: TransactionReceipt) => {
      return receipt.status === 'success';
    }),
  );
}

function doCall(params: UseWriteParamType, opt: { gasLimit?: bigint }): Observable<`0x${string}`> {
  return from(
    writeContract(config as any, {
      abi: params.abi,
      address: params.address,
      functionName: params.function,
      value: params.value ? BigInt(params.value) : undefined,
      args: params.args,
      gas: opt?.gasLimit,
    }),
  );
}

/**
 *
 */
function isUseSafeWallet(): Observable<{ isSafe: boolean; safeProvider?: IUniversalProvider | Eip1193Provider | null }> {
  const account = getAccount(config as any);
  if (!account.isConnected || !account.connector) {
    return of({ isSafe: false });
  }

  const isSafe = account.connector.name.toLowerCase().indexOf('safe') >= 0;
  if (isSafe) {
    return from(account.connector.getProvider() as Promise<Eip1193Provider>).pipe(
      map((provider: Eip1193Provider) => {
        return { isSafe: true, safeProvider: provider };
      }),
    );
  }

  const connector: Connector = account.connector;
  if (connector.id === 'walletConnect' && 'getProvider' in connector) {
    const walletConnectProvider$ = connector.getProvider() as Promise<IUniversalProvider>;

    return from(walletConnectProvider$).pipe(
      take(1),
      map((provider: IUniversalProvider) => {
        const session = provider.session;
        const name: string | undefined = session?.peer.metadata.name;
        const isSafe: boolean = name ? name.toLowerCase().indexOf('safe') >= 0 : false;

        return { isSafe, safeProvider: isSafe ? provider : null };
      }),
    );
  }

  return of({ isSafe: false });
}
