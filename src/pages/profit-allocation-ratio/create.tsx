import { Create, TextField, useForm } from "@refinedev/antd";
import { useParams } from "react-router";
import { useCreate, useOne } from "@refinedev/core";
import { Form, Input, InputNumber, message, Select, Typography } from "antd";
import React from "react";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";

const { Title } = Typography;

export const CreateProfitAllocationRatio = () => {
  const { formProps, saveButtonProps } = useForm({});

  let { portfolioId } = useParams();
  if (isNaN(Number(portfolioId))) {
    portfolioId = undefined;
  }

  const { result } = useOne({
    resource: "portfolios",
    id: portfolioId,
    queryOptions: {
      enabled: !!portfolioId,
    },
  });

  const { arr } = usePortfolios(portfolioId == undefined);
  const options = arr.map((one) => ({ label: one.fundAlias, value: one.id }));

  const [messageApi, contextHolder] = message.useMessage();
  const { mutate } = useCreate({ resource: "profit_allocation_ratios" });

  return (
    <Create saveButtonProps={saveButtonProps}>
      {contextHolder}
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: any) => {
          const one = values.toTeam + values.toPlatform + values.toUser;
          if (one !== 100) {
            messageApi.error("分配比例加和要等于100%");

            return;
          }

          const pid = Number(values.portfolioId);

          mutate({
            values: {
              portfolioId: pid,
              allocation: {
                toTeam: values.toTeam * 100,
                toPlatform: values.toPlatform * 100,
                toUser: values.toUser * 100,
              },
            },
          });
        }}
      >
        <Form.Item hidden={portfolioId == undefined}>
          <Title level={5}>{"投资组合"}</Title>
          <TextField value={result?.fundAlias} />
        </Form.Item>

        <Form.Item
          name={"portfolioId"}
          label={"投资组合"}
          rules={[{ required: true }]}
          initialValue={portfolioId}
          hidden={portfolioId !== undefined}
        >
          {portfolioId == undefined ? (
            <Select options={options} style={{ width: "150px" }} />
          ) : (
            <Input />
          )}
        </Form.Item>

        <Form.Item
          label={"用户比例"}
          name={"toUser"}
          rules={[{ required: true }]}
        >
          <InputNumber
            precision={2}
            max={100}
            suffix={"%"}
            style={{ width: "150px" }}
          />
        </Form.Item>

        <Form.Item
          label={"平台比例"}
          name={"toPlatform"}
          rules={[{ required: true }]}
        >
          <InputNumber
            precision={2}
            max={100}
            suffix={"%"}
            style={{ width: "150px" }}
          />
        </Form.Item>

        <Form.Item
          label={"团队比例"}
          name={"toTeam"}
          rules={[{ required: true }]}
        >
          <InputNumber
            precision={2}
            max={100}
            suffix={"%"}
            style={{ width: "150px" }}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
