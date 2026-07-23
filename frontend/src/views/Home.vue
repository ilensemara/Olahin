<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const searchQuery = ref('')
const isNotificationOpen = ref(false)
const hasUnreadNotifications = ref(true)

const openNotifications = () => {
  isNotificationOpen.value = true
  hasUnreadNotifications.value = false
}

// Filter matched recipes based on search query
const filteredRecipes = computed(() => {
  if (!searchQuery.value) return store.matchedRecipes
  const query = searchQuery.value.toLowerCase().trim()
  return store.matchedRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(query) ||
    recipe.description.toLowerCase().includes(query)
  )
})

const startCooking = (recipe) => {
  store.selectedRecipe = recipe
  router.push('/cook')
}

// Check if any fridge item is nearing expiry (<= 3 days)
const hasExpiryWarning = computed(() => {
  return store.fridgeItems.some(item => {
    const today = new Date()
    today.setHours(0,0,0,0)
    const exp = new Date(item.expiry_date)
    exp.setHours(0,0,0,0)
    const diffTime = exp - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  })
})

onMounted(() => {
  store.loadAllData()
})
</script>

<template>
  <div class="flex-1 bg-nature-cream flex flex-col p-5 overflow-y-auto">
    <!-- Header: Logo, Subtitle, Bell & Profile Avatar (Hidden on Desktop since Top Navbar exists) -->
    <div class="flex justify-between items-center mb-5 pt-2 md:hidden">
      <div>
        <div class="flex items-center gap-1.5">
          <!-- Logo symbol (Bowl with leaves) -->
          <svg class="w-6 h-6 text-nature-zaitun" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
          </svg>
          <span class="text-xl font-extrabold text-nature-zaitun tracking-wider">Olahin</span>
        </div>
        <p class="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Apakah Bahannya, Olahin Ada Resepnya</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Notification Bell (Clickable, matches mockup notification indicator) -->
        <button 
          @click="openNotifications"
          class="relative p-2 bg-white rounded-full border border-gray-150 shadow-sm active:scale-95 transition-transform text-nature-zaitun"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span v-if="hasUnreadNotifications" class="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>
        <!-- Profile Avatar (Budi Santoso photo placeholder) -->
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" 
          class="w-8 h-8 rounded-full border border-nature-zaitun/20 shadow-sm cursor-pointer hover:opacity-95"
          @click="router.push('/insights')"
          alt="Avatar"
        />
      </div>
    </div>

    <!-- Search Input: "What do you cook today?" -->
    <div class="relative w-full mb-4">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="What do you cook today?" 
        class="w-full pl-10 pr-4 py-2.5 bg-nature-input border border-transparent rounded-2xl text-xs focus:outline-none focus:border-nature-zaitun focus:bg-white transition-all font-semibold text-nature-forest placeholder-gray-400"
      />
    </div>

    <!-- Peringatan Kadaluarsa Alert Banner (Shown if items nearing expiry, matches mockup style) -->
    <div 
      v-if="hasExpiryWarning" 
      @click="router.push('/fridge')"
      class="bg-[#4D5C48]/90 text-white rounded-2xl p-3 mb-5 flex items-start justify-between cursor-pointer active:scale-98 transition-transform shadow-sm"
    >
      <div class="flex gap-2 text-[10px]">
        <span class="text-base">⚠️</span>
        <div>
          <h5 class="font-extrabold tracking-wide">Peringatan!</h5>
          <p class="text-white/80 font-medium leading-relaxed">Bahan makanan tiruan akan kadaluarsa dalam 3 hari lagi.</p>
        </div>
      </div>
      <span class="text-[9px] bg-white/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">Lihat Bahan</span>
    </div>

    <!-- Quick Action: 3 Circular Buttons -->
    <div class="grid grid-cols-3 gap-2 mb-5">
      <div class="flex flex-col items-center gap-1.5 text-center">
        <button 
          @click="router.push('/add-ingredient')"
          class="w-12 h-12 bg-nature-zaitun hover:bg-emerald-800 text-white rounded-full flex justify-center items-center shadow-md active:scale-95 transition-transform"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <span class="text-[8px] font-black text-nature-forest uppercase tracking-wider">Tambah Bahan</span>
      </div>

      <div class="flex flex-col items-center gap-1.5 text-center">
        <button 
          @click="router.push('/recipes')"
          class="w-12 h-12 bg-nature-zaitun hover:bg-emerald-800 text-white rounded-full flex justify-center items-center shadow-md active:scale-95 transition-transform"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <span class="text-[8px] font-black text-nature-forest uppercase tracking-wider">Menu Mingguan</span>
      </div>

      <div class="flex flex-col items-center gap-1.5 text-center">
        <button 
          @click="router.push('/nutrition')"
          class="w-12 h-12 bg-nature-zaitun hover:bg-emerald-800 text-white rounded-full flex justify-center items-center shadow-md active:scale-95 transition-transform"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </button>
        <span class="text-[8px] font-black text-nature-forest uppercase tracking-wider">Analisis Nutrisi</span>
      </div>
    </div>

    <!-- Recommended Section Title -->
    <div class="flex justify-between items-center mb-3">
      <h4 class="text-xs font-black uppercase tracking-wider text-nature-forest">Recommended</h4>
    </div>

    <!-- Recommended Grid -->
    <div class="flex-1">
      <div v-if="filteredRecipes.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        <div 
          v-for="recipe in filteredRecipes" 
          :key="recipe.id"
          @click="startCooking(recipe)"
          class="bg-white border border-gray-150 rounded-[25px] overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <!-- Recipe Image -->
          <div class="w-full h-24 bg-gray-150 overflow-hidden relative">
            <img 
              :src="recipe.id === 1 ? 'https://images.unsplash.com/photo-1603133872878-6967b68270c6?auto=format&fit=crop&q=80&w=200' : 
                    recipe.id === 2 ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200' :
                    recipe.id === 3 ? 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=200' :
                    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200'"
              class="w-full h-full object-cover"
              alt="Recipe Banner"
            />
            <!-- Match percentage float badge -->
            <span class="absolute top-2 left-2 bg-nature-zaitun text-white font-extrabold text-[7px] px-2 py-0.5 rounded-full uppercase">
              {{ recipe.match_percentage }}% Cocok
            </span>
          </div>

          <!-- Description and titles -->
          <div class="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h5 class="font-extrabold text-nature-forest text-[11px] leading-tight line-clamp-1 mb-0.5">{{ recipe.title }}</h5>
              <p class="text-gray-400 text-[9px] leading-relaxed line-clamp-2">{{ recipe.description }}</p>
            </div>

            <!-- Stats -->
            <div class="flex justify-between items-center text-[8px] font-bold text-gray-500 border-t border-gray-100 pt-2 mt-2">
              <span class="flex items-center gap-0.5">
                ⏱ {{ recipe.prep_time }}m
              </span>
              <span class="flex items-center gap-0.5 text-orange-500">
                🔥 {{ recipe.calories }}k
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback when no recipes matched -->
      <div v-else class="flex flex-col items-center justify-center py-10 bg-white rounded-[25px] border border-gray-150 p-5 text-center shadow-sm">
        <svg class="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-xs font-bold text-nature-forest mb-0.5">Tidak ada resep cocok</p>
        <p class="text-[9px] text-gray-400 leading-normal max-w-[160px]">
          Tambahkan bahan baru ke kulkas Anda untuk mencocokkan menu.
        </p>
      </div>
    </div>

    <!-- ---------------------------------------------------- -->
    <!-- NOTIFICATION MODAL OVERLAY -->
    <!-- ---------------------------------------------------- -->
    <div v-if="isNotificationOpen" class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-[#2C3529]">
      <div class="bg-white rounded-[30px] p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4">
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-gray-150 pb-2.5">
          <span class="text-xs font-black text-nature-zaitun uppercase tracking-widest">Notifikasi Anda (2)</span>
          <button @click="isNotificationOpen = false" class="p-1 text-gray-400 hover:text-rose-500 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Notifications list -->
        <div class="flex flex-col gap-3">
          <!-- Notification 1 -->
          <div class="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-800">
            <span class="text-base leading-none">⚠️</span>
            <div>
              <h5 class="font-extrabold uppercase tracking-wider text-[8px] mb-0.5">Bahan Hampir Kadaluarsa</h5>
              <p class="leading-relaxed text-amber-900/80">Wortel di kulkas hampir kadaluarsa dalam 2 hari! Yuk, segera olah dengan resep Sop Ayam Wortel.</p>
            </div>
          </div>

          <!-- Notification 2 -->
          <div class="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-800">
            <span class="text-base leading-none">🎉</span>
            <div>
              <h5 class="font-extrabold uppercase tracking-wider text-[8px] mb-0.5">Penyelamatan Sukses</h5>
              <p class="leading-relaxed text-emerald-900/80">Anda berhasil memasak Nasi Goreng Telur dan menyelamatkan 0.5 kg sampah makanan hari ini!</p>
            </div>
          </div>
        </div>

        <button 
          @click="isNotificationOpen = false"
          class="w-full py-2.5 bg-nature-zaitun hover:bg-emerald-800 text-white font-extrabold rounded-full text-xs mt-1 active:scale-95 transition-transform shadow-md"
        >
          Tandai Telah Dibaca
        </button>
      </div>
    </div>
  </div>
</template>
