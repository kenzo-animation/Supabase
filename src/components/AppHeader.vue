<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="end">
        <ion-button :disabled="isLoading" @click="signOut">
          {{ isLoading ? 'Saindo...' : 'Sair' }}
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
    <ion-toolbar v-if="errorMessage">
      <ion-title size="small" color="danger">{{ errorMessage }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/vue'
import { getErrorMessage, getSupabase } from '@/lib/supabase'

defineProps<{ title: string }>()

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

async function signOut() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { error } = await getSupabase().auth.signOut()
    if (error) throw error
    await router.replace({ name: 'login' })
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>