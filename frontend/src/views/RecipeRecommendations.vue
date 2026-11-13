<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../store'
import { getRecipeImage } from '../utils/recipeMedia'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

// Search input (prefilled from route query if passed from Fridge)
const searchQuery = ref(route.query.q || '')

// Filter states
const activeMatchFilter = ref('Semua') // 'Semua' | '100% Cocok' | 'Butuh Belanja'
const activeDietFilter = ref(store.user?.health_goal === 'lose_weight')
const activeBulkingFilter = ref(store.user?.health_goal === 'gain_weight')
const activeNutritionFilter = ref(false)
const activeCalorieBudgetFilter = ref(false)
const hideAllergens = ref(true)

// Calorie budget calculations
const targetCalories = computed(() => store.user?.target_calories || 2000)
const consumedCalories = computed(() => store.insights?.today_nutrition?.calories || 1240)
const remainingCalories = computed(() => Math.max(0, targetCalories.value - consumedCalories.value))

const openRecipeDetail = (recipe) => {
  store.setSelectedRecipe(recipe)
  router.push('/recipe-detail')
}

// Compute filtered matched recipes list
const filteredRecipes = computed(() => {
  let list = store.matchedRecipes

  // Filter out recipes with user's allergens if enabled
  if (hideAllergens.value && store.user?.allergies?.length > 0) {
    list = list.filter(r => !r.has_allergen)
  }

  // Search query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.ingredients?.some(i => i.name.toLowerCase().includes(q))
    )
  }

  // Match percent filter
  if (activeMatchFilter.value === '100% Cocok') {
    list = list.filter(r => r.match_percentage === 100)
  } else if (activeMatchFilter.value === 'Butuh Belanja') {
    list = list.filter(r => r.match_percentage < 100)
  }

  // Diet filter (<= 250 kkal)
  if (activeDietFilter.value) {
    list = list.filter(r => (r.calories || 300) <= 250)
  }

  // Bulking filter (>= 280 kkal and high protein)
  if (activeBulkingFilter.value) {
    list = list.filter(r => (r.calories || 300) >= 280 && (r.protein || 0) >= 12)
  }

  // High Protein filter (>= 10g protein)
  if (activeNutritionFilter.value) {
    list = list.filter(r => (r.protein || 0) >= 10)
  }

  // Smart Remaining Calorie Budget Filter
  if (activeCalorieBudgetFilter.value) {
    list = list.filter(r => (r.calories || 300) <= remainingCalories.value)
  }

  return list
})

onMounted(() => {
  store.loadMatchedRecipes()
})
</script>

