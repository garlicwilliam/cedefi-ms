import { FilterDropdown } from './FilterDropdown.tsx';
import { Button, DatePicker } from 'antd';
import { dayjsObj, timestamp } from '../../util/time.ts';
import React from 'react';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './SnapshotAtFilter.module.scss';
import {
  clearFilter,
  delFilter,
  delFiltersBy,
  filterValue,
  setFilter,
  SetFilterFn,
} from '../../util/filter.ts';
import type { CrudFilter } from '@refinedev/core';

export const SnapshotAtFilter = ({
  setFilters,
  filters,
  fieldName = 'snapshotAt',
}: {
  setFilters: SetFilterFn;
  filters: CrudFilter[];
  fieldName?: string;
}): React.JSX.Element => {
  const styleMr = useStyleMr(styles);

  const shotFieldName: string = fieldName;

  const onFromChange = (timestamp: number | null) => {
    if (timestamp === null) {
      delFilter(setFilters, shotFieldName, 'gte');
    } else {
      setFilter(setFilters, shotFieldName, 'gte', timestamp);
    }
  };
  const onToChange = (timestamp: number | null) => {
    if (timestamp === null) {
      delFilter(setFilters, shotFieldName, 'lt');
    } else {
      setFilter(setFilters, shotFieldName, 'lt', timestamp);
    }
  };
  const onClear = () => {
    delFiltersBy(setFilters, shotFieldName);
  };

  const from = filterValue<number>(filters, shotFieldName, 'gte');
  const to = filterValue<number>(filters, shotFieldName, 'lt');
  const fromTime = from ? dayjsObj(from) : undefined;
  const toTime = to ? dayjsObj(to) : undefined;

  return (
    <FilterDropdown>
      <div className={styleMr(styles.timeFilter)}>
        <div>From:</div>
        <DatePicker
          name={'from'}
          showTime={{
            format: 'HH',
          }}
          prefix={<div style={{ width: '20px', color: '#999999' }}>&gt;=</div>}
          onChange={(value) => {
            if (!value) {
              onFromChange(null);
            } else {
              onFromChange(timestamp(value.toDate()));
            }
          }}
          value={fromTime}
        />

        <div>To:</div>
        <DatePicker
          name={'to'}
          showTime={{
            format: 'HH',
          }}
          prefix={<div style={{ width: '20px', color: '#999999' }}>&lt;</div>}
          onChange={(value) => {
            if (!value) {
              onToChange(null);
            } else {
              onToChange(timestamp(value.toDate()));
            }
          }}
          value={toTime}
        />

        <div>
          <Button type="primary" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </FilterDropdown>
  );
};
