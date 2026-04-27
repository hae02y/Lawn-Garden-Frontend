import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { FrameViewport } from '@/components/FrameViewport';
import ProgressBar from '@/components/ProgressBar';
import { getUserById } from '@/api/user';
import { getTodayStats, getWeeklyStats } from '@/api/stats';
import { useAuthStore } from '@/store/authStore';
import type { UserDetailResponseDto, UserStatsResponseDto } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const PageContainer = styled.section`
  width: min(92vw, 430px);
  margin: 0 auto;
`;

const UserInfoBox = styled.header`
  background-color: #faf1e6;
  width: 100%;
  min-height: 102px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  padding: 1rem;
  text-align: center;
`;

const UserInfoText = styled.div`
  color: #99bc85;

  span {
    color: #3d8d7a;
  }
`;

const FrameContainer = styled.section`
  width: 100%;
  aspect-ratio: 430 / 450;
  margin-bottom: 10px;
`;

const TreeInfoBox = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #faf1e6;
  width: 100%;
  border-radius: 25px;
  padding: 1rem;
  gap: 0.85rem;
`;

const TreeInfoText = styled.div`
  color: #3d8d7a;
  text-align: center;

  span {
    font-size: 17px;
    color: #99bc85;
  }
`;

const GraphCard = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  padding: 0.75rem;
`;

const Notice = styled.p`
  color: #6b6b6b;
  text-align: center;
`;

const getTreeName = (weeklyCount: number) => {
  if (weeklyCount >= 20) return '무성한 큰나무';
  if (weeklyCount >= 12) return '든든한 중간나무';
  if (weeklyCount >= 5) return '쑥쑥 자라는 새싹나무';
  return '처음 심은 새싹';
};

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

  const effectiveUserId = normalizedUserId ?? storedUserId ?? null;

  useEffect(() => {
    if (!effectiveUserId) {
      setErrorMessage('유저 ID가 없어서 상세 정보를 불러올 수 없어요.');
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
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '유저 정보를 불러오지 못했어요.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [effectiveUserId]);

  const weeklyCount = useMemo(() => {
    if (!user?.username) return 0;
    const match = weeklyStats.find((item) => item.username === user.username);
    return Number(match?.commitCount ?? 0);
  }, [user, weeklyStats]);

  const todayCount = useMemo(() => {
    if (!user?.username) return 0;
    const match = todayStats.find((item) => item.username === user.username);
    return Number(match?.commitCount ?? 0);
  }, [user, todayStats]);

  const themeMode = new Date().getHours() >= 6 && new Date().getHours() < 18 ? 'morning' : 'night';
  const treeName = getTreeName(weeklyCount);
  const progressTotal = 20;
  const progressValue = Math.min(progressTotal, weeklyCount);
  const githubId = user?.username ?? 'gardener';

  return (
    <Wrapper marginBottom>
      <PageHeader title="내 정원 조회" />
      <PageContainer>
        {isLoading && <Loading />}
        {!isLoading && errorMessage && <Notice>{errorMessage}</Notice>}

        {!isLoading && !errorMessage && user && (
          <>
            <UserInfoBox>
              <UserInfoText>
                <h2>
                  <span>{user.username}</span> 님의 정원
                </h2>
                <h4>
                  당신의 레벨 : <span>Lv.{user.level} {user.levelName}</span>
                </h4>
              </UserInfoText>
            </UserInfoBox>

            <FrameContainer>
              <FrameViewport
                themeMode={themeMode}
                treeState={{ totalDate: weeklyCount, currentDate: todayCount }}
              />
            </FrameContainer>

            <TreeInfoBox>
              <TreeInfoText>
                <h3>
                  지금 내 나무는?
                  <br />
                  <span>{treeName}</span>
                </h3>
              </TreeInfoText>

              <ProgressBar total={progressTotal} value={progressValue} />

              <GraphCard>
                <img
                  src={`https://ghchart.rshah.org/${encodeURIComponent(githubId)}`}
                  alt="GitHub 잔디 그래프"
                  style={{ width: '100%', border: 'none', display: 'block' }}
                />
              </GraphCard>
            </TreeInfoBox>
          </>
        )}
      </PageContainer>
    </Wrapper>
  );
}
