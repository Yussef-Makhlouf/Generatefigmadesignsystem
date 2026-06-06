import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { queryKeys } from "../query-keys";
import { GUEST_USER, mapProfileRow, type AppUser } from "../mappers/feed-mappers";

interface AuthSessionValue {
  currentUserId: string | null;
  setCurrentUserId: React.Dispatch<React.SetStateAction<string | null>>;
  currentUser: AppUser;
}

const AuthSessionContext = createContext<AuthSessionValue | undefined>(undefined);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: queryKeys.currentUser(currentUserId),
    queryFn: async () => {
      if (!currentUserId) return GUEST_USER;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const email = authUser?.email ?? "";

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .maybeSingle();

      if (!data) {
        return { ...GUEST_USER, email };
      }

      return { ...mapProfileRow(data as Record<string, unknown>), email };
    },
    enabled: !!currentUserId,
  });

  return (
    <AuthSessionContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        currentUser: (currentUser ?? GUEST_USER) as AppUser,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}

export function isGuestUser(user: AppUser): boolean {
  return user.id === "1" || user.username === "guest";
}

export function useIsAuthenticated(): boolean {
  const { currentUser } = useAuthSession();
  return !isGuestUser(currentUser);
}

export function useIsAdmin(): boolean {
  const { currentUser } = useAuthSession();
  return !isGuestUser(currentUser) && currentUser.accountType === "admin";
}
