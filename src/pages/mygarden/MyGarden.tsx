import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Container from '@/styles/Container';
import BlockLabel from '@/styles/BlockLabel';
import Loading from '@/components/Loading';
import { getUserById } from '@/api/user';
import { getTodayStats, getWeeklyStats } from '@/api/stats';
import { useAuthStore } from '@/store/authStore';
import type { UserDetailResponseDto, UserStatsResponseDto } from '@/types/api';

const InfoCard = styled.section`
  background: var(--color-background);
  border-radius: 18px;
  padding: 1.1rem 1.2rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: var(--color-content-font);
`;

const Value = styled.span`
  color: #3d8d7a;
  font-weight: 700;
`;

const Notice = styled.p`
  color: var(--color-content-font);
  line-height: 1.5;
  text-align: center;
  margin-top: 1rem;
`;

const SummaryCard = styled.section`
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 18px;
  padding: 1rem;
`;

export default function MyGarden() {
  const { userId } = useParams();
  const storedUserId = useAuthStore((state) => state.userId);
  const [user, setUser] = useState<UserDetailResponseDto | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<UserStatsResponseDto[]>([]);
  const [todayStats, setTodayStats] = useState<UserStatsResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [userId]);

  const effectiveUserId = useMemo(() => {
    return normalizedUserId ?? storedUserId ?? null;
  }, [normalizedUserId, storedUserId]);

  useEffect(() => {
    if (!effectiveUserId) {
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [userRes, weeklyRes, todayRes] = await Promise.all([
          getUserById(effectiveUserId),
          getWeeklyStats(),
          getTodayStats(),
        ]);

        setUser(userRes.data);
        setWeeklyStats(weeklyRes.data);
        setTodayStats(todayRes.data);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('유저 정보를 불러오지 못했어요.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [effectiveUserId]);

  const weeklyCount = useMemo(() => {
    if (!user?.username) return '-';
    const match = weeklyStats.find((item) => item.username === user.username);
    return match?.commitCount ?? '0';
  }, [user, weeklyStats]);

  const todayCount = useMemo(() => {
    if (!user?.username) return '-';
    const match = todayStats.find((item) => item.username === user.username);
    return match?.commitCount ?? '0';
  }, [user, todayStats]);

  return (
    <Wrapper>
      <PageHeader title="내 정원 조회" />
      <Container>
        <BlockLabel>정원사 정보</BlockLabel>
        {isLoading && <Loading />}
        {!isLoading && !effectiveUserId && (
          <Notice>유저 ID가 없어서 상세 정보를 불러올 수 없어요.</Notice>
        )}
        {!isLoading && effectiveUserId && errorMessage && <Notice>{errorMessage}</Notice>}
        {!isLoading && effectiveUserId && !errorMessage && user && (
          <>
            <SummaryCard>
              <InfoRow>
                <Label>오늘 잔디</Label>
                <Value>{todayCount}</Value>
              </InfoRow>
              <InfoRow>
                <Label>이번주 잔디</Label>
                <Value>{weeklyCount}</Value>
              </InfoRow>
            </SummaryCard>

            <InfoCard>
              <InfoRow>
                <Label>아이디</Label>
                <Value>{user.id ?? effectiveUserId}</Value>
              </InfoRow>
              <InfoRow>
                <Label>이름</Label>
                <Value>{user.username ?? '-'}</Value>
              </InfoRow>
              <InfoRow>
                <Label>이메일</Label>
                <Value>{user.email ?? '-'}</Value>
              </InfoRow>
            </InfoCard>
          </>
        )}
      </Container>
    </Wrapper>
  );
}
