<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const email = ref('user@olahin.com')
const password = ref('password')
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Silakan lengkapi email dan kata sandi.'
    return
  }

  errorMessage.value = ''
  const res = await store.login(email.value, password.value)
  if (res.success) {
    router.push('/home')
  } else {
    errorMessage.value = res.message
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-between p-6 relative bg-gradient-to-b from-[#2C3529] to-[#11160F] text-[#2C3529] overflow-y-auto">
    <!-- Blurred Food Background -->
    <div class="absolute inset-0 bg-cover bg-center opacity-30 select-none pointer-events-none" style="background-image: url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600'); filter: blur(2px);"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-[#11160F]/90 via-transparent to-[#2C3529]/70"></div>

    <!-- Back Arrow Nav -->
    <div class="relative z-10 flex justify-between items-center pt-4 text-white">
      <button @click="router.push('/welcome')" class="p-2 -ml-2 text-white hover:opacity-80">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <span class="text-sm font-bold tracking-wider">Masuk</span>
      <div class="w-8"></div>
    </div>

    <!-- Glassmorphic Login Card -->
    <div class="relative z-10 my-auto mx-auto w-full max-w-sm bg-white/90 backdrop-blur-md rounded-[35px] border border-white/20 p-6 shadow-2xl flex flex-col gap-4 mt-8 mb-6">
      <div class="flex flex-col items-center mb-1">
        <img src="/logo-dark.png" alt="Olahin" class="h-10 object-contain mb-2 select-none" />
        <h2 class="text-base font-extrabold text-nature-forest tracking-wide">Masuk ke Akun Anda</h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div class="border-b border-gray-300 pb-1">
          <label class="block text-[10px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Nama / Email</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="Masukkan email Anda" 
            class="w-full bg-transparent focus:outline-none text-xs font-bold text-nature-forest"
          />
        </div>

        <div class="border-b border-gray-300 pb-1">
          <label class="block text-[10px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Sandi</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Masukkan kata sandi" 
            class="w-full bg-transparent focus:outline-none text-xs font-bold text-nature-forest"
          />
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-[10px] text-rose-500 font-bold bg-rose-50 p-2 rounded-xl border border-rose-100">{{ errorMessage }}</p>

        <!-- Login Button (Solid Olive Round) -->
        <button 
          type="submit" 
          class="w-full py-2.5 bg-nature-zaitun hover:bg-emerald-800 active:scale-95 transition-all text-white font-bold rounded-full shadow-md text-xs mt-2"
        >
          Masuk
        </button>
      </form>

      <!-- Social Logins -->
      <div class="flex flex-col items-center gap-3 mt-2">
        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">atau masuk dengan</span>
        
        <!-- Social buttons inline grid -->
        <div class="grid grid-cols-2 gap-2 w-full">
          <button 
            type="button"
            @click="handleLogin"
            class="py-2 bg-[#EAE8DC] border border-transparent rounded-full flex items-center justify-center gap-1.5 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <!-- Apple Icon -->
            <svg class="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 3 .12.01.24.01.37.01.91 0 2.06-.57 2.63-1.45z"/>
            </svg>
            <span class="text-[10px] font-bold text-gray-700">Apple</span>
          </button>

          <button 
            type="button"
            @click="handleLogin"
            class="py-2 bg-[#EAE8DC] border border-transparent rounded-full flex items-center justify-center gap-1.5 hover:bg-gray-200 active:scale-95 transition-all"
          >
            <!-- Google Icon -->
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 15.02 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.74 8.92 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.57v3h3.86c2.26-2.09 3.57-5.16 3.57-8.72z"/>
              <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 10.96 0 13.2s.54 4.38 1.5 6.3l3.86-3z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.09 7.96-2.93l-3.86-3c-1.1.74-2.5 1.19-4.1 1.19-3.08 0-5.73-2.7-6.64-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z"/>
            </svg>
            <span class="text-[10px] font-bold text-gray-700">Google</span>
          </button>
        </div>
      </div>
      
      <p class="text-[10px] text-gray-400 font-bold text-center mt-2">
        Belum punya akun? 
        <router-link to="/register" class="text-nature-zaitun hover:underline">Daftar!</router-link>
      </p>
    </div>

    <!-- Bottom spacer -->
    <div class="h-6"></div>
  </div>
</template>
