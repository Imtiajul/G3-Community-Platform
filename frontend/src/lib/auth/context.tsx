"use client";

import React, { createContext, useContext } from "react";
import type { User } from "./types";

interface UserContextValue {
  user: User | null;
}

const UserContext = createContext<UserContextValue>({ user: null });

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  return (
    <UserContext.Provider value={{ user: initialUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): User | null {
  const context = useContext(UserContext);
  return context.user;
}
