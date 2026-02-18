import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/Logo.svg';
import { LogoStyle } from '@/styles/LogoStyle';
import Wrapper from '@/styles/Wrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { SignText, TextButton } from '@/components/SignText';
import { login } from '@/api/auth';
// 토큰 저장위한 store
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      const res = await login({ username, password });
      const { accessToken, user } = res.data as {
        accessToken: string;
        user: { id?: number; username: string };
      };

      const { setAccessToken, setUserId, setUsername } = useAuthStore.getState();
      setAccessToken(accessToken);
      if (typeof user?.id === 'number') {
        setUserId(user.id);
      }
      setUsername(user.username);

      alert('로그인 성공!');
      navigate('/main');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('로그인 실패:', err.message);
      } else {
        console.error('로그인 실패: 알 수 없는 오류', err);
      }
      alert('로그인 실패!');
    }
  };

  const handleGithubLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseUrl}/oauth2/authorization/github`;
  };

  return (
    <Wrapper marginBottom>
      <LogoStyle src={Logo} alt="Logo" />
      <Input
        placeholder="ID"
        value={username}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />
      <Input
        placeholder="PASSWORD"
        type="password"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />
      <Button onClick={handleLogin}>Login</Button>
      <Button onClick={handleGithubLogin}>GitHub 로그인</Button>

      <SignText color="#99BC85">
        회원이 아니신가요?
        <TextButton onClick={() => navigate('/join')}> 회원가입</TextButton>
      </SignText>
    </Wrapper>
  );
}
