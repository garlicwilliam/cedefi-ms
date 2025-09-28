import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import React from "react";

export const CreateBlacklist = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"地址"}
          name={["address"]}
          rules={[
            { required: true },
            {
              pattern: /^0x[a-fA-F0-9]{40}$/,
              message: "请输入有效的以太坊地址",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label={"备注"} name={["note"]} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};
