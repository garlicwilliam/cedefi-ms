import { Modal } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AssetCutOffPrice, RequestOrder, RequestOrderStatus } from '../../service/types.ts';
import { Action, ActionNames } from './action.types.tsx';
import { ValueItem } from './ValueItem.tsx';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './ActionModal.module.scss';
import { StyleMerger } from '../../util/css.ts';
import { SelectCutOffPrices } from './SelectCutOffPrices.tsx';
import { useEstimateLiabilities } from '../../hooks/combine/useEstimateLiabilities.tsx';
import { NumberValue } from '../value/NumberValue.tsx';
import { formatDatetime } from '../../util/time.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { E18 } from '../../util/big-number.ts';
import { useAssets } from '../../hooks/graph/useAssets.tsx';

type ActionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (action: Action, orders: Set<string>, priceIndex?: number) => void;
  //
  checkedOrders: Set<string>;
  checkedStatus?: RequestOrderStatus | null;
  action: Action | null;
  //
  currentOrders: RequestOrder[];
};

const lpAddress: string = DEPLOYED_CONTRACTS.ADDR_LP.toLowerCase();

function useLps(checkedOrders: Set<string>, curOrders: RequestOrder[]) {
  return useMemo(() => {
    const assetsLp: Record<string, SldDecimal> = {};
    let lps: SldDecimal = SldDecimal.ZERO;

    if (!curOrders || !checkedOrders) {
      return { lps: SldDecimal.ZERO, assetsLp: {} };
    }

    curOrders
      .filter((one) => checkedOrders.has(one.id))
      .forEach((order) => {
        const lp = SldDecimal.fromOrigin(BigInt(order.requestShares), 18);
        lps = lps.add(lp);

        if (!assetsLp[order.requestAsset.id]) {
          assetsLp[order.requestAsset.id] = SldDecimal.ZERO;
        }
        assetsLp[order.requestAsset.id] = assetsLp[order.requestAsset.id].add(lp);
      });

    return { lps, assetsLp };
  }, [checkedOrders, curOrders]);
}

function useSettleAssets(assetsLp: Record<string, SldDecimal>, price: AssetCutOffPrice | null) {
  return useMemo(() => {
    const initRs: Record<string, SldDecimal> = {};

    if (!price || !assetsLp || price.assets[lpAddress] === null) {
      return initRs;
    }

    const useRate: SldDecimal = price.assets[lpAddress];

    Object.keys(assetsLp).forEach((assetAddr) => {
      const assetPrice: SldDecimal | null = price.assets[assetAddr];
      if (assetPrice === null) {
        return;
      }

      const lpAmount: SldDecimal = assetsLp[assetAddr];
      const lpValue: SldDecimal = lpAmount.mul(useRate.toE18()).div(E18);

      initRs[assetAddr] = lpValue.mul(E18).div(assetPrice.toE18());
    });

    return initRs;
  }, [assetsLp, price]);
}

function useLockedAssets(checkedOrders: Set<string>, curOrders: RequestOrder[]): Record<string, SldDecimal> {
  return useMemo(() => {
    const orders: RequestOrder[] = curOrders.filter((one) => checkedOrders.has(one.id));
    const res = {} as Record<string, SldDecimal>;
    orders.forEach((order) => {
      const amount: SldDecimal = SldDecimal.fromOrigin(BigInt(order.assetAmount), 18);
      const asset: string = order.requestAsset.symbol;

      res[asset] = (res[asset] || SldDecimal.ZERO).add(amount);
    });

    return res;
  }, [curOrders, checkedOrders]);
}

type ProcessingItemsProps = {
  checkedOrders: Set<string>;
  currentOrders: RequestOrder[];
  selectedPriceIdx?: (idx: number) => void;
};

