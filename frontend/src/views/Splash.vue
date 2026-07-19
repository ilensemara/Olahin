<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

onMounted(() => {
  setTimeout(() => {
    if (store.isAuthenticated) {
      router.push('/home')
    } else {
      router.push('/welcome')
    }
  }, 2500)
})
</script>

<template>
  <div class="flex-1 bg-gradient-to-tr from-nature-forest via-nature-leaf to-emerald-400 flex flex-col justify-center items-center p-6 text-white select-none">
    <div class="flex flex-col items-center gap-4 animate-bounce">
      <!-- Leaf Icon Logo -->
      <div class="w-24 h-24 bg-white rounded-full flex justify-center items-center shadow-lg border-4 border-nature-mint">
        <svg class="w-14 h-14 text-nature-leaf" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.5 2C13 2 11 5 11 8c0 3 2 5.5 2 5.5s-1.5-1.5-2.5-3.5C9.5 8 7 8 5 9.5c-2.5 2-3 5.5-3 8.5 0 2.2 1.8 4 4 4 3 0 6.5-1.5 8.5-4 2 2.5 5.5 4 8.5 4 2.2 0 4-1.8 4-4 0-3-.5-6.5-3-8.5-2-1.5-4.5-1.5-5.5.5-1 2-2.5 3.5-2.5 3.5s2-2.5 2-5.5c0-3-2-6-6.5-6z"/>
        </svg>
      </div>
      <h1 class="text-4xl font-extrabold tracking-wider mt-2">Olahin</h1>
    </div>
    
    <!-- Tagline -->
    <p class="absolute bottom-16 text-emerald-100/90 text-sm tracking-wide font-medium">
      Smart Recipe & Nutrition Manager
    </p>
  </div>
</template>
