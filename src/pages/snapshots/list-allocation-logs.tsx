import { List, useTable } from '@refinedev/antd';
import { Switch, Table } from 'antd';
import { usePortfolios } from '../../hooks/usePortfolios.tsx';
import { formatDatetime } from '../../util/time.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { PortfolioAccProfit, ProfitAllocationLog, ProfitAllocationRatio } from '../../service/types.ts';
import React, { useCallback, useMemo, useState } from 'react';
import { useList } from '@refinedev/core';
import { usePortfolioFilters } from '../../hooks/usePortfolioFilters.tsx';
import { filtered } from '../../util/filter.ts';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { AllocationLogExpand } from './list-allocation-logs-expand.tsx';

function formatValue(val: string): SldDecimal {
  return SldDecimal.fromNumeric(val, 18);
}

function useRefData(datasource: ProfitAllocationLog[]) {
  const { pnlIds, ratioIds } = useMemo(() => {
    if (!datasource) {
      return { pnlIds: new Set(), ratioIds: new Set() };
    }

    const pnlIds: Set<number> = new Set(
      datasource.map((item) => [item.hourlySnapshotCurrId, item.hourlySnapshotCurrId]).flat(),
    );
    const ratioIds: Set<number> = new Set(datasource.map((item) => item.allocationRatioId));

    return { pnlIds, ratioIds };
  }, [datasource]);

  const { result: pnlResult, query: pnlQuery } = useList<PortfolioAccProfit>({
    resource: 'acc_profit_from_portfolio',
    filters: [{ field: 'id', operator: 'ina', value: Array.from(pnlIds) }],
    pagination: { pageSize: pnlIds.size },
    queryOptions: {
      enabled: pnlIds.size > 0,
    },
  });
  const { result: ratioResult, query: ratioQuery } = useList<ProfitAllocationRatio>({
    resource: 'profit_allocation_ratios',
    filters: [{ field: 'id', operator: 'ina', value: Array.from(ratioIds) }],
    pagination: { pageSize: ratioIds.size },
    queryOptions: {
      enabled: ratioIds.size > 0,
    },
  });

  const pnlMap = useMemo(() => {
    if (!pnlResult || !pnlResult.data) {
      return {};
    }

    return pnlResult.data.reduce(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {} as Record<number, PortfolioAccProfit>,
    );
  }, [pnlResult]);
  const ratioMap = useMemo(() => {
    if (!ratioResult || !ratioResult.data) {
      return {};
    }
    return ratioResult.data.reduce(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {} as Record<number, ProfitAllocationRatio>,
    );
  }, [ratioResult]);

  const isPending: boolean = pnlQuery.isPending || ratioQuery.isPending;

  return { pnlMap, ratioMap, isPending };
}

export function AllocationLogs() {
  const [is18Decimals, setIs18Decimals] = useState(false);
  const { tableProps, filters, setFilters } = useTable({ resource: 'profit_allocation_logs' });
  const { map: portfolioMap } = usePortfolios();
  const filterItems = usePortfolioFilters();
  const dataSource = tableProps.dataSource as ProfitAllocationLog[];
  const { pnlMap, ratioMap, isPending } = useRefData(dataSource);

  const onCheck = useCallback((checked: boolean) => {
    setIs18Decimals(checked);
  }, []);

  const fix = useMemo(() => {
    return is18Decimals ? 18 : 2;
  }, [is18Decimals]);

  return (
    <List
      title={'收益分配日志'}
      headerButtons={() => {
        return (
          <div>
            <Switch checkedChildren="高精度" unCheckedChildren="低精度" onChange={onCheck} />
          </div>
        );
      }}
    >
      <Table
        {...tableProps}
        expandable={{
          expandedRowRender: (row) => {
            return (
              <AllocationLogExpand pnlMap={pnlMap} ratioMap={ratioMap} log={row as ProfitAllocationLog} />
            );
          },
        }}
        rowKey="id"
      >
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="portfolioId"
          title={'投资组合'}
          render={(id) => {
            const portfolio = portfolioMap.get(id);
            return portfolio ? portfolio.fundAlias : '未知投资组合';
          }}
          filters={filterItems}
          filtered={filtered(filters, 'portfolioId')}
        />
        <Table.Column
          dataIndex={'hourEndAt'}
          title={'计算时间'}
          render={(val) => {
            return formatDatetime(val);
          }}
          filterDropdown={() => {
            return <SnapshotAtFilter fieldName={'hourEndAt'} filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'hourEndAt')}
        />
        <Table.Column
          dataIndex={'hourlyProfit'}
          title={'前1小时收益(USD)'}
          align={'right'}
          render={(val) => {
            return <NumberValue>{formatValue(val).format({ fix: fix })}</NumberValue>;
          }}
        />
        <Table.Column
          dataIndex={'profitToTeam'}
          title={'分配到团队(USD)'}
          align={'right'}
          render={(val) => {
            return <NumberValue>{formatValue(val).format({ fix: fix })}</NumberValue>;
          }}
        />
        <Table.Column
          dataIndex={'profitToUser'}
          title={'分配到用户(USD)'}
          align={'right'}
          render={(val) => {
            return <NumberValue>{formatValue(val).format({ fix: fix })}</NumberValue>;
          }}
        />
        <Table.Column
          dataIndex={'profitToPlatform'}
          title={'分配到平台(USD)'}
          align={'right'}
          render={(val) => {
            return <NumberValue>{formatValue(val).format({ fix: fix })}</NumberValue>;
          }}
        />
      </Table>
    </List>
  );
}
