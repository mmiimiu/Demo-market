import { useAuthStore } from '../store/auth.store';

export const useAuthSession = () => {
  return useAuthStore();
};
