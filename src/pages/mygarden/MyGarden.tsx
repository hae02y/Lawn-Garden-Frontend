import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Wrapper from '@/styles/Wrapper';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { FrameViewport } from '@/components/FrameViewport';
import ProgressBar from '@/components/ProgressBar';
import {
  getMyNotifications,
  getNotificationSettings,
  markAllNotificationsRead,
  markNotificationRead,
  refreshMyNotifications,
  updateNotificationSettings,
} from '@/api/notification';
import { refreshMyAchievements } from '@/api/achievement';
import { cheerUser, getCheerStatus, getWeeklyLeaderboard } from '@/api/social';
import { getMyPosts } from '@/api/post';
import { getMyLevelHistory, getMyLevelProgress, getUserById } from '@/api/user';
import { getTodayStats, getWeeklyStats } from '@/api/stats';
import { useAuthStore } from '@/store/authStore';
import type {
  NotificationSeverity,
  NotificationReadResponseDto,
  PageResponse,
  PostSummaryDto,
  UserAchievementResponseDto,
  UserNotificationSettingDto,
  UserNotificationResponseDto,
  UserDetailResponseDto,
  UserLevelHistoryResponseDto,
  UserLevelProgressResponseDto,
  UserStatsResponseDto,
  WeeklyLeaderboardItemDto,
  CheerStatusResponseDto,
} from '@/types/api';
import { getErrorMessage } from '@/utils/error';

type GardenSeason = 'spring' | 'summer' | 'autumn' | 'winter';

const seasonCardGradient: Record<GardenSeason, string> = {
  spring: 'linear-gradient(165deg, #fff1f6 0%, #f5efe2 60%, #edf8ee 100%)',
  summer: 'linear-gradient(165deg, #fff5dd 0%, #eff7e9 58%, #e8f6f4 100%)',
  autumn: 'linear-gradient(165deg, #fff1e3 0%, #f8ead8 56%, #f2e9dc 100%)',
  winter: 'linear-gradient(165deg, #eef5ff 0%, #f4f8ff 58%, #f0f4f8 100%)',
};

const seasonAccentMap: Record<GardenSeason, string> = {
  spring: '#c9759a',
  summer: '#cc8a37',
  autumn: '#b36b2f',
  winter: '#5f86b7',
};

const PageContainer = styled.section`
  width: min(92vw, 430px);
  margin: 0 auto;
  height: calc(100dvh - 88px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;

  @media (min-height: 900px) {
    height: calc(100dvh - 96px);
  }
`;

const SeasonShell = styled.div<{ $season: GardenSeason }>`
  border-radius: 24px;
  padding: 0.35rem 0.3rem 0.7rem;
  background: ${({ $season }) => seasonCardGradient[$season]};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
`;

const FrameContainer = styled.section`
  width: 100%;
  flex: 1 1 auto;
  min-height: 220px;
  max-height: clamp(260px, 48vh, 420px);
`;

const TreeInfoBox = styled.section<{ $season: GardenSeason }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ $season }) => seasonCardGradient[$season]};
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

const LevelCard = styled.section<{ $season: GardenSeason }>`
  background: ${({ $season }) => seasonCardGradient[$season]};
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

const BadgePill = styled.div<{ $season: GardenSeason }>`
  background: ${({ $season }) => `linear-gradient(140deg, ${seasonAccentMap[$season]} 0%, #6aa58f 100%)`};
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
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 10px;
  padding: 0.42rem 0.5rem;
  font-size: 0.77rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? '#2f5f51' : '#9ba99f')};
  background: ${({ $active }) => ($active ? '#dcf0e6' : '#f1efec')};
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
`;

const BadgeHint = styled.p`
  margin-top: 0.42rem;
  font-size: 0.7rem;
  color: #71867a;
  text-align: left;
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

const BellButton = styled.button<{ $hasUnread: boolean }>`
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 0.38rem 0.64rem;
  font-size: 0.78rem;
  font-weight: 800;
  color: #fff;
  background: ${({ $hasUnread }) => ($hasUnread ? '#d17c43' : '#3d8d7a')};
`;

const NotificationPanel = styled.section<{ $season: GardenSeason }>`
  width: min(92vw, 430px);
  max-height: min(72vh, 540px);
  background: ${({ $season }) => seasonCardGradient[$season]};
  border-radius: 20px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  padding: 0.88rem;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.55rem;

  h3 {
    color: #2f5f51;
    font-size: 0.98rem;
  }
`;

const NotificationToolRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-bottom: 0.45rem;
`;

const NotificationFilterGroup = styled.div`
  display: inline-flex;
  gap: 0.35rem;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.28rem 0.56rem;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#3d8d7a' : '#dfddd9')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#5b6460')};
