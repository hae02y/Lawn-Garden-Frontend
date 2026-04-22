import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
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
      let message = '로그인에 실패했어요.';

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as
          | { message?: string; error?: string }
          | string
          | undefined;

        if (typeof data === 'string') {
          message = data;
        } else {
          message = data?.message || data?.error || message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      } else {
        console.error('로그인 실패: 알 수 없는 오류', err);
      }

      setErrorMessage(message);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseUrl}/oauth2/authorization/github`;
  };

  return (
    <Wrapper marginBottom>
      <LogoStyle src={Logo} alt="Logo" />
      <form onSubmit={handleLogin}>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : 'Login'}
        </Button>
      </form>
      {errorMessage && <SignText color="#d46a6a">{errorMessage}</SignText>}
      <Button type="button" onClick={handleGithubLogin}>
        GitHub 로그인
      </Button>

      <SignText color="#99BC85">
        회원이 아니신가요?
        <TextButton onClick={() => navigate('/join')}> 회원가입</TextButton>
      </SignText>
    </Wrapper>
  );
}
