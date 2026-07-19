<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const recipe = store.selectedRecipe
if (!recipe) {
  router.push('/recipes')
}

// State
const isDeducted = ref(false)
const wasteSaved = ref(0)
const costSaved = ref(0)

const handleDeductIngredients = async () => {
  store.loading = true
  const res = await store.cookRecipe(recipe.id)
  store.loading = false
  if (res.success) {
    isDeducted.value = true
    wasteSaved.value = store.cookingSuccessData.waste_prevented
    costSaved.value = store.cookingSuccessData.cost_saved
  } else {
    alert('Gagal memotong stok bahan makanan.')
  }
}

const cancelAndHome = () => {
  router.push('/home')
}
</script>

<template>
  <div class="flex-1 bg-[#F4F3EA] flex flex-col justify-between p-5 overflow-y-auto">
    <!-- Success Header -->
    <div class="flex flex-col items-center pt-6 text-center select-none">
      <span class="text-6xl mb-4 animate-bounce">🎉</span>
      <h3 class="text-xl font-black text-nature-zaitun mb-1">Selamat! Masakan Selesai</h3>
      <p class="text-[10px] text-gray-400 font-bold px-6 leading-relaxed">
        Anda telah berhasil memasak menu <strong class="text-nature-forest">{{ recipe.title }}</strong>!
      </p>
    </div>

    <!-- Central Card: Checklist or Impact Stats (Matches mockup screen 6) -->
    <div class="my-4 bg-white border border-gray-150 rounded-[30px] shadow-sm p-5 flex flex-col gap-4">
      
      <!-- List of ingredients used with checkmarks -->
      <div v-if="!isDeducted" class="flex flex-col">
        <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Bahan yang digunakan</h4>
        
        <div class="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
          <div 
            v-for="ing in recipe.ingredients" 
            :key="ing.name"
            class="flex items-center gap-3 text-xs font-bold text-nature-forest"
          >
            <!-- Custom checkmark -->
            <span class="w-4 h-4 rounded-full bg-[#EBF0E9] border border-nature-sage text-nature-zaitun flex justify-center items-center text-[9px] select-none font-black">
              ✓
            </span>
            <span>{{ ing.name }} ({{ ing.quantity }} {{ ing.unit }})</span>
          </div>
        </div>
      </div>

      <!-- Impact Stats shown after successful deduction -->
      <div v-else class="flex flex-col items-center text-center">
        <div class="w-10 h-10 bg-[#EBF0E9] border border-nature-sage/40 rounded-full flex justify-center items-center mb-2">
          <svg class="w-5 h-5 text-[#4D5C48]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 class="text-[10px] font-black text-[#4D5C48] uppercase tracking-widest mb-2 border-b border-gray-50 pb-1 w-full">Hasil Penyelamatan Makanan</h4>
        
        <div class="w-full flex flex-col gap-2.5 text-xs text-nature-forest font-bold py-2">
          <div class="flex justify-between items-center">
            <span>Sampah Dicegah:</span>
            <span class="text-nature-zaitun font-black text-sm">{{ wasteSaved }} kg</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Estimasi Uang Dihemat:</span>
            <span class="text-nature-zaitun font-black text-sm">Rp {{ costSaved.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-400 text-[10px]">
            <span>Reduksi Emisi CO2:</span>
            <span>{{ (wasteSaved * 2.5).toFixed(2) }} kg CO2</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons within card (Hapus Bahan & Batal) -->
      <div class="flex flex-col gap-2 mt-2">
        <button 
          v-if="!isDeducted"
          @click="handleDeductIngredients"
          class="w-full py-2.5 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-full shadow-md text-xs active:scale-95 transition-transform"
        >
          Hapus Bahan
        </button>
        <button 
          v-if="!isDeducted"
          @click="cancelAndHome"
          class="w-full py-2.5 bg-transparent border border-nature-zaitun/20 text-nature-zaitun hover:bg-gray-50 font-extrabold rounded-full text-xs active:scale-95 transition-transform"
        >
          Batal
        </button>
      </div>
    </div>

    <!-- Bottom navigation controls (Mundur & Selesai) -->
    <div class="flex gap-4">
      <button 
        @click="router.push('/cook')"
        class="flex-1 py-2.5 bg-white border border-nature-zaitun/20 rounded-full font-black text-xs text-nature-zaitun hover:bg-gray-50 active:scale-95 transition-transform shadow-sm"
      >
        ◀ Mundur
      </button>

      <button 
        @click="cancelAndHome"
        class="flex-1 py-2.5 bg-[#4D5C48] text-white font-black rounded-full shadow-md hover:bg-emerald-800 active:scale-95 transition-transform text-xs"
      >
        Selesai
      </button>
    </div>
  </div>
</template>
