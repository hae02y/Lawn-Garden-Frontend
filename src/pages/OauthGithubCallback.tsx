import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function OauthGithubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const { clearAccessToken } = useAuthStore.getState();
    const accessToken = searchParams.get('accessToken');
    const accessTokenAlt = searchParams.get('access_token');
    const username = searchParams.get('username');
    const userIdParam = searchParams.get('userId');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hashAccessToken = hashParams.get('accessToken');
    const hashAccessTokenAlt = hashParams.get('access_token');
    const hashUsername = hashParams.get('username');
    const hashUserId = hashParams.get('userId');
    const hashError = hashParams.get('error');
    const hashMessage = hashParams.get('message');
    const errorMessage = searchParams.get('error') || searchParams.get('message');

    const exchangeCode = async () => {
      const token = accessToken || accessTokenAlt || hashAccessToken || hashAccessTokenAlt;
      const name = username || hashUsername;
      const userIdValue = userIdParam || hashUserId;
      const oauthError = errorMessage || hashError || hashMessage;

      if (oauthError) {
        clearAccessToken();
        navigate(`/?error=${encodeURIComponent(oauthError)}`, { replace: true });
        return;
      }

      if (!token) {
        clearAccessToken();
        navigate('/?error=github-login-failed', { replace: true });
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
