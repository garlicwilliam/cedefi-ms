import type { CrudFilter, CrudFilters, CrudOperators } from "@refinedev/core";

export type SetFilterBehavior = "merge" | "replace";
export type SetFilterFn = ((
  filters: CrudFilter[],
  behavior?: SetFilterBehavior,
) => void) &
  ((setter: (prevFilters: CrudFilter[]) => CrudFilter[]) => void);
export type FilterOp = "lt" | "gt" | "lte" | "gte";

export function setFilter(
  setFilters: SetFilterFn,
  field: string,
  op: FilterOp,
  value: any,
): void {
  setFilters((prevFilters: CrudFilter[]): CrudFilter[] => {
    const filter: CrudFilter = {
      field: field,
      operator: op,
      value: value,
    };

    const prev: CrudFilter[] = prevFilters.filter(
      (one: CrudFilter): boolean =>
        "field" in one && (one.field !== field || one.operator !== op),
    );

    return [...prev, filter];
  });
}

export function delFilter(
  setFilters: SetFilterFn,
  field: string,
  op: FilterOp,
) {
  console.log("del filter", field, op);

  setFilters((prevFilters: CrudFilter[]): CrudFilter[] => {
    const prev = prevFilters.filter(
      (one: CrudFilter): boolean =>
        "field" in one && (one.field !== field || one.operator !== op),
    );

    return prev;
  });
}

export function clearFilter(setFilters: SetFilterFn) {
  setFilters((): CrudFilter[] => {
    return [];
  });
}

export function filterValue<T>(
  filters: CrudFilter[],
  field: string,
  op: FilterOp,
): T | undefined {
  const f: CrudFilter | undefined = filters.find(
    (one: CrudFilter): boolean =>
      "field" in one && one.field === field && one.operator === op,
  );

  if (!f) {
    return undefined;
  }

  return f.value as T;
}

// ----------------------------

export const mapOperator = (operator: CrudOperators): string => {
  switch (operator) {
    case "ne":
    case "gte":
    case "lte":
    case "gt":
    case "lt":
      return `_${operator}`;
    case "contains":
      return "_like";
    default:
      return "";
  }
};

export const generateFilter = (filters?: CrudFilters) => {
  const queryFilters: { [key: string]: string } = {};

  if (filters) {
    filters.map((filter) => {
      if (filter.operator === "or" || filter.operator === "and") {
        throw new Error(
          `[@refinedev/simple-rest]: \`operator: ${filter.operator}\` is not supported. You can create custom data provider. https://refine.dev/docs/api-reference/core/providers/data-provider/#creating-a-data-provider`,
        );
      }

      if ("field" in filter) {
        const { field, operator, value } = filter;

        if (field === "q") {
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

// ----------------------------

export function filteredValue(
  target: string,
  filters: CrudFilter[],
): any[] | undefined {
  for (const filter of filters) {
    if ("field" in filter && filter.field === target) {
      return [filter.value];
    }
  }

  return undefined;
}
