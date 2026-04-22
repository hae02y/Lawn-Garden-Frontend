import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function OauthGithubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const { clearAccessToken } = useAuthStore.getState();
    const accessToken = searchParams.get('accessToken');
    const username = searchParams.get('username');
    const userIdParam = searchParams.get('userId');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hashAccessToken = hashParams.get('accessToken');
    const hashUsername = hashParams.get('username');
    const hashUserId = hashParams.get('userId');

    const exchangeCode = async () => {
      const token = accessToken || hashAccessToken;
      const name = username || hashUsername;
      const userIdValue = userIdParam || hashUserId;

      if (!token) {
        clearAccessToken();
        navigate('/', { replace: true });
        return;
      }

      const { setAccessToken, setUserId, setUsername } = useAuthStore.getState();
      setAccessToken(token);
      if (userIdValue && !Number.isNaN(Number(userIdValue))) {
        setUserId(Number(userIdValue));
      }
      if (name) {
        setUsername(name);
      }
      navigate('/main', { replace: true });
    };

    exchangeCode();
  }, [navigate, searchParams]);

  return <div>GitHub 로그인 처리 중...</div>;
}
