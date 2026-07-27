<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Top Sub-Tabs: 'Bahan Makanan' or 'Analisis Gizi' (Matches screen 7 & 8 mockup)
const activeSubTab = ref('Bahan Makanan')
const activeCategory = ref('Semua')

// Filtered fridge items based on category selection
const filteredFridge = computed(() => {
  if (activeCategory.value === 'Semua') return store.fridgeItems
  return store.fridgeItems.filter(item => item.category === activeCategory.value)
})

// Freshness classification & styling rules
const getExpiryClass = (expiryDate) => {
  const diffDays = getDaysUntilExpiry(expiryDate)
  if (diffDays <= 3) return 'bg-rose-50 border-rose-100 text-nature-red'
  if (diffDays <= 7) return 'bg-amber-50 border-amber-100 text-nature-yellow'
  return 'bg-emerald-50 border-emerald-100 text-nature-olive'
}

const getExpiryLabel = (expiryDate) => {
  const diffDays = getDaysUntilExpiry(expiryDate)
  if (diffDays < 0) return 'Kadaluwarsa'
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Besok'
  if (diffDays < 7) return `${diffDays} hari lagi`
  const diffWeeks = Math.ceil(diffDays / 7)
  return `${diffWeeks} minggu`
}

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date()
  today.setHours(0,0,0,0)
  const exp = new Date(expiryDate)
  exp.setHours(0,0,0,0)
  const diffTime = exp - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const deleteItem = async (id) => {
  await store.deleteIngredient(id)
}

// ----------------------------------------------------
// Nutrition Tab calculations (Matches screen 8 mockup)
// ----------------------------------------------------
const nutritionEstimates = {
  telur: { calories: 75, protein: 6.5, carbs: 0.6, fat: 5 },
  bayam: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  cabai: { calories: 40, protein: 1.9, carbs: 8.8, fat: 0.4 },
  bawang: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  minyak: { calories: 884, protein: 0, carbs: 0, fat: 100 },
  kecap: { calories: 150, protein: 1.4, carbs: 35, fat: 0.1 },
  daging: { calories: 250, protein: 26, carbs: 0, fat: 17 },
  default: { calories: 50, protein: 2.5, carbs: 8.0, fat: 1.5 }
}

const totalFridgeNutrients = computed(() => {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  store.fridgeItems.forEach(item => {
    const nameLower = item.name.toLowerCase()
    let factor = 1
    if (item.unit === 'gr' || item.unit === 'g') {
      factor = item.quantity / 100
    } else if (item.unit === 'ml' || item.unit === 'l') {
      factor = item.quantity / 100
    } else {
      factor = item.quantity
    }

    let rule = nutritionEstimates.default
    Object.keys(nutritionEstimates).forEach(key => {
      if (nameLower.includes(key)) rule = nutritionEstimates[key]
    })

    calories += rule.calories * factor
    protein += rule.protein * factor
    carbs += rule.carbs * factor
    fat += rule.fat * factor
  })

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  }
})

// Calculate nutrient breakdowns *per ingredient* for "Gizi Per Bahan" list
const ingredientGiziBreakdown = computed(() => {
  return store.fridgeItems.map(item => {
    const nameLower = item.name.toLowerCase()
    let factor = 1
    if (item.unit === 'gr' || item.unit === 'g') {
      factor = item.quantity / 100
    } else if (item.unit === 'ml' || item.unit === 'l') {
      factor = item.quantity / 100
    } else {
      factor = item.quantity
    }

    let rule = nutritionEstimates.default
    Object.keys(nutritionEstimates).forEach(key => {
      if (nameLower.includes(key)) rule = nutritionEstimates[key]
    })

    const p = Math.round(rule.protein * factor)
    const f = Math.round(rule.fat * factor)
    const c = Math.round(rule.carbs * factor)
    const tot = p + f + c || 1

    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      protein: p,
      fat: f,
      carbs: c,
      proteinPct: Math.round((p / tot) * 100),
      fatPct: Math.round((f / tot) * 100),
      carbsPct: Math.round((c / tot) * 100)
    }
  })
})

const calPercentage = computed(() => {
  const percent = (totalFridgeNutrients.value.calories / store.user.target_calories) * 100
  return Math.min(Math.round(percent), 100)
})

const strokeDashoffset = computed(() => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  return circumference - (calPercentage.value / 100) * circumference
})

