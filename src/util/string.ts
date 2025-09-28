export function shortHex(
  hexBytes: string,
  prefixLen: number,
  suffixLen: number,
): string {
  if (!hexBytes) {
    return hexBytes;
  }

  if (hexBytes.length <= prefixLen + suffixLen) {
    return hexBytes;
  }

  const reg: RegExp = new RegExp(`^(.{${prefixLen}})(.*)(.{${suffixLen}})`);
  return hexBytes.replace(reg, `$1...$3`);
}
