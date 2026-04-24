export interface UserDetailResponseDto {
  id: number | null;
  username: string;
  email: string;
}

export interface UserStatsResponseDto {
  id: number | null;
  username: string;
  email: string;
  commitCount: string;
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
