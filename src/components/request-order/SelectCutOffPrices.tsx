import { AssetCutOffPrice } from '../../service/types.ts';
import { Select } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { useCutOffPrices } from '../../hooks/contract/useCutOffPrices.tsx';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { useMemo } from 'react';

export type SelectPricesProps = {
  onSelect: (idx: number, prices: AssetCutOffPrice) => void;
};

const lpAddress: string = DEPLOYED_CONTRACTS.ADDR_LP.toLowerCase();

export const SelectCutOffPrices = ({ onSelect }: SelectPricesProps) => {
  const { prices, isPending } = useCutOffPrices();

  const options = useMemo(() => {
    return prices.map((price: AssetCutOffPrice) => {
      const label = `[${price.index}] ${formatDatetime(price.updateTime)} - ${price.assets[lpAddress]?.format({ fix: 6 })}`;

      return {
        value: price.index,
        label: <span style={{ fontFamily: 'monospace' }}>{label}</span>,
      };
    });
  }, [prices]);

  const placeholder = useMemo(() => {
    if (options.length === 0 && !isPending) {
      return '暂无可用的结算价格';
    }

    return '选择有效的结算价格';
  }, [options, isPending]);

  return (
    <Select
      placeholder={placeholder}
      style={{ width: '100%' }}
      options={options}
      onSelect={(value) => onSelect(value, prices[value])}
    />
  );
};
