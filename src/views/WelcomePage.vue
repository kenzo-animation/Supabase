<template>
  <ion-page>
    <AppHeader title="Bem-vindo" />
    <ion-content class="ion-padding">
      <section class="welcome-panel">
        <ion-avatar v-if="avatarUrl">
          <img :src="avatarUrl" alt="Foto do perfil" />
        </ion-avatar>
        <h1>Olá, {{ displayName }}!</h1>
        <p>Que bom ter você por aqui.</p>
        <ion-note v-if="errorMessage" color="danger">{{ errorMessage }}</ion-note>
        <ion-button router-link="/profile">Ver meu perfil</ion-button>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IonAvatar, IonButton, IonContent, IonNote, IonPage } from '@ionic/vue'
import AppHeader from '@/components/AppHeader.vue'
import { getFirebaseAuth, getErrorMessage } from '@/lib/firebase'
import { createAvatarUrl, fetchProfile } from '@/lib/profile'

const displayName = ref('!')
const avatarUrl = ref<string | null>(null)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const user = getFirebaseAuth().currentUser
    if (!user) throw new Error('Sua sessão expirou. Entre novamente.')

    displayName.value = user.displayName || user.email || '!'
    const profile = await fetchProfile(user.uid)
    if (profile?.fullName) displayName.value = profile.fullName
    avatarUrl.value = await createAvatarUrl(profile?.avatarPath ?? null)
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
})
</script>

<style scoped>
.welcome-panel {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  margin: 3rem auto;
  max-width: 36rem;
  text-align: center;
}

ion-avatar {
  height: 6rem;
  width: 6rem;
}
</style>