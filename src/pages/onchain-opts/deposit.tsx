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
import { DepositExeStep, useDoDeposit } from '../../hooks/contract/useDoDeposit.tsx';
import { LoadingOutlined } from '@ant-design/icons';
import { App as AntdApp } from 'antd';

type InputValue = {
  asset: Asset;
  value: SldDecimal;
};

export const DepositPage = () => {
  const { underlyingAssets: assets } = useDepositUnderlyingAssets();
  const { message: messageApi } = AntdApp.useApp();

  const [selectAssetId, setSelectAssetId] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<InputValue | null>(null);
  const [needApprove, setNeedApprove] = useState(false);
  const [isInputError, setIsInputError] = useState(false);
  //
  const styleMr: StyleMerger = useStyleMr(styles);
  const { assetBalances, refresh: refreshBalance } = useUserDepositBalance(assets);
  const { assetAllowances, refresh: refreshApprove } = useUserDepositApproved(assets);
  //
  const curAssetBalance: SldDecimal = useMemo(() => {
    const s = assetBalances.find((one) => isSameStrNoCase(one.asset.id, selectAssetId || ''));
    if (s) {
      return s.balance;
    }
    return SldDecimal.ZERO;
  }, [assetBalances, selectAssetId]);
  const selectedAsset: Asset | undefined = useMemo(() => {
    return assets.find((one) => isSameStrNoCase(one.id, selectAssetId || ''));
  }, [selectAssetId, assets]);
  const depositAssetsOpts = useMemo(() => {
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
  const placeholder: string = useMemo(() => {
    return curAssetBalance.isZero()
      ? '余额不足 0.00'
      : '钱包余额: ' + curAssetBalance.format({ fix: selectedAsset?.decimals, removeZero: true });
  }, [curAssetBalance, selectedAsset]);
  //
  const { mutate, executing, step } = useDoDeposit(needApprove, selectedAsset, inputValue?.value || null);
  //
  useEffect(() => {}, [selectAssetId]);
  // 默认/自动选中资产
  useEffect(() => {
    if (!selectAssetId && assets.length > 0) {
      setSelectAssetId(assets[0].id);
    } else if (assets.length > 0 && !assets.some((one) => one.id === selectAssetId)) {
      setSelectAssetId(assets[0].id);
    }
  }, [assets, selectAssetId]);
  //
  useEffect(() => {
    if (!selectedAsset || assetAllowances.length === 0) {
      return;
    }

    const allowanceInfo = assetAllowances.find((one) => isSameStrNoCase(one.asset.id, selectedAsset.id));

    if (allowanceInfo) {
      console.log('allowanceInfo', inputValue, allowanceInfo.allowance);
      if (inputValue && inputValue.value.gtZero() && allowanceInfo.allowance.lt(inputValue.value)) {
        setNeedApprove(true);
      } else {
        console.log('set need approve false');
        setNeedApprove(false);
      }
    }
  }, [selectedAsset, assetAllowances, inputValue]);
  //
  useEffect(() => {
    if (!executing && step === DepositExeStep.DONE) {
      refreshApprove();
      refreshBalance();
      setInputValue(null);

      messageApi.success('Deposit Successful!');
    }
  }, [executing, step, refreshApprove, refreshBalance, messageApi]);
  //
  const onMax = useCallback((): void => {
    if (!selectedAsset) {
      return;
    }

    setInputValue({
      asset: selectedAsset,
      value: curAssetBalance,
    });
  }, [selectedAsset, curAssetBalance]);
  //
  const onInputChange = useCallback(
    (value: SldDecimal | null) => {
      if (!selectedAsset) {
        return;
      }

      setInputValue({
        asset: selectedAsset,
        value: value || SldDecimal.ZERO,
      });
    },
    [selectedAsset],
  );
  //
  const onError = useCallback((isError: boolean) => {
    setIsInputError(isError);
  }, []);
  //
  const onSelectAsset = useCallback((assetId: string) => {
    setSelectAssetId(assetId);
    setInputValue(null);
  }, []);
  //
  const onDeposit = useCallback((): void => {
    if (!selectedAsset || !inputValue || inputValue.value.isZero() || inputValue.asset.id !== selectedAsset.id) {
      return;
    }

    mutate();
  }, [mutate, selectedAsset, inputValue]);
  //

  return (
    <div className={styleMr(styles.depositBox)}>
      <DecimalNumInput
        originDecimal={selectedAsset?.decimals || 18}
        max={curAssetBalance}
        placeholder={placeholder}
        value={inputValue === null || inputValue.value.isZero() ? null : inputValue.value}
        onChange={onInputChange}
        onErrorChange={onError}
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
        disabled={!inputValue || inputValue.value.isZero() || isInputError || executing}
        className={styleMr(styles.actionButton)}
        onClick={onDeposit}
      >
        DEPOSIT {needApprove ? '(APPROVE)' : ''} {executing && <LoadingOutlined />}
      </Button>
    </div>
  );
};
