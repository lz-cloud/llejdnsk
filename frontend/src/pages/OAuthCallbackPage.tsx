import { useEffect } from 'react';
import { Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token && user) {
      const parsedUser = JSON.parse(decodeURIComponent(user));
      dispatch(setCredentials({ token, user: parsedUser }));
      navigate('/portal');
    } else {
      navigate('/login');
    }
  }, [navigate, dispatch, searchParams]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}>
      <Spin size="large" />
    </div>
  );
};

export default OAuthCallbackPage;
