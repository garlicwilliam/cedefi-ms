export function baseBigInt(wei: number): bigint {
  const pow = BigInt(Math.abs(wei));

  return 10n ** pow;
}

export const E18: bigint = baseBigInt(18);

export function normalizeE18(origin: bigint, decimal: number): bigint {
  if (decimal === 18) {
    return origin;
  } else if (decimal < 18) {
    return origin * 10n ** BigInt(18 - decimal);
  } else {
    return origin / 10n ** BigInt(decimal - 18);
  }
}
