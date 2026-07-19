<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './store'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

// Determine if we should show the bottom navigation bar
const showBottomNav = computed(() => {
  const mainRoutes = ['Home', 'Fridge', 'RecipeRecommendations', 'Insights']
  return mainRoutes.includes(route.name)
})

// Initialize application data
onMounted(async () => {
  await store.initApp()
  
  // Register online/offline event listeners
  window.addEventListener('online', () => {
    store.isOnline = true
    store.loadAllData()
  })
  window.addEventListener('offline', () => {
    store.isOnline = false
  })
})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-nature-cream relative text-nature-forest overflow-hidden">
    <!-- Top Status Bar (Emulates smartphone UI) -->
    <div class="px-6 py-2.5 flex justify-between items-center text-[10px] select-none z-50 font-bold tracking-wider"
         :class="route.name === 'Splash' || route.name === 'Welcome' ? 'bg-transparent text-white/80 absolute top-0 left-0 right-0' : 'bg-nature-cream text-nature-forest border-b border-gray-150/40'">
      <div class="flex items-center gap-1">
        <span>Olahin</span>
        <span v-if="!store.isOnline" class="bg-nature-red/90 text-white text-[8px] px-1 rounded font-extrabold uppercase animate-pulse">Offline</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="flex items-center gap-0.5">
          <!-- Signal Icon -->
          <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-1.46-1.92-2.35-4.31-2.35-6.9 0-6.63 5.37-12 12-12s12 5.37 12 12c0 2.59-.89 4.98-2.35 6.9l-1.62-1.79C23.26 16.07 24 14.12 24 12c0-4.97-4.03-9-9-9zm0 4c-2.76 0-5 2.24-5 5 0 1.25.46 2.4 1.22 3.28l1.45-1.6C9.25 13.16 9 12.61 9 12c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .61-.25 1.16-.67 1.68l1.45 1.6C16.54 14.4 17 13.25 17 12c0-2.76-2.24-5-5-5zm0 4c-.55 0-1 .45-1 1 0 .28.12.53.3.71l1.41-1.41c-.18-.18-.43-.3-.71-.3z"/></svg>
          <!-- Wifi Icon -->
          <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 21l-12-12c2.5-2.5 6-4 12-4s9.5 1.5 12 4l-12 12z"/></svg>
        </span>
        <span>10:54</span>
      </div>
    </div>

    <!-- Main Content Panel -->
    <div class="flex-1 overflow-y-auto relative flex flex-col pb-16" :class="{ 'pb-0': !showBottomNav }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>

    <!-- Global Loading Overlay -->
    <div v-if="store.loading" class="absolute inset-0 bg-nature-cream/80 backdrop-blur-sm z-50 flex justify-center items-center flex-col gap-3">
      <div class="w-12 h-12 border-4 border-nature-leaf border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm font-semibold text-nature-forest">Memproses data...</p>
    </div>

    <!-- Persistent Bottom Navigation Bar -->
    <nav v-if="showBottomNav" class="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex justify-around items-center px-4 py-2 z-40 shadow-lg">
      <button 
        @click="router.push('/home')" 
        class="flex flex-col items-center justify-center flex-1 transition-colors py-1"
        :class="route.name === 'Home' ? 'text-nature-zaitun font-bold' : 'text-gray-400 font-medium'"
      >
        <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-[9px] mt-0.5 tracking-wide">Home</span>
      </button>

      <button 
        @click="router.push('/fridge')" 
        class="flex flex-col items-center justify-center flex-1 transition-colors py-1"
        :class="route.name === 'Fridge' || route.name === 'AddIngredient' ? 'text-nature-zaitun font-bold' : 'text-gray-400 font-medium'"
      >
        <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span class="text-[9px] mt-0.5 tracking-wide">Kulkas</span>
      </button>

      <button 
        @click="router.push('/recipes')" 
        class="flex flex-col items-center justify-center flex-1 transition-colors py-1"
        :class="route.name === 'RecipeRecommendations' || route.name === 'CookingGuide' ? 'text-nature-zaitun font-bold' : 'text-gray-400 font-medium'"
      >
        <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.754 18 18.174 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span class="text-[9px] mt-0.5 tracking-wide">Resep</span>
      </button>

      <button 
        @click="router.push('/insights')" 
        class="flex flex-col items-center justify-center flex-1 transition-colors py-1"
        :class="route.name === 'Insights' ? 'text-nature-zaitun font-bold' : 'text-gray-400 font-medium'"
      >
        <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
        <span class="text-[9px] mt-0.5 tracking-wide">Profil</span>
      </button>
    </nav>
  </div>
</template>
