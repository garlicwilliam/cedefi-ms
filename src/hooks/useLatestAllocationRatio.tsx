import { useList } from "@refinedev/core";
import { PortfolioAllocationRatio } from "../service/types.ts";

export const useLatestAllocationRatio = (portfolioId: number) => {
  const {
    result: { data },
    query: { isLoading, refetch },
  } = useList({
    resource: "profit_allocation_ratios",
    pagination: {
      pageSize: 1,
      currentPage: 1,
    },
    filters: [
      {
        field: "portfolioId",
        operator: "eq",
        value: portfolioId,
      },
    ],
    queryOptions: {
      enabled: true,
    },
  });

  const latest: PortfolioAllocationRatio | null =
    data.length > 0 ? (data[0] as PortfolioAllocationRatio) : null;

  return { latest, isLoading, refetch };
};
