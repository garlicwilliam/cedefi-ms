import { useLatestAllocationRatio } from "../../hooks/useLatestAllocationRatio.tsx";
import styles from "./AllocationRatioRow.module.scss";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";
import { StyleMerger } from "../../util/css.ts";
import { CreateButton } from "@refinedev/antd";
import React from "react";
import { Descriptions } from "antd";
import { formatDatetime } from "../../util/time.ts";

type RatioRowProps = { portfolioId: number };

export const AllocationRatioRow = ({ portfolioId }: RatioRowProps) => {
  const { latest } = useLatestAllocationRatio(portfolioId);
  const styleMr: StyleMerger = useStyleMr(styles);

  if (!latest) {
    return (
      <div className={styleMr(styles.rowWrapper)}>
        <Descriptions title={"收益分配"}>
          <Descriptions.Item label={"未设置"}>--%</Descriptions.Item>
        </Descriptions>

        <CreateButton
          meta={{ portfolioId: portfolioId }}
          resource={"profit_allocation_ratios"}
          size="small"
        >
          设置分配比例
        </CreateButton>
      </div>
    );
  } else {
    return (
      <div className={styleMr(styles.rowWrapper)}>
        <Descriptions title={"收益分配"}>
          <Descriptions.Item label={"用户"}>
            {latest.toUser / 100}%
          </Descriptions.Item>
          <Descriptions.Item label={"平台"}>
            {latest.toPlatform / 100}%
          </Descriptions.Item>
          <Descriptions.Item label={"团队"}>
            {latest.toTeam / 100}%
          </Descriptions.Item>
          <Descriptions.Item label={"生效时间"}>
            {formatDatetime(latest.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label={"参数版本"}>
            {latest.version}
          </Descriptions.Item>
        </Descriptions>

        <CreateButton
          meta={{ portfolioId: portfolioId }}
          resource={"profit_allocation_ratios"}
          size="small"
        >
          修改分配比例
        </CreateButton>
      </div>
    );
  }
};
