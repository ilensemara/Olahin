<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Filter states (diet pill, match filters)
const activeMatchFilter = ref('Semua') // 'Semua' | '100% Cocok' | 'Butuh Bahan Umum'
const activeDietFilter = ref(false)

const startCooking = (recipe) => {
  store.selectedRecipe = recipe
  router.push('/cook')
}

// Compute filtered matched recipes list
const filteredRecipes = computed(() => {
  let list = store.matchedRecipes

  // Match percent filter
  if (activeMatchFilter.value === '100% Cocok') {
    list = list.filter(r => r.match_percentage === 100)
  } else if (activeMatchFilter.value === 'Butuh Bahan Umum') {
    list = list.filter(r => r.match_percentage < 100)
  }

  return list
})

onMounted(() => {
  store.loadMatchedRecipes()
})
</script>

<template>
  <div class="flex-1 bg-nature-cream flex flex-col p-5 overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center gap-1 mb-4 pt-2">
      <button @click="router.push('/home')" class="p-1 -ml-1 text-nature-forest hover:opacity-80 md:hidden">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h3 class="text-base font-extrabold text-nature-forest leading-tight">Rekomendasi Resep Terbaik</h3>
        <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Berdasarkan bahan kulkasmu</p>
      </div>
    </div>

    <!-- Filter Pills Row 1: Diet / Nutrisi -->
    <div class="flex gap-2 mb-3">
      <button 
        @click="activeDietFilter = !activeDietFilter"
        class="px-3.5 py-1 bg-white border border-gray-150 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all text-nature-zaitun"
        :class="activeDietFilter ? 'bg-[#EBF0E9] border-nature-sage font-black' : ''"
      >
        🥗 Diet
      </button>
      <button class="px-3.5 py-1 bg-white border border-gray-150 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all text-nature-zaitun">
        ⚡ Nutrisi
      </button>
    </div>

    <!-- Filter Pills Row 2: Semua / 100% Cocok / Butuh Bahan Umum -->
    <div class="flex gap-1.5 mb-4 border-b border-gray-150/40 pb-3 select-none">
      <button 
        v-for="f in ['Semua', '100% Cocok', 'Butuh Bahan Umum']"
        :key="f"
        @click="activeMatchFilter = f"
        class="px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all"
        :class="activeMatchFilter === f ? 'bg-nature-zaitun border-nature-zaitun text-white shadow-sm' : 'bg-white border-gray-150 text-gray-400 hover:text-nature-forest'"
      >
        {{ f }}
      </button>
    </div>

    <!-- Recommended Recipes List -->
    <div class="flex-1 flex flex-col gap-4">
      <div v-if="filteredRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          class="bg-white border border-gray-150 rounded-[30px] p-4 shadow-sm flex flex-col justify-between"
        >
          <!-- Expiry Alert Banner inside Card (Matches Screen 9 mockup) -->
          <div 
            v-if="recipe.min_expiry_days !== null && recipe.min_expiry_days <= 3" 
            class="bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-1.5 text-[9px] font-black text-rose-600 mb-3 flex items-center gap-1.5"
          >
            <span>⚠️</span>
            <span>Memanfaatkan bahan yang hampir kadaluarsa</span>
          </div>

          <!-- Layout: Left side info, Right side image -->
          <div class="flex justify-between items-center gap-4">
            <!-- Left side info -->
            <div class="flex-1 flex flex-col justify-between h-24">
              <div>
                <!-- Match percentage pill -->
                <span class="bg-[#EBF0E9] text-nature-zaitun font-black text-[7px] px-2 py-0.5 rounded-full uppercase border border-nature-sage/40 inline-block mb-1.5">
                  {{ recipe.match_percentage }}% Cocok
                </span>
                <h4 class="font-extrabold text-nature-forest text-xs leading-snug line-clamp-1">{{ recipe.title }}</h4>
                <p class="text-[9px] text-gray-400 leading-normal line-clamp-1 mt-0.5">{{ recipe.description }}</p>
              </div>

              <!-- Stats & CTA inline -->
              <div class="flex justify-between items-center pt-2">
                <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                  ⏱ {{ recipe.prep_time }} mnt • 🔥 {{ recipe.calories }} kkal
                </span>
                
                <button 
                  @click="startCooking(recipe)"
                  class="bg-nature-zaitun text-white px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-emerald-800 transition-colors active:scale-95 shadow-sm"
                >
                  Lihat Resep
                </button>
              </div>
            </div>

            <!-- Right side image -->
            <div class="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img 
                :src="recipe.id === 1 ? 'https://images.unsplash.com/photo-1603133872878-6967b68270c6?auto=format&fit=crop&q=80&w=200' : 
                      recipe.id === 2 ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200' :
                      recipe.id === 3 ? 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=200' :
                      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200'"
                class="w-full h-full object-cover"
                alt="Food cover"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback when no recipes matched -->
      <div v-else class="flex-1 flex flex-col items-center justify-center py-16 bg-white rounded-[30px] border border-gray-150 p-6 text-center shadow-sm">
        <span class="text-3xl mb-2">🥗</span>
        <h4 class="text-xs font-bold text-nature-forest mb-1">Tidak ada resep cocok</h4>
        <p class="text-[9px] text-gray-400 leading-normal max-w-[160px]">
          Coba hilangkan filter kecocokan 100% atau tambahkan bahan baru ke kulkas.
        </p>
      </div>
    </div>
  </div>
</template>
