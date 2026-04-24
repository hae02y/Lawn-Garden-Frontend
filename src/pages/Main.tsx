import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import ArrowButton from '@/components/ArrowButton';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/api/auth';
import { changeMailStatus } from '@/api/mail';
import { getTodayStats, getWeeklyStats } from '@/api/stats';
import type { MailStatus, UserStatsResponseDto } from '@/types/api';

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

const Dashboard = styled.section`
  width: min(92vw, 900px);
  margin-top: 3rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const Card = styled.div`
  background: rgba(250, 241, 230, 0.95);
  border-radius: 24px;
  padding: 1rem 1.1rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  text-align: left;
`;

const CardTitle = styled.h3`
  color: #3d8d7a;
  margin-bottom: 0.75rem;
`;

const StatList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
`;

const StatItem = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-content-font);
`;

const MailButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const SmallButton = styled.button<{ $active?: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  background: ${(props) => (props.$active ? '#3D8D7A' : '#E4EFE7')};
  color: ${(props) => (props.$active ? '#fff' : '#3D8D7A')};
  font-weight: 700;
`;

const Notice = styled.p`
  margin-top: 0.35rem;
  color: #6b6b6b;
  font-size: 0.95rem;
`;

export default function Main() {
  const navigate = useNavigate();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  const username = useAuthStore((state) => state.username);
  const userId = useAuthStore((state) => state.userId);
  const [todayStats, setTodayStats] = useState<UserStatsResponseDto[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<UserStatsResponseDto[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [mailStatus, setMailStatus] = useState<MailStatus>('OFF');
  const [mailMessage, setMailMessage] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      setStatsError('');

      try {
        const [todayRes, weeklyRes] = await Promise.all([
          getTodayStats(),
          getWeeklyStats(),
        ]);

        setTodayStats(todayRes.data);
        setWeeklyStats(weeklyRes.data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setStatsError(error.message);
        } else {
          setStatsError('통계를 불러오지 못했어요.');
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
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

  const handleMailStatusChange = async (status: MailStatus) => {
    try {
      await changeMailStatus(status);
      setMailStatus(status);
      setMailMessage(status === 'ON' ? '메일 알림을 켰어요.' : '메일 알림을 껐어요.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMailMessage(error.message);
      } else {
        setMailMessage('메일 상태를 변경하지 못했어요.');
      }
    }
  };

  const renderStatList = (stats: UserStatsResponseDto[]) => {
    if (!stats.length) {
      return <Notice>아직 기록이 없어요.</Notice>;
    }

    return (
      <StatList>
        {stats.slice(0, 5).map((item) => (
          <StatItem key={`${item.id ?? item.username}-${item.commitCount}`}>
            <span>{item.username}</span>
            <strong>{item.commitCount}</strong>
          </StatItem>
        ))}
      </StatList>
    );
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
          당신의 레벨: <span>잔디관리인</span>
        </p>
      </HeaderText>

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
        <ArrowButton direction="center" text="로그아웃" angle={2} onClick={handleLogout} />
      </SignsSection>

      <Dashboard>
        <Card>
          <CardTitle>오늘의 통계</CardTitle>
          {isLoadingStats ? <Notice>불러오는 중...</Notice> : renderStatList(todayStats)}
        </Card>

        <Card>
          <CardTitle>이번주 통계</CardTitle>
          {isLoadingStats ? <Notice>불러오는 중...</Notice> : renderStatList(weeklyStats)}
        </Card>

        <Card>
          <CardTitle>메일 알림</CardTitle>
          <MailButtons>
            <SmallButton type="button" $active={mailStatus === 'ON'} onClick={() => handleMailStatusChange('ON')}>
              ON
            </SmallButton>
            <SmallButton type="button" $active={mailStatus === 'OFF'} onClick={() => handleMailStatusChange('OFF')}>
              OFF
            </SmallButton>
          </MailButtons>
          <Notice>{mailMessage || `현재 상태: ${mailStatus}`}</Notice>
        </Card>

        <Card>
          <CardTitle>시스템</CardTitle>
          <Notice>{statsError || '정원 상태를 확인하고 오늘 할 일을 관리해보세요.'}</Notice>
        </Card>
      </Dashboard>
    </Wrapper>
  );
}
