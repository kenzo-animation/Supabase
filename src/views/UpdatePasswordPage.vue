<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Redefinir senha</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form class="form-panel" @submit.prevent="updatePassword">
        <p>Escolha uma nova senha para sua conta.</p>
        <ion-input
          v-model="password"
          label="Nova senha"
          label-placement="stacked"
          type="password"
          autocomplete="new-password"
          :minlength="6"
          required
        />
        <ion-input
          v-model="passwordConfirmation"
          label="Confirme a senha"
          label-placement="stacked"
          type="password"
          autocomplete="new-password"
          :minlength="6"
          required
        />
        <ion-note v-if="errorMessage" color="danger">{{ errorMessage }}</ion-note>
        <ion-note v-if="notice" color="success">{{ notice }}</ion-note>
        <ion-button expand="block" type="submit" :disabled="isLoading || !hasRecoverySession">
          {{ isLoading ? 'Salvando...' : 'Salvar nova senha' }}
        </ion-button>
        <ion-button v-if="!hasRecoverySession" expand="block" fill="clear" router-link="/reset-password">
          Solicitar novo link
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import { getErrorMessage, getSupabase } from '@/lib/supabase'

const router = useRouter()
const password = ref('')
const passwordConfirmation = ref('')
const hasRecoverySession = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const notice = ref('')

onMounted(async () => {
  try {
    const { data, error } = await getSupabase().auth.getSession()
    if (error) throw error
    hasRecoverySession.value = Boolean(data.session)
    if (!data.session) {
      errorMessage.value = 'O link de redefinição expirou ou não é válido. Solicite um novo link.'
    }
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
})

async function updatePassword() {
  errorMessage.value = ''
  notice.value = ''
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  isLoading.value = true
  try {
    const { error } = await getSupabase().auth.updateUser({ password: password.value })
    if (error) throw error
    notice.value = 'Senha atualizada com sucesso.'
    await router.replace({ name: 'welcome' })
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form-panel {
  display: grid;
  gap: 1rem;
  margin: 2rem auto;
  max-width: 30rem;
}
</style>