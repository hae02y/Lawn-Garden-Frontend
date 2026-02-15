import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function OauthGithubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const username = searchParams.get('username');
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const hashAccessToken = hashParams.get('accessToken');
    const hashUsername = hashParams.get('username');

    console.log('OAuth callback URL:', window.location.href);
    console.log('OAuth query params:', { accessToken, username });
    console.log('OAuth hash params:', { accessToken: hashAccessToken, username: hashUsername });

    const exchangeCode = async () => {
      const token = accessToken || hashAccessToken;
      const name = username || hashUsername;

      if (!token) {
        navigate('/', { replace: true });
        return;
      }

      const { setAccessToken, setUsername } = useAuthStore.getState();
      setAccessToken(token);
      if (name) {
        setUsername(name);
      }
      navigate('/main', { replace: true });
    };

    exchangeCode();
  }, [navigate, searchParams]);

  return <div>GitHub 로그인 처리 중...</div>;
}
