import { Modal } from 'antd';
import { useCallback, useState } from 'react';
import { RequestOrderStatus } from '../../service/types.ts';
import { Action, ActionNames } from './action.types.tsx';
import { ValueItem } from './ValueItem.tsx';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './ActionModal.module.scss';
import { StyleMerger } from '../../util/css.ts';
import { SelectCutOffPrices } from './SelectCutOffPrices.tsx';

type ActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (action: Action, orders: Set<string>, priceIndex?: number) => void;
  //
  checkedOrders: Set<string>;
  checkedStatus?: RequestOrderStatus | null;
  action: Action | null;
};

export const ActionModal = ({ isOpen, onClose, onConfirm, checkedOrders, checkedStatus, action }: ActionModalProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const [priceIdx, setPriceIdx] = useState<number>(0);

  const onOk = useCallback(() => {
    if (onConfirm && action && checkedOrders && checkedOrders.size > 0) {
      onConfirm(action!, checkedOrders, priceIdx);
    }
  }, [onConfirm, action, checkedOrders, priceIdx]);

  const needPrice = action === Action.Processing;

  return (
    <Modal
      title={action ? ActionNames[action] : '操作'}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isOpen}
      onOk={onOk}
      onCancel={onClose}
    >
      <div className={styleMr(styles.actionDetails)}>
        <ValueItem label={'订单数量'} value={checkedOrders.size} />
        <ValueItem label={'订单状态'} value={checkedStatus} />
        <ValueItem label={'执行操作'} value={action ? ActionNames[action] : ''} />
        {needPrice ? <ValueItem label={'结算价格'} value={<SelectCutOffPrices onSelect={(idx) => setPriceIdx(idx)} />} /> : <></>}
      </div>
    </Modal>
  );
};
