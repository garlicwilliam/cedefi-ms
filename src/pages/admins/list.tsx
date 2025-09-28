import { EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { Space, Table, Tag } from "antd";
import React from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { BaseRecord } from "@refinedev/core";
import { usePermissions } from "../../hooks/usePermissions.tsx";
import { Permission } from "../../service/types.ts";
import { useAuthPermissions } from "../../hooks/useAuthPermissions.tsx";
import { UpdateButton } from "../../components/button/UpdateButton.tsx";

export const AdminList = () => {
  const { tableProps } = useTable({ resource: "users" });
  const { map: permissionMap } = usePermissions();
  const { map: authPermissions } = useAuthPermissions();

  return (
    <List canCreate={authPermissions?.has("user")}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="email" title={"Email"} />
        <Table.Column
          dataIndex="suspended"
          title={"状态"}
          render={(suspended) => {
            return suspended ? (
              <span style={{ color: "#dc3535" }}>
                <CloseCircleOutlined /> Suspended
              </span>
            ) : (
              <>
                <CheckCircleOutlined /> Active
              </>
            );
          }}
        />
        <Table.Column
          dataIndex="isSuper"
          title={"超级管理员"}
          render={(is) => {
            return is ? (
              <>
                <CheckCircleOutlined /> 是
              </>
            ) : (
              "否"
            );
          }}
        />

        <Table.Column
          dataIndex="permissions"
          title={"权限"}
          render={(vals: string[]) => {
            const labels: Permission[] = vals
              .map((p: string): Permission | undefined => permissionMap?.get(p))
              .filter((a) => a !== undefined);

            return labels.map((p: Permission) => {
              return <Tag key={p.id}>{p.label}</Tag>;
            });
          }}
        />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton size="small" recordItemId={record.id}>
                查看
              </ShowButton>
              <EditButton
                hidden={record.isSuper}
                size="small"
                recordItemId={record.id}
              >
                编辑
              </EditButton>
              <UpdateButton
                hidden={record.isSuper}
                size="small"
                recordItemId={record.id}
                meta={{
                  method: "patch",
                  subPath: "suspend",
                }}
                resource={"users"}
                values={{ suspend: !record.suspended }}
                confirmOkText={"确认"}
                confirmCancelText={"取消"}
                icon={
                  record.suspended ? (
                    <CheckCircleOutlined />
                  ) : (
                    <CloseCircleOutlined />
                  )
                }
              >
                {record.suspended ? "启用" : "禁用"}
              </UpdateButton>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
