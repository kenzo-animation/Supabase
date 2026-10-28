import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref } from 'firebase/storage'
import { getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase'
import type { Profile } from '@/types/profile'

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), 'profiles', userId))
  if (!snapshot.exists()) return null

  const data = snapshot.data()
  return {
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    birthDate: typeof data.birthDate === 'string' ? data.birthDate : '',
    nickname: typeof data.nickname === 'string' ? data.nickname : '',
    avatarPath: typeof data.avatarPath === 'string' ? data.avatarPath : null,
  }
}

export async function saveProfile(userId: string, profile: Profile): Promise<void> {
  await setDoc(
    doc(getFirebaseFirestore(), 'profiles', userId),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function createAvatarUrl(
  avatarPath: string | null,
): Promise<string | null> {
  if (!avatarPath) return null

  return getDownloadURL(ref(getFirebaseStorage(), avatarPath))
}
