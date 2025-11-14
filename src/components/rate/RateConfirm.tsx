import { TimeLockExecute } from '../../service/types.ts';
import { Button, Descriptions } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { decodeFunctionData } from 'viem';
import { AbiOracleRegistry } from '../../const/abis/OracleRegistry.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { CheckOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { AbiNoDelayTimelockController } from '../../const/abis/NoDelayTimelockController.ts';
import { ZERO_BYTES32 } from '../../const/contract.ts';
import { useState } from 'react';
import { useCallContractState } from '../../hooks/wallet-write/useCallContract.tsx';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export type RateConfirmProps = { execute: TimeLockExecute; onDone?: () => void };

export const RateConfirm = ({ execute, onDone }: RateConfirmProps) => {
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [isCancel, setIsCancel] = useState<boolean>(false);

  const { mutate, isDisabled } = useCallContractState(onDone);

  const callData = execute.callData[0];
  const { args }: { args: readonly any[] | undefined } = decodeFunctionData({
    abi: AbiOracleRegistry,
    data: callData,
  });
  const [price, isCutOff] = args as [bigint, boolean];
  const priceDec: SldDecimal = SldDecimal.fromOrigin(price, 18);
  const target = execute.target[0];
  const salt = execute.salt ? execute.salt : ZERO_BYTES32;
  const value = BigInt(execute.value[0]);
  //

  //
  const onCancel = () => {
    setIsCancel(true);
    mutate(
      {
        abi: AbiNoDelayTimelockController,
        address: DEPLOYED_CONTRACTS.ADDR_TIMELOCK_0,
        function: 'cancel',
        args: [execute.exHash],
      },
      { gasLimit: BigInt(30000) },
    );
  };
  const onConfirm = () => {
    setIsConfirm(true);
    mutate(
      {
        abi: AbiNoDelayTimelockController,
        address: DEPLOYED_CONTRACTS.ADDR_TIMELOCK_0,
        function: 'execute',
        args: [target, value, callData, execute.predecessorId, salt],
      },
      {
        gasLimit: BigInt(400000),
      },
    );
  };
  //

  return (
    <>
      <Descriptions title="确认价格" bordered={true} column={1}>
        <Descriptions.Item label={'id'}>{execute.exHash}</Descriptions.Item>
        <Descriptions.Item label={'提交时间'}>{formatDatetime(Number(execute.createdAt))}</Descriptions.Item>
        <Descriptions.Item label={'确认间隔'}>{execute.delay}</Descriptions.Item>
        <Descriptions.Item label={'ExchangeRate'}>
          1 SSUSD = <span style={{ color: 'red' }}>{priceDec.format({ fix: 18, removeZero: true })}</span> USD
        </Descriptions.Item>
        <Descriptions.Item label={'是否可结算'}>
          <span style={{ color: 'red' }}>{isCutOff ? '是' : '否'}</span>
        </Descriptions.Item>
        <Descriptions.Item label={'操作'}>
          <div style={{ display: 'flex', columnGap: '10px' }}>
            <Button
              type="primary"
              shape="round"
              icon={<CheckOutlined />}
              size={'middle'}
              onClick={onConfirm}
              disabled={isDisabled}
            >
              提交 {isDisabled && isConfirm ? <LoadingOutlined /> : ''}
            </Button>

            <Button
              type="default"
              shape="round"
              icon={<DeleteOutlined />}
              size={'middle'}
              onClick={onCancel}
              disabled={isDisabled}
            >
              取消 {isDisabled && isCancel ? <LoadingOutlined /> : ''}
            </Button>
          </div>
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};
