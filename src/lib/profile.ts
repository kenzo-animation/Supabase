import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/types/profile'

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createAvatarUrl(
  avatarPath: string | null,
): Promise<string | null> {
  if (!avatarPath) return null

  const { data, error } = await getSupabase()
    .storage.from('avatars')
    .createSignedUrl(avatarPath, 60 * 60)

  if (error) throw error
  return data.signedUrl
}
