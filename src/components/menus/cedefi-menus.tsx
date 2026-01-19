import React, { Ref } from 'react';
import { Menu } from 'antd';
import { DashboardOutlined, LineChartOutlined, SafetyOutlined } from '@ant-design/icons';
import { LinkProps } from '@refinedev/core';

type LinkType<T> = (props: LinkProps<T> & { ref?: Ref<Element> }) => React.JSX.Element;

export function cedefiMenus(Link: LinkType<any>): React.JSX.Element[] {
  return [
    <Menu.Item icon={<DashboardOutlined />} key={'/dashboard'}>
      <Link to={'/dashboard'}>Dashboard</Link>
    </Menu.Item>,
    <Menu.Item icon={<LineChartOutlined />} key={'/charts'}>
      <Link to={'/charts'}>Charts</Link>
    </Menu.Item>,
  ];
}

export function resetPassMenus(Link: LinkType<any>): React.JSX.Element[] {
  return [
    <Menu.Item icon={<SafetyOutlined />} key={'/modify_password'}>
      <Link to={'/modify_password'}>修改密码</Link>
    </Menu.Item>,
  ];
}
