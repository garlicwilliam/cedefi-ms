import styles from './withdraw.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { DecimalNumInput } from '../../components/input/num-input-decimal.tsx';
import { Button, Select, Tag, List } from 'antd';
import { useWithdrawUnderlyingAssets } from '../../hooks/contract/useUnderlyings.tsx';
import { Asset, RequestOrder } from '../../service/types.ts';
import { ASSETS_ICONS } from '../../const/const.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSameStrNoCase, isValidAddress } from '../../util/string.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { useLpBalanceAndApprove } from '../../hooks/contract/useUserWithdrawInfo.tsx';
import { useCancelWithdraw, useClaimWithdraw, useWithdraw } from '../../hooks/contract/useWithdraw.tsx';
import { App as AntdApp } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAccount, useCall } from 'wagmi';
import { useList } from '@refinedev/core';
import { formatDatetime } from '../../util/time.ts';

const StatusMap = {
  Requested: '等待审核',
  Cancelled: '已经取消',
  Rejected: '被驳回',
  Processing: '等待结算',
  Reviewing: '正在复核',
  Processed: '结算完成',
  Completed: '领取完成',
  Forfeited: '被冻结',
};
function useAssetOptions(assets: Asset[]) {
  return useMemo(() => {
    return assets.map((asset: Asset) => {
      return {
        value: asset.id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
            <img src={ASSETS_ICONS[asset.symbol] || ''} alt="" width={20} height={20} />
            <span>{asset.symbol}</span>
          </div>
        ),
      };
    });
  }, [assets]);
}

function useWithdrawSelect(assets: Asset[]) {
  const [selectAssetId, setSelectAssetId] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<SldDecimal | null>(null);
  //
  useEffect(() => {
    if (
      (!selectAssetId && assets.length > 0) ||
      (selectAssetId && !assets.map((a) => a.id).some((one) => isSameStrNoCase(one, selectAssetId)))
    ) {
      if (assets.length > 0) {
        setSelectAssetId(assets[0].id);
      }
    }
  }, [assets, selectAssetId]);
  //
  const setSelectAsset = useCallback((assetId: string) => {
    setInputValue(null);
    setSelectAssetId(assetId);
  }, []);
  //
  const selectedAsset: Asset | undefined = useMemo(() => {
    return assets.find((asset) => asset.id === selectAssetId);
  }, [selectAssetId, assets]);

  return {
    setSelectAsset,
    selectedAsset,
    inputValue,
    setInputValue,
  };
}

function useInputLimit(assets: Asset[]) {
  const { setSelectAsset, selectedAsset, inputValue, setInputValue } = useWithdrawSelect(assets);
  const { approved, balance, refresh: refreshBalance } = useLpBalanceAndApprove();

  const needApprove: boolean = useMemo(() => {
    return !!inputValue && inputValue.gtZero() && !!approved && inputValue.gt(approved);
  }, [inputValue, approved]);

  const onMax = useCallback(() => {
    if (!balance) {
      return;
    }
    setInputValue(balance);
  }, [setInputValue, balance]);

  const placeholder = useMemo(() => {
    if (balance && balance.gtZero()) {
      return '可赎回LP数量：' + balance.format({ fix: 6, removeZero: true });
    } else {
      return '数量不足：0.00';
    }
  }, [balance]);

  return {
    setSelectAsset,
    setInputValue,
    inputValue,
    selectedAsset,
    needApprove,
    refreshBalance,
    balance,
    onMax,
    placeholder,
  };
}

function useWithdrawRecords() {
  const { address, isConnected } = useAccount();

  const { result, query } = useList({
    resource: 'requestOrders',
    sorters: [{ order: 'desc', field: 'requestedAt' }],
    filters: [
      { field: 'requester', operator: 'eq', value: address?.toLowerCase() },
      {
        field: 'status',
        operator: 'in',
        value: ['Requested', 'Processing', 'Processed'],
      },
    ],
    queryOptions: {
      enabled: isConnected && isValidAddress(address || ''),
    },
  });

  const orders = result.data as RequestOrder[];

  return { orders, refresh: query.refetch };
}