`;

const TinyActionButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.28rem 0.56rem;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  background: #cfded6;
  color: #2f5f51;
`;

const NotificationList = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.46rem;
`;

const NotificationItem = styled.button<{ $read: boolean; $severity: NotificationSeverity }>`
  border: none;
  text-align: left;
  cursor: pointer;
  border-radius: 12px;
  padding: 0.56rem 0.62rem;
  background: ${({ $read, $severity }) => {
    if ($read) return '#f1ece6';
    if ($severity === 'WARN') return '#ffe9d8';
    if ($severity === 'SUCCESS') return '#dff4e8';
    return '#e7f2ec';
  }};

  strong {
    color: #2f5f51;
    font-size: 0.78rem;
  }

  p {
    margin-top: 0.15rem;
    color: #698074;
    font-size: 0.71rem;
    line-height: 1.32;
  }
`;

const NotificationActions = styled.div`
  margin-top: 0.62rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;

const MarkAllButton = styled.button`
  border: none;
  cursor: pointer;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.34rem 0.62rem;
  color: #fff;
  background: #5f7f73;
`;

const LoadMoreButton = styled.button`
  border: none;
  cursor: pointer;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.34rem 0.62rem;
  color: #2f5f51;
  background: #dce7e1;
`;

const SocialCard = styled.div<{ $season: GardenSeason }>`
  margin-top: 0.85rem;
  background: ${({ $season }) => seasonCardGradient[$season]};
  border-radius: 14px;
  padding: 0.68rem;
`;

const SocialTitle = styled.p`
  color: #3d8d7a;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: left;
`;

const CheerRow = styled.div`
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const CheerSummary = styled.p`
  color: #5c7669;
  font-size: 0.72rem;
`;

const CheerButton = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.62rem;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#ffffff' : '#355f52')};
  background: ${({ $active }) => ($active ? '#3d8d7a' : '#d7e4dd')};
`;

const LeaderboardList = styled.ul`
  margin-top: 0.5rem;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.34rem;
`;

const LeaderItem = styled.li`
  border-radius: 10px;
  background: #f3efe9;
  padding: 0.46rem 0.56rem;
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  color: #49675a;
  font-size: 0.72rem;
`;

const LeaderName = styled.span<{ $mine: boolean }>`
  font-weight: ${({ $mine }) => ($mine ? 800 : 700)};
  color: ${({ $mine }) => ($mine ? '#255448' : '#49675a')};
`;

const RankBadge = styled.span<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  color: ${({ $rank }) => ($rank <= 3 ? '#ffffff' : '#49675a')};
  background: ${({ $rank }) => {
    if ($rank === 1) return '#d6a529';
    if ($rank === 2) return '#80909e';
    if ($rank === 3) return '#b07854';
    return '#d6e6de';
  }};
`;

const GrowthText = styled.span<{ $positive: boolean }>`
  color: ${({ $positive }) => ($positive ? '#2f835f' : '#ab6a50')};
  font-weight: 700;
`;

const NotificationSentinel = styled.div`
  height: 1px;
`;

const toastIn = keyframes`
  0% { opacity: 0; transform: translateY(12px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const toastOut = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-8px) scale(0.98); }
`;

const ToastStack = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 1200;
  pointer-events: none;
`;

const UnlockToast = styled.div<{ $leaving: boolean }>`
  min-width: 240px;
  max-width: min(86vw, 340px);
  border-radius: 12px;
  background: linear-gradient(145deg, #355f52 0%, #47856f 100%);
  color: #ffffff;
  padding: 0.58rem 0.66rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: ${({ $leaving }) => ($leaving ? toastOut : toastIn)} 0.28s ease forwards;

  strong {
    font-size: 0.8rem;
  }

  p {
    margin-top: 0.12rem;
    font-size: 0.72rem;
    line-height: 1.32;
    opacity: 0.96;
  }
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

const CalendarCard = styled.div<{ $season: GardenSeason }>`
  margin-top: 0.85rem;
  background: ${({ $season }) => seasonCardGradient[$season]};
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

const WeekHeaderCell = styled.div<{ $weekend?: boolean }>`
  font-size: 0.66rem;
  color: ${({ $weekend }) => ($weekend ? '#b9735b' : '#7c8f84')};
  text-align: center;
  font-weight: 700;
`;

const CalendarGrid = styled.div`
  margin-top: 0.2rem;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.18rem;
`;

