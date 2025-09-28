import { useList } from "@refinedev/core";

export const useAccounts = () => {
  // 获取用户账户的信息
  const { result: userProfitResult } = useList({
    resource: "acc_profit_user",
    pagination: { pageSize: 1, currentPage: 1 },
  });
  const userProfit = userProfitResult.data;

  // 获取平台账户的信息
  const {result: platform} = useList({resource: 'acc_profit_platform'})

  //
};
