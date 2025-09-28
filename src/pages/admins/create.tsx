import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Checkbox } from "antd";
import React from "react";
import { usePermissions } from "../../hooks/usePermissions.tsx";

export const CreateAdmin = () => {
  const { formProps, saveButtonProps } = useForm({});

  const { arr: permissions } = usePermissions();
  const options = permissions.map((item) => {
    return {
      label: item.label,
      value: item.id,
    };
  });

  //
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Email"}
          name={["email"]}
          rules={[{ required: true }, { type: "email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={"权限"}
          name={"permissions"}
          rules={[{ required: true }]}
        >
          <Checkbox.Group options={options}></Checkbox.Group>
        </Form.Item>
      </Form>
    </Create>
  );
};