const CalendarCell = styled.button<{ $active: boolean; $today: boolean; $weekend: boolean; $selected: boolean }>`
  border: none;
  height: 24px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  font-weight: 700;
  color: ${({ $active, $weekend }) => ($active ? '#ffffff' : $weekend ? '#b07a64' : '#84988d')};
  background: ${({ $active, $selected }) => ($active ? '#3d8d7a' : $selected ? '#e8efe8' : '#f2f0ed')};
  outline: ${({ $today }) => ($today ? '1px dashed #3d8d7a' : 'none')};
  cursor: pointer;
  box-shadow: ${({ $selected }) => ($selected ? 'inset 0 0 0 1px #8cae9f' : 'none')};

  &:disabled {
    cursor: default;
    color: transparent;
    background: #f4f2ef;
    box-shadow: none;
  }
`;

const CalendarMeta = styled.div`
  margin-top: 0.42rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.42rem 0.5rem;
  color: #5b766a;
  font-size: 0.72rem;
`;

const CalendarNavRow = styled.div`
  margin-top: 0.35rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CalendarNavButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.24rem 0.52rem;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  background: #dce8e2;
  color: #3d6458;
`;

const CalendarMonthText = styled.p`
  color: #5f766c;
  font-size: 0.72rem;
  font-weight: 700;
`;

