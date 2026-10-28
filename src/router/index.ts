import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { auth, isFirebaseConfigured } from '@/lib/firebase'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordPage.vue'),
  },
  {
    path: '/update-password',
    name: 'update-password',
    component: () => import('@/views/UpdatePasswordPage.vue'),
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('@/views/WelcomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (!isFirebaseConfigured || !auth) {
    return to.meta.requiresAuth ? { name: 'login' } : true
  }

  await auth.authStateReady()
  const isLoggedIn = Boolean(auth.currentUser)

  if (to.meta.requiresAuth && !isLoggedIn) return { name: 'login' }
  if (
    isLoggedIn &&
    (to.name === 'login' || to.name === 'reset-password')
  ) {
    return { name: 'welcome' }
  }
  return true
})

export default router
