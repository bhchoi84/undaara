/* ── Supabase 클라이언트 (브라우저 전용) ── */

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://baecbdazvbjscmpaerbz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZWNiZGF6dmJqc2NtcGFlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDEyODQsImV4cCI6MjA5MDgxNzI4NH0.fZmri9OKy50OFJGUIJeMsC3s_p-qD0oCBSd2dP8_R94';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: string;
  kakao_birthday?: string;
  kakao_gender?: string;
}

export function extractProfileFromUser(user: User): UserProfile {
  const meta = user.user_metadata || {};
  const provider = user.app_metadata?.provider || '';
  const profile: UserProfile = {
    id: user.id,
    email: user.email || meta.email || '',
    name: meta.full_name || meta.name || meta.nickname || meta.user_name || '',
    avatar: meta.avatar_url || meta.picture || '',
    provider,
  };
  if (provider === 'kakao') {
    if (meta.birthday) profile.kakao_birthday = meta.birthday;
    if (meta.gender) profile.kakao_gender = meta.gender;
  }
  return profile;
}

export async function loginWithKakao() {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      scopes: 'account_email profile_nickname birthday gender',
    },
  });
  if (error) throw error;
}

export async function loginWithGoogle() {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
}

export async function logout() {
  const sb = getSupabase();
  await sb.auth.signOut();
}
