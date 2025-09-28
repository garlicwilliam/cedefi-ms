import { EditButton, List, useTable } from "@refinedev/antd";
import { Space, Table } from "antd";
import React from "react";
import { BaseRecord } from "@refinedev/core";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { Team } from "../../service/types.ts";
import { AllocationRatioRow } from "../../components/portfolio/AllocationRatioRow.tsx";
import { ColumnFilterItem } from "antd/es/table/interface";
import { AllocationRatioLabel } from "../../components/portfolio/AllocationRatioLabel.tsx";

export const PortfolioList = () => {
  const { tableProps } = useTable({ resource: "portfolios" });
  const { map, arr: teams } = useTeamMap();

  const filters: ColumnFilterItem[] = teams.map((one) => ({
    text: one.name,
    value: one.id as number,
  }));

  return (
    <List>
      <Table
        {...tableProps}
        expandable={{
          expandedRowRender: (portfolio) => {
            return (
              <>
                <AllocationRatioRow portfolioId={Number(portfolio.id)} />
              </>
            );
          },
        }}
        rowKey="id"
      >
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="fundAlias" title={"投资组合"} />
        <Table.Column dataIndex="accountAlias" title={"子账号"} />
        <Table.Column dataIndex="ceffuWalletName" title={"Ceffu Wallet"} />
        <Table.Column
          dataIndex="teamId"
          title={"所属团队"}
          render={(tid) => {
            const team: Team | undefined = map.get(tid);
            if (team) {
              return team.name;
            }

            return "无";
          }}
          filters={filters}
        />

        <Table.Column
          dataIndex="id"
          title={"收益分配"}
          render={(id) => {
            return <AllocationRatioLabel portfolioId={Number(id)} />;
          }}
        />

        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton
                hidden={record.isSuper}
                size="small"
                recordItemId={record.id}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
