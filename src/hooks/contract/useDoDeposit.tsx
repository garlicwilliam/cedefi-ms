import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCallContractState } from '../wallet-write/useCallContract.tsx';
import { AbiErc20 } from '../../const/abis/Erc20.ts';
import { Asset } from '../../service/types.ts';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { AbiDepositVault } from '../../const/abis/DepositVault.ts';
import { useLatest } from '../useLatest.tsx';
import { useLatestMap } from '../useLatestMap.tsx';
import { MAX_APPROVE } from '../../const/contract.ts';

export enum DepositExeStep {
  IDLE,
  APPROVING,
  WAIT_DEPOSIT,
  DEPOSITING,
  DONE,
  ERROR,
}

function approveParamFun(assetId: string | undefined) {
  return {
    abi: AbiErc20,
    address: assetId as `0x${string}`,
    function: 'approve',
    args: [DEPLOYED_CONTRACTS.ADDR_DEPOSIT, MAX_APPROVE],
  };
}

export const useDoDeposit = (needApprove: boolean, asset: Asset | undefined, amount: SldDecimal | null) => {
  const [executing, setExecuting] = useState<boolean>(false);
  const [step, setStep] = useState<DepositExeStep>(DepositExeStep.IDLE);

  const needApproveRef = useLatest(needApprove);
  const executingRef = useLatest(executing);

  // approve
  const { mutate: approve, isDisabled: approving, isSuccess: approveSuccess } = useCallContractState();

  // deposit
  const { mutate: deposit, isDisabled: depositing, isSuccess: depositSuccess } = useCallContractState();

  const approveParamRef = useLatestMap(asset?.id, approveParamFun);

  const depositParam = useMemo(() => {
    return {
      abi: AbiDepositVault,
      address: DEPLOYED_CONTRACTS.ADDR_DEPOSIT,
      function: 'deposit',
      args: [asset?.id as `0x${string}`, amount?.toOrigin()],
    };
  }, [asset?.id, amount]);
  const depositParamRef = useLatest(depositParam);

  const mutate = useCallback(() => {
    if (executingRef.current) {
      return;
    }

    setStep(DepositExeStep.IDLE);
    setExecuting(true);
  }, [executingRef]);

  // approving
  useEffect(() => {
    if (executing && step === DepositExeStep.IDLE) {
      if (needApproveRef.current) {
        // do approve

        approve(approveParamRef.current);
        //
        setStep(DepositExeStep.APPROVING);
      } else {
        setStep(DepositExeStep.WAIT_DEPOSIT);
      }
    }
  }, [executing, step, approve, needApproveRef, approveParamRef]);

  // approving end
  useEffect(() => {
    if (executing && step === DepositExeStep.APPROVING) {
      if (!approving && approveSuccess) {
        setStep(DepositExeStep.WAIT_DEPOSIT);
      } else if (!approving && !approveSuccess) {
        // failed
        setStep(DepositExeStep.ERROR);
        setExecuting(false);
      }
    }
  }, [executing, step, approving, approveSuccess]);

  // depositing
  useEffect(() => {
    if (executing && step === DepositExeStep.WAIT_DEPOSIT) {
      deposit(depositParamRef.current);

      setStep(DepositExeStep.DEPOSITING);
    }
  }, [executing, step, deposit, depositParamRef]);

  // depositing end
  useEffect(() => {
    if (executing && step === DepositExeStep.DEPOSITING) {
      if (!depositing && depositSuccess) {
        setStep(DepositExeStep.DONE);
        setExecuting(false);
      } else if (!depositing && !depositSuccess) {
        setStep(DepositExeStep.ERROR);
        setExecuting(false);
      }
    }
  }, [executing, step, depositing, depositSuccess]);

  return { mutate, executing, step };
};
