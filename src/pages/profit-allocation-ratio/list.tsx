import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { formatDatetime } from "../../util/time.ts";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";

export const ProfitAllocationRatioList = () => {
  const { tableProps } = useTable({
    resource: "profit_allocation_ratios",
  });

  const { arr: portfolios, map } = usePortfolios();
  const filters = portfolios.map((one) => ({
    text: one.fundAlias,
    value: one.id,
  }));

  return (
    <List canCreate={true}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="portfolioId"
          title={"所属投资组合"}
          render={(pid) => {
            return map.get(pid)?.fundAlias;
          }}
          filters={filters}
        />

        <Table.Column dataIndex="version" title={"Version"} />

        <Table.Column
          dataIndex={"toUser"}
          title={"用户所得比例"}
          render={(toUser) => {
            return `${toUser / 100}%`;
          }}
        />

        <Table.Column
          dataIndex={"toPlatform"}
          title={"平台所得比例"}
          render={(toPlatform) => {
            return `${toPlatform / 100}%`;
          }}
        />

        <Table.Column
          dataIndex={"toTeam"}
          title={"团队所得比例"}
          render={(toTeam) => {
            return `${toTeam / 100}%`;
          }}
        />

        <Table.Column
          dataIndex={"createdAt"}
          title={"生效时间"}
          render={(createdAt) => {
            return `${formatDatetime(createdAt)}`;
          }}
        />
      </Table>
    </List>
  );
};
