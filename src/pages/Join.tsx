import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/Logo.svg';
import { LogoStyle } from '@/styles/LogoStyle';
import Wrapper from '@/styles/Wrapper';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { SignText, TextButton } from '@/components/SignText';
import { signUp } from '@/api/auth';
import { getErrorMessage } from '@/utils/error';

export default function Join() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [githubId, setGithubId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !githubId.trim() || !password.trim()) {
      setErrorMessage('모든 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp({ email, githubId, password });
      alert('회원가입 성공!');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, '회원가입에 실패했어요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper marginBottom>
      <LogoStyle src={Logo} alt="Logo" />
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Github ID"
          value={githubId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubId(e.target.value)}
        />
        <Input
          placeholder="PASSWORD"
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : 'SignUP'}
        </Button>
      </form>
      {errorMessage && <SignText $color="#d46a6a">{errorMessage}</SignText>}
      <SignText $color="#99BC85">
        이미 회원이신가요?
        <TextButton onClick={() => navigate('/')}> 로그인</TextButton>
      </SignText>
    </Wrapper>
  );
}
