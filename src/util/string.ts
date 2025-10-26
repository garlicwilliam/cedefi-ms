import { SldDecimal } from './decimal.ts';

export function shortHex(hexBytes: string, prefixLen: number, suffixLen: number): string {
  if (!hexBytes) {
    return hexBytes;
  }

  if (hexBytes.length <= prefixLen + suffixLen) {
    return hexBytes;
  }

  const reg: RegExp = new RegExp(`^(.{${prefixLen}})(.*)(.{${suffixLen}})`);
  return hexBytes.replace(reg, `$1...$3`);
}

export function isSameStrNoCase(strA: string, strB: string): boolean {
  return strA.toLowerCase() === strB.toLowerCase();
}

export function formatBigDec(val: string, fix: number = 18, decimal = 18): string {
  return SldDecimal.fromOrigin(BigInt(val), decimal).format({ fix: fix, removeZero: true });
}

export function toBigDec(val: string, decimal = 18): SldDecimal {
  return SldDecimal.fromOrigin(BigInt(val), decimal);
}
