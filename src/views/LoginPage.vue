<template>
  <ion-page>
    <ion-content class="ion-padding">
      <main class="auth-panel">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ isSignUp ? 'Criar conta' : 'Entrar' }}</ion-card-title>
            <ion-card-subtitle>
              {{ isSignUp ? 'Crie sua conta para começar.' : 'Acesse sua conta.' }}
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="submit">
              <ion-input
                v-if="isSignUp"
                v-model="fullName"
                label="Nome completo"
                label-placement="stacked"
                autocomplete="name"
                :maxlength="120"
                required
              />
              <ion-input
                v-if="isSignUp"
                v-model="birthDate"
                label="Data de nascimento"
                label-placement="stacked"
                type="date"
                required
              />
              <ion-input
                v-if="isSignUp"
                v-model="nickname"
                label="Nickname"
                label-placement="stacked"
                autocomplete="nickname"
                :maxlength="40"
                required
              />
              <ion-input
                v-model="email"
                label="E-mail"
                label-placement="stacked"
                type="email"
                autocomplete="email"
                required
              />
              <ion-input
                v-model="password"
                label="Senha"
                label-placement="stacked"
                type="password"
                :autocomplete="isSignUp ? 'new-password' : 'current-password'"
                :minlength="6"
                required
              />
              <ion-note v-if="errorMessage" color="danger">{{ errorMessage }}</ion-note>
              <ion-note v-if="notice" color="success">{{ notice }}</ion-note>
              <ion-button expand="block" type="submit" :disabled="isLoading">
                {{ isLoading ? 'Aguarde...' : isSignUp ? 'Cadastrar' : 'Entrar' }}
              </ion-button>
            </form>
            <ion-button
              v-if="!isSignUp"
              fill="clear"
              expand="block"
              router-link="/reset-password"
            >
              Esqueci minha senha
            </ion-button>
            <ion-button fill="clear" expand="block" @click="toggleMode">
              {{ isSignUp ? 'Já tenho uma conta' : 'Criar uma conta' }}
            </ion-button>
          </ion-card-content>
        </ion-card>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonNote,
  IonPage,
} from '@ionic/vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { getErrorMessage, getFirebaseAuth } from '@/lib/firebase'
import { saveProfile } from '@/lib/profile'

const router = useRouter()
const route = useRoute()
const isSignUp = ref(false)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const fullName = ref('')
const birthDate = ref('')
const nickname = ref('')
const errorMessage = ref('')
const notice = ref('')
if (route.query.passwordUpdated === 'true') {
  notice.value = 'Senha atualizada. Entre com sua nova senha.'
}

function toggleMode() {
  isSignUp.value = !isSignUp.value
  errorMessage.value = ''
  notice.value = ''
}

async function submit() {
  isLoading.value = true
  errorMessage.value = ''
  notice.value = ''

  try {
    const auth = getFirebaseAuth()
    const normalizedEmail = email.value.trim()

    if (isSignUp.value) {
      const credential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password.value,
      )
      const profile = {
        fullName: fullName.value.trim(),
        birthDate: birthDate.value,
        nickname: nickname.value.trim(),
        avatarPath: null,
      }
      await updateProfile(credential.user, { displayName: profile.fullName })
      await saveProfile(credential.user.uid, profile)
      await router.replace({ name: 'welcome' })
      return
    }

    await signInWithEmailAndPassword(auth, normalizedEmail, password.value)
    await router.replace({ name: 'welcome' })
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-panel {
  display: grid;
  min-height: 100%;
  place-items: center;
}

ion-card {
  width: min(100%, 30rem);
}

ion-input {
  margin-bottom: 1rem;
}
</style>
