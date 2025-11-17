import type { CrudFilter, CrudFilters, CrudOperators, CrudSorting } from '@refinedev/core';
import { ConditionalFilter, LogicalFilter } from '@refinedev/core';

export type SetFilterBehavior = 'merge' | 'replace';
export type SetFilterFn = ((filters: CrudFilter[], behavior?: SetFilterBehavior) => void) &
  ((setter: (prevFilters: CrudFilter[]) => CrudFilter[]) => void);
export type FilterOp = 'lt' | 'gt' | 'lte' | 'gte' | 'eq';

export function setFilter(setFilters: SetFilterFn, field: string, op: FilterOp, value: any): void {
  setFilters((prevFilters: CrudFilter[]): CrudFilter[] => {
    const filter: CrudFilter = {
      field: field,
      operator: op,
      value: value,
    };

    const prev: CrudFilter[] = prevFilters.filter(
      (one: CrudFilter): boolean => 'field' in one && (one.field !== field || one.operator !== op),
    );

    return [...prev, filter];
  });
}

export function delFilter(setFilters: SetFilterFn, field: string, op: FilterOp): void {
  const modifier = (prevFilters: CrudFilter[]): CrudFilter[] => {
    return prevFilters
      .map((one: CrudFilter) => {
        if (one.operator === 'or' || one.operator === 'and') {
          one.value = modifier(one.value as CrudFilter[]);

          if (one.value.length === 0) {
            return null;
          } else {
            return one;
          }
        } else {
          if ('field' in one && one.field === field && one.operator === op) {
            return null;
          } else {
            return one;
          }
        }
      })
      .filter((one) => one !== null);
  };

  setFilters((prevFilters: CrudFilter[]): CrudFilter[] => {
    return modifier(prevFilters);
  });
}

export function delFiltersBy(setFilters: SetFilterFn, field: string): void {
  const modifier = (prevFilters: CrudFilter[]): CrudFilter[] => {
    return prevFilters
      .map((one: CrudFilter) => {
        if (one.operator === 'or' || one.operator === 'and') {
          one.value = modifier(one.value as CrudFilter[]);

          if (one.value.length === 0) {
            return null;
          } else {
            return one;
          }
        } else {
          if ('field' in one && one.field === field) {
            return null;
          } else {
            return one;
          }
        }
      })
      .filter((one) => one !== null);
  };

  setFilters((prevFilters: CrudFilter[]): CrudFilter[] => {
    return modifier(prevFilters);
  });
}

export function clearFilter(setFilters: SetFilterFn) {
  setFilters((): CrudFilter[] => {
    return [];
  });
}

export function filterValue<T>(filters: CrudFilter[], field: string, op: FilterOp): T | undefined {
  for (const f of filters) {
    if (f.operator === 'or' || f.operator === 'and') {
      return filterValue(f.value, field, op);
    } else {
      if ('field' in f && f.field === field && f.operator === op) {
        return f.value as T;
      }
    }
  }

  return undefined;
}

export function filtered(filters: CrudFilter[], field: string): boolean {
  for (const f of filters) {
    if (f.operator === 'or' || f.operator === 'and') {
      const is = filtered(f.value, field);
      if (is) {
        return true;
      }
    } else {
      const is: boolean = 'field' in f && f.field === field;
      if (is) {
        return true;
      }
    }
  }

  return false;
}

// -------------------------------------------------------------------------------------------------------
// for rest
export const mapOperator = (operator: CrudOperators): string => {
  switch (operator) {
    case 'ne':
    case 'gte':
    case 'lte':
    case 'gt':
    case 'lt':
      return `_${operator}`;
    case 'contains':
      return '_like';
    default:
      return '';
  }
};
// for rest
export const generateFilter = (filters?: CrudFilters) => {
  const queryFilters: { [key: string]: string } = {};

  if (filters) {
    filters.map((filter) => {
      if (filter.operator === 'or' || filter.operator === 'and') {
        throw new Error(
          `[@refinedev/simple-rest]: \`operator: ${filter.operator}\` is not supported. You can create custom data provider. https://refine.dev/docs/api-reference/core/providers/data-provider/#creating-a-data-provider`,
        );
      }

      if ('field' in filter) {
        const { field, operator, value } = filter;

        if (operator === 'eq') {
          queryFilters[field] = value;
          return;
        }

        const mappedOperator = mapOperator(operator);
        queryFilters[`${field}${mappedOperator}`] = value;
      }
    });
  }

  return queryFilters;
};

// -------------------------------------------------------------------------------------------------------
// for sub graph
export const mapOperatorGraph = (operator: CrudOperators): string => {
  switch (operator) {
    case 'ne':
      return `_not`;
    case 'gte':
    case 'lte':
    case 'gt':
    case 'lt':
    case 'in':
      return `_${operator}`;
    case 'contains':
      return '_contains';
    default:
      return '';
  }
};

export const generateFilterGraph = (filters: CrudFilters): null | object => {
  if (!filters || filters.length === 0) {
    return null;
  }

  if (filters.length === 1) {
    return genGraphFilterLogical(filters[0]);
  } else {
    return genGraphFilterLogical({ operator: 'and', value: filters });
  }
};

function genGraphFilterObject(filter: LogicalFilter): any {
  const { field, operator, value } = filter;

  return { [`${field}${mapOperatorGraph(operator)}`]: value };
}

function genGraphFilterLogical(filter: ConditionalFilter | LogicalFilter): any {
  const { operator, value } = filter;

  if (operator === 'or' || operator === 'and') {
    const subCondition = value as (LogicalFilter | ConditionalFilter)[];
    return { [operator]: subCondition.map((one) => genGraphFilterLogical(one)) };
  } else {
    return genGraphFilterObject(filter as LogicalFilter);
  }
}

export function generateSort(
  sorters: CrudSorting,
): null | { orderBy: string; orderDirection: 'asc' | 'desc' } {
  if (sorters.length > 0) {
    return {
      orderBy: sorters[0].field,
      orderDirection: sorters[0].order,
    };
  }

  return null;
}

// -------------------------------------------------------------------------------------------------------

export function filteredValue(target: string, filters: CrudFilter[]): any[] | undefined {
  for (const filter of filters) {
    if ('field' in filter && filter.field === target) {
      return [filter.value];
    }
  }

  return undefined;
}
