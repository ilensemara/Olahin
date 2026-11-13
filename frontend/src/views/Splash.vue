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
    <div class="flex flex-col items-center animate-bounce px-4">
      <img 
        src="/logo-light.png" 
        alt="Olahin - Apa pun Bahanmu, Olahin Ada Resepnya" 
        class="w-72 max-w-full object-contain filter drop-shadow-lg"
      />
    </div>
    
    <!-- Tagline -->
    <p class="absolute bottom-16 text-emerald-100/90 text-sm tracking-wide font-medium">
      Smart Recipe & Nutrition Manager
    </p>
  </div>
</template>
