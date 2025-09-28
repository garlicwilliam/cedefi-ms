import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { formatDatetime } from "../../util/time.ts";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";
import React from "react";

export const UserProfitList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: "acc_profit_user",
  });

  return (
    <List title={"用户累计收益快照"}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="snapshotAt"
          title={"快照时间"}
          render={(time) => {
            return formatDatetime(time);
          }}
          filterDropdown={() => {
            return (
              <SnapshotAtFilter filters={filters} setFilters={setFilters} />
            );
          }}
        />
        <Table.Column dataIndex="accProfit" title={"余额(USD)"} />
        <Table.Column
          dataIndex="createdAt"
          title={"创建时间"}
          render={(time) => {
            return formatDatetime(time);
          }}
        />
      </Table>
    </List>
  );
};
