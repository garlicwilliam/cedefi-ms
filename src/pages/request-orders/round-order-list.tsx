import { List } from '@refinedev/antd';
import styles from './round-order-list.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { List as AntList, Tag } from 'antd';
import { useRounds } from '../../hooks/graph/useRounds.tsx';
import { RequestOrderStatus, Round } from '../../service/types.ts';
import { formatDatetime } from '../../util/time.ts';
import { useCallback, useEffect, useState } from 'react';
import { cssPick } from '../../util/css.ts';
import { useRoundOrders } from '../../hooks/graph/useRoundOrders.tsx';
import { OrderItem } from '../../components/request-order/OrderItem.tsx';
import { OrderListHeader } from '../../components/request-order/OrderListHeader.tsx';
import { useMultiTimesCall } from '../../util/refresh.ts';

export const RoundOrderList = () => {
  const styleMr = useStyleMr(styles);
  const [selectRound, setSelectRound] = useState<Round | undefined>(undefined);
  const [selectStatus, setSelectStatus] = useState<RequestOrderStatus[]>([]);
  const { arr: roundArr } = useRounds();
  const { data: orders, refresh: refreshOrders } = useRoundOrders(selectRound?.id, selectStatus);
  const [checkedOrders, setCheckedOrders] = useState<Set<string>>(new Set());

  const onCheckStatus = useCallback(
    (checked: RequestOrderStatus[]) => {
      return setSelectStatus(checked);
    },
    [setSelectStatus],
  );

  const onCheckOrder = useCallback(
    (val: { id: string; checked: boolean }) => {
      if (val.checked) {
        checkedOrders.add(val.id);
      } else {
        checkedOrders.delete(val.id);
      }

      setCheckedOrders(new Set(checkedOrders));
    },
    [setCheckedOrders, checkedOrders],
  );

  const onCheckAllOrders = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setCheckedOrders(new Set());
      } else {
        const ids = orders.map((one) => one.id);
        setCheckedOrders(new Set(ids));
      }
    },
    [setCheckedOrders, orders],
  );

  const { refresh, isPending } = useMultiTimesCall(refreshOrders);

  useEffect(() => {
    const ids: Set<string> = new Set(orders.map((one) => one.id));
    // if checked orders contains ids not in current orders, remove them
    const oldChecks = Array.from(checkedOrders);
    let needUpdate: boolean = false;
    oldChecks.forEach((id) => {
      if (!ids.has(id)) {
        checkedOrders.delete(id);
        needUpdate = true;
      }
    });

    if (needUpdate) {
      setCheckedOrders(new Set(checkedOrders));
    }
  }, [orders, setCheckedOrders, checkedOrders]);

  return (
    <List>
      <div className={styleMr(styles.wrapper)}>
        <AntList
          bordered
          header={<div>封账周期</div>}
          dataSource={roundArr}
          renderItem={(item: Round) => {
            return (
              <AntList.Item
                className={styleMr(styles.roundItem, cssPick(selectRound?.id === item.id, styles.active))}
                onClick={() => setSelectRound(item)}
              >
                <AntList.Item.Meta
                  title={<div>Round: &nbsp;{item.id}</div>}
                  description={
                    <div className={styleMr(styles.roundTime)}>
                      <Tag className={styleMr(styles.timeTag, styles.start)}>Start: {formatDatetime(Number(item.startedAt))}</Tag>

                      {Number(item.closedAt) == 0 ? (
                        ''
                      ) : (
                        <Tag className={styleMr(styles.timeTag, styles.close)}>Close: {formatDatetime(Number(item.closedAt))}</Tag>
                      )}
                    </div>
                  }
                />
              </AntList.Item>
            );
          }}
        />

        <AntList
          header={
            <OrderListHeader
              refresh={refresh}
              refreshing={isPending}
              checkedOrders={checkedOrders}
              currentOrders={orders}
              onCheckedAll={onCheckAllOrders}
              checkedStatus={selectStatus}
              onCheckStatus={onCheckStatus}
            />
          }
          dataSource={orders}
          renderItem={(item) => {
            return (
              <AntList.Item>
                <OrderItem order={item} curChecked={checkedOrders} onCheck={onCheckOrder} />
              </AntList.Item>
            );
          }}
        />
      </div>
    </List>
  );
};
