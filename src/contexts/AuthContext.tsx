import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Use the database enum type
type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: AppRole, pinCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let initialSessionHandled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        initialSessionHandled = true;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setRole(null);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (initialSessionHandled) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        setRole(null);
      } else if (data) {
        const mappedRole: AppRole = data.role === "school_admin" ? "instructor" : data.role;
        setRole(mappedRole);
      }
    } catch (err) {
      console.error("Failed to fetch role:", err);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    selectedRole: AppRole,
    pinCode?: string
  ): Promise<{ error: Error | null }> => {
    try {
      // If student with PIN, validate the permanent instructor PIN first
      let instructorId: string | null = null;
      
      if (selectedRole === "student" && pinCode) {
        const { data: pinData, error: pinError } = await supabase
          .rpc("validate_permanent_instructor_pin", { _pin_code: pinCode });

        if (pinError || !pinData || pinData.length === 0 || !pinData[0].is_valid) {
          return { error: new Error("Invalid instructor PIN") };
        }
        instructorId = pinData[0].instructor_id;
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: selectedRole,
            // Pass instructor_id in metadata so the trigger (Priority 1 update)
            // can write it to profiles.instructor_id without a client-side write
            ...(instructorId ? { instructor_id: instructorId } : {}),
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        // The handle_new_user_profile trigger (SECURITY DEFINER) creates the profile
        // and user_roles rows from auth.users metadata. No client-side writes here —
        // session is null until the user clicks the verification link, so any RLS-
        // protected insert would fail silently.
        // Branded verification email is sent automatically by the Supabase Auth Hook
        // (send-auth-email edge function). No manual call needed here.
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear all Cruzi session-specific localStorage keys FIRST
    const cruziSessionKeys = [
      'cruzi_funnel_step',
      'cruzi_instructor_profile',
      'cruzi_settings',
      'cruzi_selected_tier',
      'cruzi_signup_name',
      'cruzi_trial_expires',
      'pending_parent_token',
    ];
    cruziSessionKeys.forEach(key => localStorage.removeItem(key));
    
    // Then sign out from Supabase
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const value = {
    user,
    session,
    role,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
