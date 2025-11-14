import { FilterDropdown } from './FilterDropdown.tsx';
import { Button, Input, InputNumber } from 'antd';
import { delFilter, FilterOp, filterValue, setFilter, SetFilterFn } from '../../util/filter.ts';
import type { CrudFilter } from '@refinedev/core';
import styles from './ValueFilter.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { px, StyleMerger } from '../../util/css.ts';
import { useCallback, useEffect, useState } from 'react';

export type ValueFilterProps = {
  isNumber?: boolean;
  setFilters: SetFilterFn;
  filters: CrudFilter[];
  fieldName: string;
  inputWidth?: number;
};

export const ValueFilter = ({ setFilters, filters, fieldName, isNumber, inputWidth }: ValueFilterProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const [value, setValue] = useState<any>(null);
  const operator: FilterOp = 'eq';

  useEffect(() => {
    const val = filterValue<any>(filters, fieldName, operator);

    setValue(val === undefined ? null : val);
  }, [filters, fieldName, operator]);

  const onClear = useCallback(() => {
    delFilter(setFilters, fieldName, operator);
  }, [setFilters, fieldName]);

  const onOk = useCallback(() => {
    setFilter(setFilters, fieldName, operator, value);
  }, [setFilters, fieldName, value]);

  const onChange = useCallback((val: any) => {
    setValue(val);
  }, []);

  const onChangeStr = useCallback((event: any) => {
    setValue(event.target.value);
  }, []);

  return (
    <FilterDropdown>
      <div className={styleMr(styles.wrapper)}>
        <div className={styleMr(styles.valueFilter)}>
          <span>{fieldName}:</span>

          {isNumber ? (
            <InputNumber style={{ width: px(inputWidth) }} value={value} onChange={onChange} />
          ) : (
            <Input
              style={{ width: px(inputWidth) }}
              maxLength={inputWidth}
              value={value}
              onChange={onChangeStr}
            />
          )}
        </div>

        <div className={styleMr(styles.valueActions)}>
          <Button type="primary" size={'small'} onClick={onOk}>
            OK
          </Button>

          <Button type={'default'} size={'small'} onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </FilterDropdown>
  );
};
