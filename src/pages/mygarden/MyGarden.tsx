import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { FrameViewport } from '@/components/FrameViewport';
import ProgressBar from '@/components/ProgressBar';
import { getMyPosts } from '@/api/post';
import { getMyLevelHistory, getMyLevelProgress, getUserById } from '@/api/user';
import { getTodayStats, getWeeklyStats } from '@/api/stats';
import { useAuthStore } from '@/store/authStore';
import type {
  PostSummaryDto,
  UserDetailResponseDto,
  UserLevelHistoryResponseDto,
  UserLevelProgressResponseDto,
  UserStatsResponseDto,
} from '@/types/api';
import { getErrorMessage } from '@/utils/error';

const PageContainer = styled.section`
  width: min(92vw, 430px);
  margin: 0 auto;
  height: calc(100dvh - 86px);
  display: grid;
  grid-template-rows: minmax(230px, 1fr) auto auto;
  gap: 8px;
  overflow: hidden;
`;

const FrameContainer = styled.section`
  width: 100%;
  min-height: 220px;
  max-height: 48vh;
`;

const TreeInfoBox = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #faf1e6;
  width: 100%;
  border-radius: 25px;
  padding: 0.65rem 0.75rem;
  gap: 0.55rem;
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
  padding: 0.45rem;
`;

const LevelCard = styled.section`
  background: linear-gradient(165deg, #faf1e6 0%, #f4eadc 55%, #efe3d3 100%);
  border-radius: 25px;
  padding: 0.72rem;
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
    font-size: 0.96rem;
    margin-bottom: 0.12rem;
  }

  p {
    font-size: 0.74rem;
    color: #6f8476;
  }

  strong {
    color: #3d8d7a;
    font-size: 0.86rem;
  }
`;

const BadgePill = styled.div`
  background: linear-gradient(140deg, #3d8d7a 0%, #6aa58f 100%);
  color: #ffffff;
  border-radius: 999px;
  padding: 0.26rem 0.58rem;
  font-size: 0.69rem;
  font-weight: 700;
  white-space: nowrap;
`;

const LevelStatGrid = styled.div`
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.75);
  border-radius: 12px;
  padding: 0.4rem 0.5rem;
  text-align: center;
`;

const StatLabel = styled.p`
  color: #819586;
  font-size: 0.67rem;
`;

const StatValue = styled.p`
  color: #3d8d7a;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 0.1rem;
`;

const NextLevelCard = styled.div`
  margin-top: 0.48rem;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 14px;
  padding: 0.58rem;
`;

const NextLevelText = styled.p`
  color: #476154;
  font-size: 0.74rem;
`;

const NextLevelTrack = styled.div`
  margin-top: 0.3rem;
  width: 100%;
  height: 6px;
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
  margin-top: 0.45rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
`;

const LevelHint = styled.p`
  color: #6f8476;
  font-size: 0.71rem;
  text-align: left;
