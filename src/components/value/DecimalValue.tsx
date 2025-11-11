import { SldDecimal } from '../../util/decimal.ts';

export type DecimalValueProps = {
  value: SldDecimal | null | undefined;
  noneStr?: string;
  fix?: number;
  sign?: boolean;
};

export function DecimalValue({ value, noneStr = '', fix = 2, sign = false }: DecimalValueProps) {
  if (!value) {
    return <>{noneStr}</>;
  }

  return <>{value.format({ fix, sign })}</>;
}
