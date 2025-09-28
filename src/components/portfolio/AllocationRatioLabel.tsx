import { useLatestAllocationRatio } from "../../hooks/useLatestAllocationRatio.tsx";

type Props = { portfolioId: number };

export const AllocationRatioLabel = ({ portfolioId }: Props) => {
  const { latest } = useLatestAllocationRatio(portfolioId);
  if (!latest) {
    return "--% / --% / --%";
  }

  return `用户:${latest.toUser / 100}%； 平台:${latest.toPlatform / 100}%； 团队:${latest.toTeam / 100}%;`;
};
