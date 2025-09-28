import { Edit, TextField, useForm } from "@refinedev/antd";
import { Form, Select, Typography } from "antd";
import React from "react";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { useUpdate } from "@refinedev/core";
const { Title } = Typography;

export const PortfolioEdit = () => {
  const { formProps, query, saveButtonProps } = useForm({});
  const record = query?.data?.data;
  const { arr } = useTeamMap();
  const options = arr.map((team) => {
    return { label: team.name, value: team.id };
  });

  const { mutate } = useUpdate({
    resource: "portfolios",
    id: record?.id,
    meta: {
      subPath: "team",
      method: "patch",
    },
    mutationOptions: {},
  });

  const onChangeTeam = (id: string | number) => {
    console.log("id =", id);
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values) => {
          mutate({ values: values });
        }}
      >
        <Title level={5}>{"ID"}</Title>
        <TextField value={record?.id} />

        <Title level={5}>{"投资组合"}</Title>
        <TextField value={record?.fundName} />

        <Title level={5}>{"子账号"}</Title>
        <TextField value={record?.accountName} />

        <Title level={5}>{"Ceffu Wallet"}</Title>
        <TextField value={record?.ceffuWalletName} />

        <Title level={5}>{"所属团队"}</Title>
        <Form.Item
          name={"teamId"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select options={options} onChange={onChangeTeam}></Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};
