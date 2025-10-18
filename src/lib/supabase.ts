import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseBoolean, parseString } from './config';

const SUPABASE_URL = parseString(process.env.EXPO_PUBLIC_SUPABASE_URL, '');
const SUPABASE_ANON_KEY = parseString(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, '');

// Auth configuration - properly converts string values from .env to booleans
const AUTH_AUTO_REFRESH_TOKEN = parseBoolean(process.env.EXPO_PUBLIC_AUTH_AUTO_REFRESH_TOKEN, true);
const AUTH_PERSIST_SESSION = parseBoolean(process.env.EXPO_PUBLIC_AUTH_PERSIST_SESSION, true);
const AUTH_DETECT_SESSION_IN_URL = parseBoolean(process.env.EXPO_PUBLIC_AUTH_DETECT_SESSION_IN_URL, true);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: AUTH_AUTO_REFRESH_TOKEN,
    persistSession: AUTH_PERSIST_SESSION,
    detectSessionInUrl: AUTH_DETECT_SESSION_IN_URL,
  },
});

// SQL for database setup (to be run in Supabase SQL Editor)
export const DATABASE_SETUP_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Clubs table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Memberships table (links users to clubs/teams with roles)
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT membership_target CHECK (
    (club_id IS NOT NULL AND team_id IS NULL) OR 
    (club_id IS NULL AND team_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can view clubs they are members of
CREATE POLICY "Users can view their clubs" ON public.clubs
  FOR SELECT USING (
    id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND club_id IS NOT NULL
    ) OR created_by = auth.uid()
  );

-- Users can create clubs (and become admin automatically via trigger)
CREATE POLICY "Users can create clubs" ON public.clubs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only admins can update clubs
CREATE POLICY "Admins can update clubs" ON public.clubs
  FOR UPDATE USING (
    id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )
  );

-- Only admins can delete clubs
CREATE POLICY "Admins can delete clubs" ON public.clubs
  FOR DELETE USING (
    id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )
  );

-- Users can view teams in their clubs
CREATE POLICY "Users can view teams in their clubs" ON public.teams
  FOR SELECT USING (
    club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND club_id IS NOT NULL
    )
  );

-- Club admins can create teams
CREATE POLICY "Club admins can create teams" ON public.teams
  FOR INSERT WITH CHECK (
    club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )
  );

-- Club admins can update teams
CREATE POLICY "Club admins can update teams" ON public.teams
  FOR UPDATE USING (
    club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )
  );

-- Club admins can delete teams
CREATE POLICY "Club admins can delete teams" ON public.teams
  FOR DELETE USING (
    club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )
  );

-- Users can view their own memberships
CREATE POLICY "Users can view their memberships" ON public.memberships
  FOR SELECT USING (user_id = auth.uid());

-- Admins can create memberships for their clubs/teams
CREATE POLICY "Admins can create memberships" ON public.memberships
  FOR INSERT WITH CHECK (
    (club_id IS NOT NULL AND club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )) OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT t.id FROM public.teams t
      INNER JOIN public.memberships m ON m.club_id = t.club_id
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    ))
  );

-- Admins can update memberships
CREATE POLICY "Admins can update memberships" ON public.memberships
  FOR UPDATE USING (
    (club_id IS NOT NULL AND club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )) OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT t.id FROM public.teams t
      INNER JOIN public.memberships m ON m.club_id = t.club_id
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    ))
  );

-- Admins can delete memberships
CREATE POLICY "Admins can delete memberships" ON public.memberships
  FOR DELETE USING (
    (club_id IS NOT NULL AND club_id IN (
      SELECT club_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role = 'admin' AND club_id IS NOT NULL
    )) OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT t.id FROM public.teams t
      INNER JOIN public.memberships m ON m.club_id = t.club_id
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    ))
  );

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create admin membership when club is created
CREATE OR REPLACE FUNCTION public.handle_new_club()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.memberships (user_id, club_id, role)
  VALUES (new.created_by, new.id, 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create admin membership when club is created
DROP TRIGGER IF EXISTS on_club_created ON public.clubs;
CREATE TRIGGER on_club_created
  AFTER INSERT ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_club();
`;
