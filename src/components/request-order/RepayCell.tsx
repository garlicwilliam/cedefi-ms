import { Button } from 'antd';
import { useCallback, useMemo } from 'react';
import { useList } from '@refinedev/core';
import { AssetRepay } from '../../service/types.ts';
import { NumberValue } from '../value/NumberValue.tsx';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './RepayCell.module.scss';

export type RepayCellProps = {
  roundId: number;
  onEdit: (roundId: number) => void;
};

export function RepayCell({ roundId, onEdit }: RepayCellProps) {
  const onClick = useCallback(() => {
    onEdit(roundId);
  }, [roundId, onEdit]);

  const styleMr = useStyleMr(styles);

  const { result: roundResult, query: roundQuery } = useList({
    resource: 'asset_repay',
    filters: [{ field: 'roundId', operator: 'eq', value: roundId }],
    queryOptions: {
      enabled: !!roundId && roundId > 0,
      queryKey: ['round_bind', roundId],
    },
  });

  const valueRecord: Record<string, number> = useMemo(() => {
    const rs = {} as Record<string, number>;
    roundResult.data.forEach((one) => {
      const item = one as AssetRepay;
      rs[item.assetSymbol] = (rs[item.assetSymbol] || 0) + Number(item.assetAmount);
    });
    return rs;
  }, [roundResult]);

  return (
    <div className={styleMr(styles.cell)}>
      <div>
        {Object.entries(valueRecord).map(([symbol, amount]) => (
          <div key={symbol}>
            <NumberValue>
              {symbol}: {amount}
            </NumberValue>
          </div>
        ))}
      </div>

      <div>
        <Button size={'small'} onClick={onClick}>
          编辑
        </Button>
      </div>
    </div>
  );
}
