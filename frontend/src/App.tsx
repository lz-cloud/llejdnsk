import { Layout, Menu } from 'antd';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  TeamOutlined,
  StarOutlined,
} from '@ant-design/icons';
import PortalPage from './pages/PortalPage';
import RecentAccessPage from './pages/RecentAccessPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import KnowledgeBaseManagementPage from './pages/admin/KnowledgeBaseManagementPage';
import SSOConfigPage from './pages/admin/SSOConfigPage';
import OAuth2ConfigPage from './pages/admin/OAuth2ConfigPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import GroupManagementPage from './pages/admin/GroupManagementPage';
import AccessAnalyticsPage from './pages/admin/AccessAnalyticsPage';
import { useAppSelector } from './store';
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

const { Header, Content, Footer, Sider } = Layout;

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const isAdmin = auth.user?.role === 'ADMIN';

  const menuItems = [
    {
      key: '/portal',
      icon: <AppstoreOutlined />,
      label: <Link to="/portal">知识库门户</Link>,
    },
    {
      key: '/recent',
      icon: <DashboardOutlined />,
      label: <Link to="/recent">最近访问</Link>,
    },
    {
      key: '/favorites',
      icon: <StarOutlined />,
      label: <Link to="/favorites">收藏夹</Link>,
    },
  ];

  const adminItems = [
    {
      key: 'admin-dashboard',
      icon: <DashboardOutlined />,
      label: '管理员',
      children: [
        {
          key: '/admin/dashboard',
          label: <Link to="/admin/dashboard">系统概览</Link>,
        },
        {
          key: '/admin/knowledge-bases',
          label: <Link to="/admin/knowledge-bases">知识库管理</Link>,
        },
        {
          key: '/admin/sso-config',
          label: <Link to="/admin/sso-config">SSO配置</Link>,
        },
        {
          key: '/admin/oauth2-config',
          label: <Link to="/admin/oauth2-config">OAuth2配置</Link>,
        },
        {
          key: '/admin/users',
          label: <Link to="/admin/users">用户管理</Link>,
        },
        {
          key: '/admin/groups',
          label: <Link to="/admin/groups">用户组管理</Link>,
        },
        {
          key: '/admin/analytics',
          label: <Link to="/admin/analytics">访问分析</Link>,
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {auth.isAuthenticated && (
        <Sider breakpoint="lg" collapsedWidth="0">
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
            fontSize: 18,
          }}>
            FastGPT Portal
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
          {isAdmin && <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={adminItems} />}
        </Sider>
      )}
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 600 }}>
          FastGPT 知识库平台
        </Header>
        <Content className="layout-content">
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} FastGPT Third-Party Platform</Footer>
      </Layout>
    </Layout>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const auth = useAppSelector((state) => state.auth);
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const auth = useAppSelector((state) => state.auth);
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (auth.user?.role !== 'ADMIN') {
    return <Navigate to="/portal" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route
        path="/*"
        element={(
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="portal" element={<PortalPage />} />
                <Route path="recent" element={<RecentAccessPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route
                  path="admin/dashboard"
                  element={(<AdminRoute><AdminDashboardPage /></AdminRoute>)}
                />
                <Route
                  path="admin/knowledge-bases"
                  element={(<AdminRoute><KnowledgeBaseManagementPage /></AdminRoute>)}
                />
                <Route
                  path="admin/sso-config"
                  element={(<AdminRoute><SSOConfigPage /></AdminRoute>)}
                />
                <Route
                  path="admin/oauth2-config"
                  element={(<AdminRoute><OAuth2ConfigPage /></AdminRoute>)}
                />
                <Route
                  path="admin/users"
                  element={(<AdminRoute><UserManagementPage /></AdminRoute>)}
                />
                <Route
                  path="admin/groups"
                  element={(<AdminRoute><GroupManagementPage /></AdminRoute>)}
                />
                <Route
                  path="admin/analytics"
                  element={(<AdminRoute><AccessAnalyticsPage /></AdminRoute>)}
                />
                <Route path="*" element={<Navigate to="/portal" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}

export default App;
