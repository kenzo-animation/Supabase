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
import { getErrorMessage, getSupabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const isSignUp = ref(false)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const fullName = ref('')
const birthDate = ref('')
const nickname = ref('')
const errorMessage = ref(
  route.query.error === 'session'
    ? 'Não foi possível recuperar sua sessão. Tente novamente.'
    : '',
)
const notice = ref('')

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
    const client = getSupabase()
    const normalizedEmail = email.value.trim()

    if (isSignUp.value) {
      const { data, error } = await client.auth.signUp({
        email: normalizedEmail,
        password: password.value,
        options: {
          emailRedirectTo: new URL('/welcome', window.location.origin).toString(),
          data: {
            full_name: fullName.value.trim(),
            birth_date: birthDate.value,
            nickname: nickname.value.trim(),
          },
        },
      })
      if (error) throw error

      if (data.session) {
        await router.replace({ name: 'welcome' })
      } else {
        notice.value = 'Conta criada. Verifique seu e-mail para confirmar o cadastro.'
      }
      return
    }

    const { error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.value,
    })
    if (error) throw error
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
