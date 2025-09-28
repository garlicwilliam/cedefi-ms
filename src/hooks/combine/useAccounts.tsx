import { DataProvider, useDataProvider, useList } from "@refinedev/core";
import { usePortfolios } from "../usePortfolios.tsx";
import { restProvider } from "../../restProvider.ts";
import { from } from "rxjs";
import { map } from "rxjs/operators";

export const useAccounts = () => {
  const dataProvider: DataProvider = useDataProvider()();

  const user$ = from(
    dataProvider.getList({
      resource: "acc_profit_user",
      pagination: { currentPage: 1, pageSize: 1 },
    }),
  ).pipe(
    map((result) => {
      return result.data;
    }),
    map((list) => {
      return list.length > 0 ? list[0] : null;
    }),
  );

  from(dataProvider.getList({resource: "acc_profit_platform"}))
};
