export interface User {
  id: string;
  email: string;
  name?: string;
  phone_number?: string;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  club_id: string;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  club_id?: string;
  team_id?: string;
  role: 'admin' | 'member';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
}
