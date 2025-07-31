// components/UserInitializer.tsx
"use client";

import { useEffect } from "react";
import { useUserStore } from "./useUserStore";

interface User {
  name: string;
  bio: string;
  username: string;
  pfp: string;
  id: number;
}

export default function UserInitializer({ user }: { user: User }) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  return null;
}