const TrophyCard = styled.div<{ $season: GardenSeason }>`
  margin-top: 0.85rem;
  background: ${({ $season }) => seasonCardGradient[$season]};
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

const badgeDetailMap: Record<string, string> = {
  SPROUT: '첫 시작을 알리는 새싹 배지예요. 오늘 한 번 더 물주기 해보세요.',
  SAPLING: '성장 루틴이 자리 잡기 시작한 단계예요.',
  GROWING_TREE: '안정적으로 성장하는 구간이에요. 연속 인증을 노려보세요.',
  BIG_TREE: '상위권 정원사 단계예요. 월간 완주가 눈앞이에요.',
  MASTER_GARDENER: '정원의 전설 단계예요. 최고의 루틴을 유지 중이에요.',
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

const achievementEmojiMap: Record<UserAchievementResponseDto['code'], string> = {
  FIRST_WATERING: '🥉',
  STREAK_7: '🔥',
  LEVEL_3: '🌳',
  LEVEL_5: '👑',
  MONTHLY_12: '📅',
  STREAK_30: '🏆',
};

const achievementLabelMap: Record<UserAchievementResponseDto['code'], string> = {
  FIRST_WATERING: '첫 물주기 달성',
  STREAK_7: '7일 연속 인증',
  LEVEL_3: 'Lv.3 도달',
  LEVEL_5: 'Lv.5 도달',
  MONTHLY_12: '월간 12회 인증',
  STREAK_30: '연속 30일 인증',
};

const getGardenSeason = (monthIndex: number): GardenSeason => {
  const month = monthIndex + 1;
  if ([3, 4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  if ([9, 10, 11].includes(month)) return 'autumn';
  return 'winter';
};

const formatMonthLabel = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }).format(date);
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
  const navigate = useNavigate();
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
  const [previewBadge, setPreviewBadge] = useState<string | null>(null);
  const [badgeFeedback, setBadgeFeedback] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotificationResponseDto[]>([]);
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationHasNext, setNotificationHasNext] = useState(false);
  const [notificationUnreadOnly, setNotificationUnreadOnly] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettingDto | null>(null);
  const [achievements, setAchievements] = useState<UserAchievementResponseDto[]>([]);
  const [leaderboard, setLeaderboard] = useState<WeeklyLeaderboardItemDto[]>([]);
  const [cheerStatus, setCheerStatus] = useState<CheerStatusResponseDto | null>(null);
  const [isCheering, setIsCheering] = useState(false);
  const [viewMonthDate, setViewMonthDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [unlockToasts, setUnlockToasts] = useState<Array<{ id: string; code: UserAchievementResponseDto['code']; leaving: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const notificationListRef = useRef<HTMLDivElement | null>(null);
  const notificationSentinelRef = useRef<HTMLDivElement | null>(null);
  const notificationLoadLockRef = useRef(false);
  const achievementsRef = useRef<UserAchievementResponseDto[]>([]);
  const notifiedAchievementRef = useRef<Set<UserAchievementResponseDto['code']>>(new Set());

  const normalizedUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = Number(userId);
    return Number.isNaN(parsed) ? null : parsed;
  }, [userId]);

  const effectiveUserId = normalizedUserId ?? storedUserId ?? null;
  const isMyGarden = !!storedUserId && effectiveUserId === storedUserId;

  const applyNotificationPage = useCallback((
    pageResponse: PageResponse<UserNotificationResponseDto>,
    append: boolean
  ) => {
    setNotifications((prev) => {
      if (!append) return pageResponse.content;

      const merged = [...prev, ...pageResponse.content];
      const unique = new Map<string, UserNotificationResponseDto>();
      merged.forEach((item) => {
        const key = item.id ? `id:${item.id}` : `code:${item.code}:${item.createdAt ?? ''}`;
        unique.set(key, item);
      });
      return Array.from(unique.values());
    });
    setNotificationPage(pageResponse.number);
    setNotificationHasNext(pageResponse.number + 1 < pageResponse.totalPages);
  }, []);

  const loadNotifications = useCallback(async ({
    unreadOnly,
    page,
    append,
  }: {
    unreadOnly: boolean;
    page: number;
    append: boolean;
  }) => {
    if (!isMyGarden) return;
    if (notificationLoadLockRef.current) return;

    try {
      notificationLoadLockRef.current = true;
      setNotificationLoading(true);
      const response = await getMyNotifications({ unreadOnly, page, size: 20 });
      applyNotificationPage(response.data, append);
      setNotificationUnreadOnly(unreadOnly);
    } finally {
      setNotificationLoading(false);
      notificationLoadLockRef.current = false;
    }
  }, [applyNotificationPage, isMyGarden]);

  const enqueueUnlockToast = useCallback((code: UserAchievementResponseDto['code']) => {
    const toastId = `${code}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setUnlockToasts((prev) => [...prev, { id: toastId, code, leaving: false }]);

    window.setTimeout(() => {
      setUnlockToasts((prev) => prev.map((item) => (item.id === toastId ? { ...item, leaving: true } : item)));
      window.setTimeout(() => {
        setUnlockToasts((prev) => prev.filter((item) => item.id !== toastId));
      }, 280);
    }, 2200);
  }, []);

  const applyAchievements = useCallback((incoming: UserAchievementResponseDto[], shouldNotify: boolean) => {
    const previous = achievementsRef.current;
    if (!shouldNotify || previous.length === 0) {
      const seeded = new Set(incoming.filter((item) => item.unlocked).map((item) => item.code));
      notifiedAchievementRef.current = seeded;
      achievementsRef.current = incoming;
      setAchievements(incoming);
      return;
    }

    const previousUnlocked = new Set(previous.filter((item) => item.unlocked).map((item) => item.code));
    const nextUnlocked = incoming.filter((item) => item.unlocked).map((item) => item.code);
    nextUnlocked.forEach((code) => {
      if (!previousUnlocked.has(code) && !notifiedAchievementRef.current.has(code)) {
        enqueueUnlockToast(code);
        notifiedAchievementRef.current.add(code);
      }
    });

    achievementsRef.current = incoming;
    setAchievements(incoming);
  }, [enqueueUnlockToast]);

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

        const [
          userRes,
          weeklyRes,
          todayRes,
          myProgressRes,
          myHistoryRes,
          notificationRes,
          achievementRes,
          leaderboardRes,
          cheerStatusRes,
          notificationSettingsRes,
        ] = await Promise.all([
          getUserById(effectiveUserId),
          getWeeklyStats(),
          getTodayStats(),
          isMyGarden ? getMyLevelProgress() : Promise.resolve(null),
          isMyGarden ? getMyLevelHistory(10) : Promise.resolve(null),
          isMyGarden ? refreshMyNotifications() : Promise.resolve(null),
          isMyGarden ? refreshMyAchievements() : Promise.resolve(null),
          getWeeklyLeaderboard(10),
          !isMyGarden && storedUserId && normalizedUserId ? getCheerStatus(normalizedUserId) : Promise.resolve(null),
          isMyGarden ? getNotificationSettings() : Promise.resolve(null),
        ]);

        const myDateKeys = await fetchMyPostDateKeys();

        setUser(userRes.data);
        setWeeklyStats(weeklyRes.data);
        setTodayStats(todayRes.data);
        setLevelProgress(myProgressRes?.data ?? null);
        setLevelHistories(myHistoryRes?.data ?? []);
        const firstPage = notificationRes?.data;
        if (firstPage) {
          applyNotificationPage(firstPage, false);
        } else {
          setNotifications([]);
          setNotificationPage(0);
          setNotificationHasNext(false);
        }
        setNotificationUnreadOnly(false);
        applyAchievements(achievementRes?.data ?? [], false);
        setLeaderboard(leaderboardRes.data);
        setCheerStatus(cheerStatusRes?.data ?? null);
        setNotificationSettings(notificationSettingsRes?.data ?? null);
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
  }, [effectiveUserId, isMyGarden, storedUserId, normalizedUserId, applyAchievements, applyNotificationPage]);

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

  const now = new Date();
  const themeMode = now.getHours() >= 6 && now.getHours() < 18 ? 'morning' : 'night';
  const gardenSeason = getGardenSeason(now.getMonth());
  const treeName = getTreeName(weeklyCount);
  const progressTotal = 20;
  const progressValue = Math.min(progressTotal, weeklyCount);
  const githubId = user?.username ?? 'gardener';
  const actualBadge = levelProgress?.currentBadge ?? user?.levelBadge ?? 'SPROUT';
  const currentTreeBadge = previewBadge ?? actualBadge;
  const badgeInfo = badgeInfoMap[currentTreeBadge] ?? {
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
    const year = viewMonthDate.getFullYear();
    const month = viewMonthDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const items: Array<{
      day: number | null;
      active: boolean;
      today: boolean;
      key: string | null;
      weekend: boolean;
      selected: boolean;
    }> = [];
    const postSet = new Set(myPostDateKeys);
    const todayKey = toDateKey(new Date());

    for (let i = 0; i < first.getDay(); i += 1) {
      items.push({ day: null, active: false, today: false, key: null, weekend: i === 0 || i === 6, selected: false });
    }

    for (let day = 1; day <= last.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const key = toDateKey(date);
      const dayOfWeek = date.getDay();
      items.push({
        day,
        active: postSet.has(key),
        today: key === todayKey,
        key,
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
        selected: selectedDateKey === key,
      });
    }

    while (items.length % 7 !== 0) {
      const slot = items.length % 7;
      items.push({ day: null, active: false, today: false, key: null, weekend: slot === 0 || slot === 6, selected: false });
    }

    return items;
  }, [myPostDateKeys, selectedDateKey, viewMonthDate]);

  const trophies = useMemo(() => {
    if (achievements.length > 0) {
      return achievements.map((achievement) => ({
        title: achievement.title,
        unlocked: achievement.unlocked,
        emoji: achievementEmojiMap[achievement.code],
      }));
    }

    return [
      { title: '첫 물주기 달성', unlocked: (levelProgress?.postCount ?? 0) >= 1, emoji: '🥉' },
      { title: '7일 연속 인증', unlocked: streakDays >= 7, emoji: '🔥' },
      { title: 'Lv.3 도달', unlocked: (levelProgress?.currentLevel ?? 0) >= 3, emoji: '🌳' },
      { title: 'Lv.5 도달', unlocked: (levelProgress?.currentLevel ?? 0) >= 5, emoji: '👑' },
      { title: '월간 12회 인증', unlocked: calendarDays.filter((x) => x.active).length >= 12, emoji: '📅' },
      { title: '연속 30일 인증', unlocked: streakDays >= 30, emoji: '🏆' },
    ];
  }, [achievements, levelProgress, streakDays, calendarDays]);

  const selectedCalendarMeta = useMemo(() => {
    if (!selectedDateKey) return null;
    const isToday = selectedDateKey === toDateKey(new Date());
    const isActive = myPostDateKeys.includes(selectedDateKey);
    if (isActive) {
      return {
        title: `${selectedDateKey} 기록 완료`,
        description: '이 날은 물주기 인증을 완료했어요.',
      };
    }
    return {
      title: `${selectedDateKey} 기록 없음`,
      description: isToday ? '오늘 인증이 아직 없어요. 지금 바로 인증해보세요.' : '해당 날짜에는 인증 기록이 없습니다.',
    };
  }, [myPostDateKeys, selectedDateKey]);

  const rankedTopFive = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);
  const myLeaderboardRank = useMemo(() => {
    if (!user) return null;
    const index = leaderboard.findIndex((item) => item.username === user.username);
    if (index < 0) return null;
    return { rank: index + 1, item: leaderboard[index] };
  }, [leaderboard, user]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  useEffect(() => {
    const shouldLock = isLevelModalOpen || isNotificationOpen;
    if (!shouldLock) return;

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
  }, [isLevelModalOpen, isNotificationOpen]);

  useEffect(() => {
    const todayKey = toDateKey(new Date());
    if (!selectedDateKey && calendarDays.some((cell) => cell.key === todayKey)) {
      setSelectedDateKey(todayKey);
    }
  }, [calendarDays, selectedDateKey]);

  useEffect(() => {
    if (!isNotificationOpen || !isMyGarden || !notificationHasNext || notificationLoading) return;
    const rootElement = notificationListRef.current;
    const target = notificationSentinelRef.current;
    if (!rootElement || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void loadNotifications({
              unreadOnly: notificationUnreadOnly,
              page: notificationPage + 1,
              append: true,
            });
          }
        });
      },
      { root: rootElement, threshold: 0.3 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isMyGarden, isNotificationOpen, notificationHasNext, notificationLoading, notificationPage, notificationUnreadOnly, loadNotifications]);

  useEffect(() => {
    if (!isLevelModalOpen || !isMyGarden) return;
    const refresh = async () => {
      try {
        const response = await refreshMyAchievements();
        applyAchievements(response.data, true);
      } catch {
        // 업적 재동기화 실패 시 기존 상태를 유지한다.
      }
    };
    void refresh();
  }, [isLevelModalOpen, isMyGarden, applyAchievements]);

  const handleBadgeClick = (badgeKey: string, unlocked: boolean) => {
    setPreviewBadge(badgeKey);
    setBadgeFeedback(
      unlocked
        ? `${badgeInfoMap[badgeKey]?.emoji ?? '🌱'} ${badgeDetailMap[badgeKey] ?? '배지 정보'} `
        : '아직 잠긴 배지예요. 연속 인증으로 잠금 해제해보세요.'
    );
  };

  const handleOpenNotifications = async () => {
    if (isMyGarden) {
      try {
        await loadNotifications({ unreadOnly: notificationUnreadOnly, page: 0, append: false });
      } catch {
        // 알림 조회 실패 시 기존 화면 상태를 유지한다.
      }
    }
    setIsNotificationOpen(true);
  };

  const handleFilterNotifications = async (unreadOnly: boolean) => {
    if (!isMyGarden || notificationLoading) return;
    try {
      await loadNotifications({ unreadOnly, page: 0, append: false });
    } catch {
      // 필터 변경 실패 시 기존 상태를 유지한다.
    }
  };

  const handleLoadMoreNotifications = async () => {
    if (!isMyGarden || !notificationHasNext || notificationLoading) return;
    try {
      await loadNotifications({
        unreadOnly: notificationUnreadOnly,
        page: notificationPage + 1,
        append: true,
      });
    } catch {
      // 추가 로딩 실패 시 기존 상태를 유지한다.
    }
  };

  const handleMarkNotificationRead = async (notification: UserNotificationResponseDto) => {
    if (!notification.id) return;
    if (notification.isRead) {
      if (notification.deepLink) {
        setIsNotificationOpen(false);
        navigate(notification.deepLink);
      }
      return;
    }

    try {
      const response = await markNotificationRead(notification.id);
      const readPayload: NotificationReadResponseDto = response.data;
      setNotifications((prev) =>
        prev.map((item) => (item.id === readPayload.id ? { ...item, isRead: readPayload.isRead } : item))
      );
      if (notification.deepLink) {
        setIsNotificationOpen(false);
        navigate(notification.deepLink);
      }
    } catch {
      // 읽음 처리 실패 시 기존 상태를 유지한다.
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // 전체 읽음 실패 시 기존 상태를 유지한다.
    }
  };

  const handleToggleMissionNotification = async () => {
    if (!notificationSettings || !isMyGarden) return;
    try {
      const response = await updateNotificationSettings({
        ...notificationSettings,
        missionEnabled: !notificationSettings.missionEnabled,
      });
      setNotificationSettings(response.data);
    } catch {
      // 설정 변경 실패 시 기존 상태를 유지한다.
    }
  };

  const handleCheer = async () => {
    if (!normalizedUserId || isMyGarden || isCheering) return;
    try {
      setIsCheering(true);
      const response = await cheerUser(normalizedUserId, 'WATER');
      setCheerStatus(response.data);
    } catch {
      // 응원 실패 시 기존 상태를 유지한다.
    } finally {
      setIsCheering(false);
    }
  };

  const handleMoveMonth = (offset: number) => {
    setViewMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedDateKey(null);
  };

  const handleSelectCalendarCell = (key: string | null) => {
    if (!key) return;
    setSelectedDateKey(key);
  };

  return (
    <Wrapper>
      <PageHeader
        title="내 정원 조회"
        rightButton={isMyGarden ? (
          <BellButton type="button" $hasUnread={unreadCount > 0} onClick={handleOpenNotifications}>
            🔔 {unreadCount > 0 ? unreadCount : ''}
          </BellButton>
        ) : undefined}
      />
      <PageContainer>
        <SeasonShell $season={gardenSeason}>
          {isLoading && <Loading />}
          {!isLoading && errorMessage && <Notice>{errorMessage}</Notice>}

          {!isLoading && !errorMessage && user && (
            <>
            <FrameContainer>
              <FrameViewport
                themeMode={themeMode}
                season={gardenSeason}
                treeState={{ totalDate: weeklyCount, currentDate: todayCount }}
                treeBadge={levelProgress?.currentBadge ?? user.levelBadge}
                levelUpPulse={justLeveledUp}
              />
            </FrameContainer>

            <TreeInfoBox $season={gardenSeason}>
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
              <LevelCard $season={gardenSeason}>
                <LevelHeader>
                  <LevelHeading>
                    <h3>레벨 진행도</h3>
                    <p>
                      <strong>{user.username}</strong> 님 · Lv.{levelProgress.currentLevel} {levelProgress.currentLevelName}
                    </p>
                  </LevelHeading>
                  <BadgePill $season={gardenSeason}>
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
                  <OpenModalButton
                    type="button"
                    onClick={() => {
                      setIsLevelModalOpen(true);
                      setBadgeFeedback('');
                    }}
                  >
                    상세 보기
                  </OpenModalButton>
                </LevelActionRow>
              </LevelCard>
            )}

            <SocialCard $season={gardenSeason}>
              <SocialTitle>주간 정원 랭킹</SocialTitle>
              {!isMyGarden && cheerStatus && (
                <CheerRow>
                  <CheerSummary>
                    오늘 받은 응원 {cheerStatus.receivedTodayCount}회 · 누적 {cheerStatus.receivedTotalCount}회
                  </CheerSummary>
                  <CheerButton
                    type="button"
                    $active={cheerStatus.canCheerToday}
                    onClick={handleCheer}
                    disabled={!cheerStatus.canCheerToday || isCheering}
                  >
                    {cheerStatus.canCheerToday ? (isCheering ? '응원 중...' : '💧 물주기 응원') : '오늘 응원 완료'}
                  </CheerButton>
                </CheerRow>
              )}
              <LeaderboardList>
                {rankedTopFive.map((item, index) => (
                  <LeaderItem key={item.userId}>
                    <LeaderName $mine={item.username === user.username}>
                      <RankBadge $rank={index + 1}>{index + 1}위</RankBadge> · {item.username}
                    </LeaderName>
                    <span>
                      주간 {item.weeklyPostCount}회 · {item.streakDays}일 ·{' '}
                      <GrowthText $positive={item.growthRate >= 0}>
                        {item.growthRate >= 0 ? '+' : ''}
                        {item.growthRate}%
                      </GrowthText>
                    </span>
                  </LeaderItem>
                ))}
                {myLeaderboardRank && myLeaderboardRank.rank > 5 && (
                  <LeaderItem>
                    <LeaderName $mine>
                      내 순위 · {myLeaderboardRank.rank}위 ({myLeaderboardRank.item.username})
                    </LeaderName>
                    <span>
                      주간 {myLeaderboardRank.item.weeklyPostCount}회 · {myLeaderboardRank.item.streakDays}일 ·{' '}
                      <GrowthText $positive={myLeaderboardRank.item.growthRate >= 0}>
                        {myLeaderboardRank.item.growthRate >= 0 ? '+' : ''}
                        {myLeaderboardRank.item.growthRate}%
                      </GrowthText>
                    </span>
                  </LeaderItem>
                )}
              </LeaderboardList>
            </SocialCard>

            {isMyGarden && levelProgress && isLevelModalOpen && (
              <ModalOverlay role="dialog" aria-modal="true" aria-label="레벨 상세 정보">
                <ModalSheet>
                  <ModalHeader>
                    <ModalTitle>레벨 상세 정보</ModalTitle>
                    <CloseModalButton
                      type="button"
                      onClick={() => {
                        setIsLevelModalOpen(false);
                        setPreviewBadge(null);
                        setBadgeFeedback('');
                      }}
                    >
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
                            <BadgeChip
                              as="button"
                              type="button"
                              key={badge.key}
                              $active={unlocked}
                              onClick={() => handleBadgeClick(badge.key, unlocked)}
                            >
                              {info.emoji} {info.label}
                            </BadgeChip>
                          );
                        })}
                      </BadgeCollectionGrid>
                      {badgeFeedback && <BadgeHint>{badgeFeedback}</BadgeHint>}
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

                    <CalendarCard $season={gardenSeason}>
                      <CalendarTitle>월간 성장 캘린더</CalendarTitle>
                      <CalendarNavRow>
                        <CalendarNavButton type="button" onClick={() => handleMoveMonth(-1)}>
                          이전 달
                        </CalendarNavButton>
                        <CalendarMonthText>{formatMonthLabel(viewMonthDate)}</CalendarMonthText>
                        <CalendarNavButton type="button" onClick={() => handleMoveMonth(1)}>
                          다음 달
                        </CalendarNavButton>
                      </CalendarNavRow>
                      <WeekHeader>
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                          <WeekHeaderCell key={day} $weekend={index === 0 || index === 6}>
                            {day}
                          </WeekHeaderCell>
                        ))}
                      </WeekHeader>
                      <CalendarGrid>
                        {calendarDays.map((cell, index) => (
                          <CalendarCell
                            type="button"
                            key={`${cell.key ?? 'empty'}-${index}`}
                            $active={cell.active}
                            $today={cell.today}
                            $weekend={cell.weekend}
                            $selected={cell.selected}
                            onClick={() => handleSelectCalendarCell(cell.key)}
                            disabled={!cell.key}
                          >
                            {cell.day ?? ''}
                          </CalendarCell>
                        ))}
                      </CalendarGrid>
                      <CalendarMeta>
                        {selectedCalendarMeta
                          ? `${selectedCalendarMeta.title} · ${selectedCalendarMeta.description}`
                          : '날짜를 눌러 그날의 인증 상태를 확인해보세요.'}
                      </CalendarMeta>
                    </CalendarCard>

                    <TrophyCard $season={gardenSeason}>
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

            {isNotificationOpen && (
              <ModalOverlay role="dialog" aria-modal="true" aria-label="알림 센터">
                <NotificationPanel $season={gardenSeason}>
                  <NotificationHeader>
                    <h3>알림 센터</h3>
                    <CloseModalButton type="button" onClick={() => setIsNotificationOpen(false)}>
                      닫기
                    </CloseModalButton>
                  </NotificationHeader>

                  <NotificationToolRow>
                    <NotificationFilterGroup>
                      <FilterButton
                        type="button"
                        $active={!notificationUnreadOnly}
                        onClick={() => handleFilterNotifications(false)}
                      >
                        전체
                      </FilterButton>
                      <FilterButton
                        type="button"
                        $active={notificationUnreadOnly}
                        onClick={() => handleFilterNotifications(true)}
                      >
                        미읽음
                      </FilterButton>
                    </NotificationFilterGroup>
                    {isMyGarden && notificationSettings && (
                      <TinyActionButton type="button" onClick={handleToggleMissionNotification}>
                        미션알림 {notificationSettings.missionEnabled ? 'ON' : 'OFF'}
                      </TinyActionButton>
                    )}
                  </NotificationToolRow>

                  <NotificationList ref={notificationListRef}>
                    {notificationLoading && notifications.length === 0 && (
                      <NotificationItem as="div" $read={false} $severity="INFO">
                        <strong>불러오는 중...</strong>
                        <p>알림 데이터를 동기화하고 있어요.</p>
                      </NotificationItem>
                    )}
                    {notifications.length === 0 && (
                      <NotificationItem as="div" $read={false} $severity="INFO">
                        <strong>알림이 없어요</strong>
                        <p>지금 정원 상태가 안정적이에요.</p>
                      </NotificationItem>
                    )}
                    {notifications.map((notification) => {
                      const isRead = notification.isRead;
                      return (
                        <NotificationItem
                          key={notification.id ?? notification.code}
                          $read={isRead}
                          $severity={notification.severity}
                          onClick={() => handleMarkNotificationRead(notification)}
                        >
                          <strong>{isRead ? '읽음' : '새 알림'} · {notification.title}</strong>
                          <p>{notification.message}</p>
                        </NotificationItem>
                      );
                    })}
                    <NotificationSentinel ref={notificationSentinelRef} />
                  </NotificationList>

                  <NotificationActions>
                    {notificationHasNext && (
                      <LoadMoreButton
                        type="button"
                        onClick={handleLoadMoreNotifications}
                        disabled={notificationLoading}
                      >
                        {notificationLoading ? '로딩 중...' : '더 보기'}
                      </LoadMoreButton>
                    )}
                    <MarkAllButton type="button" onClick={handleMarkAllNotificationsRead}>
                      전체 읽음 처리
                    </MarkAllButton>
                  </NotificationActions>
                </NotificationPanel>
              </ModalOverlay>
            )}
            </>
          )}
        </SeasonShell>
      </PageContainer>
      <ToastStack>
        {unlockToasts.map((toast) => (
          <UnlockToast key={toast.id} $leaving={toast.leaving}>
            <strong>{achievementEmojiMap[toast.code]} 업적 해금!</strong>
            <p>{achievementLabelMap[toast.code]}를 달성했어요.</p>
          </UnlockToast>
        ))}
      </ToastStack>
    </Wrapper>
  );
}
