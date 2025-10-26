import { useList } from '@refinedev/core';
import { TimeLockExecute } from '../../service/types.ts';
import { AbiOracleRegistry } from '../../const/abis/OracleRegistry.ts';
import * as _ from 'lodash';
import { AbiFunction, toFunctionSelector } from 'viem';

export type UseExchangeRateExecuteReturnType = { data: TimeLockExecute[]; refresh: () => void };

// 从graph 获取没有提交的execute列表，过滤出updatePrices的
export const useExchangeRateExecute: () => UseExchangeRateExecuteReturnType = (): UseExchangeRateExecuteReturnType => {
  const abiFun = AbiOracleRegistry.find((one): boolean => _.has(one, 'name') && one.name === 'updatePrices');
  const funSign: `0x${string}` | undefined = abiFun ? toFunctionSelector(abiFun as AbiFunction) : undefined;
  //
  const { result, query } = useList({
    resource: 'timeLockExecutes',
    filters: [
      { field: 'status', operator: 'eq', value: 'scheduled' },
      { field: 'batchSize', operator: 'eq', value: 1 },
    ],
    sorters: [{ field: 'createdAt', order: 'desc' }],
  });
  //

  //
  let executes: TimeLockExecute[] = result.data as TimeLockExecute[];
  if (funSign) {
    executes = executes.filter((one): boolean => one.callData[0].startsWith(funSign));
  }
  //
  return {
    data: executes,
    refresh: query.refetch,
  };
};
