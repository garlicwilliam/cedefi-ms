import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import React from "react";
import { formatDateHour, formatDatetime } from "../../util/time.ts";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";

export const NavList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: "nav_snapshots",
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="nav" title={"NAV"} />
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
