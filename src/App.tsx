import { Refine, Authenticated, useLink } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { ErrorComponent, useNotificationProvider, ThemedLayout, ThemedSider } from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';
import { App as AntdApp } from 'antd';
import { BrowserRouter, Route, Routes, Outlet, Navigate } from 'react-router';
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router';
import { BlogPostList, BlogPostCreate, BlogPostEdit, BlogPostShow } from './pages/blog-posts';
import { CategoryList, CategoryCreate, CategoryEdit, CategoryShow } from './pages/categories';
import { ColorModeContextProvider } from './contexts/color-mode';
import { Header } from './components';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { ForgotPassword } from './pages/forgotPassword';
import { authProvider } from './authProvider';
import { TitleImg } from './components/title/TitleImg.tsx';
import React from 'react';
import { cedefiMenus, resetPassMenus } from './components/menus/cedefi-menus.tsx';
import { Dashboard } from './pages/dashboard';
import { restProvider } from './restProvider.ts';
import { RateList, NavList } from './pages/snapshots';
import { AssetsList } from './pages/snapshots/list-assets.tsx';
import { AdminList } from './pages/admins/list.tsx';
import { ShowAdmin } from './pages/admins/show.tsx';
import { EditAdmin } from './pages/admins/edit.tsx';
import { CreateAdmin } from './pages/admins/create.tsx';
import { TeamList } from './pages/teams/list.tsx';
import { CreateTeam } from './pages/teams/create.tsx';
import { PortfolioList } from './pages/portfolios/list.tsx';
import { PortfolioEdit } from './pages/portfolios/edit.tsx';
import { CreateProfitAllocationRatio } from './pages/profit-allocation-ratio/create.tsx';
import { ProfitAllocationRatioList } from './pages/profit-allocation-ratio/list.tsx';
import { ModifyPass } from './pages/my/ModifyPass.tsx';
import { BlackList } from './pages/blacklist/list.tsx';
import { CreateBlacklist } from './pages/blacklist/create.tsx';
import {
  FundViewOutlined,
  CameraOutlined,
  DatabaseOutlined,
  TeamOutlined,
  GroupOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  ClockCircleOutlined,
  AccountBookOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { UserProfitList } from './pages/snapshots/list-user-profit.tsx';
import { PlatformProfitList } from './pages/snapshots/list-platform-profit.tsx';
import { TeamProfitList } from './pages/snapshots/list-team-profit.tsx';
import { ProfitReallocationList } from './pages/profit-reallocations/list.tsx';
import { CreateProfitReallocation } from './pages/profit-reallocations/create.tsx';
import { ProfitWithdrawList } from './pages/profit-withdraw/list.tsx';
import { CreateProfitWithdrawal } from './pages/profit-withdraw/create.tsx';
import { ProfitBalanceList } from './pages/profit-balance/list.tsx';
import { UserHourlyProfitList } from './pages/profit-hourly/list-user.tsx';
import { PlatformHourlyProfitList } from './pages/profit-hourly/list-platform.tsx';
import { TeamHourlyProfitList } from './pages/profit-hourly/list-team.tsx';

function App() {
  const Link = useLink();
  const menus = cedefiMenus(Link);
  const passes = resetPassMenus(Link);

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={{
                  default: restProvider('http://localhost:3100'),
                }}
                notificationProvider={useNotificationProvider}
                routerProvider={routerProvider}
                authProvider={authProvider}
                resources={[
                  {
                    name: 'permissions',
                  },
                  {
                    name: 'users',
                    list: '/users',
                    show: '/users/show/:id',
                    edit: '/users/edit/:id',
                    create: '/users/create',
                    meta: {
                      label: '管理员',
                      method: 'patch',
                      icon: <UsergroupAddOutlined />,
                    },
                  },
                  {
                    name: 'snapshots',
                    meta: {
                      label: '整时快照',
                    },
                  },
                  {
                    name: 'nav-snapshots',
                    list: '/nav_snapshots',
                    meta: {
                      canDelete: false,
                      canEdit: false,
                      canCreate: false,
                      label: 'NAV 快照',
                      parent: 'snapshots',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'rate_snapshots',
                    list: '/rate_snapshots',
                    meta: {
                      canDelete: false,
                      canEdit: false,
                      canCreate: false,
                      label: 'Rate 快照',
                      parent: 'snapshots',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'assets_snapshots',
                    list: '/assets_snapshots',
                    meta: {
                      canDelete: false,
                      canEdit: false,
                      canCreate: false,
                      label: '总资产快照',
                      parent: 'snapshots',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'funds',
                    meta: {
                      label: '基金',
                    },
                  },
                  {
                    name: 'teams',
                    list: '/teams',
                    edit: '/teams/edit/:id',
                    create: '/teams/create',
                    meta: {
                      label: '量化团队',
                      canDelete: false,
                      method: 'patch',
                      parent: 'funds',
                      icon: <TeamOutlined />,
                    },
                  },
                  {
                    name: 'portfolios',
                    list: '/portfolios',
                    edit: '/portfolios/edit/:id',
                    meta: {
                      label: '投资组合',
                      canDelete: false,
                      canCreate: false,
                      parent: 'funds',
                      icon: <GroupOutlined />,
                    },
                  },
                  {
                    name: 'profit_allocation_ratios',
                    list: '/profit_allocation_ratios',
                    create: '/profit_allocation_ratios/create/:portfolioId',
                    meta: {
                      label: '收益分配比例',
                      canDelete: false,
                      canEdit: false,
                      parent: 'funds',
                      icon: <SettingOutlined />,
                    },
                  },
                  {
                    name: 'blacklist',
                    list: '/blacklist',
                    create: '/blacklist/create',
                    meta: {
                      label: '黑名单',
                      canEdit: false,
                    },
                  },
                  {
                    name: 'accounts',
                    meta: {
                      label: '收益虚拟账户',
                      icon: <AccountBookOutlined />,
                    },
                  },
                  {
                    name: 'accounts_view',
                    list: 'accounts_view',
                    meta: {
                      label: '收益账户总览',
                      parent: 'accounts',
                      icon: <FundViewOutlined />,
                    },
                  },
                  {
                    name: 'acc_profit',
                    meta: {
                      label: '收益累计',
                      parent: 'accounts',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'acc_profit_user',
                    list: '/acc_profit_user',
                    meta: {
                      label: '用户快照',
                      parent: 'acc_profit',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'acc_profit_platform',
                    list: '/acc_profit_platform',
                    meta: {
                      label: '平台快照',
                      parent: 'acc_profit',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'acc_profit_team',
                    list: '/acc_profit_team',
                    meta: {
                      label: '团队快照',
                      parent: 'acc_profit',
                      icon: <CameraOutlined />,
                    },
                  },
                  {
                    name: 'hourly_profit',
                    meta: {
                      label: '收益变动',
                      parent: 'accounts',
                      icon: <FieldTimeOutlined />,
                    },
                  },
                  {
                    name: 'hourly_profit_user',
                    list: '/hourly_profit_user',
                    meta: {
                      label: '用户',
                      parent: 'hourly_profit',
                      icon: <FieldTimeOutlined />,
                    },
                  },
                  {
                    name: 'hourly_profit_platform',
                    list: '/hourly_profit_platform',
                    meta: {
                      label: '平台',
                      parent: 'hourly_profit',
                      icon: <FieldTimeOutlined />,
                    },
                  },
                  {
                    name: 'hourly_profit_team',
                    list: '/hourly_profit_team',
                    meta: {
                      label: '团队',
                      parent: 'hourly_profit',
                      icon: <FieldTimeOutlined />,
                    },
                  },
                  {
                    name: 'profit_reallocations',
                    list: '/profit_reallocations',
                    create: '/profit_reallocations/create',
                    meta: {
                      label: '调账记录',
                      parent: 'accounts',
                      icon: <DatabaseOutlined />,
                    },
                  },
                  {
                    name: 'profit_withdrawals',
                    list: '/profit_withdrawals',
                    create: '/profit_withdrawals/create',
                    meta: {
                      label: '提现记录',
                      parent: 'accounts',
                      icon: <DatabaseOutlined />,
                    },
                  },
                  {
                    name: 'redeem_view',
                    meta: {
                      label: '赎回',
                    },
                  },
                  {
                    name: 'redeems',
                    list: '/redeems',
                    meta: {
                      label: '赎回记录',
                      parent: 'redeem_view',
                      icon: <DatabaseOutlined />,
                    },
                  },
                  {
                    name: 'period_closing',
                    list: '/period_closing',
                    meta: {
                      label: '封账周期',
                      parent: 'redeem_view',
                      icon: <ClockCircleOutlined />,
                    },
                  },
                  {
                    name: 'rate',
                    meta: {
                      label: 'Exchange Rate',
                    },
                  },
                  {
                    name: 'rate_submit',
                    list: '/rate_submit',
                    meta: {
                      label: 'Rate 上链',
                      parent: 'rate',
                    },
                  },
                  {
                    name: 'rate_history',
                    list: '/rate_history',
                    meta: {
                      label: 'Rate 历史',
                      parent: 'rate',
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: false,
                  projectId: 'UHQ55z-Y2kdks-R3DGwC',
                  title: {
                    icon: <TitleImg size={24} />,
                    text: 'CEDEFI',
                  },
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
                        <ThemedLayout
                          Header={Header}
                          Sider={(props) => {
                            return (
                              <ThemedSider
                                {...props}
                                fixed
                                render={({ items, logout }) => {
                                  return [menus, ...items, passes, logout].filter(Boolean);
                                }}
                              />
                            );
                          }}
                        >
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route index element={<Navigate to={'/dashboard'} />} />

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path={'/users'}>
                      <Route index element={<AdminList />} />
                      <Route path={'show/:id'} element={<ShowAdmin />} />
                      <Route path={'edit/:id'} element={<EditAdmin />} />
                      <Route path={'create'} element={<CreateAdmin />} />
                    </Route>

                    <Route path={'/nav_snapshots'} element={<NavList />} />
                    <Route path={'/rate_snapshots'} element={<RateList />} />
                    <Route path={'/assets_snapshots'} element={<AssetsList />} />

                    <Route path={'/teams'}>
                      <Route index element={<TeamList />} />
                      <Route path={'create'} element={<CreateTeam />} />
                    </Route>

                    <Route path={'/portfolios'}>
                      <Route index element={<PortfolioList />} />
                      <Route path={'edit/:id'} element={<PortfolioEdit />} />
                    </Route>

                    <Route path={'/profit_allocation_ratios'}>
                      <Route path={'/profit_allocation_ratios'} element={<ProfitAllocationRatioList />} />
                      <Route path={'create/:portfolioId'} element={<CreateProfitAllocationRatio />} />
                    </Route>

                    <Route path={'/accounts_view'} element={<ProfitBalanceList />} />

                    <Route path={'/acc_profit_user'} element={<UserProfitList />} />
                    <Route path={'/acc_profit_platform'} element={<PlatformProfitList />} />
                    <Route path={'/acc_profit_team'} element={<TeamProfitList />} />

                    <Route path={'/hourly_profit_user'} element={<UserHourlyProfitList />} />
                    <Route path={'/hourly_profit_platform'} element={<PlatformHourlyProfitList />} />
                    <Route path={'/hourly_profit_team'} element={<TeamHourlyProfitList />} />

                    <Route path={'/profit_reallocations'}>
                      <Route index element={<ProfitReallocationList />} />
                      <Route path={'create'} element={<CreateProfitReallocation />} />
                    </Route>

                    <Route path={'/profit_withdrawals'}>
                      <Route index element={<ProfitWithdrawList />} />
                      <Route path={'create'} element={<CreateProfitWithdrawal />} />
                    </Route>

                    <Route path={'/blacklist'}>
                      <Route index element={<BlackList />} />
                      <Route path={'create'} element={<CreateBlacklist />} />
                    </Route>

                    <Route path={'/modify_password'} element={<ModifyPass />} />

                    <Route path="/blog-posts">
                      <Route index element={<BlogPostList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>

                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>

                    <Route path="*" element={<ErrorComponent />} />
                  </Route>

                  {/* 登陆验证通过后，跳转到根路径，否则 */}
                  <Route
                    element={
                      <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
