import { Col, Form, Row, Select, Input, InputNumber } from "antd";
import { Create, useForm } from "@refinedev/antd";
import React from "react";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";
import { FromTypes } from "./util.ts";
import { Portfolio } from "../../service/types.ts";
import { useCreate, useNavigation } from "@refinedev/core";

export const CreateProfitReallocation = () => {
  const { formProps, saveButtonProps } = useForm({});
  const { arr: teams } = useTeamMap();
  const { arr: portfolios } = usePortfolios();
  const teamOptions = teams.map((team) => {
    return {
      value: team.id,
      label: team.name,
    };
  });
  const { list } = useNavigation();
  const { mutate } = useCreate();

  const { form } = formProps;
  const fromVal = Form.useWatch("from", form);
  const fromTeamVal = Form.useWatch("fromTeamId", form);
  const fromPortfolioIdVal = Form.useWatch("fromPortfolioId", form);
  const toVal = Form.useWatch("to", form);
  const toTeamVal = Form.useWatch("toTeamId", form);

  const fromPortfoliosOpts = portfolios
    .filter((p) => p.teamId == fromTeamVal)
    .map((p) => {
      return {
        value: p.id,
        label: p.fundAlias,
      };
    });

  const toPortfoliosOpts = portfolios
    .filter((p: Portfolio) => p.teamId == toTeamVal)
    .map((p: Portfolio) => {
      return {
        value: p.id,
        label: p.fundAlias,
      };
    });

  const handleFromTeamChange = () => {
    form?.setFieldsValue({ fromPortfolioId: undefined });
  };

  const handleToTeamChange = () => {
    form?.setFieldsValue({ toPortfolioId: undefined });
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <div style={{ lineHeight: 2, paddingBottom: "16px" }}>
        该操作会将历史累计收益余额重新分配，请谨慎
      </div>
      <Form
        {...formProps}
        layout="horizontal"
        onFinish={(values: any) => {
          const submitValues = {
            from: values.from,
            to: values.to,
            fromPortfolioId: values.fromPortfolioId || null,
            toPortfolioId: values.toPortfolioId || null,
            usdValue: values.usdValue.toString(),
            reason: values.reason,
          };
          mutate(
            {
              resource: "profit_reallocations",
              values: submitValues,
            },
            {
              onSuccess: () => {
                list("profit_reallocations");
              },
            },
          );
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              labelCol={{ span: 4 }}
              label={"From"}
              name={"from"}
              rules={[{ required: true }]}
            >
              <Select options={FromTypes} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              hidden={fromVal !== "team_portfolio"}
              name={"fromTeamId"}
              rules={[
                {
                  validator(_, value) {
                    if (fromVal === "team_portfolio" && !value) {
                      return Promise.reject(new Error("请选择团队"));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select onChange={handleFromTeamChange} options={teamOptions} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              hidden={fromVal !== "team_portfolio"}
              name={"fromPortfolioId"}
              rules={[
                {
                  validator(_, value) {
                    if (fromVal === "team_portfolio" && !value) {
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              labelCol={{ span: 4 }}
              label={"To"}
              name={"to"}
              rules={[
                { required: true },
                {
                  validator(_, value) {
                    if (
                      value === fromVal &&
                      (value === "platform" || value === "user")
                    ) {
                      return Promise.reject(new Error("不能和From相同"));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select options={FromTypes} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              hidden={toVal !== "team_portfolio"}
              name={"toTeamId"}
              rules={[
                {
                  validator(_, value) {
                    if (toVal === "team_portfolio" && !value) {
                      return Promise.reject(new Error("请选择团队"));
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select onChange={handleToTeamChange} options={teamOptions} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              hidden={toVal !== "team_portfolio"}
              name={"toPortfolioId"}
              rules={[
                {
                  validator(_, value) {
                    if (toVal === "team_portfolio" && !value) {
                      return Promise.reject(new Error("请选择投组"));
                    }

                    if (
                      fromVal === "team_portfolio" &&
                      toVal === "team_portfolio" &&
                      fromTeamVal === toTeamVal
                    ) {
                      if (fromPortfolioIdVal === value) {
                        return Promise.reject(new Error("不能和From相同"));
                      }
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select allowClear={true} options={toPortfoliosOpts} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={"金额(USD)"}
          name={"usdValue"}
          labelCol={{ span: 2 }}
          rules={[{ required: true }]}
        >
          <InputNumber suffix={"USD"} style={{ width: "150px" }} min={0} />
        </Form.Item>

        <Form.Item
          label={"原因"}
          name={"reason"}
          labelCol={{ span: 2 }}
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Create>
  );
};
