import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, message } from 'antd';
import { GoogleOutlined, GithubOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { login, fetchProfile } from '../store/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { API_BASE_URL } from '../services/api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingOAuth, setLoadingOAuth] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/portal');
    } else {
      const token = localStorage.getItem('authToken');
      if (token) {
        dispatch(fetchProfile()).unwrap().then(() => navigate('/portal'));
      }
    }
  }, [auth.isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    const ssoParams = searchParams.get('sso');
    const ssoConfigId = searchParams.get('config');
    if (ssoParams && ssoConfigId) {
      dispatch({
        type: 'auth/ssoLogin/pending',
      });
      authService.ssoLogin({ encryptedParams: ssoParams, ssoConfigId })
        .then(({ user, token, redirectUrl }) => {
          dispatch({ type: 'auth/ssoLogin/fulfilled', payload: { user, token } });
          message.success('SSO 登录成功');
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            navigate('/portal');
          }
        })
        .catch((error) => {
          message.error(error.response?.data?.message || 'SSO 登录失败');
        });
    }
  }, [dispatch, navigate, searchParams]);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await dispatch(login(values)).unwrap();
      message.success('登录成功');
      navigate('/portal');
    } catch (error) {
      message.error(error as string);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    setLoadingOAuth(true);
    window.location.href = `${API_BASE_URL}/auth/oauth2/${provider}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #2f54eb 0%, #13c2c2 100%)',
      padding: 16,
    }}>
      <Card style={{ maxWidth: 420, width: '100%', borderRadius: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>FastGPT 知识库平台</Title>
          <Text type="secondary">使用您的账号登录访问企业知识库</Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="example@company.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={auth.loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或使用第三方登录</Divider>

        <Button
          icon={<GoogleOutlined />}
          block
          size="large"
          style={{ marginBottom: 12 }}
          onClick={() => handleOAuthLogin('google')}
          loading={loadingOAuth}
        >
          使用 Google 登录
        </Button>

        <Button
          icon={<GithubOutlined />}
          block
          size="large"
          onClick={() => handleOAuthLogin('github')}
          loading={loadingOAuth}
        >
          使用 GitHub 登录
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;
