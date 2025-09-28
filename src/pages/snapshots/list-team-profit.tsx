import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { formatDatetime } from "../../util/time.ts";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";
import React from "react";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { Portfolio } from "../../service/types.ts";

export const TeamProfitList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: "acc_profit_team",
  });

  const { map: portfolioMap, arr: portfolios } = usePortfolios();
  const { map: teamMap } = useTeamMap();

  const teamFilters = portfolios.map((one) => {
    const team = teamMap.get(one.teamId!);
    return {
      text: `${team?.name} - ${one.fundAlias}`,
      value: one.id,
    };
  });

  return (
    <List title={"团队(投组)累计收益快照"}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="portfolioId"
          title={"团队-投资组合"}
          render={(pid: number) => {
            const portfolio: Portfolio | undefined = portfolioMap.get(pid);
            const name = portfolio?.fundAlias;
            const team = teamMap.get(portfolio?.teamId ?? -1);

            return `${team?.name ?? "未知团队"} - ${name}`;
          }}
          filters={teamFilters}
        />

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
