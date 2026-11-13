<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Sub-tab: 'kulkas' | 'tubuh'
const activeTab = ref('kulkas')

// Comprehensive Indonesian nutritional values database (per 100g or per 1 unit)
const nutritionEstimates = {
  // Protein Hewani & Telur
  telur: { calories: 75, protein: 6.5, carbs: 0.6, fat: 5.0, isUnit: true },
  ayam: { calories: 239, protein: 27.0, carbs: 0.0, fat: 13.6 },
  sapi: { calories: 250, protein: 26.0, carbs: 0.0, fat: 15.0 },
  daging: { calories: 245, protein: 26.0, carbs: 0.0, fat: 14.0 },
  ikan: { calories: 120, protein: 20.0, carbs: 0.0, fat: 4.0 },
  udang: { calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3 },
  
  // Protein Nabati
  tempe: { calories: 193, protein: 19.0, carbs: 9.4, fat: 11.0 },
  tahu: { calories: 76, protein: 8.0, carbs: 1.9, fat: 4.8 },

  // Sayuran
  bayam: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  wortel: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 },
  brokoli: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4 },
  sawi: { calories: 20, protein: 1.5, carbs: 3.0, fat: 0.2 },
  kangkung: { calories: 19, protein: 2.6, carbs: 3.1, fat: 0.2 },
  tomat: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  kentang: { calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },

  // Bumbu & Minyak
  cabai: { calories: 40, protein: 1.9, carbs: 8.8, fat: 0.4 },
  bawang: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  minyak: { calories: 884, protein: 0.0, carbs: 0.0, fat: 100.0 },
  kecap: { calories: 150, protein: 1.4, carbs: 35.0, fat: 0.1 },
  santan: { calories: 230, protein: 2.3, carbs: 5.5, fat: 24.0 },

  // Buah
  apel: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 },
  pisang: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  jeruk: { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1 },

  default: { calories: 50, protein: 2.5, carbs: 8.0, fat: 1.5 }
}

