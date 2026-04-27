import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 기존의 코드에서 인터페이스만 추가해서 들고온건데 원하면 싹 갈아엎어두 됩니다

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  username: string | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUserId: (userId: number) => void;
  setUsername: (username: string) => void;
  setAuthSession: (session: {
    accessToken: string;
    refreshToken: string;
    userId: number | null;
    username: string;
  }) => void;
  clearAccessToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      username: null,
      setAccessToken: (token: string) => set({ accessToken: token }),
      setRefreshToken: (token: string) => set({ refreshToken: token }),
      setUserId: (userId: number) => set({ userId }),
      setUsername: (username: string) => set({ username }),
      setAuthSession: ({ accessToken, refreshToken, userId, username }) =>
        set({ accessToken, refreshToken, userId, username }),
      clearAccessToken: () =>
        set({ accessToken: null, refreshToken: null, userId: null, username: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // 기본은 localStorage
    }
  )
);
