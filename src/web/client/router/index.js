import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Views
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import PackageDetails from '../views/PackageDetails.vue'
import Commands from '../views/Commands.vue'
import AdminPanel from '../views/AdminPanel.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/packages/:packageName',
    name: 'PackageDetails',
    component: PackageDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/packages/:packageName/commands',
    name: 'Commands',
    component: Commands,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      try {
        // Try to fetch current user if not already authenticated
        await store.dispatch('fetchCurrentUser')
      } catch (error) {
        return next('/login')
      }
      
      // Check if user is authenticated after fetch attempt
      if (!store.getters.isAuthenticated) {
        return next('/login')
      }
      
      // Check if route requires admin privileges
      if (to.matched.some(record => record.meta.requiresAdmin) && 
          !store.getters.isAdmin) {
        return next('/dashboard')
      }
    }
  }
  
  next()
})

export default router
