import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import { Space, Table, List as AntList, Descriptions } from "antd";
import { BaseRecord } from "@refinedev/core";
import React from "react";
import { usePortfolios } from "../../hooks/usePortfolios.tsx";
import { Portfolio } from "../../service/types.ts";

export const TeamList = () => {
  const { tableProps } = useTable({ resource: "teams" });
  const { arr, map } = usePortfolios();

  const teamPortfolios = (teamId: number): Portfolio[] => {
    return arr.filter((item) => item.teamId == teamId);
  };

  return (
    <List>
      <Table
        {...tableProps}
        rowKey="id"
        expandable={{
          expandedRowRender: (team) => {
            return (
              <AntList
                bordered={false}
                style={{ paddingLeft: "50px" }}
                header={"拥有投资组合"}
                dataSource={teamPortfolios(team.id as number)}
                renderItem={(item: Portfolio) => {
                  return (
                    <>
                      <AntList.Item style={{ paddingLeft: "50px" }}>
                        <Descriptions>
                          <Descriptions.Item label={"ID"}>
                            {item.id}
                          </Descriptions.Item>
                          <Descriptions.Item label={"Name"}>
                            {item.fundAlias}
                          </Descriptions.Item>
                        </Descriptions>
                      </AntList.Item>
                    </>
                  );
                }}
              />
            );
          },
        }}
      >
        <Table.Column dataIndex="id" title={"ID"} width={"50px"} />
        <Table.Column dataIndex="name" title={"Name"} width={"100%"} />

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
