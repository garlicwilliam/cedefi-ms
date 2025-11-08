import { DecimalNumInput } from '../../components/input/num-input-decimal.tsx';
import { useDepositUnderlyingAssets } from '../../hooks/contract/useUnderlyings.tsx';
import { Asset } from '../../service/types.ts';
import { Button, Select } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './deposit.module.scss';
import { ASSETS_ICONS } from '../../const/const.ts';
import { StyleMerger } from '../../util/css.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserDepositApproved, useUserDepositBalance } from '../../hooks/contract/useUserDepositInfo.tsx';
import { isSameStrNoCase } from '../../util/string.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { LoadingOutlined } from '@ant-design/icons';
import { App as AntdApp } from 'antd';
import { useDeposit } from '../../hooks/contract/useDeposit.tsx';

type InputValue = {
  asset: Asset;
  value: SldDecimal;
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

function useDepositSelect(assets: Asset[], assetsBalances: { asset: Asset; balance: SldDecimal }[]) {
  const [selectAssetId, setSelectAssetId] = useState<string | undefined>(undefined);

  // auto select
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
  const selectedAsset: Asset | undefined = useMemo(() => {
    return assets.find((asset) => asset.id === selectAssetId);
  }, [selectAssetId, assets]);

  //
  const curAssetBalance: SldDecimal = useMemo(() => {
    const b = assetsBalances.find((one) => isSameStrNoCase(one.asset.id, selectAssetId || ''));
    return b ? b.balance : SldDecimal.ZERO;
  }, [assetsBalances, selectAssetId]);

  const placeholder: string = useMemo(() => {
    return curAssetBalance.isZero()
      ? '余额不足 0.00'
      : '钱包余额: ' + curAssetBalance.format({ fix: selectedAsset?.decimals, removeZero: true });
  }, [curAssetBalance, selectedAsset]);

  return {
    selectAssetId,
    setSelectAssetId,
    selectedAsset,
    curAssetBalance,
    placeholder,
  };
}

function useDepositInput(selectedAsset: Asset | undefined, assetAllowances: { asset: Asset; allowance: SldDecimal }[]) {
  const [inputValue, setInputValue] = useState<InputValue | null>(null);
  const [needApprove, setNeedApprove] = useState(false);
  const curAllowance: SldDecimal = useMemo(() => {
    const curAllow = assetAllowances.find((a) => isSameStrNoCase(a.asset.id, selectedAsset?.id || ''));
    return curAllow ? curAllow.allowance : SldDecimal.ZERO;
  }, [assetAllowances, selectedAsset]);

  useEffect(() => {
    const need: boolean = !!inputValue && !!inputValue.value && inputValue.value.gtZero() && curAllowance.lt(inputValue.value);
    setNeedApprove(need);
  }, [inputValue, curAllowance]);

  const setInput = useCallback(
    (inputVal: SldDecimal | null) => {
      if (!selectedAsset) {
        return;
      }

      setInputValue(
        inputVal === null
          ? null
          : {
              asset: selectedAsset,
              value: inputVal,
            },
      );
    },
    [selectedAsset],
  );

  return {
    needApprove,
    inputValue,
    setInput,
  };
}

function useActions(setInput: (v: SldDecimal | null) => void, setSelectAssetId: (id?: string) => void, curAssetBalance: SldDecimal) {
  const onMax = useCallback((): void => {
    setInput(curAssetBalance);
  }, [curAssetBalance, setInput]);

  const onSelectAsset = useCallback(
    (assetId: string) => {
      setSelectAssetId(assetId);
      setInput(null);
    },
    [setSelectAssetId, setInput],
  );

  return { onMax, onSelectAsset };
}

export const DepositPage = () => {
  const { underlyingAssets: assets } = useDepositUnderlyingAssets();
  const { message: messageApi } = AntdApp.useApp();
  const [isInputError, setIsInputError] = useState(false);
  //
  const styleMr: StyleMerger = useStyleMr(styles);
  const { assetBalances, refresh: refreshBalance } = useUserDepositBalance(assets);
  const { assetAllowances, refresh: refreshApprove } = useUserDepositApproved(assets);
  const { curAssetBalance, selectedAsset, selectAssetId, setSelectAssetId, placeholder } = useDepositSelect(assets, assetBalances);
  const depositAssetsOpts = useAssetOptions(assets);
  const { inputValue, setInput, needApprove } = useDepositInput(selectedAsset, assetAllowances);
  const { mutate: mutate2, isSuccess, isFinal, isPending } = useDeposit(needApprove, selectedAsset, inputValue?.value || null);
  const { onMax, onSelectAsset } = useActions(setInput, setSelectAssetId, curAssetBalance);
  //

  useEffect(() => {
    if (isFinal && isSuccess) {
      refreshApprove();
      refreshBalance();
      setInput(null);

      messageApi.success('Deposit Successful!');
    }
  }, [isFinal, isSuccess, refreshApprove, refreshBalance, messageApi, setInput]);

  //
  const onDeposit = useCallback((): void => {
    if (!selectedAsset || !inputValue || inputValue.value.isZero() || inputValue.asset.id !== selectedAsset.id) {
      return;
    }
    mutate2();
  }, [mutate2, selectedAsset, inputValue]);
  //

  return (
    <div className={styleMr(styles.depositBox)}>
      <DecimalNumInput
        originDecimal={selectedAsset?.decimals || 18}
        max={curAssetBalance}
        placeholder={placeholder}
        value={inputValue === null || inputValue.value.isZero() ? null : inputValue.value}
        onChange={setInput}
        onErrorChange={setIsInputError}
        prefix={
          <Select
            value={selectAssetId}
            defaultValue={depositAssetsOpts[0]?.value}
            className={styleMr(styles.selection)}
            options={depositAssetsOpts}
            onChange={onSelectAsset}
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
        disabled={!inputValue || inputValue.value.isZero() || isInputError || isPending}
        className={styleMr(styles.actionButton)}
        onClick={onDeposit}
      >
        DEPOSIT {needApprove ? '(APPROVE)' : ''} {isPending && <LoadingOutlined />}
      </Button>
    </div>
  );
};
