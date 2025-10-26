import { encodeFunctionData } from 'viem';

import { SldDecimal } from '../../util/decimal.ts';
import { AbiOracleRegistry } from '../../const/abis/OracleRegistry.ts';

export const useUpdatePriceCallData = (priceNum: string, isCutOff: boolean): `0x${string}` => {
  const funName: string = 'updatePrices';
  const rate: SldDecimal = SldDecimal.fromNumeric(priceNum, 18);
  const args = [rate.toOrigin(), isCutOff];

  const calldata: `0x${string}` = encodeFunctionData({
    abi: AbiOracleRegistry,
    functionName: funName,
    args: args,
  });

  return calldata;
};
