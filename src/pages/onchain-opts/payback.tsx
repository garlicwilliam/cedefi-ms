import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './payback.module.scss';
import { DecimalNumInput } from '../../components/input/num-input-decimal.tsx';
import { Asset } from '../../service/types.ts';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ASSETS_ICONS } from '../../const/const.ts';
import { Button } from 'antd';
import { useUserTokenApproved } from '../../hooks/contract/useUserPaybackInfo.tsx';
import { useUserDepositBalance } from '../../hooks/contract/useUserDepositInfo.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { useWithdrawUnderlyingAssets } from '../../hooks/contract/useUnderlyings.tsx';
import { usePayback } from '../../hooks/contract/usePayback.tsx';
import { LoadingOutlined } from '@ant-design/icons';
import { App as AntApp } from 'antd';

function useAssetLabels(assets: Asset[]) {
  return useMemo(() => {
    return assets.reduce(
      (acc, asset: Asset) => {
        acc[asset.id] = (
          <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
            <img src={ASSETS_ICONS[asset.symbol] || ''} alt="" width={20} height={20} />
            <span>{asset.symbol}</span>
          </div>
        );

        return acc;
      },
      {} as { [s: string]: ReactNode },
    );
  }, [assets]);
}

function useInput(assetBalanceMap: { [a: string]: SldDecimal }, allowanceMap: { [a: string]: SldDecimal }) {
  const [inputMap, setInputMap] = useState<{ [s: string]: SldDecimal }>({});
  const [hasError, setHasError] = useState<{ [s: string]: boolean }>({});

  //
  const setAssetInput = useCallback(
    (assetId: string, value: SldDecimal | null) => {
      setInputMap(Object.assign({}, inputMap, { [assetId]: value || SldDecimal.ZERO }));
    },
    [inputMap],
  );
  //
  const setInputError = useCallback(
    (assetId: string, isError: boolean) => {
      setHasError(Object.assign({}, hasError, { [assetId]: isError }));
    },
    [hasError],
  );
  //
  const onMax = useCallback(
    (assetId: string) => {
      const balance = assetBalanceMap[assetId];
      setAssetInput(assetId, balance);
    },
    [assetBalanceMap, setAssetInput],
  );

  const needApproveMap = useMemo(() => {
    return Object.keys(inputMap).reduce(
      (acc, assetId) => {
        const inputVal = inputMap[assetId];
        const allowance = allowanceMap[assetId];
        acc[assetId] = inputVal.gtZero() && inputVal.gt(allowance);
        return acc;
      },
      {} as { [s: string]: boolean },
    );
  }, [allowanceMap, inputMap]);

  //
  const placeholderMap = useMemo(() => {
    return Object.keys(assetBalanceMap).reduce(
      (acc, assetId) => {
        const b = assetBalanceMap[assetId].format({ fix: 6, removeZero: true });
        acc[assetId] = `钱包余额：${b}`;
        return acc;
      },
      {} as { [s: string]: string },
    );
  }, [assetBalanceMap]);

  //
  return {
    inputMap,
    hasError,
    onMax,
    setAssetInput,
    setInputError,
    setInputMap,
    needApproveMap,
    placeholderMap,
  };
}

export const PaybackPage = () => {
  const styleMr = useStyleMr(styles);
  const { message: messageApi } = AntApp.useApp();
  const { underlyingAssets: assets } = useWithdrawUnderlyingAssets();
  const tokenLabels = useAssetLabels(assets);
  const { allowanceMap, refresh: refreshApproved } = useUserTokenApproved(assets);
  const { balanceMap, refresh: refreshBalances } = useUserDepositBalance(assets);
  const { inputMap, hasError, onMax, setAssetInput, setInputMap, setInputError, needApproveMap, placeholderMap } = useInput(
    balanceMap,
    allowanceMap,
  );
  //
  const hasApprove: boolean = useMemo(() => Object.values(needApproveMap).some(Boolean), [needApproveMap]);
  const isError: boolean = useMemo(() => Object.values(hasError).some(Boolean), [hasError]);
  const hasInput: boolean = useMemo(() => Object.values(inputMap).some((v) => v.gtZero()), [inputMap]);
  //

  const { mutate, isSuccess, isPending, isFinal } = usePayback();
  const onPay = useCallback(() => mutate(needApproveMap, inputMap), [inputMap, needApproveMap, mutate]);

  useEffect(() => {
    if (isFinal && isSuccess === true) {
      setInputMap({});
      refreshApproved();
      refreshBalances();

      messageApi.success('Request Successful!');
    }
  }, [isFinal, isSuccess, setInputMap, refreshApproved, refreshBalances, messageApi]);

  return (
    <div className={styleMr(styles.box)}>
      {assets.map((asset: Asset) => {
        return (
          <DecimalNumInput
            key={asset.id}
            originDecimal={asset.decimals}
            max={balanceMap[asset.id]}
            value={inputMap[asset.id] && inputMap[asset.id].gtZero() ? inputMap[asset.id] : null}
            placeholder={placeholderMap[asset.id]}
            prefix={tokenLabels[asset.id]}
            onChange={(val) => setAssetInput(asset.id, val)}
            onErrorChange={(isError) => setInputError(asset.id, isError)}
            suffix={
              <Button type="text" onClick={() => onMax(asset.id)}>
                MAX
              </Button>
            }
          />
        );
      })}

      <Button
        type={'primary'}
        disabled={isError || !hasInput || isPending}
        className={styleMr(styles.actionButton)}
        size={'large'}
        onClick={onPay}
      >
        PAYBACK {hasApprove && `(APPROVE)`} {isPending && <LoadingOutlined />}
      </Button>
    </div>
  );
};
