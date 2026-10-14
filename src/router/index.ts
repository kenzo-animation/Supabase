import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { supabase } from '@/lib/supabase'

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
  if (!supabase) {
    return to.meta.requiresAuth ? { name: 'login' } : true
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) return { name: 'login', query: { error: 'session' } }

  if (to.meta.requiresAuth && !data.session) return { name: 'login' }
  if (
    data.session &&
    (to.name === 'login' || to.name === 'reset-password')
  ) {
    return { name: 'welcome' }
  }
  return true
})

export default router
