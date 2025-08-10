import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";

interface User {
  name: string;
  bio: string;
  username: string;
  pfp: string;
  id: number;
  profile: boolean;
  mission: boolean;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const EXPIRY_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days

const customStorage: PersistStorage<UserStore> = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      const parsed = JSON.parse(str);
      if (!parsed.timestamp || Date.now() - parsed.timestamp > EXPIRY_TIME) {
        localStorage.removeItem(name);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    const withExpiry = {
      ...value,
      timestamp: Date.now(),
    };
    localStorage.setItem(name, JSON.stringify(withExpiry));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useUserStore = create<
  UserStore & {
    setProfile: (profile: boolean) => void;
    setMission: (mission: boolean) => void;
  }
>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setProfile: (profile) => {
        const user = get().user;
        if (user) set({ user: { ...user, profile } });
      },
      setMission: (mission) => {
        const user = get().user;
        if (user) set({ user: { ...user, mission } });
      },
    }),
    {
      name: "user-storage",
      storage: customStorage,
    }
  )
);

export const useUser = () => {
  const { user, setUser, clearUser } = useUserStore();
  return { user, setUser, clearUser };
};
