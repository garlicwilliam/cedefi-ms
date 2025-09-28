import { useList } from "@refinedev/core";
import { Portfolio } from "../service/types.ts";

type HookReturnType = {
  arr: Portfolio[];
  map: Map<number, Portfolio>;
  isLoading: boolean;
};

// 全部portfolios的hook
export const usePortfolios: (enabled?: boolean) => HookReturnType = (
  enabled: boolean | undefined,
): HookReturnType => {
  //
  const { result, query } = useList({
    resource: "portfolios",
    pagination: { pageSize: 1000, currentPage: 1 },
    queryOptions: {
      enabled: enabled == undefined ? true : enabled,
    },
  });

  const data: Portfolio[] = (result?.data || []) as Portfolio[];
  const isLoading = query.isLoading;
  const map = (data as any[]).reduce(
    (map: Map<number, Portfolio>, portfolio: Portfolio) => {
      map.set(portfolio.id, portfolio);
      return map;
    },
    new Map<number, Portfolio>(),
  );

  return { arr: data, isLoading, map };
};