const getIngredientIcon = (name, category) => {
  const nameLower = name.toLowerCase().trim()
  if (nameLower.includes('telur')) return '🥚'
  if (nameLower.includes('daging sapi') || nameLower.includes('sapi')) return '🥩'
  if (nameLower.includes('daging ayam') || nameLower.includes('chicken') || nameLower.includes('ayam')) return '🍗'
  if (nameLower.includes('ikan')) return '🐟'
  if (nameLower.includes('udang')) return '🍤'
  if (nameLower.includes('cabai') || nameLower.includes('cabe')) return '🌶️'
  if (nameLower.includes('bawang merah') || nameLower.includes('shallot')) return '🧅'
  if (nameLower.includes('bawang putih') || nameLower.includes('garlic')) return '🧄'
  if (nameLower.includes('bawang bombay') || nameLower.includes('onion')) return '🧅'
  if (nameLower.includes('jahe')) return '🫚'
  if (nameLower.includes('kunyit')) return '🫚'
  if (nameLower.includes('lengkuas')) return '🫚'
  if (nameLower.includes('bayam')) return '🥬'
  if (nameLower.includes('kentang')) return '🥔'
  if (nameLower.includes('wortel')) return '🥕'
  if (nameLower.includes('tomat')) return '🍅'
  if (nameLower.includes('timun') || nameLower.includes('mentimun')) return '🥒'
  if (nameLower.includes('jagung')) return '🌽'
  if (nameLower.includes('brokoli')) return '🥦'
  if (nameLower.includes('sawi') || nameLower.includes('kangkung') || nameLower.includes('kubis') || nameLower.includes('kol')) return '🥬'
  if (nameLower.includes('minyak')) return '🫗'
  if (nameLower.includes('mentega') || nameLower.includes('butter') || nameLower.includes('margarin')) return '🧈'
  if (nameLower.includes('keju')) return '🧀'
  if (nameLower.includes('tempe') || nameLower.includes('tahu')) return '🥜'
  if (nameLower.includes('kecap')) return '🍶'
  if (nameLower.includes('saus') || nameLower.includes('saos')) return '🥫'
  if (nameLower.includes('garam') || nameLower.includes('merica') || nameLower.includes('lada') || nameLower.includes('gula')) return '🧂'
  if (nameLower.includes('susu')) return '🥛'

  // Fallback by category
  const cat = category || ''
  if (cat === 'Sayuran') return '🥬'
  if (cat.includes('Daging') || cat === 'Telur') return '🥩'
  if (cat === 'Bumbu') return '🧅'
  if (cat.includes('Minyak') || cat.includes('Lemak')) return '🫒'
  if (cat.includes('Nabati') || cat.includes('Tahu') || cat.includes('Tempe')) return '🥜'
  if (cat === 'Buah') return '🍎'

  return '📦'
}

onMounted(() => {
  store.loadFridge()
})
</script>

