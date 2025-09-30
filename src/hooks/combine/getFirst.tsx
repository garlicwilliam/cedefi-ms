import { BaseRecord, CrudFilter, DataProvider } from "@refinedev/core";

export const getFirst = (
  provider: DataProvider,
  resource: string,
  filters?: CrudFilter[],
): Promise<BaseRecord | null> => {
  return provider
    .getList({
      resource,
      pagination: { currentPage: 1, pageSize: 1 },
      filters: filters,
    })
    .then((result) => {
      const list = result.data;
      return list && list.length > 0 ? list[0] : null;
    })
    .catch((err) => {
      console.log("err", err);
      return null;
    });
};
