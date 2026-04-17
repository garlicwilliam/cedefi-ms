export const FromTypes = [
  { value: 'platform', label: '平台' },
  { value: 'team_portfolio', label: '团队投组' },
];

export const FilterTypes = [
  { value: 'platform', text: '平台' },
  { value: 'team_portfolio', text: '团队投组' },
];

export function isTxHash(hash: string): boolean {
  const regex = /^0x([A-Fa-f0-9]{64})$/;
  return regex.test(hash);
}
