import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '../store'

import Splash from '../views/Splash.vue'
import Welcome from '../views/Welcome.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Fridge from '../views/Fridge.vue'
import AddIngredient from '../views/AddIngredient.vue'
import Nutrition from '../views/Nutrition.vue'
import RecipeRecommendations from '../views/RecipeRecommendations.vue'
import RecipeDetail from '../views/RecipeDetail.vue'
import CookingGuide from '../views/CookingGuide.vue'
import CookingSuccess from '../views/CookingSuccess.vue'
import Insights from '../views/Insights.vue'
import MealPlanner from '../views/MealPlanner.vue'

const routes = [
  { path: '/', name: 'Splash', component: Splash },
  { path: '/welcome', name: 'Welcome', component: Welcome },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/fridge', name: 'Fridge', component: Fridge, meta: { requiresAuth: true } },
  { path: '/add-ingredient', name: 'AddIngredient', component: AddIngredient, meta: { requiresAuth: true } },
  { path: '/nutrition', name: 'Nutrition', component: Nutrition, meta: { requiresAuth: true } },
  { path: '/meal-planner', name: 'MealPlanner', component: MealPlanner, meta: { requiresAuth: true } },
  { path: '/recipes', name: 'RecipeRecommendations', component: RecipeRecommendations, meta: { requiresAuth: true } },
  { path: '/recipe-detail', name: 'RecipeDetail', component: RecipeDetail, meta: { requiresAuth: true } },
  { path: '/cook', name: 'CookingGuide', component: CookingGuide, meta: { requiresAuth: true } },
  { path: '/cooking-success', name: 'CookingSuccess', component: CookingSuccess, meta: { requiresAuth: true } },
  { path: '/insights', name: 'Insights', component: Insights, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Authentication guard
router.beforeEach((to, from, next) => {
  const store = useAppStore()
  const isAuth = store.isAuthenticated

  if (to.meta.requiresAuth && !isAuth) {
    next({ name: 'Welcome' })
  } else if ((to.name === 'Login' || to.name === 'Register' || to.name === 'Welcome' || to.name === 'Splash') && isAuth) {
    // If already authenticated and trying to access landing pages, redirect to Home
    if (to.name === 'Splash') {
      next()
    } else {
      next({ name: 'Home' })
    }
  } else {
    next()
  }
})

export default router
