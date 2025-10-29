import React from 'react';
import type { DeleteButtonProps } from '@refinedev/antd';
import { useDeleteButton, useUpdate } from '@refinedev/core';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { RefineButtonClassNames, RefineButtonTestIds } from '@refinedev/ui-types';

export const UpdateButton: React.FC<DeleteButtonProps & { values: any }> = ({
  resource: resourceNameFromProps,
  recordItemId,
  onSuccess,
  mutationMode: mutationModeProp,
  children,
  successNotification,
  errorNotification,
  hideText = false,
  accessControl,
  meta,
  dataProviderName,
  confirmTitle,
  confirmOkText,
  confirmCancelText,
  invalidates,
  values,
  ...rest
}) => {
  const {
    title,
    label,
    hidden,
    disabled,
    loading,
    confirmTitle: defaultConfirmTitle,
    confirmOkLabel: defaultConfirmOkLabel,
    cancelLabel: defaultCancelLabel,
  } = useDeleteButton({
    resource: resourceNameFromProps,
    id: recordItemId,
    dataProviderName,
    invalidates,
    meta,
    onSuccess,
    mutationMode: mutationModeProp,
    errorNotification,
    successNotification,
    accessControl,
  });

  const { mutate, mutation } = useUpdate({
    resource: resourceNameFromProps,
    id: recordItemId,
    meta: meta,
  });

  const isDisabled = disabled || rest.disabled;
  const isHidden = hidden || rest.hidden;

  if (isHidden) return null;

  const onConfirm = async () => {
    mutate({ values: values });
  };

  return (
    <Popconfirm
      key="delete"
      okText={confirmOkText ?? defaultConfirmOkLabel}
      cancelText={confirmCancelText ?? defaultCancelLabel}
      okType="danger"
      title={confirmTitle ?? defaultConfirmTitle}
      okButtonProps={{ disabled: loading }}
      onConfirm={onConfirm}
      disabled={isDisabled}
    >
      <Button
        danger
        loading={loading}
        icon={<DeleteOutlined />}
        title={title}
        disabled={isDisabled}
        data-testid={RefineButtonTestIds.DeleteButton}
        className={RefineButtonClassNames.DeleteButton}
        {...rest}
      >
        {!hideText && (children ?? label)}
      </Button>
    </Popconfirm>
  );
};
