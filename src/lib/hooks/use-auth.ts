import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUserProfile
} from "../services";
import { supabase } from "../supabase";
import { queryKeys } from "../query-keys";
import type { AccountType } from "../database.types";

// ── Auth Hooks ───────────────────────────────────────────────
export function useAuth() {
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: (params: { email: string; password: string }) =>
      signIn(params.email, params.password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser(null) });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (params: { 
      email: string; 
      password: string; 
      username: string; 
      name: string; 
      accountType?: AccountType;
    }) => signUp(params.email, params.password, params.username, params.name, params.accountType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isLoading: signInMutation.isPending || signUpMutation.isPending,
    error: signInMutation.error?.message || signUpMutation.error?.message,
  };
}

// ── Get current session ─────────────────────────────────────
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── Get current user ───────────────────────────────────────
export function useCurrentUser() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ["currentUser", session?.user?.id],
    queryFn: () => getCurrentUserProfile(),
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });
}