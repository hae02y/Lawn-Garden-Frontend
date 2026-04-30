export interface UserDetailResponseDto {
  id: number | null;
  username: string;
  email: string;
  level: number;
  levelName: string;
  levelBadge: string;
}

export interface UserLevelProgressResponseDto {
  currentLevel: number;
  currentLevelName: string;
  currentBadge: string;
  postCount: number;
  nextLevel: number | null;
  nextLevelName: string | null;
  nextLevelMinPostCount: number | null;
  remainingPostCount: number;
}

export interface UserLevelHistoryResponseDto {
  id: number | null;
  previousLevel: number;
  previousLevelName: string;
  newLevel: number;
  newLevelName: string;
  postCount: number;
  changedAt: string | null;
}

export interface UserStatsResponseDto {
  id: number | null;
  username: string;
  email: string;
  commitCount: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDetailResponseDto;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiErrorResponse {
  errorCode?: string;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface SignUpRequest {
  email: string;
  githubId: string;
  password: string;
}

export interface PostSummaryDto {
  id: number | null;
  createdDate: string | null;
  user: UserDetailResponseDto;
  image: string | null;
}

export interface PostDetailDto {
  id: number | null;
  link: string | null;
  createdDate: string | null;
  user: UserDetailResponseDto | null;
  contents: string | null;
  image: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface GeekNewsResponseDto {
  id: number | null;
  sourceId: string;
  title: string;
  link: string;
  summary: string | null;
  publishedAt: string | null;
  bookmarked: boolean;
  read: boolean;
  readAt: string | null;
}

export interface GeekNewsListResponseDto {
  items: GeekNewsResponseDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export type MailStatus = 'ON' | 'OFF';
export type MailCategory = 'BACKEND' | 'FRONTEND' | 'AI' | 'NONE';
export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface MailStatusResponseDto {
  status: MailStatus;
}

export interface MailSettingsResponseDto {
  status: MailStatus;
  preferredDays: Weekday[];
  preferredHour: number;
  categories: MailCategory[];
}

export interface MailSettingsRequestDto {
  status: MailStatus;
  preferredDays: Weekday[];
  preferredHour: number;
  categories: MailCategory[];
}

export interface GeekNewsStateResponseDto {
  articleId: number;
  bookmarked: boolean;
  read: boolean;
  readAt: string | null;
}

export interface AdminSyncResponseDto {
  success: boolean;
  message: string;
  affectedCount: number;
}

export interface GeekNewsSyncLogResponseDto {
  id: number | null;
  requestedLimit: number;
  insertedCount: number;
  success: boolean;
  message: string;
  createdAt: string | null;
}

export interface SystemStatusResponseDto {
  status: string;
  version: string;
  serverTime: string;
  docsUrl: string;
  errorCodesUrl: string;
}

export interface ErrorCodeDocItem {
  code: string;
  httpStatus: string;
  description: string;
}

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARN';

export interface UserNotificationResponseDto {
  id: number | null;
  title: string;
  message: string;
  severity: NotificationSeverity;
  code: string;
  deepLink: string | null;
  referenceDate: string | null;
  isRead: boolean;
  createdAt: string | null;
}

export interface NotificationReadResponseDto {
  id: number;
  isRead: boolean;
}

export interface UserNotificationSettingDto {
  missionEnabled: boolean;
  streakRiskEnabled: boolean;
  levelUpEnabled: boolean;
  rewardEnabled: boolean;
  quietHoursEnabled: boolean;
  quietStartHour: number;
  quietEndHour: number;
}

export interface UserAchievementResponseDto {
  code:
    | 'FIRST_WATERING'
    | 'STREAK_7'
    | 'LEVEL_3'
    | 'LEVEL_5'
    | 'MONTHLY_12'
    | 'STREAK_30';
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export type CheerType = 'WATER' | 'HEART';

export interface CheerStatusResponseDto {
  canCheerToday: boolean;
  receivedTodayCount: number;
  receivedTotalCount: number;
}

export interface WeeklyLeaderboardItemDto {
  userId: number;
  username: string;
  weeklyPostCount: number;
  streakDays: number;
  growthRate: number;
}