<template>
  <div class="flex-1 bg-nature-cream flex flex-col p-5 overflow-y-auto relative">
    <!-- Header title -->
    <div class="flex justify-between items-center mb-4 pt-2">
      <div class="flex items-center gap-1">
        <button @click="router.push('/home')" class="p-1 -ml-1 text-nature-forest hover:opacity-80 md:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="text-xl font-extrabold text-nature-forest">Kulkas Saya</h3>
      </div>
      <!-- Three dots menu icon -->
      <button class="p-1 text-nature-forest">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>

    <!-- Sub-tabs toggle button pills (Bahan Makanan / Analisis Gizi, matches mockup screen 7 & 8) -->
    <div class="bg-nature-input p-1 rounded-2xl flex gap-1 mb-4 select-none">
      <button 
        @click="activeSubTab = 'Bahan Makanan'"
        class="flex-1 py-2 rounded-xl text-xs font-black transition-all"
        :class="activeSubTab === 'Bahan Makanan' ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        Bahan Makanan
      </button>
      <button 
        @click="activeSubTab = 'Analisis Gizi'"
        class="flex-1 py-2 rounded-xl text-xs font-black transition-all"
        :class="activeSubTab === 'Analisis Gizi' ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        Analisis Gizi
      </button>
    </div>

    <!-- ----------------------- TAB: BAHAN MAKANAN ----------------------- -->
    <div v-if="activeSubTab === 'Bahan Makanan'" class="flex-1 flex flex-col justify-between">
      <!-- Category filter pills -->
      <div class="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-5 px-5 scroll-smooth">
        <button 
          v-for="cat in store.categories"
          :key="cat"
          @click="activeCategory = cat"
          class="flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all"
          :class="activeCategory === cat ? 'bg-nature-zaitun border-nature-zaitun text-white shadow-sm' : 'bg-white border-gray-150 text-nature-forest hover:bg-gray-50'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Ingredient list cards (Matches mockup screen 7) -->
      <div class="flex-1 flex flex-col gap-3 min-h-[300px] mb-12">
        <div v-if="filteredFridge.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="item in filteredFridge" 
            :key="item.id"
            class="bg-white border border-gray-150 rounded-[25px] p-3.5 shadow-sm flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 bg-[#EBF0E9] rounded-2xl flex justify-center items-center text-lg shadow-inner">
                {{ getIngredientIcon(item.name, item.category) }}
              </span>
              <div>
                <h4 class="font-extrabold text-nature-forest text-xs">{{ item.name }}</h4>
                <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{{ item.quantity }} {{ item.unit }}</p>
              </div>
            </div>

            <!-- Expiry badging & Remove trigger -->
            <div class="flex items-center gap-2">
              <span 
                class="border px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider"
                :class="getExpiryClass(item.expiry_date)"
              >
                {{ getExpiryLabel(item.expiry_date) }}
              </span>
              <button 
                @click="deleteItem(item.id)" 
                class="p-2 text-gray-300 hover:text-rose-500 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center py-12 bg-white rounded-[25px] border border-gray-150 p-6 text-center shadow-sm">
          <span class="text-3xl mb-2">📦</span>
          <p class="text-xs font-bold text-nature-forest mb-0.5">Kategori {{ activeCategory }} Kosong</p>
          <p class="text-[9px] text-gray-400 leading-normal max-w-[150px]">
            Tambahkan bahan untuk melihatnya di sini.
          </p>
        </div>
      </div>

      <!-- Floating Plus Button at bottom right -->
      <button 
        @click="router.push('/add-ingredient')"
        class="absolute bottom-20 md:bottom-6 right-6 w-12 h-12 bg-nature-zaitun hover:bg-emerald-800 text-white rounded-full flex justify-center items-center shadow-lg active:scale-95 transition-all z-20 border-2 border-white"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- ----------------------- TAB: ANALISIS GIZI ----------------------- -->
    <div v-else class="flex-1 flex flex-col justify-between">
      
      <!-- Calorie circular gauge section (Matches screen 8 mockup) -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-4 flex flex-col items-center mb-4 shadow-sm">
        <div class="relative w-32 h-32 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="#EBF0E9" stroke-width="10" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="transparent" 
              stroke="#4D5C48" 
              stroke-width="10" 
              stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 50"
              :stroke-dashoffset="strokeDashoffset"
              class="transition-all duration-1000"
            />
          </svg>
          <div class="absolute flex flex-col items-center">
            <span class="text-2xl font-black text-nature-forest leading-none">{{ totalFridgeNutrients.calories }}</span>
            <span class="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-0.5">kkal</span>
          </div>
        </div>

        <div class="text-center mt-3 text-[10px] font-bold text-nature-slate">
          Potensi Gizi: {{ calPercentage }}% dari Target Harian ({{ store.user.target_calories }} kkal)
        </div>
      </div>

      <!-- Ingredient breakdown section (Gizi Per Bahan, matches mockup screen 8) -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-4 shadow-sm mb-4">
        <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Gizi Per Bahan</h4>
        
        <div v-if="ingredientGiziBreakdown.length > 0" class="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
          <div v-for="item in ingredientGiziBreakdown" :key="item.id" class="text-xs">
            <div class="flex justify-between font-bold text-nature-slate mb-1">
              <span>{{ item.name }} <span class="text-[9px] text-gray-400 font-medium">({{ item.quantity }} {{ item.unit }})</span></span>
              <span class="text-[10px] text-nature-zaitun">P: {{ item.protein }}g | L: {{ item.fat }}g | K: {{ item.carbs }}g</span>
            </div>
            <!-- Macro horizontal bar splits (Protein, Carbs, Fat) -->
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <!-- Protein (Green) -->
              <div class="h-full bg-emerald-500" :style="{ width: `${item.proteinPct}%` }"></div>
              <!-- Fat (Yellow) -->
              <div class="h-full bg-yellow-400" :style="{ width: `${item.fatPct}%` }"></div>
              <!-- Carbs (Slate) -->
              <div class="h-full bg-gray-400" :style="{ width: `${item.carbsPct}%` }"></div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-[10px] text-gray-400 font-bold leading-normal">
          Kosong. Tambah bahan untuk kalkulasi gizi.
        </div>
      </div>

      <!-- Match recipes CTA button (Matches screen 8 mockup) -->
      <button 
        @click="router.push('/recipes')"
        class="w-full py-3 bg-nature-zaitun hover:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-lg flex justify-center items-center gap-1.5 text-xs select-none"
      >
        Lihat Resep Yang Cocok
      </button>
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto {
  scrollbar-width: none;
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
