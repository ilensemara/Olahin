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
  <div class="flex flex-col h-screen w-full bg-nature-cream relative text-nature-forest overflow-hidden">
    <!-- Desktop Responsive Navigation Header (Visible only on desktop/tablet) -->
    <header v-if="showBottomNav" class="hidden md:flex justify-between items-center px-8 py-3.5 bg-white border-b border-gray-100 shadow-sm z-40">
      <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/home')">
        <svg class="w-6.5 h-6.5 text-nature-zaitun" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
        </svg>
        <span class="text-xl font-extrabold text-nature-zaitun tracking-wider">Olahin</span>
      </div>
      <nav class="flex items-center gap-6">
        <button 
          @click="router.push('/home')" 
          class="text-xs font-black uppercase tracking-wider transition-colors" 
          :class="route.name === 'Home' ? 'text-nature-zaitun' : 'text-gray-400 hover:text-nature-zaitun'"
        >
          Home
        </button>
        <button 
          @click="router.push('/fridge')" 
          class="text-xs font-black uppercase tracking-wider transition-colors" 
          :class="route.name === 'Fridge' || route.name === 'AddIngredient' ? 'text-nature-zaitun' : 'text-gray-400 hover:text-nature-zaitun'"
        >
          Kulkas
        </button>
        <button 
          @click="router.push('/recipes')" 
          class="text-xs font-black uppercase tracking-wider transition-colors" 
          :class="route.name === 'RecipeRecommendations' || route.name === 'CookingGuide' ? 'text-nature-zaitun' : 'text-gray-400 hover:text-nature-zaitun'"
        >
          Resep
        </button>
        <button 
          @click="router.push('/insights')" 
          class="text-xs font-black uppercase tracking-wider transition-colors" 
          :class="route.name === 'Insights' ? 'text-nature-zaitun' : 'text-gray-400 hover:text-nature-zaitun'"
        >
          Profil
        </button>
      </nav>
    </header>

    <!-- Offline Indicator Banner (Only shows when user is disconnected) -->
    <div v-if="!store.isOnline" class="bg-nature-red text-white text-[10px] font-bold py-1 px-4 text-center z-50 animate-pulse flex items-center justify-center gap-1 shadow-sm">
      <span>⚠️ Anda sedang offline (Aplikasi berjalan dalam mode lokal)</span>
    </div>

    <!-- Main Content Panel (Responsive wrapped) -->
    <div class="flex-1 overflow-y-auto relative flex flex-col pb-16 md:pb-6" :class="{ 'pb-0': !showBottomNav, 'md:pb-6': showBottomNav }">
      <div class="w-full max-w-5xl mx-auto px-4 md:px-8 py-2 md:py-6 flex-1 flex flex-col">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- Global Loading Overlay -->
    <div v-if="store.loading" class="absolute inset-0 bg-nature-cream/80 backdrop-blur-sm z-50 flex justify-center items-center flex-col gap-3">
      <div class="w-12 h-12 border-4 border-nature-leaf border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm font-semibold text-nature-forest">Memproses data...</p>
    </div>

    <!-- Persistent Bottom Navigation Bar (Visible on Mobile only) -->
    <nav v-if="showBottomNav" class="md:hidden absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex justify-around items-center px-4 py-2 z-40 shadow-lg">
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
