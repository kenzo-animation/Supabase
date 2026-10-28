<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Recuperar senha</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form class="form-panel" @submit.prevent="sendRecoveryEmail">
        <p>Informe seu e-mail para receber um link de redefinição de senha.</p>
        <ion-input
          v-model="email"
          label="E-mail"
          label-placement="stacked"
          type="email"
          autocomplete="email"
          required
        />
        <ion-note v-if="errorMessage" color="danger">{{ errorMessage }}</ion-note>
        <ion-note v-if="notice" color="success">{{ notice }}</ion-note>
        <ion-button expand="block" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar link' }}
        </ion-button>
        <ion-button expand="block" fill="clear" router-link="/login">Voltar ao login</ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
import { sendPasswordResetEmail } from 'firebase/auth'
import { getErrorMessage, getFirebaseAuth } from '@/lib/firebase'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const notice = ref('')

async function sendRecoveryEmail() {
  isLoading.value = true
  errorMessage.value = ''
  notice.value = ''

  try {
    const actionCodeSettings = {
      url: new URL('/update-password', window.location.origin).toString(),
    }
    await sendPasswordResetEmail(
      getFirebaseAuth(),
      email.value.trim(),
      actionCodeSettings,
    )
    notice.value = 'Se o endereço estiver cadastrado, você receberá um link para redefinir a senha.'
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