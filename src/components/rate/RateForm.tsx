import { InputNumber, Button, Checkbox, CheckboxChangeEvent } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { cssPick, StyleMerger } from '../../util/css.ts';
import styles from './RateForm.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { useUpdatePriceCallData } from '../../hooks/contract/useUpdatePriceCallData.tsx';
import { AbiNoDelayTimelockController } from '../../const/abis/NoDelayTimelockController.ts';
import { ZERO_BYTES32 } from '../../const/contract.ts';
import { generatePrivateKey } from 'viem/accounts';
import { LoadingOutlined } from '@ant-design/icons';
import { useCallContractState } from '../../hooks/wallet-write/useCallContract.tsx';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { useEstimateLiabilities } from '../../hooks/combine/useEstimateLiabilities.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { formatDatetime } from '../../util/time.ts';

type RateFormProps = {
  onDone: () => void;
  onChange?: (rate: number | undefined) => void;
};

export const RateForm = ({ onDone, onChange }: RateFormProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const [rate, setRate] = useState<number | null>(null);
  const [isCutOff, setCutOff] = useState<boolean>(true);
  const [confirmed, setConfirm] = useState<boolean>(false);

  const rateDecimal = useMemo(() => {
    return rate ? SldDecimal.fromNumeric(rate.toString(), 18) : null;
  }, [rate]);

  const { liabilities, time } = useEstimateLiabilities(rateDecimal);

  //
  const rateStr: string = rate ? String(rate) : '0';
  const callData: `0x${string}` = useUpdatePriceCallData(rateStr, isCutOff);
  const { mutate, isDisabled } = useCallContractState(onDone);

  //
  const rChange = useCallback(
    (val: number | null): void => {
      setRate(val);
      if (onChange) {
        onChange(val || undefined);
      }
    },
    [onChange],
  );
  //
  const cChange = (e: CheckboxChangeEvent): void => {
    setCutOff(e.target.checked as boolean);
  };
  //
  const onConfirm = (): void => {
    if (rate == null) {
      return;
    }

    setConfirm(true);
  };
  //
  const onSubmit = (): void => {
    const salt = generatePrivateKey();
    const args: any[] = [DEPLOYED_CONTRACTS.ADDR_ORACLE, 0n, callData, ZERO_BYTES32, salt, 0n];

    mutate({
      abi: AbiNoDelayTimelockController,
      address: DEPLOYED_CONTRACTS.ADDR_TIMELOCK_0,
      function: 'schedule',
      args,
    });
  };
  //

  return (
    <div className={styleMr(styles.formArea)}>
      <div className={styleMr(styles.inputArea)}>
        {/* 填表单 */}
        <div className={styleMr(styles.box, cssPick(confirmed, styles.hide))}>
          <InputNumber addonAfter={'USD'} addonBefore={'1 SSUSD ='} onChange={rChange} />
          <Checkbox checked={isCutOff} disabled={false}>
            是否用于结算价格
          </Checkbox>
          <div>
            <span>预估负债：{liabilities.format({ sign: true })}</span>
            <br />
            <span className={styleMr(styles.descText)}>(基于{formatDatetime(time || 0)}快照数据)</span>
          </div>
          <Button type="primary" onClick={onConfirm}>
            确定
          </Button>
        </div>

        {/* 确认表单 */}
        <div className={styleMr(styles.box, cssPick(!confirmed, styles.hide))}>
          <div className={styleMr(styles.displayBox)}>
            <div className={styleMr(styles.price)}>
              1 SSUSD = <span style={{ color: 'red' }}>{rateStr}</span> USD
            </div>

            <div className={styleMr(styles.cutOff)}>
              是否可用于结算：<span style={{ color: 'red' }}>{isCutOff ? '是' : '否'}</span>
            </div>

            <div className={styleMr(styles.submit)}>
              <Button onClick={() => setConfirm(false)}>重置</Button>
            </div>
          </div>

          <div>
            <span>预估负债：{liabilities.format({ sign: true })}</span> <br />
            <span className={styleMr(styles.descText)}>(基于{formatDatetime(time || 0)}快照数据)</span>
          </div>

          <Button type="primary" onClick={onSubmit} disabled={isDisabled}>
            提交 {isDisabled ? <LoadingOutlined /> : ''}
          </Button>
        </div>
      </div>
    </div>
  );
};
