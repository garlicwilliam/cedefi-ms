import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";
import { formatDateHour, formatDatetime } from "../../util/time.ts";
import React from "react";

export const AssetsList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: "assets_snapshots",
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="assetsValue"
          title={"Assets"}
          render={(val: number) => {
            return val.toLocaleString();
          }}
        />
        <Table.Column
          dataIndex="snapshotAt"
          title={"Snapshot Time"}
          filterDropdown={() => {
            return (
              <SnapshotAtFilter filters={filters} setFilters={setFilters} />
            );
          }}
          render={(snapshotAt: number) => formatDateHour(snapshotAt)}
        />
        <Table.Column
          dataIndex="createdAt"
          title={"Created At"}
          render={(time: number) => formatDatetime(time)}
        />
      </Table>
    </List>
  );
};
