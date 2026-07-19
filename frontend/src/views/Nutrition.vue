<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Nutritional estimation rules of different ingredient categories (mock averages per unit)
const nutritionEstimates = {
  telur: { calories: 75, protein: 6.5, carbs: 0.6, fat: 5 },
  bayam: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  cabai: { calories: 40, protein: 1.9, carbs: 8.8, fat: 0.4 },
  bawang: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  minyak: { calories: 884, protein: 0, carbs: 0, fat: 100 },
  kecap: { calories: 150, protein: 1.4, carbs: 35, fat: 0.1 },
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
    let factor = 1
    
    // Convert units to a standard multiplier
    if (item.unit === 'gr' || item.unit === 'g') {
      factor = item.quantity / 100 // estimate nutrition per 100 grams
    } else if (item.unit === 'ml' || item.unit === 'l') {
      factor = item.quantity / 100 // estimate nutrition per 100 ml
    } else {
      factor = item.quantity // pieces, siung, etc.
    }

    // Find rule match
    let rule = nutritionEstimates.default
    Object.keys(nutritionEstimates).forEach(key => {
      if (nameLower.includes(key)) {
        rule = nutritionEstimates[key]
      }
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

// Compare with user targets (or show target distribution)
const calorieProgressPercent = computed(() => {
  const percent = (totalFridgeNutrients.value.calories / store.user.target_calories) * 100
  return Math.min(Math.round(percent), 100)
})

// Helper for circular progress
const strokeDashoffset = computed(() => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  return circumference - (calorieProgressPercent.value / 100) * circumference
})

onMounted(() => {
  store.loadFridge()
})
</script>

<template>
  <div class="flex-1 bg-nature-cream flex flex-col p-6 overflow-y-auto">
    <!-- Top Nav -->
    <div class="flex justify-between items-center mb-6 pt-2">
      <button @click="router.push('/home')" class="p-2 -ml-2 text-nature-forest hover:opacity-80">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <span class="text-sm font-semibold text-nature-forest">Analisis Gizi</span>
      <div class="w-8"></div>
    </div>

    <!-- Overview Text -->
    <div class="mb-6">
      <h3 class="text-2xl font-extrabold text-nature-forest mb-1">Gizi Bahan Kulkas</h3>
      <p class="text-xs text-gray-500 font-medium leading-relaxed">
        Total akumulasi nilai gizi dan kalori dari semua bahan makanan yang saat ini ada di kulkas Anda.
      </p>
    </div>

    <!-- SVG Circular Gauge Widget -->
    <div class="bg-white border border-gray-100 rounded-[35px] p-6 shadow-sm flex flex-col items-center mb-6">
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
            stroke="#4CAF50" 
            stroke-width="10" 
            stroke-linecap="round"
            :stroke-dasharray="2 * Math.PI * 54"
            :stroke-dashoffset="strokeDashoffset"
            class="transition-all duration-1000 ease-out"
          />
        </svg>
        <!-- Center Text -->
        <div class="absolute flex flex-col items-center">
          <span class="text-2xl font-extrabold text-nature-forest">{{ totalFridgeNutrients.calories }}</span>
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">total kkal</span>
        </div>
      </div>
      
      <!-- Progress details text -->
      <div class="text-center mt-4">
        <p class="text-xs font-bold text-nature-slate mb-0.5">
          Menampung {{ calorieProgressPercent }}% Kebutuhan Harian
        </p>
        <p class="text-[10px] text-gray-400 font-bold">
          Target Anda: {{ store.user.target_calories }} kkal / hari
        </p>
      </div>
    </div>

    <!-- Breakdown Horizontal Progress Bars -->
    <div class="bg-white border border-gray-100 rounded-[35px] p-5 shadow-sm flex flex-col gap-4">
      <h4 class="text-sm font-extrabold text-nature-forest border-b border-gray-50 pb-2">Rincian Makronutrisi</h4>

      <!-- Karbohidrat -->
      <div>
        <div class="flex justify-between items-center text-xs font-bold mb-1">
          <span class="text-nature-slate flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
            Karbohidrat
          </span>
          <span class="text-nature-forest">{{ totalFridgeNutrients.carbs }}g / {{ store.user.target_carbs }}g</span>
        </div>
        <div class="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
          <div 
            class="h-full bg-yellow-500 rounded-full transition-all duration-1000"
            :style="{ width: `${Math.min((totalFridgeNutrients.carbs / store.user.target_carbs) * 100, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Protein -->
      <div>
        <div class="flex justify-between items-center text-xs font-bold mb-1">
          <span class="text-nature-slate flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            Protein
          </span>
          <span class="text-nature-forest">{{ totalFridgeNutrients.protein }}g / {{ store.user.target_protein }}g</span>
        </div>
        <div class="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
          <div 
            class="h-full bg-emerald-500 rounded-full transition-all duration-1000"
            :style="{ width: `${Math.min((totalFridgeNutrients.protein / store.user.target_protein) * 100, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Lemak -->
      <div>
        <div class="flex justify-between items-center text-xs font-bold mb-1">
          <span class="text-nature-slate flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 bg-rose-400 rounded-full"></span>
            Lemak
          </span>
          <span class="text-nature-forest">{{ totalFridgeNutrients.fat }}g / {{ store.user.target_fat }}g</span>
        </div>
        <div class="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
          <div 
            class="h-full bg-rose-400 rounded-full transition-all duration-1000"
            :style="{ width: `${Math.min((totalFridgeNutrients.fat / store.user.target_fat) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Health Advice Box -->
    <div class="bg-[#E8F5E9]/50 border border-nature-leaf/10 p-4 rounded-3xl mt-6 flex gap-3">
      <span class="text-nature-leaf flex-shrink-0 mt-0.5">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <div class="text-xs">
        <h5 class="font-extrabold text-nature-forest mb-0.5">Rekomendasi Ahli Gizi</h5>
        <p class="text-gray-500 font-medium leading-relaxed">
          Kulkas Anda kaya akan <strong class="text-nature-forest">Protein</strong>. Cobalah padukan telur dan bayam di kulkas Anda untuk memasak menu sehat tinggi zat besi pagi ini.
        </p>
      </div>
    </div>
  </div>
</template>
