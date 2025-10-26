import { RequestOrderStatus } from '../../service/types.ts';

export enum Action {
  Processing = RequestOrderStatus.Processing,
  Processed = RequestOrderStatus.Processed,
  Rejected = RequestOrderStatus.Rejected,
  Reviewing = RequestOrderStatus.Reviewing,
  Forfeited = RequestOrderStatus.Forfeited,
}

export const ActionNames = {
  [Action.Processing]: <span>封账</span>,
  [Action.Processed]: <span>结算</span>,
  [Action.Rejected]: <span>拒绝</span>,
  [Action.Reviewing]: <span>复核</span>,
  [Action.Forfeited]: <span>罚没</span>,
};

export const ActionTypes: { [a in Action]: boolean } = {
  [Action.Processing]: false,
  [Action.Processed]: false,
  [Action.Rejected]: true,
  [Action.Reviewing]: true,
  [Action.Forfeited]: true,
};
