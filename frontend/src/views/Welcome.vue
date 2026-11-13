<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const isGuestModalOpen = ref(false)

const handleSkipClick = () => {
  isGuestModalOpen.value = true
}

const startWithDemoData = () => {
  store.token = 'offline-token-123'
  localStorage.setItem('auth_token', store.token)
  store.loadOfflineData()
  isGuestModalOpen.value = false
  router.push('/home')
}

const startWithEmptyData = () => {
  store.token = 'offline-token-123'
  localStorage.setItem('auth_token', store.token)
  store.loadEmptyData()
  isGuestModalOpen.value = false
  router.push('/home')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-between p-6 relative bg-gradient-to-b from-[#2C3529] to-[#11160F] text-white select-none">
    <!-- Culinary Theme Blurred Background -->
    <div class="absolute inset-0 bg-cover bg-center opacity-40 select-none pointer-events-none" style="background-image: url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600'); filter: blur(2px);"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-[#11160F]/95 via-transparent to-[#2C3529]/80"></div>

    <!-- Empty top spacer to balance logo -->
    <div class="h-10"></div>

    <!-- Centered Logo Panel -->
    <div class="relative z-10 flex flex-col items-center justify-center flex-1 -mt-10 px-4">
      <img 
        src="/logo-light.png" 
        alt="Olahin - Apa pun Bahanmu, Olahin Ada Resepnya" 
        class="w-72 max-w-full object-contain filter drop-shadow-md select-none"
      />
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

      <!-- Lewati... modal trigger -->
      <div 
        @click="handleSkipClick" 
        class="absolute -bottom-2 right-2 text-xs font-bold text-white/50 hover:text-white cursor-pointer select-none transition-colors"
      >
        Lewati...
      </div>
    </div>

    <!-- Modal Pilihan Mode Tamu / Demo -->
    <div v-if="isGuestModalOpen" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-5 text-[#2C3529]">
      <div class="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center gap-3">
        <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shadow-inner">
          🚀
        </div>
        <h3 class="text-base font-extrabold text-nature-forest leading-tight">Mulai Eksplorasi Olahin</h3>
        <p class="text-xs text-gray-500 leading-relaxed">
          Pilih mode simulasi kulkas siap pakai untuk melihat fitur resep lengkap, atau mulai bersih dari kulkas kosong.
        </p>

        <div class="w-full flex flex-col gap-2.5 mt-2">
          <button 
            @click="startWithDemoData"
            class="w-full py-3 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>🌟</span>
            <span>Gunakan Kulkas Demo (Untuk Juri)</span>
          </button>

          <button 
            @click="startWithEmptyData"
            class="w-full py-2.5 bg-nature-mint text-nature-zaitun font-extrabold rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>🆕</span>
            <span>Mulai dari Kulkas Kosong</span>
          </button>

          <button 
            @click="isGuestModalOpen = false"
            class="w-full py-1 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
