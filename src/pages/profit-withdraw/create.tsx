import { Create, useForm } from "@refinedev/antd";
import React, { useEffect, useState } from "react";
import { Col, Form, Input, InputNumber, Row, Select, message } from "antd";
import { FromTypes } from "./util.tsx";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";
import {
  ASSETS_SELECT_OPTIONS,
  CHAIN_SELECT_OPTIONS,
} from "../../const/form.tsx";
import {
  getTxTimestamp,
  isSupportedChainId,
  isTxHash,
} from "../../util/chain.ts";
import { SupportedChainType } from "../../const/chain-rpc.ts";
import { useCreate, useNavigation } from "@refinedev/core";
import { formatDatetime } from "../../util/time.ts";

export const CreateProfitWithdrawal = () => {
  const { formProps, saveButtonProps } = useForm({});
  const { arr: teams } = useTeamMap();
  const { arr: portfolios } = usePortfolios();
  const [txTime, setTxTime] = useState<number | null>(null);

  const teamOptions = teams.map((team) => {
    return {
      value: team.id,
      label: team.name,
    };
  });

  const { form } = formProps;
  const fromVal = Form.useWatch("from", form);
  const fromTeamVal = Form.useWatch("fromTeamId", form);
  const txHash: string | undefined = Form.useWatch("transactionHash", form);
  const chainId: string | undefined = Form.useWatch("chainId", form);

  const { list } = useNavigation();
  const { mutate } = useCreate({ resource: "profit_withdrawals" });
  const [messageApi, messageContext] = message.useMessage();

  //
  useEffect(() => {
    if (txHash && isTxHash(txHash) && chainId && isSupportedChainId(chainId)) {
      getTxTimestamp(chainId as SupportedChainType, txHash as `0x${string}`)
        .then((time) => {
          console.log("time is", time);
          setTxTime(time);
        })
        .catch((err) => {
          console.log("err", err);
        });
    }
  }, [txHash, chainId]);

  //
  const fromPortfoliosOpts = portfolios
    .filter((p) => p.teamId == fromTeamVal)
    .map((p) => {
      return {
        value: p.id,
        label: p.fundAlias,
      };
    });

  const handleFromTeamChange = () => {
    form?.setFieldsValue({ portfolioId: undefined });
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      {messageContext}
      <Form
        {...formProps}
        layout="horizontal"
        onFinish={(values: any) => {
          console.log(values);
          if (!txTime) {
            messageApi.error("无法获取交易时间，请检查TxHash和ChainId是否正确");
            return;
          }

          const finalValues = {
            from: values.from,
            portfolioId: values.portfolioId || null,
            transactionHash: values.transactionHash,
            chainId: values.chainId,
            transactionTime: Number(txTime),
            assets: values.assets,
            assetsAmount: values.assetsAmount,
            usdValue: values.usdValue.toString(),
          };

          mutate(
            {
              values: finalValues,
            },
            {
              onSuccess: () => {
                list("profit_withdrawals");
              },
            },
          );
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="From"
              name={"from"}
              labelCol={{ span: 4 }}
              rules={[{ required: true }]}
            >
              <Select options={FromTypes}></Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name={"fromTeamId"}
              hidden={fromVal !== "team_portfolio"}
              rules={[
                {
                  validator(_, value) {
                    if (fromVal == "team_portfolio" && !value) {
                      return Promise.reject(new Error("请选择团队"));
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
                hidden={fromVal !== "team_portfolio"}
                name={"portfolioId"}
                rules={[
                  {
                    validator(_, value) {
                      if (fromVal == "team_portfolio" && !value) {
                        return Promise.reject(new Error("请选择投组"));
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
              labelCol={{ span: 4 }}
              name={"transactionHash"}
              label={"TxHash"}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name={"chainId"} rules={[{ required: true }]}>
              <Select options={CHAIN_SELECT_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <div
              style={{ display: "flex", height: "32px", alignItems: "center" }}
            >
              Transfer At: {txTime ? formatDatetime(txTime) : ""}
            </div>
          </Col>
        </Row>

        <Form.Item
          label={"Token种类"}
          name="assets"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 4 }}
          rules={[{ required: true }]}
        >
          <Select options={ASSETS_SELECT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label={"Token数量"}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 4 }}
          name={"assetsAmount"}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label={"USD价值"}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 4 }}
          name={"usdValue"}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Create>
  );
};
