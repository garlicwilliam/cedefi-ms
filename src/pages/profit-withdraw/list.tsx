import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { getFromType } from "../profit-reallocations/util.ts";
import { useTeamMap } from "../../hooks/useTeamMap.tsx";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";
import { formatDatetime } from "../../util/time.ts";
import { useUsers } from "../../hooks/useUsers.tsx";
import { shortHex } from "../../util/string.ts";
import {
  CHAIN_EXPLORER_TX,
  CHAIN_ICON,
  SupportedChainType,
} from "../../const/chain-rpc.ts";
import { ExportOutlined } from "@ant-design/icons";
import { Link } from "@refinedev/core";
import { SnapshotAtFilter } from "../../components/dropdown/SnapshotAtFilter.tsx";
import React from "react";
import { FilterTypes } from "./util.tsx";

export const ProfitWithdrawList = () => {
  const { tableProps, filters, setFilters } = useTable({
    resource: "profit_withdrawals",
  });

  const { map: teamMap } = useTeamMap();
  const { map: portfolioMap } = usePortfolios();
  const { map: userMap } = useUsers();

  return (
    <List canCreate={true}>
      <Table {...tableProps}>
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="from"
          title={"Withdraw From"}
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
          dataIndex={"transactionHash"}
          title={"交易Hash"}
          render={(hash, row) => {
            const chainId: SupportedChainType = row.chainId;
            const icon: string = CHAIN_ICON[chainId];
            const shortHash: string = shortHex(hash, 6, 6);
            const link = `${CHAIN_EXPLORER_TX[chainId]}${hash}`;

            return (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <img src={icon} alt={hash} width={20} height={20} />
                <span>{shortHash}</span>
                <Link to={link} target="_blank" rel="noopener noreferrer">
                  <ExportOutlined />
                </Link>
              </div>
            );
          }}
        />

        <Table.Column
          dataIndex={"transactionTime"}
          title={"交易时间"}
          render={(txTime) => {
            return formatDatetime(txTime);
          }}
          filterDropdown={() => {
            return (
              <SnapshotAtFilter
                fieldName={"transactionTime"}
                filters={filters}
                setFilters={setFilters}
              />
            );
          }}
        />

        <Table.Column
          dataIndex={"usdValue"}
          title={"转账金额"}
          render={(usd, row) => {
            return `${row.assetsAmount} ${row.assets} = $${usd}`;
          }}
        />

        <Table.Column
          dataIndex="createdAt"
          title={"提交时间"}
          render={(time) => {
            return formatDatetime(time);
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
          dataIndex={"createdBy"}
          title={"记录人"}
          render={(uid) => {
            return userMap.get(uid)?.email || uid;
          }}
        />
      </Table>
    </List>
  );
};
