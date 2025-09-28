import { DeleteButton, List, useTable } from "@refinedev/antd";
import { Space, Table } from "antd";
import type { BaseRecord } from "@refinedev/core";
import React from "react";

export const BlackList = () => {
  const { tableProps } = useTable({ resource: "blacklist" });

  return (
    <List canCreate={true}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="address" title={"地址"} />
        <Table.Column dataIndex="note" title={"备注"} />
        <Table.Column dataIndex="created_at" title={"添加时间"} />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <DeleteButton size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
