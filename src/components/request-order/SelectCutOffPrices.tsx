import { Price } from '../../service/types.ts';
import { Select } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { useCutOffPrices } from '../../hooks/graph/useCutOffPrices.tsx';
import { formatBigDec } from '../../util/string.ts';

export type SelectPricesProps = {
  onSelect: (idx: number) => void;
};

export const SelectCutOffPrices = ({ onSelect }: SelectPricesProps) => {
  const { data } = useCutOffPrices();

  const opt = data.map((price: Price, i: number) => {
    const label = `[${i}] ${formatDatetime(Number(price.timestamp))} - ${formatBigDec(price.price)}`;

    return {
      value: i,
      label: <span style={{ fontFamily: 'monospace' }}>{label}</span>,
    };
  });

  return <Select style={{ width: '100%' }} options={opt} onSelect={(value) => onSelect(value)} />;
};
