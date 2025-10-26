import type { RefineThemedLayoutHeaderProps } from '@refinedev/antd';
import { useGetIdentity } from '@refinedev/core';
import { Avatar, Layout as AntdLayout, Space, Switch, theme, Typography } from 'antd';
import React, { useContext, useEffect } from 'react';
import { ColorModeContext } from '../../contexts/color-mode';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSetAtom } from 'jotai';
import { S } from '../../state/global.ts';
import { useSmall } from '../../hooks/useSmall.tsx';
import { CustomConnect } from './CustomConnect.tsx';
import { useIsSafeWallet } from '../../hooks/wallet-write/useIsSafeWallet.tsx';

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutHeaderProps> = ({ sticky = true }) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const setIsDark = useSetAtom(S.Theme.IsDark);
  setIsDark(mode === 'dark');
  const isSmall: boolean = useSmall();
  const { isSafe } = useIsSafeWallet();
  const setIsSafe = useSetAtom(S.Wallet.Safe.IsSafe);

  useEffect(() => {
    setIsSafe(isSafe);
  }, [isSafe, setIsSafe]);

  const headerStyles1: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: 'flex',
    columnGap: '16px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px 24px',
    height: '64px',
  };

  const headerStyles2: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: 'grid',
    justifyContent: 'end',
    justifyItems: 'end',
    alignItems: 'center',
    padding: '0px 16px',
    lineHeight: '28px',
    height: '80px',
  };

  const headerStyles: React.CSSProperties = isSmall ? headerStyles2 : headerStyles1;

  if (sticky) {
    headerStyles.position = 'sticky';
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  return (
    <AntdLayout.Header style={headerStyles}>
      {/*<ConnectButton></ConnectButton>*/}
      <CustomConnect />

      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === 'light' ? 'dark' : 'light')}
          defaultChecked={mode === 'dark'}
        />

        <Space style={{ marginLeft: '8px' }} size="middle">
          {user?.name && <Text strong>{user.name}</Text>}

          {!isSmall && user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};
