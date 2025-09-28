import { List, useTable } from "@refinedev/antd";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { Table } from "antd";
import { FilterTypes, getFromType } from "./util.ts";
import { formatDatetime } from "../../util/time.ts";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";
import React from "react";
import { useUsers } from "../../hooks/useUsers.tsx";

export const ProfitReallocationList = () => {
  const { tableProps, filters, setFilters } = useTable({
    resource: "profit_reallocations",
  });
  const { map: teamMap } = useTeamMap();
  const { map: portfolioMap } = usePortfolios();
  const { map: usersMap } = useUsers();

  return (
    <List canCreate={true}>
      <Table {...tableProps}>
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="from"
          title={"From"}
          render={(from, row) => {
            return getFromType(
              from,
              row.fromPortfolioId,
              teamMap,
              portfolioMap,
            );
          }}
          filters={FilterTypes}
        />
        <Table.Column
          dataIndex="to"
          title={"To"}
          render={(to, row) => {
            return getFromType(to, row.toPortfolioId, teamMap, portfolioMap);
          }}
          filters={FilterTypes}
        />
        <Table.Column dataIndex="usdValue" title={"金额(USD)"} />
        <Table.Column
          dataIndex="createdAt"
          title={"时间"}
          render={(at) => {
            return formatDatetime(at);
          }}
          filterDropdown={() => {
            return (
              <SnapshotAtFilter
                fieldName={"createdAt"}
                filters={filters}
                setFilters={setFilters}
              />
            );
          }}
        />
        <Table.Column
          dataIndex="createdBy"
          title={"发起人"}
          render={(uid) => {
            return usersMap.get(uid)?.email || uid;
          }}
        />
        <Table.Column dataIndex="reason" title={"原因"} />
      </Table>
    </List>
  );
};
