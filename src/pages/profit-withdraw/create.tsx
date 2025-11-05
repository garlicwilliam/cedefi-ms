import { Create, useForm } from '@refinedev/antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Form, Input, InputNumber, Row, Select, message } from 'antd';
import { FromTypes } from './util.tsx';
import { useTeamMap } from '../../hooks/useTeamMap.tsx';
import { usePortfolios } from '../../hooks/usePortfolios.tsx';
import { ASSETS_SELECT_OPTIONS, CHAIN_SELECT_OPTIONS } from '../../const/form.tsx';
import { getTxTimestamp, isSupportedChainId, isTxHash } from '../../util/chain.ts';
import { SupportedChainIDsType } from '../../const/chain-rpc.ts';
import { useCreate, useNavigation } from '@refinedev/core';
import { formatDatetime } from '../../util/time.ts';
import { App as AntApp } from 'antd';

export const CreateProfitWithdrawal = () => {
  const { formProps, saveButtonProps } = useForm({});
  const { arr: teams } = useTeamMap();
  const { arr: portfolios } = usePortfolios();
  const [txTime, setTxTime] = useState<number | null>(null);
  const { message: messageApi } = AntApp.useApp();

  const teamOptions = teams.map((team) => {
    return {
      value: team.id,
      label: team.name,
    };
  });

  const { form } = formProps;
  const fromVal = Form.useWatch('from', form);
  const fromTeamVal = Form.useWatch('fromTeamId', form);
  const txHash: string | undefined = Form.useWatch('transactionHash', form);
  const chainId: number | undefined = Form.useWatch('chainId', form);

  const { list } = useNavigation();
  const { mutate } = useCreate({ resource: 'profit_withdrawals' });

  // Fetch transaction time when txHash or chainId changes
  useEffect(() => {
    if (txHash && isTxHash(txHash) && chainId && isSupportedChainId(Number(chainId))) {
      getTxTimestamp(chainId as SupportedChainIDsType, txHash as `0x${string}`)
        .then((time) => {
          setTxTime(time);
        })
        .catch((err) => {
          console.log('err', err);
        });
    }
  }, [txHash, chainId]);

  // Filtered portfolios based on selected team
  const fromPortfoliosOpts = useMemo(() => {
    return portfolios
      .filter((p) => p.teamId == fromTeamVal)
      .map((p) => {
        return {
          value: p.id,
          label: p.fundAlias,
        };
      });
  }, [portfolios, fromTeamVal]);

  //
  const handleFromTeamChange = useCallback(() => {
    form?.setFieldsValue({ portfolioId: undefined });
  }, [form]);

  const onSubmit = useCallback(
    (values: any) => {
      if (!txTime) {
        messageApi.error('无法获取交易时间，请检查TxHash和ChainId是否正确');
        return;
      }

      const finalValues = {
        from: values.from,
        portfolioId: values.portfolioId || null,
        transactionHash: values.transactionHash,
        chainId: String(values.chainId),
        transactionTime: Number(txTime),
        assets: String(values.assets),
        assetsAmount: String(values.assetsAmount),
        usdValue: String(values.usdValue),
      };

      mutate({ values: finalValues }, { onSuccess: () => list('profit_withdrawals') });
    },
    [messageApi, list, mutate, txTime],
  );

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="horizontal" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="账户类型" name={'from'} labelCol={{ span: 6 }} rules={[{ required: true }]}>
              <Select options={FromTypes}></Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={'fromTeamId'}
              hidden={fromVal !== 'team_portfolio'}
              rules={[
                {
                  validator(_, value) {
                    if (fromVal == 'team_portfolio' && !value) {
                      return Promise.reject(new Error('请选择团队'));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select options={teamOptions} onChange={handleFromTeamChange} />
            </Form.Item>
          </Col>
          <>
            <Col span={6}>
              <Form.Item
                hidden={fromVal !== 'team_portfolio'}
                name={'portfolioId'}
                rules={[
                  {
                    validator(_, value) {
                      if (fromVal == 'team_portfolio' && !value) {
                        return Promise.reject(new Error('请选择投组'));
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select options={fromPortfoliosOpts} />
              </Form.Item>
            </Col>
          </>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true }]}
              labelCol={{ span: 6 }}
              name={'transactionHash'}
              label={'转账TxHash'}
              extra={'提取收益的交易Hash，系统会自动读取交易时间'}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name={'chainId'} rules={[{ required: true }]}>
              <Select options={CHAIN_SELECT_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <div style={{ display: 'flex', height: '32px', alignItems: 'center' }}>Transfer At: {txTime ? formatDatetime(txTime) : ''}</div>
          </Col>
        </Row>

        <Form.Item label={'Token种类'} name="assets" labelCol={{ span: 3 }} wrapperCol={{ span: 4 }} rules={[{ required: true }]}>
          <Select options={ASSETS_SELECT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label={'Token数量'}
          extra={'实际发给提取人的token数量'}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 4 }}
          name={'assetsAmount'}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label={'USD价值'}
          extra={'会从账户余额中扣除相应的USD余额'}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 4 }}
          name={'usdValue'}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Create>
  );
};