<template>
  <div class="flex-1 flex flex-col pb-24 select-none">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3 pt-1">
      <div class="flex items-center gap-2">
        <button @click="router.push('/home')" class="w-9 h-9 rounded-full bg-white border border-gray-150 flex items-center justify-center text-nature-forest hover:bg-gray-50 active:scale-95 transition-all shadow-sm md:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h3 class="text-base font-extrabold text-nature-forest leading-tight">Rekomendasi Resep Cerdas</h3>
          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Berdasarkan Bahan Kulkas & Target Kalorimu</p>
        </div>
      </div>

      <!-- Shortcut to Meal Planner -->
      <button 
        @click="router.push('/meal-planner')"
        class="bg-white border border-gray-150 text-nature-zaitun font-black text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
      >
        <span>📅</span>
        <span>Menu Mingguan</span>
      </button>
    </div>

    <!-- Search Input Bar with Clear Button -->
    <div class="relative mb-3">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Cari masakan atau bahan (mis: Bayam, Ayam, Telur)..."
        class="w-full bg-white border border-gray-150 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-zaitun shadow-xs"
      />
      <span class="absolute left-3.5 top-3 text-gray-400 text-xs">🔍</span>
      <button 
        v-if="searchQuery" 
        @click="searchQuery = ''"
        class="absolute right-3.5 top-2.5 text-gray-400 hover:text-rose-500 font-black text-xs"
      >
        ✕
      </button>
    </div>

    <!-- Allergen Protection Banner (Shows if user has configured allergies) -->
    <div v-if="store.user?.allergies?.length > 0" class="flex justify-between items-center bg-rose-50 border border-rose-200 rounded-2xl p-2.5 mb-3 text-[9px] font-bold text-rose-800">
      <div class="flex items-center gap-1.5">
        <span class="text-xs">🛡️</span>
        <span>Proteksi Alergi: <span class="font-extrabold underline">{{ store.user.allergies.join(', ') }}</span></span>
      </div>
      <button 
        @click="hideAllergens = !hideAllergens"
        class="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase active:scale-95 transition-all shadow-xs"
        :class="hideAllergens ? 'bg-rose-600 text-white' : 'bg-white text-gray-500 border border-gray-200'"
      >
        {{ hideAllergens ? 'Sembunyikan' : 'Tampilkan' }}
      </button>
    </div>

    <!-- Filter Pills Row 1: Diet, Bulking, Protein & Sisa Kalori Cerdas -->
    <div class="flex gap-2 mb-3 overflow-x-auto pb-1 scroll-smooth -mx-1 px-1">
      <!-- Sisa Budget Kalori Hari Ini -->
      <button 
        @click="activeCalorieBudgetFilter = !activeCalorieBudgetFilter"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all border"
        :class="activeCalorieBudgetFilter ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white border-gray-150 text-amber-700 hover:bg-amber-50'"
      >
        🔥 Sisa Kalori (≤{{ remainingCalories }} kkal)
      </button>

      <button 
        @click="activeDietFilter = !activeDietFilter"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all border"
        :class="activeDietFilter ? 'bg-[#4D5C48] text-white border-[#4D5C48] shadow-sm' : 'bg-white border-gray-150 text-nature-zaitun hover:bg-gray-50'"
      >
        🥗 Diet Defisit (≤250 kkal)
      </button>

      <button 
        @click="activeBulkingFilter = !activeBulkingFilter"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all border"
        :class="activeBulkingFilter ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white border-gray-150 text-amber-800 hover:bg-amber-50'"
      >
        💪 Bulking (≥280 kkal)
      </button>

      <button 
        @click="activeNutritionFilter = !activeNutritionFilter"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all border"
        :class="activeNutritionFilter ? 'bg-[#4D5C48] text-white border-[#4D5C48] shadow-sm' : 'bg-white border-gray-150 text-nature-zaitun hover:bg-gray-50'"
      >
        ⚡ Tinggi Protein (≥10g)
      </button>
    </div>

    <!-- Filter Pills Row 2: Semua / 100% Cocok / Butuh Belanja -->
    <div class="flex gap-1.5 mb-4 border-b border-gray-150/40 pb-3 select-none">
      <button 
        v-for="f in ['Semua', '100% Cocok', 'Butuh Belanja']"
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
          @click="openRecipeDetail(recipe)"
          class="bg-white border border-gray-150 rounded-[30px] p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
        >
          <!-- Expiry Alert Banner inside Card if applicable -->
          <div 
            v-if="recipe.min_expiry_days !== null && recipe.min_expiry_days <= 3" 
            class="bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-1.5 text-[9px] font-black text-rose-600 mb-2 flex items-center gap-1.5"
          >
            <span>⚠️</span>
            <span>Prioritas: Bahan kulkas mau kedaluwarsa dalam {{ recipe.min_expiry_days }} hari</span>
          </div>

          <!-- Allergen Warning inside Card -->
          <div 
            v-if="recipe.has_allergen" 
            class="bg-rose-100 border border-rose-300 rounded-xl px-2.5 py-1 text-[8px] font-black text-rose-800 mb-2 flex items-center gap-1.5"
          >
            <span>⚠️</span>
            <span>Mengandung Alergen Profil: {{ recipe.detected_allergens?.join(', ') }}</span>
          </div>

          <!-- Layout: Left side info, Right side image -->
          <div class="flex justify-between items-center gap-4">
            <!-- Left side info -->
            <div class="flex-1 flex flex-col justify-between min-h-[96px]">
              <div>
                <!-- Match percentage badge -->
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span 
                    class="font-black text-[7px] px-2 py-0.5 rounded-full uppercase border inline-block"
                    :class="recipe.match_percentage === 100 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'"
                  >
                    {{ recipe.match_percentage }}% Cocok Kulkas
                  </span>
                  <span v-if="recipe.match_percentage < 100" class="text-[7px] font-bold text-amber-700">
                    (Kurang {{ recipe.missing_ingredients?.length || 1 }} bahan)
                  </span>
                </div>

                <h4 class="font-extrabold text-nature-forest text-xs leading-snug line-clamp-1">{{ recipe.title }}</h4>
                <p class="text-[9px] text-gray-400 leading-normal line-clamp-1 mt-0.5">{{ recipe.description }}</p>
              </div>

              <!-- Stats & CTA inline -->
              <div class="flex justify-between items-center pt-2">
                <span class="text-[8px] font-bold text-gray-400 uppercase tracking-wide">
                  ⏱ {{ recipe.prep_time }} mnt • 🔥 {{ recipe.calories }} kkal
                </span>
                
                <button 
                  @click.stop="openRecipeDetail(recipe)"
                  class="bg-nature-zaitun text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-emerald-800 transition-colors active:scale-95 shadow-sm"
                >
                  Lihat Resep
                </button>
              </div>
            </div>

            <!-- Right side image -->
            <div class="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img 
                :src="recipe.image || getRecipeImage(recipe)"
                class="w-full h-full object-cover"
                :alt="recipe.title"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback when no recipes matched -->
      <div v-else class="flex-1 flex flex-col items-center justify-center py-16 bg-white rounded-[30px] border border-gray-150 p-6 text-center shadow-sm">
        <span class="text-3xl mb-2">🥗</span>
        <h4 class="text-xs font-bold text-nature-forest mb-1">Tidak ada resep cocok dengan filter ini</h4>
        <p class="text-[9px] text-gray-400 leading-normal max-w-[200px]">
          Coba hapus kata kunci pencarian atau matikan filter sisa kalori/diet.
        </p>
      </div>
    </div>
  </div>
</template>
