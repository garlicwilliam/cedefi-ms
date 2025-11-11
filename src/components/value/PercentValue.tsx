import { SldDecPercent } from '../../util/decimal.ts';
import { ReactNode } from 'react';

export type DecimalValueProps = {
  value: SldDecPercent | null | undefined;
  noneStr?: ReactNode;
};

export function PercentValue({ value, noneStr }: DecimalValueProps) {
  if (!value) {
    return <>{noneStr}</>;
  }

  return <>{value.percentFormat()}%</>;
}
