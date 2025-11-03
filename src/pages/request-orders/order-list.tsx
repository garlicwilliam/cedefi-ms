import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { SldDecimal } from '../../util/decimal.ts';
import { useAssets } from '../../hooks/graph/useAssets.tsx';
import { formatDatetime } from '../../util/time.ts';
import { Asset, RequestOrderStatus } from '../../service/types.ts';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import React from 'react';
import { ValueFilter } from '../../components/dropdown/ValueFilter.tsx';
import { filtered } from '../../util/filter.ts';
import { isSameStrNoCase } from '../../util/string.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export const RequestOrderList = () => {
  const { tableProps, filters, setFilters } = useTable({
    resource: 'requestOrders',
    sorters: {
      permanent: [
        {
          field: 'requestedAt',
          order: 'desc',
        },
      ],
    },
  });

  const { arr: assetArr } = useAssets();

  const statusFilters = Object.values(RequestOrderStatus).map((one) => {
    return {
      text: one,
      value: one,
    };
  });

  const assetFilters = assetArr
    .filter((one) => !isSameStrNoCase(one.id, DEPLOYED_CONTRACTS.ADDR_LP))
    .map((one) => {
      return {
        text: one.symbol,
        value: one.id,
      };
    });

  return (
    <List>
      <Table {...tableProps}>
        <Table.Column dataIndex={'id'} title={'ID'} />
        <Table.Column
          dataIndex={'round'}
          title={'Round'}
          filtered={filtered(filters, 'round')}
          filterDropdown={<ValueFilter isNumber={true} inputWidth={100} filters={filters} setFilters={setFilters} fieldName={'round'} />}
        />

        <Table.Column
          dataIndex={'requestedAt'}
          title={'赎回时间'}
          render={(at) => {
            return formatDatetime(Number(at));
          }}
          filtered={filtered(filters, 'requestedAt')}
          filterDropdown={<SnapshotAtFilter fieldName={'requestedAt'} filters={filters} setFilters={setFilters} />}
        />

        <Table.Column dataIndex={'status'} title={'状态'} filtered={filtered(filters, 'status')} filters={statusFilters} />

        <Table.Column
          dataIndex={'requester'}
          title={'赎回地址'}
          filterDropdown={
            <ValueFilter inputWidth={300} filters={filters} setFilters={setFilters} fieldName={'requester'} isNumber={false} />
          }
        />

        <Table.Column
          dataIndex={'requestShares'}
          title={'Lp数量'}
          render={(lp) => SldDecimal.fromOrigin(BigInt(lp), 18).format({ fix: 18, removeZero: true })}
        />

        <Table.Column
          dataIndex={'sharePrice'}
          title={'Lp价格'}
          render={(rate: string): string => {
            const price: SldDecimal = SldDecimal.fromOrigin(BigInt(rate), 18);
            return price.isZero() ? '--' : price.format({ fix: 18, removeZero: true });
          }}
        />

        <Table.Column
          dataIndex={'requestAsset'}
          title={'赎回资产'}
          render={(asset: Asset) => {
            return asset.symbol;
          }}
          filters={assetFilters}
        />

        <Table.Column
          dataIndex={'assetAmount'}
          title={'资产数量'}
          render={(amount: string): string => {
            const asset: SldDecimal = SldDecimal.fromOrigin(BigInt(amount), 18);
            return asset.isZero() ? '--' : asset.format({ fix: 18, removeZero: true });
          }}
        />
      </Table>
    </List>
  );
};
