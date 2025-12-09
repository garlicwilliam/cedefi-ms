import Safe from '@safe-global/protocol-kit';
import { filter, from, Observable, startWith, switchMap, take, takeWhile, timer } from 'rxjs';
import {
  MetaTransactionData,
  SafeTransaction,
  SafeMultisigTransactionResponse,
} from '@safe-global/types-kit';
import SafeApiKit from '@safe-global/api-kit';
import { DEPLOYED_NETWORK } from '../const/env.ts';
import { map } from 'rxjs/operators';
import { SAFE_WALLET_API_KEY } from '../const/const.ts';

const safeTxService: SafeApiKit = new SafeApiKit({
  chainId: BigInt(DEPLOYED_NETWORK.id),
  apiKey: SAFE_WALLET_API_KEY,
});

export function initSafeClient(provider: any, safeAccount: `0x${string}`): Observable<Safe> {
  return from(Safe.init({ provider: provider, safeAddress: safeAccount }));
}

export function nextSafeNonce(safeAccount: `0x${string}`): Observable<string> {
  return from(safeTxService.getNextNonce(safeAccount));
}

export function watchSafeTxStatus(
  account: `0x${string}`,
  safe: Safe,
  meta: MetaTransactionData,
  nonce: string,
): Observable<SafeMultisigTransactionResponse> {
  return crateSafeTx(safe, meta, Number(nonce)).pipe(
    switchMap((safeHash: `0x${string}`) => {
      return intervalRun(() => getPendingSafeTx(account, safeHash, Number(nonce), meta));
    }),
    filter(Boolean),
    take(1),
    switchMap((safeTx) => {
      const safeTxHash: string = safeTx.safeTxHash;

      return intervalRun(() => from(safeTxService.getTransaction(safeTxHash))).pipe(startWith(safeTx));
    }),
    takeWhile((safeTx): boolean => {
      const isFinal: boolean = safeTx.isExecuted && safeTx.isSuccessful !== null;
      return !isFinal;
    }, true),
  );
}

function crateSafeTx(safe: Safe, meta: MetaTransactionData, nextNonce: number): Observable<`0x${string}`> {
  return from(safe.createTransaction({ transactions: [meta], options: { nonce: nextNonce } })).pipe(
    switchMap((tx: SafeTransaction): Observable<`0x${string}`> => {
      return from(safe.getTransactionHash(tx) as Promise<`0x${string}`>);
    }),
  );
}

function getPendingSafeTx(
  safeAccount: `0x${string}`,
  safeHash: string,
  nonce: number,
  meta: MetaTransactionData,
): Observable<SafeMultisigTransactionResponse | null> {
  return from(safeTxService.getPendingTransactions(safeAccount)).pipe(
    map((pendingTxList) => {
      if (pendingTxList.results.length === 0) {
        return null;
      }

      const safeTx: SafeMultisigTransactionResponse | undefined = pendingTxList.results.find((one) => {
        return (
          one.safeTxHash === safeHash &&
          one.to.toLowerCase() === meta.to.toLowerCase() &&
          Number(one.nonce) === nonce &&
          one.data === meta.data
        );
      });

      return safeTx || null;
    }),
  );
}

function intervalRun<T>(fun: () => Observable<T>, interval: number = 3000): Observable<T> {
  return timer(0, interval).pipe(
    switchMap(() => {
      return fun();
    }),
  );
}
