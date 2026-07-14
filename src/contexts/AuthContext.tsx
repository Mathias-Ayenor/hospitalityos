import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;

  // Multi-tenant context
  hotel: any | null;
  hotelUser: any | null;
  branch: any | null;
  role: any | null;

  loading: boolean;

  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Multi-tenant application state
  const [hotel, setHotel] = useState<any>(null);
  const [hotelUser, setHotelUser] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    async function initialize() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);

      setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function refreshUser() {
    if (!supabase || !user) return;

    // This will be implemented in the next milestone.
    console.log("Loading hotel context...");
  }

  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();

    setHotel(null);
    setHotelUser(null);
    setBranch(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,

        hotel,
        hotelUser,
        branch,
        role,

        loading,

        refreshUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider.");
  }

  return context;
}