import { Modal, Select } from 'antd';
import { useList } from '@refinedev/core';
import { AssetRepay } from '../../service/types.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDatetime } from '../../util/time.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './RepayModal.module.scss';
import { NumberValue } from '../value/NumberValue.tsx';
import { usePatchAssetPay } from '../../hooks/tanstack/usePatchAssetPay.tsx';

type RepayModalProps = {
  roundId: number | null;
  onClose: () => void;
};
export function RepayModal({ roundId, onClose }: RepayModalProps) {
  const styleMr = useStyleMr(styles);
  const [roundPrimary, setRoundPrimary] = useState<AssetRepay[]>([]);
  const [nullPrimary, setNullPrimary] = useState<AssetRepay[]>([]);

  // 在不执行的情况下(enabled=false)
  // 获取的两种数据为空记录，但是每次渲染的时候，都会返回新的空记录，导致后续的 useMemo 重新计算
  const { result: nullResult, query: nullQuery } = useList({
    resource: 'asset_repay',
    filters: [{ field: 'roundId', operator: 'null', value: true }],
    queryOptions: {
      enabled: !!roundId && roundId > 0,
      queryKey: ['null_bind', roundId],
    },
  });
  const { result: roundResult, query: roundQuery } = useList({
    resource: 'asset_repay',
    filters: [{ field: 'roundId', operator: 'eq', value: roundId }],
    queryOptions: {
      enabled: !!roundId && roundId > 0,
      queryKey: ['round_bind', roundId],
    },
  });

  useEffect(() => {
    if (nullResult.data && nullQuery.isSuccess) {
      setNullPrimary(nullResult.data as AssetRepay[]);
    }
  }, [nullResult, nullQuery]);

  useEffect(() => {
    if (roundResult.data && roundQuery.isSuccess) {
      setRoundPrimary(roundResult.data as AssetRepay[]);
    }
  }, [roundResult, roundQuery]);

  const options = useMemo(() => {
    return [...nullPrimary, ...roundPrimary].map((rp) => {
      return {
        value: rp.id,
        label: (
          <NumberValue>{`${formatDatetime(rp.timestamp)} - ${rp.assetSymbol} - ${rp.assetAmount}`}</NumberValue>
        ),
      };
    });
  }, [nullPrimary, roundPrimary]);

  const [bindRepays, setBindRepays] = useState<number[] | null>(null);
  const [unbindRepays, setUnbindRepays] = useState<number[] | null>(null);
  const { mutate, isSuccess } = usePatchAssetPay({
    roundId,
    bindIds: bindRepays,
    unbindIds: unbindRepays,
  });

  const primaryIdsRef = useRef<number[]>([]);

  useEffect(() => {
    primaryIdsRef.current = roundPrimary.map((one) => one.id as number);
    setBindRepays(primaryIdsRef.current);
  }, [roundPrimary]);

  useEffect(() => {
    if (isSuccess) {
      nullQuery.refetch();
      roundQuery.refetch();
      onClose();
    }
  }, [isSuccess, onClose, nullQuery, roundQuery]);

  const onChange = useCallback((ids: number[]) => {
    setBindRepays(ids);
    const toUnbind: number[] = primaryIdsRef.current.filter((id) => !ids.includes(id));
    setUnbindRepays(toUnbind);
  }, []);

  const onSubmit = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <Modal open={roundId !== null} onCancel={onClose} title={'选择绑定回款记录'} onOk={onSubmit}>
      <div className={styleMr(styles.content)}>
        <div>RoundID: {roundId}</div>
        <Select
          mode={'multiple'}
          value={bindRepays}
          options={options}
          onChange={onChange}
          className={styleMr(styles.select)}
        />
      </div>
    </Modal>
  );
}
