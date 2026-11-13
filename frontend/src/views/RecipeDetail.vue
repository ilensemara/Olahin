<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { getRecipeImage, getRecipeYoutubeAppUrl } from '../utils/recipeMedia'

const router = useRouter()
const store = useAppStore()

const fallbackRecipe = {
  id: 1,
  title: 'Nasi Goreng Telur',
  description: 'Resep nasi goreng sederhana khas rumahan yang gurih dan cepat disajikan.',
  prep_time: 15,
  calories: 450,
  carbs: 60,
  protein: 12,
  fat: 15,
  match_percentage: 100,
  youtube_video_url: 'https://www.youtube.com/watch?v=i6yHVLgrELQ',
  youtube_id: 'i6yHVLgrELQ',
  ingredients: [
    { name: 'Telur', quantity: 1, unit: 'pcs' },
    { name: 'Bawang Merah', quantity: 15, unit: 'gr' },
    { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
    { name: 'Minyak Goreng', quantity: 15, unit: 'ml' },
    { name: 'Kecap Manis', quantity: 10, unit: 'ml' }
  ],
  steps: [
    "Panaskan 15ml minyak goreng di wajan dengan api sedang.",
    "Tumis irisan bawang merah dan bawang putih hingga harum dan layu.",
    "Masukkan telur, buat orak-arik hingga setengah matang.",
    "Masukkan nasi putih, aduk rata dengan bumbu dan telur.",
    "Tambahkan kecap manis dan garam secukupnya, aduk hingga matang merata."
  ]
}

const recipe = computed(() => store.selectedRecipe || fallbackRecipe)

// Serving Portions Multiplier
const portions = ref(1)
const adjustPortion = (delta) => {
  const newVal = portions.value + delta
  if (newVal >= 1 && newVal <= 8) {
    portions.value = newVal
  }
}

// Toast Feedback
const toastMessage = ref('')
const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => toastMessage.value = '', 2200)
}

// Add individual missing ingredient to shopping list
const addToShopping = (ing) => {
  store.addToShoppingList({
    name: ing.name,
    quantity: (ing.qty_needed || 1) * portions.value,
    unit: ing.unit,
    recipe_title: recipe.value?.title || 'Resep'
  })
  showToast(`🛒 ${ing.name} ditambahkan ke Daftar Belanja!`)
}

// Add all missing ingredients to shopping list
const addAllMissingToShopping = () => {
  if (!recipe.value?.missing_ingredients) return
  recipe.value.missing_ingredients.forEach(ing => {
    store.addToShoppingList({
      name: ing.name,
      quantity: (ing.qty_needed || 1) * portions.value,
      unit: ing.unit,
      recipe_title: recipe.value?.title || 'Resep'
    })
  })
  showToast(`🛒 ${recipe.value.missing_ingredients.length} bahan dimasukkan ke Daftar Belanja!`)
}

// Quick jump to Meal Planner
const scheduleToMealPlanner = () => {
  store.setMealPlan('Senin', 'lunch', recipe.value?.title)
  router.push('/meal-planner')
}

// Fallback images
const recipeImage = computed(() => {
  if (!recipe.value) return ''
  return recipe.value.image || getRecipeImage(recipe.value)
})

// Start cooking guide
const startCooking = () => {
  router.push('/cook')
}

// Go back to recommendations or home
const goBack = () => {
  router.push('/recipes')
}
</script>

