import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";
import { formatDateHour, formatDatetime } from "../../util/time.ts";
import React from "react";

export const RateList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: "rate_snapshots",
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="exchangeRate" title={"Rate"} />
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
