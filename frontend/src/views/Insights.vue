<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Sub-tabs: 'Status Harian' | 'Data Tubuh' | 'Riwayat 7 Hari' (Matches mockup 12, 13, 14)
const activeProfileTab = ref('Status Harian')

// Form fields for physical data (Matches Screen 13 mockup)
const weight = ref(store.user.weight)
const height = ref(store.user.height)
const age = ref(store.user.age)
const targetCalories = ref(store.user.target_calories)

const saveProfile = async () => {
  store.loading = true
  const res = await store.updateProfile({
    weight: parseInt(weight.value),
    height: parseInt(height.value),
    age: parseInt(age.value),
    target_calories: parseInt(targetCalories.value)
  })
  store.loading = false
  if (res.success) {
    alert('Profil fisik berhasil disimpan!')
    activeProfileTab.value = 'Status Harian'
  } else {
    alert('Gagal menyimpan profil.')
  }
}

// Log out handler
const handleLogout = () => {
  store.logout()
  router.push('/welcome')
}

// Logged meals for "Tujuan Makan" (Matches Screen 13 mockup)
const mealLogs = ref({
  pagi: { name: 'Telur Rebus & Roti', calories: 280, time: '07:30' },
  siang: { name: 'Nasi Goreng Telur', calories: 520, time: '13:00' },
  malam: { name: 'Sop Ayam & Wortel', calories: 440, time: '19:15' }
})

// Today's stats
const todayNutr = computed(() => {
  return store.insights.today_nutrition || {
    calories: 1240,
    carbs: 160,
    protein: 50,
    fat: 40
  }
})

// Macro percentage progress calculators for Today's Card
const carbPercent = computed(() => Math.min(Math.round((todayNutr.value.carbs / 250) * 100), 100))
const proteinPercent = computed(() => Math.min(Math.round((todayNutr.value.protein / 80) * 100), 100))
const fatPercent = computed(() => Math.min(Math.round((todayNutr.value.fat / 65) * 100), 100))

// Max calorie helper to scale vertical charts (Matches Screen 14 mockup)
const maxChartCal = computed(() => {
  let max = store.user.target_calories || 1800
  if (store.insights.chart_data && store.insights.chart_data.length > 0) {
    store.insights.chart_data.forEach(c => {
      if (c.calories > max) max = c.calories
    })
  }
  return max
})

const getBarHeight = (val, maxRef = 2000) => {
  const percent = (val / maxRef) * 100
  return `${Math.max(percent, 10)}%`
}

onMounted(async () => {
  await store.loadInsights()
  weight.value = store.user.weight
  height.value = store.user.height
  age.value = store.user.age
  targetCalories.value = store.user.target_calories
})
</script>