<template>
  <div class="flex-1 flex flex-col pb-24 relative select-none">
    <!-- Toast Feedback -->
    <div 
      v-if="toastMessage" 
      class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2C3529] text-white text-xs font-bold py-2 px-5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-white/20"
    >
      <span>✨</span>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Top Navigation Bar -->
    <div class="flex justify-between items-center mb-3 pt-1">
      <button 
        @click="goBack" 
        class="w-9 h-9 rounded-full bg-white border border-gray-150 flex items-center justify-center text-nature-forest hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        title="Kembali"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-xs font-black uppercase tracking-widest text-nature-forest">Detail Resep</span>
      
      <!-- Schedule to Meal Planner Button -->
      <button 
        @click="scheduleToMealPlanner"
        class="text-[9px] font-black uppercase tracking-wider bg-white border border-gray-150 px-2.5 py-1.5 rounded-full text-nature-zaitun shadow-sm active:scale-95 flex items-center gap-1"
        title="Jadwalkan ke Menu Mingguan"
      >
        <span>📅</span>
        <span>Jadwalkan</span>
      </button>
    </div>

    <!-- Hero Image Card -->
    <div class="relative w-full h-52 md:h-64 rounded-[30px] overflow-hidden shadow-md mb-4 bg-gray-150">
      <img 
        :src="recipeImage" 
        class="w-full h-full object-cover" 
        :alt="recipe.title"
      />
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

      <!-- Match percentage badge -->
      <span class="absolute top-3 left-3 bg-[#EBF0E9] text-nature-zaitun border border-nature-sage/40 font-black text-[10px] px-3 py-1 rounded-full uppercase shadow-sm">
        {{ recipe.match_percentage }}% Cocok Kulkas
      </span>

      <!-- Bottom overlay content -->
      <div class="absolute bottom-3 left-3 right-3 text-white">
        <h2 class="text-lg md:text-xl font-extrabold leading-tight mb-1 drop-shadow-sm">{{ recipe.title }}</h2>
        <div class="flex items-center gap-3 text-[10px] font-bold text-white/90">
          <span class="flex items-center gap-1">⏱ {{ recipe.prep_time }} Menit</span>
          <span>•</span>
          <span class="flex items-center gap-1 text-amber-300">🔥 {{ (recipe.calories || 300) * portions }} kkal</span>
          <span>•</span>
          <span class="text-emerald-300">🌱 Hemat Pangan</span>
        </div>
      </div>
    </div>

    <!-- Portion Multiplier Controller Card -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4 flex justify-between items-center">
      <div>
        <h3 class="text-xs font-black text-nature-forest uppercase tracking-wider">Atur Takaran Porsi</h3>
        <p class="text-[9px] text-gray-400 font-bold">Bahan & nutrisi otomatis dihitung sesuai porsi</p>
      </div>

      <div class="flex items-center gap-2 bg-nature-cream border border-gray-150 p-1 rounded-2xl">
        <button 
          @click="adjustPortion(-1)"
          :disabled="portions <= 1"
          class="w-7 h-7 rounded-xl bg-white text-nature-forest font-black flex items-center justify-center disabled:opacity-40 shadow-xs active:scale-90"
        >
          -
        </button>
        <span class="text-xs font-black text-nature-zaitun px-2">{{ portions }} Porsi</span>
        <button 
          @click="adjustPortion(1)"
          :disabled="portions >= 8"
          class="w-7 h-7 rounded-xl bg-white text-nature-forest font-black flex items-center justify-center disabled:opacity-40 shadow-xs active:scale-90"
        >
          +
        </button>
      </div>
    </div>

    <!-- Allergen Alert Banner if user has registered allergy to any ingredients -->
    <div 
      v-if="recipe.has_allergen"
      class="bg-rose-50 border-2 border-rose-400 rounded-2xl p-3.5 mb-4 flex items-center gap-2.5 text-xs text-rose-800 font-bold shadow-sm"
    >
      <span class="text-2xl">🚫</span>
      <div>
        <p class="font-extrabold text-xs leading-snug text-rose-900">PERINGATAN ALERGI PENGGUNA!</p>
        <p class="text-[10px] text-rose-700 font-medium mt-0.5">
          Menu ini mengandung <span class="underline font-black">{{ recipe.detected_allergens?.join(', ') }}</span> yang tercatat dalam daftar alergi profil Anda. Harap berhati-hati atau ganti dengan menu alternatif.
        </p>
      </div>
    </div>

    <!-- Expiry Alert Banner if applicable -->
    <div 
      v-if="recipe.min_expiry_days !== null && recipe.min_expiry_days <= 3"
      class="bg-rose-50 border border-rose-200 rounded-2xl p-3 mb-4 flex items-center gap-2.5 text-xs text-rose-700 font-bold shadow-sm"
    >
      <span class="text-lg">⚠️</span>
      <div>
        <p class="font-extrabold text-[11px] leading-snug">Prioritas Pencegahan Limbah!</p>
        <p class="text-[10px] text-rose-600 font-medium">Resep ini memanfaatkan bahan kulkas yang akan kadaluarsa dalam {{ recipe.min_expiry_days }} hari.</p>
      </div>
    </div>

    <!-- Description Card -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4">
      <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tentang Menu Ini</h3>
      <p class="text-xs text-nature-forest leading-relaxed font-medium">
        {{ recipe.description }}
      </p>
    </div>

    <!-- Macro Nutrition Grid (4 Columns, adjusted by portions) -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4">
      <div class="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Nutrisi ({{ portions }} Porsi)</h3>
        <span class="text-[8px] font-black text-nature-zaitun bg-nature-mint px-2 py-0.5 rounded-full">
          Disesuaikan
        </span>
      </div>
      <div class="grid grid-cols-4 gap-2 text-center">
        <!-- Kalori -->
        <div class="bg-[#FDFBF7] border border-gray-150/60 rounded-2xl p-2.5">
          <span class="block text-[8px] font-bold text-gray-400 uppercase">Energi</span>
          <span class="text-sm font-black text-nature-forest">{{ (recipe.calories || 300) * portions }}</span>
          <span class="block text-[8px] text-orange-500 font-extrabold">kkal</span>
        </div>
        <!-- Karbohidrat -->
        <div class="bg-[#FDFBF7] border border-gray-150/60 rounded-2xl p-2.5">
          <span class="block text-[8px] font-bold text-gray-400 uppercase">Karbo</span>
          <span class="text-sm font-black text-amber-600">{{ (recipe.carbs || 30) * portions }}</span>
          <span class="block text-[8px] text-amber-600 font-extrabold">gram</span>
        </div>
        <!-- Protein -->
        <div class="bg-[#FDFBF7] border border-gray-150/60 rounded-2xl p-2.5">
          <span class="block text-[8px] font-bold text-gray-400 uppercase">Protein</span>
          <span class="text-sm font-black text-emerald-600">{{ (recipe.protein || 15) * portions }}</span>
          <span class="block text-[8px] text-emerald-600 font-extrabold">gram</span>
        </div>
        <!-- Lemak -->
        <div class="bg-[#FDFBF7] border border-gray-150/60 rounded-2xl p-2.5">
          <span class="block text-[8px] font-bold text-gray-400 uppercase">Lemak</span>
          <span class="text-sm font-black text-rose-500">{{ (recipe.fat || 10) * portions }}</span>
          <span class="block text-[8px] text-rose-500 font-extrabold">gram</span>
        </div>
      </div>
    </div>

    <!-- Ingredients Checklist -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4 flex flex-col gap-3">
      <div class="flex justify-between items-center border-b border-gray-50 pb-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-nature-zaitun">Bahan yang Dibutuhkan</h3>
        <span class="text-[9px] font-bold text-gray-400">
          {{ (recipe.matched_ingredients?.length || 0) }} dari {{ (recipe.matched_ingredients?.length || 0) + (recipe.missing_ingredients?.length || 0) }} Siap
        </span>
      </div>

      <!-- Section: Available in Fridge -->
      <div v-if="recipe.matched_ingredients && recipe.matched_ingredients.length > 0">
        <span class="text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-2">
          ✓ Tersedia di Kulkas Anda
        </span>
        <div class="flex flex-col gap-2">
          <div 
            v-for="ing in recipe.matched_ingredients" 
            :key="ing.name"
            class="flex justify-between items-center p-2.5 rounded-xl bg-[#FDFBF7] border border-gray-150/60 text-xs font-bold text-nature-forest"
          >
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">✓</span>
              <div>
                <span>{{ ing.name }}</span>
                <span v-if="ing.days_until_expiry !== undefined" class="block text-[8px] text-gray-400 font-medium">
                  Sisa di kulkas: {{ ing.qty_available }} {{ ing.unit }} • 
                  <span :class="ing.days_until_expiry <= 3 ? 'text-rose-500 font-bold' : 'text-gray-500'">
                    {{ ing.days_until_expiry <= 0 ? 'Kedaluwarsa hari ini' : `${ing.days_until_expiry} hari lagi` }}
                  </span>
                </span>
              </div>
            </div>
            <span class="text-nature-zaitun font-black">{{ (ing.qty_needed || 1) * portions }} {{ ing.unit }}</span>
          </div>
        </div>
      </div>

      <!-- Section: Missing Ingredients with ADD TO SHOPPING Button -->
      <div v-if="recipe.missing_ingredients && recipe.missing_ingredients.length > 0" class="mt-2">
        <div class="flex justify-between items-center mb-2">
          <span class="text-[8px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
            ⚠️ Perlu Disiapkan / Beli Tambahan
          </span>
          <button 
            @click="addAllMissingToShopping"
            class="text-[8px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-all active:scale-95 flex items-center gap-1"
          >
            <span>🛒</span>
            <span>+ Beli Semua</span>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <div 
            v-for="ing in recipe.missing_ingredients" 
            :key="ing.name"
            class="flex justify-between items-center p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/50 text-xs font-bold text-nature-forest"
          >
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">!</span>
              <div>
                <span>{{ ing.name }}</span>
                <span class="block text-[8px] text-amber-800/80 font-medium">Belum ada di stok kulkas</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-amber-800 font-black">{{ (ing.qty_needed || 1) * portions }} {{ ing.unit }}</span>
              <button 
                @click="addToShopping(ing)"
                class="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center gap-1"
                title="Tambahkan ke Daftar Belanja"
              >
                <span>+</span>
                <span>Beli</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-800 flex items-center gap-2">
        <span>🎉</span>
        <span>Hebat! Semua bahan masakan ini 100% sudah tersedia di kulkas Anda.</span>
      </div>
    </div>

    <!-- Steps Preview List -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4">
      <div class="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Langkah Pengerjaan ({{ recipe.steps?.length || 0 }} Tahap)
        </h3>
        <a 
          :href="recipe.youtube_video_url || getRecipeYoutubeAppUrl(recipe)"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-[9px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition active:scale-95 shadow-2xs"
          :title="`Buka Video Tutorial ${recipe.title} di YouTube`"
        >
          <span>▶</span>
          <span>Tutorial YouTube</span>
        </a>
      </div>
      <div class="flex flex-col gap-2.5">
        <div 
          v-for="(step, idx) in recipe.steps" 
          :key="idx"
          class="flex items-start gap-2.5 text-xs text-nature-forest font-medium"
        >
          <span class="w-5 h-5 rounded-full bg-[#EBF0E9] text-nature-zaitun font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
            {{ idx + 1 }}
          </span>
          <p class="leading-relaxed flex-1">{{ step }}</p>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-150 p-4 z-40 shadow-xl flex gap-3 max-w-5xl mx-auto">
      <button 
        @click="goBack"
        class="flex-1 py-3 bg-white border border-nature-zaitun text-nature-zaitun hover:bg-gray-50 rounded-full font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>🔄</span>
        <span>Ganti Menu</span>
      </button>

      <button 
        @click="startCooking"
        class="flex-2 py-3 bg-[#4D5C48] hover:bg-emerald-800 text-white rounded-full font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
      >
        <span>🍳</span>
        <span>Mulai Masak ({{ portions }} Porsi)</span>
      </button>
    </div>
  </div>
</template>
