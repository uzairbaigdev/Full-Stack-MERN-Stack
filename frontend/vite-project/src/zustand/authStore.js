import axios from 'axios';
import { create } from 'zustand';

const token =
  typeof document === 'undefined'
    ? null
    : document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('token='))
        ?.slice('token='.length);

async function getUserFromToken() {
  if (!token) return null;

  const response = await axios.get(import.meta.env.VITE_BACKEND_URL, {
    params: { token: decodeURIComponent(token) },
  });

  return response.data.user;
}

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

if (token) {
  getUserFromToken()
    .then((user) => {
      if (user) useAuthStore.getState().setUser(user);
    })
    .catch((error) => {
      console.error('Failed to restore user from token:', error);
    });
}

export default useAuthStore;
