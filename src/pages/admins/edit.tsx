import { Edit, TextField, useForm } from '@refinedev/antd';
import { Form } from 'antd';
import React from 'react';
import { Typography } from 'antd';
import { Checkbox } from 'antd';
import { useUpdate } from '@refinedev/core';
import { Navigate } from 'react-router';
import { usePermissions } from '../../hooks/usePermissions.tsx';
const { Title } = Typography;

export const EditAdmin = () => {
  const { formProps, query, saveButtonProps } = useForm({});
  const record = query?.data?.data;

  const { arr: permissions } = usePermissions();
  const permissionOptions = permissions.map((one) => ({
    label: one.label,
    value: one.id,
  }));

  const { mutate } = useUpdate({
    resource: 'users',
    id: record?.id,
    meta: {
      subPath: 'permissions',
    },
    mutationOptions: {},
  });

  if (record && record?.isSuper) {
    return <Navigate to={'/users'} />;
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        onFinish={async (values) => {
          mutate({ values: values });
        }}
        layout="vertical"
      >
        <Title level={5}>{'ID'}</Title>
        <TextField value={record?.id} />
        <Title level={5}>{'Email'}</Title>
        <TextField value={record?.email} />
        <Title level={5}>{'超级管理员'}</Title>
        <TextField value={record?.isSuper ? '是' : '否'} />
        {/*  */}

        <Title level={5}>{'权限'}</Title>
        <Form.Item
          name={'permissions'}
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Checkbox.Group options={permissionOptions}></Checkbox.Group>
        </Form.Item>
      </Form>
    </Edit>
  );
};