function ProcessingItems({ checkedOrders, currentOrders, selectedPriceIdx }: ProcessingItemsProps) {
  const styleMr = useStyleMr(styles);
  const [priceIdx, setPriceIdx] = useState<number>(0);
  const [usedPrice, setUsedPrice] = useState<AssetCutOffPrice | null>(null);
  const { map: assetMap } = useAssets();
  const { lps, assetsLp } = useLps(checkedOrders, currentOrders);
  const assetsAmount = useSettleAssets(assetsLp, usedPrice);
  const processingLps: { amount: SldDecimal; rate: SldDecimal } | null = useMemo(() => {
    if (!usedPrice || !lps || lps.isZero() || usedPrice.assets[lpAddress] == null) {
      return null;
    }

    return {
      amount: lps,
      rate: usedPrice.assets[lpAddress],
    };
  }, [lps, usedPrice]);
  const { liabilities, time: estTime } = useEstimateLiabilities(null, processingLps);

  useEffect(() => {
    if (selectedPriceIdx) {
      selectedPriceIdx(priceIdx);
    }
  }, [priceIdx, selectedPriceIdx]);

  const onSelectPrice = useCallback((idx: number, price: AssetCutOffPrice) => {
    setPriceIdx(idx);
    setUsedPrice(price);
  }, []);

  return (
    <>
      <ValueItem
        className={styleMr(styles.modalItem)}
        labelClassName={styleMr(styles.modalLabel)}
        valueClassName={styleMr(styles.modalValue)}
        label={'结算价格'}
        value={<SelectCutOffPrices onSelect={onSelectPrice} />}
      />
      <ValueItem
        className={styleMr(styles.modalItem)}
        labelClassName={styleMr(styles.modalLabel)}
        valueClassName={styleMr(styles.modalValue)}
        label={'预估负债'}
        value={
          <>
            <NumberValue>{liabilities.format({ sign: true })} USD</NumberValue>
            {estTime ? ` (基于 ${formatDatetime(estTime)} 快照数据)` : ''}
          </>
        }
      />
      <ValueItem
        className={styleMr(styles.modalItem, styles.top)}
        labelClassName={styleMr(styles.modalLabel)}
        valueClassName={styleMr(styles.modalValue)}
        label={'结算金额'}
        value={
          <>
            {Object.keys(assetsAmount).map((assetId) => {
              const asset = assetMap.get(assetId)!;
              return (
                <div key={assetId}>
                  <NumberValue>
                    {asset.symbol}: {assetsAmount[assetId].format({ fix: 6, ceil: true })}
                  </NumberValue>
                </div>
              );
            })}
          </>
        }
      />
    </>
  );
}

type ProcessedItemsProps = {
  checkedOrders: Set<string>;
  currentOrders: RequestOrder[];
};
function ProcessedItems({ checkedOrders, currentOrders }: ProcessedItemsProps) {
  const styleMr = useStyleMr(styles);
  const assets = useLockedAssets(checkedOrders, currentOrders);

  return (
    <>
      <ValueItem
        className={styleMr(styles.modalItem, styles.top)}
        labelClassName={styleMr(styles.modalLabel)}
        valueClassName={styleMr(styles.modalValue)}
        label={'结算金额'}
        value={
          <div>
            {Object.keys(assets).map((symbol: string) => {
              return (
                <div>
                  <NumberValue>{`${symbol}: ${assets[symbol].format({ fix: 6 })}`}</NumberValue>
                </div>
              );
            })}
          </div>
        }
      />
    </>
  );
}

export const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  checkedOrders,
  checkedStatus,
  action,
  currentOrders,
}: ActionModalProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const [priceIdx, setPriceIdx] = useState<number>(0);

  //
  const onOk = useCallback(() => {
    if (onConfirm && action && checkedOrders && checkedOrders.size > 0) {
      onConfirm(action!, checkedOrders, priceIdx);
    }
  }, [onConfirm, action, checkedOrders, priceIdx]);

  //
  const needPrice = action === Action.Processing;
  const needAmount = action === Action.Processed;

  return (
    <Modal
      title={action ? ActionNames[action] : '操作'}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isOpen}
      onOk={onOk}
      onCancel={onClose}
    >
      <div className={styleMr(styles.actionDetails)}>
        <ValueItem
          className={styleMr(styles.modalItem)}
          labelClassName={styleMr(styles.modalLabel)}
          valueClassName={styleMr(styles.modalValue)}
          label={'订单数量'}
          value={checkedOrders.size}
        />
        <ValueItem
          className={styleMr(styles.modalItem)}
          labelClassName={styleMr(styles.modalLabel)}
          valueClassName={styleMr(styles.modalValue)}
          label={'订单状态'}
          value={checkedStatus}
        />
        <ValueItem
          className={styleMr(styles.modalItem)}
          labelClassName={styleMr(styles.modalLabel)}
          valueClassName={styleMr(styles.modalValue)}
          label={'执行操作'}
          value={action ? ActionNames[action] : ''}
        />

        {needPrice && (
          <ProcessingItems
            checkedOrders={checkedOrders}
            currentOrders={currentOrders}
            selectedPriceIdx={setPriceIdx}
          />
        )}

        {needAmount && <ProcessedItems checkedOrders={checkedOrders} currentOrders={currentOrders} />}
      </div>
    </Modal>
  );
};
