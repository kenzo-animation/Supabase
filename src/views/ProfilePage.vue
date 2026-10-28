<template>
  <ion-page>
    <AppHeader title="Meu perfil" />
    <ion-content class="ion-padding">
      <form class="profile-form" @submit.prevent="saveProfile">
        <ion-avatar v-if="avatarUrl">
          <img :src="avatarUrl" alt="Foto do perfil" />
        </ion-avatar>
        <label class="upload-label">
          Foto de perfil (máximo 5 MB)
          <input
            type="file"
            accept="image/*"
            :disabled="isUploading"
            @change="uploadAvatar"
          />
        </label>
        <ion-input
          v-model="fullName"
          label="Nome completo"
          label-placement="stacked"
          autocomplete="name"
          :maxlength="120"
          required
        />
        <ion-input
          v-model="birthDate"
          label="Data de nascimento"
          label-placement="stacked"
          type="date"
          required
        />
        <ion-input
          v-model="nickname"
          label="Nickname"
          label-placement="stacked"
          autocomplete="nickname"
          :maxlength="40"
          required
        />
        <ion-note v-if="errorMessage" color="danger">{{ errorMessage }}</ion-note>
        <ion-note v-if="notice" color="success">{{ notice }}</ion-note>
        <ion-button
          expand="block"
          type="submit"
          :disabled="isSaving || isUploading || !userId"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar perfil' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IonAvatar, IonButton, IonContent, IonInput, IonNote, IonPage } from '@ionic/vue'
import { updateProfile } from 'firebase/auth'
import { ref as storageRef, uploadBytes } from 'firebase/storage'
import AppHeader from '@/components/AppHeader.vue'
import { getErrorMessage, getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase'
import {
  createAvatarUrl,
  fetchProfile,
  saveProfile as writeProfile,
} from '@/lib/profile'

const userId = ref('')
const fullName = ref('')
const birthDate = ref('')
const nickname = ref('')
const avatarPath = ref<string | null>(null)
const avatarUrl = ref<string | null>(null)
const isSaving = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')
const notice = ref('')

onMounted(async () => {
  try {
    const user = getFirebaseAuth().currentUser
    if (!user) throw new Error('Sua sessão expirou. Entre novamente.')

    userId.value = user.uid
    const profile = await fetchProfile(user.uid)
    if (profile) {
      fullName.value = profile.fullName
      birthDate.value = profile.birthDate
      nickname.value = profile.nickname
      avatarPath.value = profile.avatarPath
      avatarUrl.value = await createAvatarUrl(profile.avatarPath)
    } else {
      fullName.value = user.displayName ?? ''
    }
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
})

async function saveProfile() {
  errorMessage.value = ''
  notice.value = ''
  isSaving.value = true
  try {
    const profile = {
      fullName: fullName.value.trim(),
      birthDate: birthDate.value,
      nickname: nickname.value.trim(),
      avatarPath: avatarPath.value,
    }
    await writeProfile(userId.value, profile)
    const user = getFirebaseAuth().currentUser
    if (user) await updateProfile(user, { displayName: profile.fullName })
    notice.value = 'Perfil salvo com sucesso.'
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isSaving.value = false
  }
}

async function uploadAvatar(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  if (!file) return

  errorMessage.value = ''
  notice.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    errorMessage.value = 'Selecione uma imagem JPEG, PNG, WebP ou GIF.'
    input.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'A imagem deve ter no máximo 5 MB.'
    input.value = ''
    return
  }

  isUploading.value = true
  try {
    if (!userId.value) throw new Error('Não foi possível identificar sua conta.')
    const path = `avatars/${userId.value}/profile`
    await uploadBytes(storageRef(getFirebaseStorage(), path), file, {
      contentType: file.type,
    })

    avatarPath.value = path
    avatarUrl.value = await createAvatarUrl(path)
    notice.value = 'Foto enviada. Salve o perfil para confirmar as alterações.'
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isUploading.value = false
    input.value = ''
  }
}
</script>

<style scoped>
.profile-form {
  display: grid;
  gap: 1rem;
  margin: 2rem auto;
  max-width: 32rem;
}

.profile-form ion-avatar {
  height: 7rem;
  margin: 0 auto;
  width: 7rem;
}

.upload-label {
  display: grid;
  gap: 0.5rem;
}
</style>