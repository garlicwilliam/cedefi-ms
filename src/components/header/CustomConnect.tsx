import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './CustomConnect.module.scss';
import { CaretDownOutlined } from '@ant-design/icons';
import React from 'react';
import { useAtomValue } from 'jotai';
import { S } from '../../state/global.ts';

export function CustomConnect() {
  const styleMr = useStyleMr(styles);
  const isSafe: boolean = useAtomValue(S.Wallet.Safe.IsSafe);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        if (!connected) {
          return (
            <Button type={'primary'} onClick={openConnectModal}>
              连接钱包
            </Button>
          );
        }

        return (
          <div className={styleMr(styles.displayBox)}>
            <Button color="default" variant="filled" onClick={openAccountModal}>
              <div className={styleMr(styles.account)}>
                {isSafe ? <img src={'/svg/safe.svg'} alt={'safe'} width={20} height={20} /> : <></>}
                {account.displayName}
                <CaretDownOutlined />
              </div>
            </Button>

            <Button color="default" variant="filled" onClick={openChainModal}>
              {chain.hasIcon ? (
                <div className={styleMr(styles.chainIcon)}>
                  <img alt={chain.name} src={chain.iconUrl} width={24} height={24} />
                  <span>{chain.name}</span>
                  <CaretDownOutlined />
                </div>
              ) : (
                <>
                  {' '}
                  <span>chain.name</span> <CaretDownOutlined />
                </>
              )}
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
