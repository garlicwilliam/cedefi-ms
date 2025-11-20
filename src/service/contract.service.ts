import { readContracts } from '@wagmi/core';
import { type ReadContractsReturnType } from '@wagmi/core';
import { config } from '../wallet.tsx';
import { AbiOracleRegistry } from '../const/abis/OracleRegistry.ts';
import { DEPLOYED_CONTRACTS } from '../const/env.ts';
import { from, Observable, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SldDecimal } from '../util/decimal.ts';
import { AssetCutOffPrice } from './types.ts';
import { AbiParamRegistry } from '../const/abis/ParamRegistry.ts';

export function getWithdrawalTokens() {}

/**
 * 检查给定的length是否与合约中的length一致
 * @param testLength
 */
function testCutOffPriceLength(testLength: number): Observable<boolean> {
  const result = readContracts(config as any, {
    contracts: [
      {
        abi: AbiOracleRegistry,
        address: DEPLOYED_CONTRACTS.ADDR_ORACLE,
        functionName: 'cutOffPriceUpdateAt',
        args: [BigInt(testLength)], // 应该报错
      },
      {
        abi: AbiOracleRegistry,
        address: DEPLOYED_CONTRACTS.ADDR_ORACLE,
        functionName: 'cutOffPriceUpdateAt',
        args: [BigInt(testLength - 1)], // 应该返回正常值
      },
    ],
  });

  return from(result).pipe(
    map((res: ReadContractsReturnType) => {
      const s0 = res[0].status;
      const s1 = res[1].status;

      return s0 === 'failure' && s1 === 'success';
    }),
  );
}

function getValidCutOffIndex(validCutOffLength: number): Observable<{ time: number }[]> {
  const dateIndex: bigint[] = [0, 1, 2]
    .map((i) => validCutOffLength - 1 - i)
    .filter((i) => i >= 0)
    .map((i) => BigInt(i));

  const priceContracts = dateIndex.map((di) => {
    return {
      abi: AbiOracleRegistry,
      address: DEPLOYED_CONTRACTS.ADDR_ORACLE,
      functionName: 'cutOffPriceUpdateAt',
      args: [di],
    };
  });

  const result = readContracts(config as any, {
    contracts: [
      ...priceContracts,
      {
        abi: AbiParamRegistry,
        address: DEPLOYED_CONTRACTS.ADDR_PARAMS,
        functionName: 'getPriceValidityDuration',
        args: [],
      },
    ],
  });

  return from(result).pipe(
    map((res: ReadContractsReturnType) => {
      // @1 datetime
      const datetimeRes = res.slice(0, priceContracts.length - 1);
      let datetimeArr: (bigint | null)[] = datetimeRes.map((d) => {
        return d.status === 'success' ? (d.result as bigint) : null;
      });
      // @2 valid duration
      const validDurationRes = res[res.length - 1];
      const duration: bigint =
        validDurationRes.status === 'success' ? (validDurationRes.result as bigint) : 0n;
      const now: bigint = BigInt(Math.floor(Date.now() / 1000));
      // @3 valid datetime,
      // 为了保持time的index连续性，这里不删除无效的datetime，只是把无效的datetime置为null
      // 而时间必然是排序好的，所以直接过滤掉过期的时间即可
      datetimeArr = datetimeArr.filter((time: bigint | null) => time == null || time + duration > now);

      return datetimeArr.map((datetime, i) => {
        return {
          time: datetime ? Number(datetime) : 0,
          index: i,
        };
      });
    }),
  );
}

function getCutOffPrices(
  assetAddresses: string[],
  cutOffIndexes: { time: number }[],
): Observable<AssetCutOffPrice[]> {
  type IDRequest = {
    asset: string;
    index: number;
  };

  const requestIds: IDRequest[] = [...assetAddresses, DEPLOYED_CONTRACTS.ADDR_LP.toLowerCase()]
    .map((asset) => {
      return cutOffIndexes.map((__, index) => {
        return {
          asset: asset.toLowerCase(),
          index: index,
        };
      });
    })
    .flat();

  const contracts = requestIds.map((id) => {
    return {
      abi: AbiOracleRegistry,
      address: DEPLOYED_CONTRACTS.ADDR_ORACLE,
      functionName: 'getCutOffPrice',
      args: [id.asset, id.index],
    };
  });

  const lastResult: AssetCutOffPrice[] = cutOffIndexes.map(({ time }, index) => {
    return {
      index: index,
      updateTime: time,
      assets: assetAddresses.reduce(
        (acc, cur) => {
          acc[cur.toLowerCase()] = null;
          return acc;
        },
        {} as Record<string, SldDecimal | null>,
      ),
    };
  });

  const result = readContracts(config as any, {
    contracts: contracts,
  });

  return from(result).pipe(
    tap((res: ReadContractsReturnType) => {
      requestIds.forEach((id: IDRequest, rsIdx: number) => {
        const r = res[rsIdx];

        if (r.status === 'success') {
          const priceBigInt = r.result as bigint;
          const priceIndex: number = id.index;

          lastResult[priceIndex].assets[id.asset] = SldDecimal.fromOrigin(priceBigInt, 18);
        }
      });
    }),
    map(() => {
      return lastResult.filter((one) => one.assets[DEPLOYED_CONTRACTS.ADDR_LP.toLowerCase()] !== null);
    }),
  );
}

export function getCutOffPricesByLength(
  testLength: number, // array length
  assets: string[],
): Observable<AssetCutOffPrice[]> {
  return testCutOffPriceLength(testLength).pipe(
    switchMap((is: boolean) => {
      if (!is) {
        throw new Error('Invalid cut-off price length');
      }

      return getValidCutOffIndex(testLength);
    }),
    switchMap((validIndexes) => {
      return getCutOffPrices(assets, validIndexes);
    }),
  );
}
