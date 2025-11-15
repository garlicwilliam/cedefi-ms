import styles from './OrderListHeader.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { StyleMerger } from '../../util/css.ts';
import { OrderStatusCheck } from './OrderStatusCheck.tsx';
import { Button, Checkbox, Divider } from 'antd';
import { RequestOrder, RequestOrderStatus } from '../../service/types.ts';
import { ActionModal } from './ActionModal.tsx';
import { Action, ActionNames, ActionTypes } from './action.types.tsx';
import { useCallback, useMemo, useState } from 'react';
import { useCallContractState } from '../../hooks/wallet-write/useCallContract.tsx';
import { AbiWithdrawController } from '../../const/abis/WithdrawController.ts';
import { LoadingOutlined } from '@ant-design/icons';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export type OrderListHeaderProps = {
  checkedOrders: Set<string>;
  currentOrders: RequestOrder[];
  onCheckedAll: (checked: boolean) => void;
  checkedStatus: RequestOrderStatus[];
  onCheckStatus: (checked: RequestOrderStatus[]) => void;
  refresh: () => void;
  refreshing: boolean;
};

// status -> actions
const ACTIONS: { [s in RequestOrderStatus]?: Action[] } = {
  [RequestOrderStatus.Requested]: [Action.Processing, Action.Rejected],
  [RequestOrderStatus.Processing]: [Action.Processed, Action.Reviewing],
  [RequestOrderStatus.Reviewing]: [Action.Processed, Action.Forfeited],
} as const;

function getCheckedOrderStatus(
  checkOrders: Set<string>,
  curOrders: RequestOrder[],
): { isSame: boolean; status: RequestOrderStatus | null; isSelectedAll: boolean; actions: Action[] } {
  const status = curOrders
    .filter((one) => checkOrders.has(one.id))
    .map((one) => one.status)
    .reduce((acc, cur: RequestOrderStatus) => {
      acc.add(cur);
      return acc;
    }, new Set<RequestOrderStatus>());

  const isSameStatus = status.size <= 1;
  const curStatus = status.size === 1 ? Array.from(status)[0] : null;

  const isSelectedAll: boolean = curOrders.length > 0 && curOrders.length <= checkOrders.size;
  const actions: Action[] = (curStatus ? ACTIONS[curStatus] : []) || [];

  return { isSame: isSameStatus, status: curStatus, isSelectedAll, actions };
}

export const OrderListHeader = ({
  checkedOrders,
  currentOrders,
  onCheckedAll,
  onCheckStatus,
  checkedStatus,
  refresh,
  refreshing,
}: OrderListHeaderProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [curAction, setCurAction] = useState<Action | null>(null);
  const [lastAction, setLastAction] = useState<Action | null>(null);

  const { mutate, isDisabled } = useCallContractState(refresh);
  const { isSame, status, isSelectedAll, actions } = useMemo(
    () => getCheckedOrderStatus(checkedOrders, currentOrders),
    [checkedOrders, currentOrders],
  );

  //
  const popAction = useCallback((action: Action) => {
    setCurAction(action);
    setIsOpenModal(true);
  }, []);

  // 改变订单状态
  const exeAction = useCallback(
    (action: Action, checked: Set<string>, priceIndex?: number) => {
      const ids: bigint[] = Array.from(checked).map((id) => BigInt(id));
      const priceIdx = priceIndex || 0;

      let args = [];
      let fun = '';

      switch (action) {
        case Action.Processing: {
          fun = 'markAsProcessing';
          args = [ids, priceIdx, false];
          break;
        }
        case Action.Rejected: {
          fun = 'markAsRejected';
          args = [ids];
          break;
        }
        case Action.Processed: {
          fun = 'markAsProcessed';
          args = [ids];
          break;
        }
        case Action.Reviewing: {
          fun = 'markAsReviewing';
          args = [ids];
          break;
        }
        case Action.Forfeited: {
          fun = 'markAsForfeited';
          args = [ids];
          break;
        }
      }

      setIsOpenModal(false);
      setLastAction(action);

      mutate({
        abi: AbiWithdrawController,
        address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
        function: fun,
        args: args,
      });
    },
    [mutate],
  );

  return (
    <div className={styleMr(styles.header)}>
      <div className={styleMr(styles.headerName)}>赎回订单 {refreshing && <LoadingOutlined />}</div>
      <div className={styleMr(styles.headerContent)}>
        <div>Status:</div>
        <OrderStatusCheck onChecked={onCheckStatus} checked={checkedStatus} />
      </div>

      <Divider size={'small'} />

      <div className={styleMr(styles.actionBox)}>
        <Checkbox checked={isSelectedAll} onChange={(e) => onCheckedAll(e.target.checked)}>
          全选
        </Checkbox>

        <div className={styleMr(styles.checkState)}>
          <div className={styleMr(styles.warn)}>{!isSame ? '请选择相同状态的订单' : ''}</div>
          <div className={styleMr()}>当前选中：{checkedOrders.size}</div>
        </div>

        <div className={styleMr(styles.buttons)}>
          {actions.map((action: Action, index: number) => {
            // action button
            return (
              <Button
                key={index}
                type={'primary'}
                danger={ActionTypes[action]}
                disabled={isDisabled}
                onClick={() => popAction(action)}
              >
                {ActionNames[action]} {isDisabled && lastAction == action ? <LoadingOutlined /> : ''}
              </Button>
            );
          })}
        </div>
      </div>

      <ActionModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onConfirm={exeAction}
        checkedOrders={checkedOrders}
        checkedStatus={status}
        action={curAction}
        currentOrders={currentOrders}
      />
    </div>
  );
};