<template>
  <div class="flex-1 bg-nature-cream flex flex-col p-5 overflow-y-auto">
    <!-- Header title -->
    <div class="flex justify-between items-center mb-4 pt-2">
      <div class="flex items-center gap-1.5">
        <span class="text-xl font-extrabold text-nature-zaitun tracking-wider">Olahin</span>
      </div>
      <div class="flex gap-2">
        <!-- Edit Profil -->
        <button 
          @click="activeProfileTab = 'Data Tubuh'"
          class="bg-white border border-gray-150 p-2 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-nature-zaitun"
          title="Edit Data Fisik"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <!-- Keluar / Log Out -->
        <button 
          @click="handleLogout"
          class="bg-white border border-rose-100 p-2 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-rose-500 hover:bg-rose-50"
          title="Keluar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Sub-tabs selection pills (Matches mockup segment layout) -->
    <div class="bg-nature-input p-1 rounded-2xl flex gap-1 mb-4 select-none">
      <button 
        v-for="tab in ['Status Harian', 'Data Tubuh', 'Riwayat 7 Hari']"
        :key="tab"
        @click="activeProfileTab = tab"
        class="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
        :class="activeProfileTab === tab ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- ----------------------- TAB 1: STATUS HARIAN ----------------------- -->
    <div v-if="activeProfileTab === 'Status Harian'" class="flex-1 flex flex-col gap-4">
      <!-- Kalori Hari Ini Card (Matches screen 12 mockup) -->
      <div class="bg-[#4D5C48] text-white border border-transparent rounded-[30px] p-5 shadow-lg flex justify-between items-center relative overflow-hidden">
        <!-- Overlay backdrop leaves -->
        <div class="absolute inset-0 opacity-10 bg-cover pointer-events-none select-none" style="background-image: url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=200');"></div>
        
        <div class="flex-1 z-10">
          <h4 class="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">Kalori Hari Ini</h4>
          <div class="flex items-baseline gap-1.5 mb-4">
            <span class="text-3xl font-black">{{ todayNutr.calories }}</span>
            <span class="text-xs text-[#EBF0E9]/80 font-bold">/ {{ store.user.target_calories }} kkal</span>
          </div>

          <!-- Tiny macro progress bars -->
          <div class="flex flex-col gap-2 w-full text-[9px] font-bold">
            <!-- Karbo (Yellow/Orange) -->
            <div>
              <div class="flex justify-between text-[#EBF0E9]/80 mb-0.5">
                <span>Karbohidrat</span>
                <span>{{ todayNutr.carbs }}g ({{ carbPercent }}%)</span>
              </div>
              <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-400" :style="{ width: `${carbPercent}%` }"></div>
              </div>
            </div>
            <!-- Protein (Mint) -->
            <div>
              <div class="flex justify-between text-[#EBF0E9]/80 mb-0.5">
                <span>Protein</span>
                <span>{{ todayNutr.protein }}g ({{ proteinPercent }}%)</span>
              </div>
              <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-300" :style="{ width: `${proteinPercent}%` }"></div>
              </div>
            </div>
            <!-- Lemak (Rose) -->
            <div>
              <div class="flex justify-between text-[#EBF0E9]/80 mb-0.5">
                <span>Lemak</span>
                <span>{{ todayNutr.fat }}g ({{ fatPercent }}%)</span>
              </div>
              <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-rose-400" :style="{ width: `${fatPercent}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Physical Review Card -->
      <div class="bg-white border border-gray-150 rounded-[25px] p-4 flex justify-between items-center text-center text-xs font-bold text-nature-forest shadow-sm">
        <div class="flex-1">
          <p class="text-gray-400 text-[8px] uppercase tracking-wider mb-0.5">Berat</p>
          <span class="text-sm font-black text-nature-zaitun">{{ store.user.weight }} kg</span>
        </div>
        <div class="w-px h-6 bg-gray-150"></div>
        <div class="flex-1">
          <p class="text-gray-400 text-[8px] uppercase tracking-wider mb-0.5">Tinggi</p>
          <span class="text-sm font-black text-nature-zaitun">{{ store.user.height }} cm</span>
        </div>
        <div class="w-px h-6 bg-gray-150"></div>
        <div class="flex-1">
          <p class="text-gray-400 text-[8px] uppercase tracking-wider mb-0.5">Usia</p>
          <span class="text-sm font-black text-nature-zaitun">{{ store.user.age }} thn</span>
        </div>
      </div>

      <!-- Meal Target items (Pagi, Siang, Malam logs) -->
      <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm">
        <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Catatan Makanan Hari Ini</h4>
        <div class="flex flex-col gap-2.5">
          <div v-for="(meal, key) in mealLogs" :key="key" class="flex justify-between items-center text-xs font-bold text-nature-forest bg-[#FDFBF7] p-2.5 border border-gray-150/40 rounded-xl shadow-inner-soft">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ key === 'pagi' ? '🍳' : key === 'siang' ? '🍲' : '🍜' }}</span>
              <div>
                <h5 class="capitalize text-nature-zaitun font-black text-[10px]">{{ key }}</h5>
                <p class="text-gray-400 text-[9px] font-medium leading-none mt-0.5">{{ meal.name }}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-orange-500 font-extrabold">{{ meal.calories }} kcal</span>
              <p class="text-[8px] text-gray-400 font-semibold mt-0.5">{{ meal.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ----------------------- TAB 2: DATA TUBUH ----------------------- -->
    <div v-if="activeProfileTab === 'Data Tubuh'" class="flex-1 flex flex-col gap-4">
      <!-- Body details edit card (Matches screen 13 mockup) -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col gap-4">
        <h4 class="text-[10px] font-black text-nature-zaitun uppercase tracking-widest border-b border-gray-50 pb-2">Data Tubuh & Target</h4>
        
        <div class="flex flex-col gap-3.5">
          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Tinggi Badan (cm)</label>
            <input 
              type="number" 
              v-model="height" 
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>
          
          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Berat Badan (kg)</label>
            <input 
              type="number" 
              v-model="weight" 
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>
          
          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Usia Anda (Tahun)</label>
            <input 
              type="number" 
              v-model="age" 
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>

          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Target Kalori Harian (kkal)</label>
            <input 
              type="number" 
              v-model="targetCalories" 
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>
        </div>

        <button 
          @click="saveProfile"
          class="w-full py-3 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-full shadow-md text-xs mt-3 active:scale-95 transition-transform"
        >
          Simpan Pembaruan
        </button>
      </div>
    </div>

    <!-- ----------------------- TAB 3: RIWAYAT 7 HARI ----------------------- -->
    <div v-if="activeProfileTab === 'Riwayat 7 Hari'" class="flex-1 flex flex-col gap-4">
      <!-- Chart card (Matches screen 14 mockup) -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col">
        <div class="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
          <h4 class="text-[10px] font-black text-nature-zaitun uppercase tracking-widest">Riwayat Konsumsi 7 Hari</h4>
          <span class="text-[8px] font-extrabold text-gray-400">Satuan kkal</span>
        </div>

        <!-- Vertical multi-stacked bars (Orange: Carb, Yellow: Prot, Green: Fat) -->
        <div class="flex justify-between items-end h-[160px] px-2 mb-3">
          <div 
            v-for="log in store.insights.chart_data"
            :key="log.date"
            class="flex flex-col items-center gap-1.5 w-7"
          >
            <!-- Values total calorie tooltip -->
            <span class="text-[7px] font-extrabold text-nature-zaitun">{{ Math.round(log.calories) }}</span>
            
            <!-- Triple grouped vertical progress bars -->
            <div class="w-full h-[110px] flex gap-0.5 justify-center items-end bg-[#FDFBF7] border border-gray-150/40 rounded-t-lg p-0.5">
              <!-- Carb (Orange/Yellow) -->
              <div 
                class="w-1.5 bg-[#DF9D4F] rounded-full transition-all duration-1000"
                :style="{ height: getBarHeight(log.carbs || (log.calories * 0.45) / 4, 300) }"
              ></div>
              <!-- Protein (Yellow/Green) -->
              <div 
                class="w-1.5 bg-[#EBF0E9] border border-nature-sage/50 text-[#4D5C48] rounded-full transition-all duration-1000"
                :style="{ height: getBarHeight(log.protein || (log.calories * 0.25) / 4, 150) }"
              ></div>
              <!-- Fat (Green) -->
              <div 
                class="w-1.5 bg-[#4D5C48] rounded-full transition-all duration-1000"
                :style="{ height: getBarHeight(log.fat || (log.calories * 0.30) / 9, 100) }"
              ></div>
            </div>

            <!-- Day label -->
            <span class="text-[9px] font-black text-nature-forest">{{ log.day }}</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex justify-center gap-4 text-[8px] font-black text-gray-400 uppercase tracking-wider pt-2 border-t border-gray-50">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#DF9D4F]"></span> Karbohidrat
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-nature-sage"></span> Protein
          </div>
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#4D5C48]"></span> Lemak
          </div>
        </div>
      </div>

      <!-- Food stats history items (Matches mockup screen 14) -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-4 shadow-sm">
        <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Catatan Makanan</h4>
        <div class="flex flex-col gap-2">
          <div 
            v-for="log in store.insights.chart_data" 
            :key="log.date"
            class="flex justify-between items-center text-[10px] font-bold text-nature-forest bg-[#FDFBF7] p-2 border border-gray-150/40 rounded-xl"
          >
            <span>Hari {{ log.day }} ({{ log.date }})</span>
            <span class="text-nature-zaitun font-black">{{ Math.round(log.calories) }} kkal</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