`;

const OpenModalButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.36rem 0.64rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffffff;
  background: #3d8d7a;
  cursor: pointer;

  &:hover {
    background: #357b69;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(26, 42, 35, 0.42);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalSheet = styled.section`
  width: min(92vw, 430px);
  max-height: min(82vh, 720px);
  background: linear-gradient(175deg, #f7eee2 0%, #f0e5d6 100%);
  border-radius: 22px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  padding: 0.92rem;
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
  margin-top: 0.62rem;
  overflow-y: auto;
  padding-right: 2px;
  padding-bottom: 0.2rem;
`;

const MissionCard = styled.div`
  margin-top: 0.5rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 14px;
  padding: 0.58rem;
`;

const MissionTitle = styled.p`
  color: #3d8d7a;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: left;
`;

const MissionList = styled.ul`
  margin-top: 0.4rem;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
`;

const MissionItem = styled.li<{ $done: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  border-radius: 10px;
  padding: 0.42rem 0.52rem;
  background: ${({ $done }) => ($done ? '#dff4e8' : '#f3f0ed')};
  color: ${({ $done }) => ($done ? '#2f6958' : '#70857a')};
  font-size: 0.76rem;
  font-weight: 700;
`;

const StreakBadge = styled.div<{ $risk: boolean }>`
  margin-top: 0.48rem;
  border-radius: 12px;
  padding: 0.5rem 0.6rem;
  background: ${({ $risk }) => ($risk ? 'linear-gradient(135deg, #ffe4cd 0%, #ffd8bf 100%)' : 'linear-gradient(135deg, #e0f3e8 0%, #d2ecd9 100%)')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const StreakMain = styled.div`
  text-align: left;

  strong {
    font-size: 1rem;
    color: #2f5f51;
  }

  p {
    margin-top: 0.1rem;
    font-size: 0.72rem;
    color: #60776b;
  }
`;

const StreakBonus = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  color: #3d8d7a;
  white-space: nowrap;
`;

const CalendarCard = styled.div`
  margin-top: 0.85rem;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 14px;
  padding: 0.68rem;
`;

const CalendarTitle = styled.p`
  color: #3d8d7a;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: left;
`;

const WeekHeader = styled.div`
  margin-top: 0.45rem;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.18rem;
`;

const WeekHeaderCell = styled.div`
  font-size: 0.66rem;
  color: #7c8f84;
  text-align: center;
  font-weight: 700;
`;

const CalendarGrid = styled.div`
  margin-top: 0.2rem;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.18rem;
`;

const CalendarCell = styled.div<{ $active: boolean; $today: boolean }>`
  height: 24px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#ffffff' : '#84988d')};
  background: ${({ $active }) => ($active ? '#3d8d7a' : '#f2f0ed')};
  outline: ${({ $today }) => ($today ? '1px dashed #3d8d7a' : 'none')};
`;

const TrophyCard = styled.div`
  margin-top: 0.85rem;
  background: rgba(255, 255, 255, 0.74);
  border-radius: 14px;
  padding: 0.68rem;
`;

const TrophyTitle = styled.p`
  color: #3d8d7a;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: left;
`;

const TrophyGrid = styled.div`
  margin-top: 0.45rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
`;

const TrophyChip = styled.div<{ $active: boolean }>`
  border-radius: 10px;
  padding: 0.45rem 0.52rem;
  background: ${({ $active }) => ($active ? '#e4f5ea' : '#f1efec')};
  color: ${({ $active }) => ($active ? '#2f6756' : '#95a39a')};
  font-size: 0.72rem;
  font-weight: 700;
  text-align: left;
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

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const normalized = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  return normalized;
};

const calcStreakDays = (dateKeys: string[]): number => {
  if (!dateKeys.length) return 0;

  const set = new Set(dateKeys);
  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let streak = 0;

  if (!set.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(toDateKey(cursor))) return 0;
  }

  while (set.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export default function MyGarden() {
  const { userId } = useParams();
  const storedUserId = useAuthStore((state) => state.userId);
  const [user, setUser] = useState<UserDetailResponseDto | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<UserStatsResponseDto[]>([]);
  const [todayStats, setTodayStats] = useState<UserStatsResponseDto[]>([]);
  const [myPostDateKeys, setMyPostDateKeys] = useState<string[]>([]);
  const [levelProgress, setLevelProgress] = useState<UserLevelProgressResponseDto | null>(null);
  const [levelHistories, setLevelHistories] = useState<UserLevelHistoryResponseDto[]>([]);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
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
        const fetchMyPostDateKeys = async (): Promise<string[]> => {
          if (!isMyGarden) return [];

          const collected: string[] = [];
          const maxPages = 6;

          for (let page = 0; page < maxPages; page += 1) {
            const response = await getMyPosts({ page, size: 100 });
            const items = response.data.content ?? [];
            items.forEach((item: PostSummaryDto) => {
              const key = parseDateKey(item.createdDate);
              if (key) collected.push(key);
            });

            if (page >= response.data.totalPages - 1) break;
          }

          return Array.from(new Set(collected)).sort();
        };

        const [userRes, weeklyRes, todayRes, myProgressRes, myHistoryRes] = await Promise.all([
          getUserById(effectiveUserId),
          getWeeklyStats(),
          getTodayStats(),
          isMyGarden ? getMyLevelProgress() : Promise.resolve(null),
          isMyGarden ? getMyLevelHistory(10) : Promise.resolve(null),
        ]);

        const myDateKeys = await fetchMyPostDateKeys();

        setUser(userRes.data);
        setWeeklyStats(weeklyRes.data);
        setTodayStats(todayRes.data);
        setLevelProgress(myProgressRes?.data ?? null);
        setLevelHistories(myHistoryRes?.data ?? []);
        setMyPostDateKeys(myDateKeys);

        if (isMyGarden && myProgressRes?.data && effectiveUserId) {
          const storageKey = `mygarden:last-level:${effectiveUserId}`;
          const lastLevel = Number(window.localStorage.getItem(storageKey) ?? '0');
          if (myProgressRes.data.currentLevel > lastLevel && lastLevel > 0) {
            setJustLeveledUp(true);
            window.setTimeout(() => setJustLeveledUp(false), 2200);
          }
          window.localStorage.setItem(storageKey, String(myProgressRes.data.currentLevel));
        }
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
  const streakDays = useMemo(() => calcStreakDays(myPostDateKeys), [myPostDateKeys]);
  const todayDone = todayCount > 0;
  const streakRisk = !todayDone && streakDays > 0;
  const streakBonusLabel =
    streakDays >= 30 ? '🌟 전설 유지 보너스' : streakDays >= 14 ? '🔥 장기 연속 보너스' : streakDays >= 7 ? '🎁 7일 연속 보너스' : '🌱 연속 도전 중';

  const missionItems = useMemo(
    () => [
      { label: '오늘 물주기 인증', done: todayDone, detail: todayDone ? '완료' : '미완료' },
      { label: '연속 인증 3일 달성', done: streakDays >= 3, detail: `${streakDays}일` },
      {
        label: '다음 레벨 준비',
        done: (levelProgress?.remainingPostCount ?? 0) === 0,
        detail: levelProgress ? `${levelProgress.remainingPostCount}회 남음` : '-',
      },
    ],
    [todayDone, streakDays, levelProgress]
  );

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const items: Array<{ day: number | null; active: boolean; today: boolean }> = [];
    const postSet = new Set(myPostDateKeys);

    for (let i = 0; i < first.getDay(); i += 1) {
      items.push({ day: null, active: false, today: false });
    }

    for (let day = 1; day <= last.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const key = toDateKey(date);
      items.push({ day, active: postSet.has(key), today: key === toDateKey(now) });
    }

    while (items.length % 7 !== 0) {
      items.push({ day: null, active: false, today: false });
    }

    return items;
  }, [myPostDateKeys]);

  const trophies = useMemo(
    () => [
      { title: '첫 물주기 달성', unlocked: (levelProgress?.postCount ?? 0) >= 1, emoji: '🥉' },
      { title: '7일 연속 인증', unlocked: streakDays >= 7, emoji: '🔥' },
      { title: 'Lv.3 도달', unlocked: (levelProgress?.currentLevel ?? 0) >= 3, emoji: '🌳' },
      { title: 'Lv.5 도달', unlocked: (levelProgress?.currentLevel ?? 0) >= 5, emoji: '👑' },
      { title: '월간 12회 인증', unlocked: calendarDays.filter((x) => x.active).length >= 12, emoji: '📅' },
      { title: '연속 30일 인증', unlocked: streakDays >= 30, emoji: '🏆' },
    ],
    [levelProgress, streakDays, calendarDays]
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
    <Wrapper>
      <PageHeader title="내 정원 조회" />
      <PageContainer>
        {isLoading && <Loading />}
        {!isLoading && errorMessage && <Notice>{errorMessage}</Notice>}

        {!isLoading && !errorMessage && user && (
          <>
            <FrameContainer>
              <FrameViewport
                themeMode={themeMode}
                treeState={{ totalDate: weeklyCount, currentDate: todayCount }}
                treeBadge={levelProgress?.currentBadge ?? user.levelBadge}
                levelUpPulse={justLeveledUp}
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
                    <p>
                      <strong>{user.username}</strong> 님 · Lv.{levelProgress.currentLevel} {levelProgress.currentLevelName}
                    </p>
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

                <MissionCard>
                  <MissionTitle>오늘의 미션</MissionTitle>
                  <MissionList>
                    {missionItems.map((mission) => (
                      <MissionItem key={mission.label} $done={mission.done}>
                        <span>
                          {mission.done ? '✅' : '⬜'} {mission.label}
                        </span>
                        <span>{mission.detail}</span>
                      </MissionItem>
                    ))}
                  </MissionList>

                  <StreakBadge $risk={streakRisk}>
                    <StreakMain>
                      <strong>{streakDays}일 연속</strong>
                      <p>{streakRisk ? '오늘 인증이 없으면 연속 기록이 끊겨요!' : '좋아요, 연속 기록 유지 중이에요.'}</p>
                    </StreakMain>
                    <StreakBonus>{streakBonusLabel}</StreakBonus>
                  </StreakBadge>
                </MissionCard>

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
              <ModalOverlay role="dialog" aria-modal="true" aria-label="레벨 상세 정보">
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

                    <CalendarCard>
                      <CalendarTitle>월간 성장 캘린더</CalendarTitle>
                      <WeekHeader>
                        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                          <WeekHeaderCell key={day}>{day}</WeekHeaderCell>
                        ))}
                      </WeekHeader>
                      <CalendarGrid>
                        {calendarDays.map((cell, index) => (
                          <CalendarCell key={`${cell.day}-${index}`} $active={cell.active} $today={cell.today}>
                            {cell.day ?? ''}
                          </CalendarCell>
                        ))}
                      </CalendarGrid>
                    </CalendarCard>

                    <TrophyCard>
                      <TrophyTitle>업적 진열대</TrophyTitle>
                      <TrophyGrid>
                        {trophies.map((trophy) => (
                          <TrophyChip key={trophy.title} $active={trophy.unlocked}>
                            {trophy.unlocked ? trophy.emoji : '🔒'} {trophy.title}
                          </TrophyChip>
                        ))}
                      </TrophyGrid>
                    </TrophyCard>
                  </ModalBody>
                </ModalSheet>
              </ModalOverlay>
            )}
          </>
        )}
      </PageContainer>
    </Wrapper>
  );
}
