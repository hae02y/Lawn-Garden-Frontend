import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '@/assets/Logo.svg';
import { LogoStyle } from '@/styles/LogoStyle';
import Wrapper from '@/styles/Wrapper';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { SignText, TextButton } from '@/components/SignText';
import { getGithubOAuthStartUrl, login, normalizeBearerToken } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';
// 토큰 저장위한 store
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get('error') || ''
  );

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
      const { accessToken, refreshToken, user } = res.data;

      const { setAuthSession } = useAuthStore.getState();
      setAuthSession({
        accessToken: normalizeBearerToken(accessToken),
        refreshToken: normalizeBearerToken(refreshToken),
        userId: typeof user?.id === 'number' ? user.id : null,
        username: user.username,
      });

      alert('로그인 성공!');
      navigate('/main', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, '로그인에 실패했어요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = getGithubOAuthStartUrl();
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
      {errorMessage && <SignText $color="#d46a6a">{errorMessage}</SignText>}
      <Button type="button" onClick={handleGithubLogin}>
        GitHub 로그인
      </Button>

      <SignText $color="#99BC85">
        회원이 아니신가요?
        <TextButton onClick={() => navigate('/join')}> 회원가입</TextButton>
      </SignText>
    </Wrapper>
  );
}
