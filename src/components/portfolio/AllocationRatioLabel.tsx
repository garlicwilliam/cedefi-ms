import { useLatestAllocationRatio } from '../../hooks/useLatestAllocationRatio.tsx';

type Props = { portfolioId: number };

export const AllocationRatioLabel = ({ portfolioId }: Props) => {
  const { latest } = useLatestAllocationRatio(portfolioId);
  if (!latest) {
    return '--% / --% / --%';
  }

  return `用户:${latest.toUserRatio / 100}%； 平台:${latest.toPlatformRatio / 100}%； 团队:${latest.toTeamRatio / 100}%;`;
};