// Calculate total nutrients stored in the fridge
const totalFridgeNutrients = computed(() => {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  store.fridgeItems.forEach(item => {
    const nameLower = item.name.toLowerCase()
    
    // Find matching rule
    let rule = nutritionEstimates.default
    for (const key of Object.keys(nutritionEstimates)) {
      if (key !== 'default' && nameLower.includes(key)) {
        rule = nutritionEstimates[key]
        break
      }
    }

    let factor = 1
    if (rule.isUnit || item.unit === 'pcs' || item.unit === 'butir' || item.unit === 'buah') {
      factor = item.quantity
    } else if (item.unit === 'gr' || item.unit === 'g') {
      factor = item.quantity / 100
    } else if (item.unit === 'ml' || item.unit === 'l') {
      factor = (item.quantity * (item.unit === 'l' ? 1000 : 1)) / 100
    } else {
      factor = item.quantity
    }

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

// Days supported by fridge stock
const daysStockSupported = computed(() => {
  const target = store.user.target_calories || 2000
  if (target <= 0) return 1
  return (totalFridgeNutrients.value.calories / target).toFixed(1)
})

// Compare with user targets (or show target distribution)
const calorieProgressPercent = computed(() => {
  const target = store.user.target_calories || 2000
  const percent = (totalFridgeNutrients.value.calories / target) * 100
  return Math.min(Math.round(percent), 100)
})

// Helper for circular progress
const strokeDashoffset = computed(() => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  return circumference - (calorieProgressPercent.value / 100) * circumference
})

// BMR & TDEE Calculations for Body Analysis Tab
// Formula Mifflin-St Jeor / Harris-Benedict (Standard Medis):
const userBMR = computed(() => {
  const w = store.user.weight || 65
  const h = store.user.height || 170
  const a = store.user.age || 26
  // Laki-laki: 10 * W + 6.25 * H - 5 * A + 5
  return Math.round((10 * w) + (6.25 * h) - (5 * a) + 5)
})

const userTDEE = computed(() => {
  // Aktivitas sedang (1.375)
  return Math.round(userBMR.value * 1.375)
})

// Ideal Macro Needs (Gram)
const idealMacros = computed(() => {
  const tdee = userTDEE.value
  return {
    carbs: Math.round((tdee * 0.50) / 4), // 50% kalori dari karbo
    protein: Math.round((store.user.weight || 65) * 1.4), // 1.4g/kg BB
    fat: Math.round((tdee * 0.25) / 9) // 25% kalori dari lemak
  }
})

// Today's consumption vs needs
const todayConsumed = computed(() => {
  return store.insights.today_nutrition || { calories: 1240, carbs: 160, protein: 50, fat: 40 }
})

// Dynamic Nutrition AI Advice
const dynamicAdvice = computed(() => {
  const p = totalFridgeNutrients.value.protein
  const c = totalFridgeNutrients.value.carbs
  if (p > 100) {
    return {
      title: 'Kulkas Kaya Protein Berkualitas',
      message: 'Stok kulkas Anda memiliki persediaan protein tinggi (telur/daging/tahu). Sangat cocok untuk menjaga massa otot, metabolisme aktif, dan rasa kenyang tahan lama.'
    }
  } else if (c > 200) {
    return {
      title: 'Sumber Energi Karbohidrat Cukup',
      message: 'Persediaan makanan Anda mengandung karbohidrat baik untuk tenaga beraktivitas. Padukan dengan sayuran hijau segar untuk memperlambat penyerapan gula darah.'
    }
  } else {
    return {
      title: 'Pola Gizi Seimbang & Segar',
      message: 'Kombinasi bahan makanan di kulkas Anda cukup seimbang. Utamakan memasak bahan sayuran yang memiliki sisa hari kadaluarsa sedikit agar nutrisinya tetap optimal.'
    }
  }
})

onMounted(() => {
  store.loadFridge()
  store.loadInsights()
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <!-- Top Nav -->
    <div class="flex justify-between items-center mb-4 pt-1">
      <button 
        @click="router.push('/home')" 
        class="w-9 h-9 rounded-full bg-white border border-gray-150 flex items-center justify-center text-nature-forest hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        title="Kembali"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-xs font-black uppercase tracking-widest text-nature-forest">Analisis Gizi Pintar</span>
      <div class="w-9"></div>
    </div>

    <!-- Segment Tab Switcher -->
    <div class="bg-nature-input p-1 rounded-2xl flex gap-1 mb-5 select-none">
      <button 
        @click="activeTab = 'kulkas'"
        class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
        :class="activeTab === 'kulkas' ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        🥦 Gizi Stok Kulkas
      </button>
      <button 
        @click="activeTab = 'tubuh'"
        class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
        :class="activeTab === 'tubuh' ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        ⚖️ Kebutuhan Tubuh (AKG)
      </button>
    </div>

    <!-- ----------------- TAB 1: GIZI STOK KULKAS ----------------- -->
    <div v-if="activeTab === 'kulkas'" class="flex flex-col gap-4">
      <!-- Overview Card -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="text-base font-extrabold text-nature-forest">Akumulasi Gizi Kulkas</h3>
            <p class="text-[10px] text-gray-400 font-medium leading-relaxed">
              Total kandungan nutrisi dari seluruh persediaan bahan makanan di kulkas Anda.
            </p>
          </div>
          <span class="bg-[#EBF0E9] text-nature-zaitun text-[9px] font-black px-2.5 py-1 rounded-full uppercase border border-nature-sage/40">
            {{ store.fridgeItems.length }} Bahan
          </span>
        </div>

        <!-- SVG Circular Gauge Widget -->
        <div class="flex flex-col items-center my-3">
          <div class="relative w-36 h-36 flex items-center justify-center">
            <!-- SVG Gauge -->
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <!-- Background circle -->
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="transparent" 
                stroke="#F1F8F5" 
                stroke-width="10" 
              />
              <!-- Progress circle -->
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="transparent" 
                stroke="#4D5C48" 
                stroke-width="10" 
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 54"
                :stroke-dashoffset="strokeDashoffset"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            <!-- Center Text -->
            <div class="absolute flex flex-col items-center">
              <span class="text-2xl font-black text-nature-forest">{{ totalFridgeNutrients.calories.toLocaleString('id-ID') }}</span>
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total kkal</span>
            </div>
          </div>
          
          <!-- Progress details text -->
          <div class="text-center mt-3">
            <p class="text-xs font-extrabold text-nature-zaitun mb-0.5">
              Cukup untuk konsumsi ± {{ daysStockSupported }} Hari
            </p>
            <p class="text-[9px] text-gray-400 font-bold">
              Berdasarkan target harian Anda ({{ store.user.target_calories }} kkal / hari)
            </p>
          </div>
        </div>
      </div>

      <!-- Breakdown Makronutrisi Bahan Kulkas -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col gap-3.5">
        <h4 class="text-xs font-black uppercase tracking-wider text-nature-forest border-b border-gray-50 pb-2">
          Rincian Makronutrisi Bahan Kulkas
        </h4>

        <!-- Karbohidrat -->
        <div>
          <div class="flex justify-between items-center text-xs font-bold mb-1">
            <span class="text-nature-forest flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              Karbohidrat
            </span>
            <span class="text-nature-forest font-black">{{ totalFridgeNutrients.carbs }} g</span>
          </div>
          <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-amber-500 rounded-full transition-all duration-1000"
              :style="{ width: `${Math.min((totalFridgeNutrients.carbs / (store.user.target_carbs * 2)) * 100, 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Protein -->
        <div>
          <div class="flex justify-between items-center text-xs font-bold mb-1">
            <span class="text-nature-forest flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
              Protein
            </span>
            <span class="text-nature-forest font-black">{{ totalFridgeNutrients.protein }} g</span>
          </div>
          <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-emerald-600 rounded-full transition-all duration-1000"
              :style="{ width: `${Math.min((totalFridgeNutrients.protein / (store.user.target_protein * 2)) * 100, 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Lemak -->
        <div>
          <div class="flex justify-between items-center text-xs font-bold mb-1">
            <span class="text-nature-forest flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              Lemak
            </span>
            <span class="text-nature-forest font-black">{{ totalFridgeNutrients.fat }} g</span>
          </div>
          <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-rose-500 rounded-full transition-all duration-1000"
              :style="{ width: `${Math.min((totalFridgeNutrients.fat / (store.user.target_fat * 2)) * 100, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ----------------- TAB 2: KEBUTUHAN TUBUH (AKG) ----------------- -->
    <div v-else class="flex flex-col gap-4">
      <!-- Body Metrics Summary -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm">
        <h3 class="text-xs font-black uppercase tracking-wider text-nature-forest mb-1">Kalkulasi Metabolisme Tubuh</h3>
        <p class="text-[10px] text-gray-400 font-medium mb-4">
          Dihitung berdasarkan rumus medis Mifflin-St Jeor dengan data fisik berat {{ store.user.weight }}kg dan tinggi {{ store.user.height }}cm.
        </p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <!-- BMR -->
          <div class="p-3 rounded-2xl bg-[#FDFBF7] border border-gray-150/60 text-center">
            <span class="block text-[8px] font-black uppercase text-gray-400 tracking-wider">BMR (Energi Dasar)</span>
            <span class="text-xl font-black text-nature-zaitun">{{ userBMR }}</span>
            <span class="block text-[8px] font-bold text-gray-400">kkal / hari</span>
            <p class="text-[8px] text-gray-400 mt-1">Energi saat tubuh istirahat</p>
          </div>
          <!-- TDEE -->
          <div class="p-3 rounded-2xl bg-[#FDFBF7] border border-gray-150/60 text-center">
            <span class="block text-[8px] font-black uppercase text-gray-400 tracking-wider">TDEE (Aktivitas Harian)</span>
            <span class="text-xl font-black text-emerald-700">{{ userTDEE }}</span>
            <span class="block text-[8px] font-bold text-gray-400">kkal / hari</span>
            <p class="text-[8px] text-gray-400 mt-1">Kebutuhan dengan aktivitas</p>
          </div>
        </div>

        <!-- Target Comparison -->
        <div class="p-3 rounded-2xl bg-nature-input border border-gray-150/40 flex justify-between items-center text-xs font-bold text-nature-forest">
          <div>
            <span class="block text-[8px] uppercase tracking-wider text-gray-400">Target Anda Saat Ini</span>
            <span class="text-sm font-black text-nature-forest">{{ store.user.target_calories }} kkal / hari</span>
          </div>
          <button 
            @click="router.push('/insights')"
            class="text-[9px] font-black uppercase text-nature-zaitun bg-white px-3 py-1.5 rounded-xl border border-gray-150 shadow-sm active:scale-95 transition-all"
          >
            Ubah Data
          </button>
        </div>
      </div>

      <!-- Ideal Macro Distribution vs Today -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col gap-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-nature-forest border-b border-gray-50 pb-2">
          Anjuran Kebutuhan Makronutrisi Ideal
        </h4>
        
        <div class="grid grid-cols-3 gap-2.5 text-center">
          <div class="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/50">
            <span class="block text-[8px] font-black uppercase text-amber-800 tracking-wider">Karbohidrat</span>
            <span class="text-sm font-black text-amber-900">{{ idealMacros.carbs }} g</span>
            <span class="block text-[8px] text-amber-700/80 mt-0.5">Hari ini: {{ todayConsumed.carbs }}g</span>
          </div>

          <div class="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/50">
            <span class="block text-[8px] font-black uppercase text-emerald-800 tracking-wider">Protein</span>
            <span class="text-sm font-black text-emerald-900">{{ idealMacros.protein }} g</span>
            <span class="block text-[8px] text-emerald-700/80 mt-0.5">Hari ini: {{ todayConsumed.protein }}g</span>
          </div>

          <div class="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/50">
            <span class="block text-[8px] font-black uppercase text-rose-800 tracking-wider">Lemak Baik</span>
            <span class="text-sm font-black text-rose-900">{{ idealMacros.fat }} g</span>
            <span class="block text-[8px] text-rose-700/80 mt-0.5">Hari ini: {{ todayConsumed.fat }}g</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Health Advice Box (Dynamic) -->
    <div class="bg-[#EBF0E9] border border-nature-sage/40 p-4 rounded-[25px] mt-4 flex gap-3 shadow-sm">
      <span class="text-xl flex-shrink-0 mt-0.5">💡</span>
      <div class="text-xs">
        <h5 class="font-extrabold text-nature-forest text-xs mb-0.5">{{ dynamicAdvice.title }}</h5>
        <p class="text-gray-600 font-medium leading-relaxed text-[11px]">
          {{ dynamicAdvice.message }}
        </p>
      </div>
    </div>
  </div>
</template>
