import { useShow } from "@refinedev/core";
import { Show, TextField } from "@refinedev/antd";
import React from "react";
import { Tag, Typography } from "antd";
import { usePermissionTags } from "../../hooks/usePermissionTags.tsx";
import { Permission } from "../../service/types.ts";

const { Title } = Typography;

export const ShowAdmin = () => {
  const {
    result: record,
    query: { isLoading },
  } = useShow();

  const tags: Permission[] = usePermissionTags(record?.permissions);

  return (
    <Show isLoading={isLoading} canDelete={false} canEdit={!record?.isSuper}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Email"}</Title>
      <TextField value={record?.email} />
      <Title level={5}>{"超级管理员"}</Title>
      <TextField value={record?.isSuper ? "是" : "否"} />
      <Title level={5}>{"权限"}</Title>
      <TextField
        value={tags.map((tag: Permission) => {
          return <Tag key={tag.id}>{tag.label}</Tag>;
        })}
      />
    </Show>
  );
};
