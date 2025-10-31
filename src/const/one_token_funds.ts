export type OneTokenSubFund = {
  id: string;
  inceptionTime: number;
  name: string;
  userRate: number; // in basis points, e.g., 9000 = 90.00%
};

export const PARENT_FUND: string = 'fund/gvbm5z';
export const SUB_FUNDS: OneTokenSubFund[] = [
  {
    id: 'fund/eae200',
    inceptionTime: 1761581982,
    name: 'SS-USD-PEBB-自营理财-1',
    userRate: 9000,
  },
  {
    id: 'fund/nahuuh',
    inceptionTime: 1761580785,
    name: 'SS-USD-ZenX-1',
    userRate: 7000,
  },
] as const;

//
