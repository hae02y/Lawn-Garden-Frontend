import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import ArrowButton from '@/components/ArrowButton';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/api/auth';
import { changeMailStatus, getMyMailStatus } from '@/api/mail';
import { getMyUser } from '@/api/user';
import { getErrorMessage } from '@/utils/error';
import type { MailStatus } from '@/types/api';

const HeaderText = styled.header`
  color: var(--color-light-green);
  margin-bottom: 8vh;

  span {
    color: var(--color-deep-green);
  }
`;

const UserNameButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  color: var(--color-deep-green);
  font-size: inherit;
  font-weight: inherit;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const SignsSection = styled.section`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  gap: 1.15rem;
  margin-top: 0.5rem;
`;

const Pole = styled.div`
  width: 15px;
  background-color: #997c70;
  border-radius: 6px;
  position: absolute;
  left: 50%;
  top: -5vh;
  bottom: 0;
  height: 100vh;
`;

const MailCard = styled.div`
  width: min(92vw, 430px);
  background: var(--color-container-background);
  border-radius: 20px;
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
`;

const MailInfo = styled.div`
  text-align: left;
  color: var(--color-content-font);
  font-size: 0.9rem;
`;

const MailStatusButton = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  background-color: ${({ $active }) => ($active ? 'var(--color-deep-green)' : '#9f9a97')};
`;

const Notice = styled.p`
  color: #9a5f5f;
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
`;

export default function Main() {
  const navigate = useNavigate();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  const userId = useAuthStore((state) => state.userId);
  const username = useAuthStore((state) => state.username);
  const [levelName, setLevelName] = useState('처음 심은 새싹');
  const [levelBadge, setLevelBadge] = useState('SPROUT');
  const [mailStatus, setMailStatus] = useState<MailStatus | null>(null);
  const [isMailLoading, setIsMailLoading] = useState(false);
  const [mailErrorMessage, setMailErrorMessage] = useState('');

  useEffect(() => {
    const bootstrapSession = async () => {
      const { setUserId, setUsername } = useAuthStore.getState();

      try {
        const meRes = await getMyUser();
        if (typeof meRes.data.id === 'number') {
          setUserId(meRes.data.id);
        }
        setUsername(meRes.data.username);
        setLevelName(meRes.data.levelName || '처음 심은 새싹');
        setLevelBadge(meRes.data.levelBadge || 'SPROUT');

        const mailRes = await getMyMailStatus();
        setMailStatus(mailRes.data.status);
      } catch (error: unknown) {
        setMailErrorMessage(getErrorMessage(error, '알림 상태를 불러오지 못했어요.'));
      }
    };

    bootstrapSession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 서버 로그아웃 실패는 무시하고 로컬 세션을 종료한다.
    } finally {
      clearAccessToken();
      navigate('/', { replace: true });
    }
  };

  const handleToggleMail = async () => {
    if (!mailStatus || isMailLoading) return;
    setIsMailLoading(true);
    setMailErrorMessage('');

    const nextStatus: MailStatus = mailStatus === 'ON' ? 'OFF' : 'ON';

    try {
      const response = await changeMailStatus(nextStatus);
      setMailStatus(response.data.status);
    } catch (error: unknown) {
      setMailErrorMessage(getErrorMessage(error, '알림 상태를 변경하지 못했어요.'));
    } finally {
      setIsMailLoading(false);
    }
  };

  return (
    <Wrapper marginBottom>
      <HeaderText>
        <h2>
          안녕하세요!<br />
          <UserNameButton
            type="button"
            onClick={() => navigate(userId ? `/mygarden/${userId}` : '/mygarden')}
          >
            {username ?? '아이디'}
          </UserNameButton>{' '}
          님!
        </h2>
        <p>
          당신의 레벨: <span>{levelName}</span> · <span>{levelBadge}</span>
        </p>
      </HeaderText>

      <MailCard>
        <MailInfo>
          <strong>데일리 메일 알림</strong>
          <div>
            {mailStatus === null
              ? '알림 상태를 확인 중이에요.'
              : mailStatus === 'ON'
                ? '매일 소식을 받고 있어요.'
                : '알림이 꺼져 있어요.'}
          </div>
        </MailInfo>
        <MailStatusButton
          type="button"
          $active={mailStatus === 'ON'}
          onClick={handleToggleMail}
          disabled={isMailLoading || !mailStatus}
        >
          {isMailLoading ? '변경 중...' : mailStatus ?? '확인 중'}
        </MailStatusButton>
      </MailCard>
      {mailErrorMessage && <Notice>{mailErrorMessage}</Notice>}

      <SignsSection>
        <Pole />
        <ArrowButton
          direction="left"
          text="잔디에 물주기"
          angle={4}
          onClick={() => navigate('/watering')}
        />
        <ArrowButton
          direction="right"
          text="인증 내역 확인"
          angle={-4}
          onClick={() => navigate('/laydown')}
        />
        <ArrowButton
          direction="left"
          text="잔디정원 참여자"
          angle={10}
          onClick={() => navigate('/farmer')}
        />
        <ArrowButton
          direction="right"
          text="내 정원 조회"
          angle={-5}
          onClick={() => navigate(userId ? `/mygarden/${userId}` : '/mygarden')}
        />
        <ArrowButton
          direction="left"
          text="비닐하우스"
          angle={6}
          onClick={() => navigate('/greenhouse')}
        />
        <ArrowButton
          direction="right"
          text="메일 설정"
          angle={-3}
          onClick={() => navigate('/settings/mail')}
        />
        <ArrowButton direction="center" text="로그아웃" angle={2} onClick={handleLogout} />
      </SignsSection>
    </Wrapper>
  );
}
