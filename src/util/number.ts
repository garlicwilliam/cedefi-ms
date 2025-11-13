import { SldDecimal } from './decimal.ts';

export function apyCompute(
  rateFrom: { value: number; timestamp: number },
  rateTo: { value: number; timestamp: number },
): number {
  const deltaTime: number = rateTo.timestamp - rateFrom.timestamp;
  const deltaValue: number = rateTo.value - rateFrom.value;
  const base: number = rateFrom.value;
  const year: number = 365 * 24 * 60 * 60; // seconds in a year

  const apy: number = (deltaValue * year * 100) / deltaTime / base;

  return apy;
}

export function decimalFormat(val: string, fix: number = 2): string {
  return SldDecimal.fromNumeric(val.toString(), 18).format({ fix });
}
