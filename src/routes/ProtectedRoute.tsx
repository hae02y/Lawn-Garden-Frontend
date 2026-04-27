import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ProtectedRoute() {
  const { accessToken, refreshToken } = useAuthStore((state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  }));

  return accessToken || refreshToken ? <Outlet /> : <Navigate to="/" replace />;
}