export const WithdrawPage = () => {
  const styleMr = useStyleMr(styles);
  const { message: messageApi } = AntdApp.useApp();
  const [isInputError, setIsInputError] = useState(false);
  const { underlyingAssets: assets } = useWithdrawUnderlyingAssets();
  const options = useAssetOptions(assets);
  const {
    setSelectAsset,
    selectedAsset,
    inputValue,
    setInputValue,
    needApprove,
    refreshBalance,
    balance,
    onMax,
    placeholder,
  } = useInputLimit(assets);
  const { mutate, isPending, isSuccess, isFinal } = useWithdraw();
  const { orders, refresh: refreshOrders } = useWithdrawRecords();
  const {
    mutate: cancelRequest,
    curCancelId,
    isSuccess: isCancelled,
    isPending: isPendingCancel,
  } = useCancelWithdraw();
  const {
    mutate: claimWithdraw,
    curClaimId,
    isSuccess: isClaimed,
    isPending: isPendingClaim,
  } = useClaimWithdraw();

  useEffect(() => {
    if (isFinal && isSuccess) {
      refreshBalance();
      refreshOrders();
      setInputValue(null);

      messageApi.success('Request Successful!');
    }
  }, [isFinal, isSuccess, messageApi, refreshBalance, setInputValue, refreshOrders]);

  useEffect(() => {
    if (isCancelled) {
      refreshBalance();
      refreshOrders();

      messageApi.success('Cancelled Successful!');
    }
  }, [isCancelled, messageApi, refreshOrders, refreshBalance]);

  useEffect(() => {
    if (isClaimed) {
      refreshOrders();

      messageApi.success('Claimed Successful!');
    }
  }, [isClaimed, refreshOrders, messageApi]);

  const onWithdraw = useCallback(() => {
    if (!selectedAsset || !inputValue || inputValue.isZero()) {
      return;
    }

    mutate(needApprove, selectedAsset, inputValue);
  }, [mutate, needApprove, selectedAsset, inputValue]);

  return (
    <div className={styleMr(styles.withdrawBox)}>
      <DecimalNumInput
        max={balance}
        originDecimal={18}
        value={inputValue === null || inputValue.isZero() ? null : inputValue}
        onChange={setInputValue}
        onErrorChange={setIsInputError}
        placeholder={placeholder}
        prefix={
          <Select
            options={options}
            value={selectedAsset?.id}
            defaultValue={options[0]?.value}
            onChange={setSelectAsset}
            className={styleMr(styles.selection)}
          />
        }
        suffix={
          <Button type="text" onClick={onMax}>
            MAX
          </Button>
        }
      />

      <Button
        type={'primary'}
        size={'large'}
        disabled={isInputError || !inputValue || inputValue.isZero() || isPending}
        className={styleMr(styles.actionButton)}
        onClick={onWithdraw}
      >
        REQUEST WITHDRAW {needApprove && `(APPROVE)`} {isPending && <LoadingOutlined />}
      </Button>

      <div>
        <List
          header={
            <div className={styleMr(styles.listHead)}>
              <span>赎回订单</span>
              <span>
                <Button type={'text'} onClick={() => refreshOrders()}>
                  <ReloadOutlined /> 刷新列表
                </Button>
              </span>
            </div>
          }
          dataSource={orders}
          itemLayout={'horizontal'}
          renderItem={(order: RequestOrder) => {
            return (
              <List.Item
                actions={[
                  <Button
                    disabled={order.status !== 'Requested' || (isPendingCancel && curCancelId == order.id)}
                    onClick={() => cancelRequest(order.id)}
                  >
                    撤销 {isPendingCancel && curCancelId == order.id && <LoadingOutlined />}
                  </Button>,
                  <Button
                    disabled={order.status !== 'Processed' || (isPendingClaim && curClaimId == order.id)}
                    onClick={() => claimWithdraw(order.id)}
                  >
                    领取 {isPendingClaim && curClaimId == order.id && <LoadingOutlined />}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      <span className={styleMr(styles.listNo)}>#{order.id}</span>{' '}
                      <span className={styleMr(styles.listTime)}>
                        提交时间：{formatDatetime(Number(order.requestedAt))}
                      </span>{' '}
                      <Tag>{StatusMap[order.status]}</Tag>
                    </div>
                  }
                  description={
                    <div className={styleMr(styles.listDesc)}>
                      <span className={styleMr(styles.listAsset)}>
                        赎回资产: &nbsp;<span>{order.requestAsset.symbol}</span>
                      </span>

                      <span className={styleMr(styles.listAmount)}>
                        赎回数量(STONEUSD): &nbsp;
                        {SldDecimal.fromOrigin(BigInt(order.requestShares), 18).format({
                          fix: 6,
                          removeZero: true,
                        })}
                      </span>
                    </div>
                  }
                ></List.Item.Meta>
              </List.Item>
            );
          }}
        ></List>
      </div>
    </div>
  );
};
