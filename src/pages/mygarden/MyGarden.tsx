import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { FrameViewport } from '@/components/FrameViewport';
import ProgressBar from '@/components/ProgressBar';
import { getMyLevelHistory, getMyLevelProgress, getUserById } from '@/api/user';
import { getTodayStats, getWeeklyStats } from '@/api/stats';
import { useAuthStore } from '@/store/authStore';
import type {
  UserDetailResponseDto,
  UserLevelHistoryResponseDto,
  UserLevelProgressResponseDto,
  UserStatsResponseDto,
} from '@/types/api';
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

const LevelCard = styled.section`
  margin-top: 0.85rem;
  background: linear-gradient(165deg, #faf1e6 0%, #f4eadc 55%, #efe3d3 100%);
  border-radius: 25px;
  padding: 1rem 1rem 1.1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
`;

const LevelHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
`;

const LevelHeading = styled.div`
  color: #3d8d7a;

  h3 {
    font-size: 1.04rem;
    margin-bottom: 0.2rem;
  }

  p {
    font-size: 0.83rem;
    color: #6f8476;
  }
`;

const BadgePill = styled.div`
  background: linear-gradient(140deg, #3d8d7a 0%, #6aa58f 100%);
  color: #ffffff;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.77rem;
  font-weight: 700;
  white-space: nowrap;
`;

const LevelStatGrid = styled.div`
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
  text-align: center;
`;

const StatLabel = styled.p`
  color: #819586;
  font-size: 0.73rem;
`;

const StatValue = styled.p`
  color: #3d8d7a;
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 0.1rem;
`;

const NextLevelCard = styled.div`
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  padding: 0.7rem;
`;

const NextLevelText = styled.p`
  color: #476154;
  font-size: 0.84rem;
`;

const NextLevelTrack = styled.div`
  margin-top: 0.45rem;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #d7e7dd;
  overflow: hidden;
`;

const NextLevelTrackFill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => `${$percent}%`};
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6ab495 0%, #3d8d7a 100%);
`;

const BadgeCollection = styled.div`
  margin-top: 0.75rem;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  padding: 0.72rem;
`;

const BadgeCollectionTitle = styled.p`
  color: #4d6b5d;
  font-size: 0.82rem;
  font-weight: 700;
`;

const BadgeCollectionGrid = styled.div`
  margin-top: 0.48rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
`;

const BadgeChip = styled.div<{ $active: boolean }>`
  border-radius: 10px;
  padding: 0.42rem 0.5rem;
  font-size: 0.77rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#2f5f51' : '#9ba99f')};
  background: ${({ $active }) => ($active ? '#dcf0e6' : '#f1efec')};
`;

const HistoryTitle = styled.h4`
  margin-top: 0.85rem;
  color: #3d8d7a;
  font-size: 0.95rem;
`;

const HistoryList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.6rem;
`;

const HistoryItem = styled.li`
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  padding: 0.62rem 0.68rem;
`;

const HistoryLine = styled.div`
  color: #355f52;
  font-size: 0.85rem;
  font-weight: 600;
`;

const HistoryMeta = styled.div`
  color: #768d7f;
  font-size: 0.76rem;
  margin-top: 0.2rem;
`;

const Notice = styled.p`
  color: #6b6b6b;
  text-align: center;
`;

const LevelActionRow = styled.div`
  margin-top: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
`;

const LevelHint = styled.p`
  color: #6f8476;
  font-size: 0.78rem;
  text-align: left;
`;

const OpenModalButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.42rem 0.78rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffffff;
  background: #3d8d7a;
  cursor: pointer;

  &:hover {
    background: #357b69;
  }
`;

const FullscreenModal = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: rgba(26, 42, 35, 0.34);
  backdrop-filter: blur(4px);
  display: flex;
`;

const ModalSheet = styled.section`
  width: 100%;
  height: 100%;
  background: linear-gradient(175deg, #f7eee2 0%, #f0e5d6 100%);
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const ModalHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
`;

const ModalTitle = styled.h3`
  color: #2f5f51;
  font-size: 1.05rem;
`;

const CloseModalButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.34rem 0.74rem;
  font-size: 0.77rem;
  font-weight: 700;
  color: #ffffff;
  background: #7f8d83;
  cursor: pointer;
`;

const ModalBody = styled.div`
  margin-top: 0.75rem;
  overflow-y: auto;
  padding-bottom: 1.1rem;
`;

const getTreeName = (weeklyCount: number) => {
  if (weeklyCount >= 20) return '무성한 큰나무';
  if (weeklyCount >= 12) return '든든한 중간나무';
  if (weeklyCount >= 5) return '쑥쑥 자라는 새싹나무';
  return '처음 심은 새싹';
};

const badgeInfoMap: Record<string, { emoji: string; label: string }> = {
  SPROUT: { emoji: '🌱', label: '새싹 배지' },
  SAPLING: { emoji: '🌿', label: '새나무 배지' },
  GROWING_TREE: { emoji: '🌳', label: '성장나무 배지' },
  BIG_TREE: { emoji: '🌲', label: '큰나무 배지' },
  MASTER_GARDENER: { emoji: '👑', label: '마스터 정원사 배지' },
};

const badgeOrder = [
  { level: 1, key: 'SPROUT' },
  { level: 2, key: 'SAPLING' },
  { level: 3, key: 'GROWING_TREE' },
  { level: 4, key: 'BIG_TREE' },
  { level: 5, key: 'MASTER_GARDENER' },
] as const;

const levelFloorMap: Record<number, number> = {
  1: 0,
  2: 7,
  3: 15,
  4: 30,
  5: 60,
};

const formatHistoryDate = (value: string | null) => {
  if (!value) return '시간 정보 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '시간 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

export default function MyGarden() {
  const { userId } = useParams();
  const storedUserId = useAuthStore((state) => state.userId);
  const [user, setUser] = useState<UserDetailResponseDto | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<UserStatsResponseDto[]>([]);
  const [todayStats, setTodayStats] = useState<UserStatsResponseDto[]>([]);
  const [levelProgress, setLevelProgress] = useState<UserLevelProgressResponseDto | null>(null);
  const [levelHistories, setLevelHistories] = useState<UserLevelHistoryResponseDto[]>([]);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [userId]);

  const effectiveUserId = normalizedUserId ?? storedUserId ?? null;
  const isMyGarden = !!storedUserId && effectiveUserId === storedUserId;

  useEffect(() => {
    if (!effectiveUserId) {
      setErrorMessage('유저 ID가 없어서 상세 정보를 불러올 수 없어요.');
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [userRes, weeklyRes, todayRes, myProgressRes, myHistoryRes] = await Promise.all([
          getUserById(effectiveUserId),
          getWeeklyStats(),
          getTodayStats(),
          isMyGarden ? getMyLevelProgress() : Promise.resolve(null),
          isMyGarden ? getMyLevelHistory(10) : Promise.resolve(null),
        ]);

        setUser(userRes.data);
        setWeeklyStats(weeklyRes.data);
        setTodayStats(todayRes.data);
        setLevelProgress(myProgressRes?.data ?? null);
        setLevelHistories(myHistoryRes?.data ?? []);
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '유저 정보를 불러오지 못했어요.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [effectiveUserId, isMyGarden]);

  const weeklyCount = useMemo(() => {
    if (!user?.username) return 0;
    const match = weeklyStats.find((item) => item.username === user.username);
    return match?.commitCount ?? 0;
  }, [user, weeklyStats]);

  const todayCount = useMemo(() => {
    if (!user?.username) return 0;
    const match = todayStats.find((item) => item.username === user.username);
    return match?.commitCount ?? 0;
  }, [user, todayStats]);

  const themeMode = new Date().getHours() >= 6 && new Date().getHours() < 18 ? 'morning' : 'night';
  const treeName = getTreeName(weeklyCount);
  const progressTotal = 20;
  const progressValue = Math.min(progressTotal, weeklyCount);
  const githubId = user?.username ?? 'gardener';
  const badgeInfo = badgeInfoMap[levelProgress?.currentBadge ?? user?.levelBadge ?? 'SPROUT'] ?? {
    emoji: '🌱',
    label: '새싹 배지',
  };
  const levelProgressPercent = useMemo(() => {
    if (!levelProgress?.nextLevelMinPostCount) return 100;
    const currentFloor = levelFloorMap[levelProgress.currentLevel] ?? 0;
    const nextFloor = levelProgress.nextLevelMinPostCount;
    const totalGap = Math.max(1, nextFloor - currentFloor);
    const currentGap = Math.max(0, levelProgress.postCount - currentFloor);
    return Math.min(100, Math.round((currentGap / totalGap) * 100));
  }, [levelProgress]);
  const recentLevelUp = levelHistories[0] ?? null;

  useEffect(() => {
    if (!isLevelModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLevelModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLevelModalOpen]);

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
                  당신의 레벨 : <span>Lv.{user.level} {user.levelName}</span> · <span>{user.levelBadge}</span>
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

            {isMyGarden && levelProgress && (
              <LevelCard>
                <LevelHeader>
                  <LevelHeading>
                    <h3>레벨 진행도</h3>
                    <p>오늘도 꾸준히 잔디를 심고 있어요.</p>
                  </LevelHeading>
                  <BadgePill>
                    {badgeInfo.emoji} {badgeInfo.label}
                  </BadgePill>
                </LevelHeader>

                <LevelStatGrid>
                  <StatCard>
                    <StatLabel>현재 레벨</StatLabel>
                    <StatValue>Lv.{levelProgress.currentLevel}</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>누적 인증</StatLabel>
                    <StatValue>{levelProgress.postCount}회</StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>다음까지</StatLabel>
                    <StatValue>{levelProgress.remainingPostCount}회</StatValue>
                  </StatCard>
                </LevelStatGrid>

                <NextLevelCard>
                  <NextLevelText>
                    {levelProgress.nextLevelName
                      ? `다음 레벨 "${levelProgress.nextLevelName}"까지 ${levelProgress.remainingPostCount}회 남았어요.`
                      : '최고 레벨을 달성했어요!'}
                  </NextLevelText>
                  <NextLevelTrack>
                    <NextLevelTrackFill $percent={levelProgressPercent} />
                  </NextLevelTrack>
                </NextLevelCard>

                <LevelActionRow>
                  <LevelHint>
                    {recentLevelUp
                      ? `최근 레벨업: Lv.${recentLevelUp.newLevel} ${recentLevelUp.newLevelName}`
                      : '최근 레벨업 이력이 없어요.'}
                  </LevelHint>
                  <OpenModalButton type="button" onClick={() => setIsLevelModalOpen(true)}>
                    상세 보기
                  </OpenModalButton>
                </LevelActionRow>
              </LevelCard>
            )}

            {isMyGarden && levelProgress && isLevelModalOpen && (
              <FullscreenModal role="dialog" aria-modal="true" aria-label="레벨 상세 정보">
                <ModalSheet>
                  <ModalHeader>
                    <ModalTitle>레벨 상세 정보</ModalTitle>
                    <CloseModalButton type="button" onClick={() => setIsLevelModalOpen(false)}>
                      닫기
                    </CloseModalButton>
                  </ModalHeader>

                  <ModalBody>
                    <BadgeCollection>
                      <BadgeCollectionTitle>배지 컬렉션</BadgeCollectionTitle>
                      <BadgeCollectionGrid>
                        {badgeOrder.map((badge) => {
                          const info = badgeInfoMap[badge.key];
                          const unlocked = levelProgress.currentLevel >= badge.level;
                          return (
                            <BadgeChip key={badge.key} $active={unlocked}>
                              {info.emoji} {info.label}
                            </BadgeChip>
                          );
                        })}
                      </BadgeCollectionGrid>
                    </BadgeCollection>

                    <HistoryTitle>레벨업 히스토리</HistoryTitle>
                    <HistoryList>
                      {levelHistories.length === 0 && <HistoryItem>아직 레벨업 이력이 없어요.</HistoryItem>}
                      {levelHistories.map((history) => (
                        <HistoryItem key={history.id ?? `${history.newLevel}-${history.changedAt}`}>
                          <HistoryLine>
                            Lv.{history.previousLevel} {history.previousLevelName} → Lv.{history.newLevel}{' '}
                            {history.newLevelName}
                          </HistoryLine>
                          <HistoryMeta>
                            누적 {history.postCount}회 · {formatHistoryDate(history.changedAt)}
                          </HistoryMeta>
                        </HistoryItem>
                      ))}
                    </HistoryList>
                  </ModalBody>
                </ModalSheet>
              </FullscreenModal>
            )}
          </>
        )}
      </PageContainer>
    </Wrapper>
  );
}
