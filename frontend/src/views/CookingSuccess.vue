<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

const fallbackRecipe = {
  id: 1,
  title: 'Nasi Goreng Telur',
  ingredients: [
    { name: 'Telur', quantity: 1, unit: 'pcs' },
    { name: 'Bawang Merah', quantity: 15, unit: 'gr' },
    { name: 'Bawang Putih', quantity: 10, unit: 'gr' }
  ]
}

const recipe = store.selectedRecipe || fallbackRecipe

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

// Handler for the bottom "Selesai" button:
// Auto-deducts if user hasn't pressed the button yet, so progress is never lost!
const handleFinish = async () => {
  if (!isDeducted.value) {
    await handleDeductIngredients()
  }
  router.push('/home')
}

const skipWithoutDeduct = () => {
  router.push('/home')
}
</script>

<template>
  <div class="flex-1 flex flex-col justify-between pb-6">
    <!-- Success Header -->
    <div class="flex flex-col items-center pt-6 text-center select-none">
      <span class="text-6xl mb-3 animate-bounce">🎉</span>
      <h3 class="text-xl font-black text-nature-zaitun mb-1">Selamat! Masakan Selesai</h3>
      <p class="text-[10px] text-gray-400 font-bold px-6 leading-relaxed">
        Anda telah berhasil memasak menu <strong class="text-nature-forest">{{ recipe.title }}</strong>!
      </p>
    </div>

    <!-- Central Card: Checklist or Impact Stats (Matches mockup screen 6) -->
    <div class="my-4 bg-white border border-gray-150 rounded-[30px] shadow-sm p-5 flex flex-col gap-4">
      
      <!-- List of ingredients used with checkmarks -->
      <div v-if="!isDeducted" class="flex flex-col">
        <div class="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
          <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bahan yang digunakan</h4>
          <span class="text-[8px] font-bold text-nature-zaitun">Siap dipotong dari kulkas</span>
        </div>
        
        <div class="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
          <div 
            v-for="ing in recipe.ingredients" 
            :key="ing.name"
            class="flex items-center gap-3 text-xs font-bold text-nature-forest bg-[#FDFBF7] p-2.5 rounded-xl border border-gray-150/50"
          >
            <!-- Custom checkmark -->
            <span class="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex justify-center items-center text-[10px] select-none font-black">
              ✓
            </span>
            <div class="flex-1 flex justify-between items-center">
              <span>{{ ing.name }}</span>
              <span class="text-nature-zaitun font-black">{{ ing.quantity }} {{ ing.unit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Impact Stats shown after successful deduction -->
      <div v-else class="flex flex-col items-center text-center">
        <div class="w-12 h-12 bg-[#EBF0E9] border border-nature-sage/40 rounded-full flex justify-center items-center mb-2">
          <svg class="w-6 h-6 text-[#4D5C48]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 class="text-xs font-black text-[#4D5C48] uppercase tracking-widest mb-1">Stok Berhasil Diperbarui!</h4>
        <p class="text-[9px] text-gray-400 font-bold mb-3">Bahan telah dikurangi dari kulkas & kalori tercatat ke asupan harian.</p>
        
        <div class="w-full flex flex-col gap-2.5 text-xs text-nature-forest font-bold py-2 bg-[#FDFBF7] p-3 rounded-2xl border border-gray-150/60">
          <div class="flex justify-between items-center">
            <span class="text-gray-500 font-medium">Sampah Makanan Dicegah:</span>
            <span class="text-nature-zaitun font-black text-sm">{{ wasteSaved }} kg</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 font-medium">Estimasi Uang Dihemat:</span>
            <span class="text-nature-zaitun font-black text-sm">Rp {{ costSaved.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-400 text-[10px] border-t border-gray-150/40 pt-1.5">
            <span>Reduksi Emisi Karbon:</span>
            <span class="font-bold text-nature-forest">{{ (wasteSaved * 2.5).toFixed(2) }} kg CO2e</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons within card -->
      <div class="flex flex-col gap-2 mt-1">
        <button 
          v-if="!isDeducted"
          @click="handleDeductIngredients"
          class="w-full py-3 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-full shadow-md text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
        >
          <span>📉</span>
          <span>Potong Stok Kulkas & Catat Gizi</span>
        </button>

        <button 
          v-if="!isDeducted"
          @click="skipWithoutDeduct"
          class="w-full py-2 bg-transparent text-gray-400 hover:text-nature-forest font-bold text-[10px] active:scale-95 transition-transform"
        >
          Lewati Tanpa Memotong Stok
        </button>
      </div>
    </div>

    <!-- Bottom navigation controls -->
    <div class="flex gap-3">
      <!-- If already deducted, navigate forward to Insights or Home -->
      <button 
        v-if="isDeducted"
        @click="router.push('/insights')"
        class="flex-1 py-3 bg-white border border-nature-zaitun/20 rounded-full font-black text-xs text-nature-zaitun hover:bg-gray-50 active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>📊</span>
        <span>Lihat Gizi di Profil</span>
      </button>

      <!-- If not yet deducted, allow going back to cook guide -->
      <button 
        v-else
        @click="router.push('/cook')"
        class="flex-1 py-3 bg-white border border-nature-zaitun/20 rounded-full font-black text-xs text-nature-zaitun hover:bg-gray-50 active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-1"
      >
        <span>◀</span>
        <span>Panduan Memasak</span>
      </button>

      <button 
        @click="handleFinish"
        class="flex-1 py-3 bg-[#4D5C48] text-white font-black rounded-full shadow-md hover:bg-emerald-800 active:scale-95 transition-transform text-xs flex items-center justify-center gap-1.5"
      >
        <span>🏠</span>
        <span>{{ isDeducted ? 'Ke Beranda' : 'Selesai & Catat' }}</span>
      </button>
    </div>
  </div>
</template>
