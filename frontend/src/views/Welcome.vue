<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const handleSkip = () => {
  store.token = 'offline-token-123'
  localStorage.setItem('auth_token', store.token)
  store.loadOfflineData()
  router.push('/home')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-between p-6 relative bg-gradient-to-b from-[#2C3529] to-[#11160F] text-white">
    <!-- Culinary Theme Blurred Background -->
    <div class="absolute inset-0 bg-cover bg-center opacity-40 select-none pointer-events-none" style="background-image: url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600'); filter: blur(2px);"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-[#11160F]/95 via-transparent to-[#2C3529]/80"></div>

    <!-- Empty top spacer to balance logo -->
    <div class="h-10"></div>

    <!-- Centered Logo Panel -->
    <div class="relative z-10 flex flex-col items-center justify-center flex-1 -mt-12">
      <!-- Leaf Bowl Logo (White stroke circle with transparent green) -->
      <div class="w-24 h-24 bg-white/10 rounded-full flex justify-center items-center shadow-lg border-2 border-white/20 backdrop-blur-md mb-4">
        <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.5 2C13 2 11 5 11 8c0 3 2 5.5 2 5.5s-1.5-1.5-2.5-3.5C9.5 8 7 8 5 9.5c-2.5 2-3 5.5-3 8.5 0 2.2 1.8 4 4 4 3 0 6.5-1.5 8.5-4 2 2.5 5.5 4 8.5 4 2.2 0 4-1.8 4-4 0-3-.5-6.5-3-8.5-2-1.5-4.5-1.5-5.5.5-1 2-2.5 3.5-2.5 3.5s2-2.5 2-5.5c0-3-2-6-6.5-6z"/>
        </svg>
      </div>
      <h2 class="text-3xl font-extrabold tracking-widest text-white">Olahin</h2>
      <p class="text-[10px] text-gray-300 tracking-wider font-medium mt-1">Apa pun Bahannya, Olahin Ada Resepnya</p>
    </div>

    <!-- Action Buttons & Skip option -->
    <div class="relative z-10 flex flex-col w-full max-w-sm mx-auto gap-3.5 pb-16">
      <button 
        @click="router.push('/login')" 
        class="w-full py-3 bg-nature-zaitun hover:bg-emerald-800 active:scale-95 transition-all text-white font-bold rounded-full shadow-lg flex justify-center items-center text-sm tracking-wide"
      >
        Masuk
      </button>
      
      <button 
        @click="router.push('/register')" 
        class="w-full py-3 bg-transparent border border-white/60 hover:border-white text-white font-bold rounded-full flex justify-center items-center text-sm tracking-wide active:scale-95 transition-all"
      >
        Daftar
      </button>

      <!-- Lewati... skip button positioned exactly like mockup bottom right -->
      <div 
        @click="handleSkip" 
        class="absolute -bottom-2 right-2 text-xs font-bold text-white/50 hover:text-white cursor-pointer select-none transition-colors"
      >
        Lewati...
      </div>
    </div>
  </div>
</template>
