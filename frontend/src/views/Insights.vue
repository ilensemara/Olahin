<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Sub-tabs: 'Status Harian' | 'Edit Profil & Gizi' | 'Riwayat 7 Hari'
const activeProfileTab = ref('Status Harian')

// Form fields for user personal identity
const name = ref(store.user?.name || 'Budi Santoso')
const username = ref(store.user?.username || 'budisantoso')
const email = ref(store.user?.email || 'user@olahin.com')
const gender = ref(store.user?.gender || 'male')
const avatar = ref(store.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150')

// Avatar presets for easy 1-click selection
const avatarPresets = [
  { label: 'Pria Santai', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
  { label: 'Wanita Hijab', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' },
  { label: 'Chef Pria', url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=150' },
  { label: 'Chef Wanita', url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=150' },
  { label: 'Pria Atletis', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
  { label: 'Wanita Aktif', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
]

// Form fields for physical data (Matches Screen 13 mockup)
const weight = ref(store.user?.weight || 65)
const height = ref(store.user?.height || 170)
const age = ref(store.user?.age || 26)
const targetCalories = ref(store.user?.target_calories || 2000)
const healthGoal = ref(store.user?.health_goal || 'maintain')
const allergies = ref([...(store.user?.allergies || [])])

const toggleAllergy = (a) => {
  if (allergies.value.includes(a)) {
    allergies.value = allergies.value.filter(item => item !== a)
  } else {
    allergies.value.push(a)
  }
}

const setGoal = (g) => {
  healthGoal.value = g
  const bmr = (10 * Number(weight.value || 65)) + (6.25 * Number(height.value || 170)) - (5 * Number(age.value || 25)) + 5
  const tdee = Math.round(bmr * 1.375)
  if (g === 'lose_weight') {
    targetCalories.value = Math.max(1400, tdee - 400)
  } else if (g === 'gain_weight') {
    targetCalories.value = tdee + 400
  } else {
    targetCalories.value = tdee
  }
}

const saveProfile = async () => {
  store.loading = true
  const res = await store.updateProfile({
    name: name.value.trim() || 'Pengguna Olahin',
    username: username.value.trim().toLowerCase().replace(/\s+/g, ''),
    email: email.value.trim(),
    gender: gender.value,
    avatar: avatar.value,
    weight: parseInt(weight.value),
    height: parseInt(height.value),
    age: parseInt(age.value),
    target_calories: parseInt(targetCalories.value),
    health_goal: healthGoal.value,
    allergies: allergies.value
  })
  store.loading = false
  if (res.success) {
    alert('✅ Data diri, akun & preferensi gizi berhasil disimpan!')
    activeProfileTab.value = 'Status Harian'
  } else {
    alert('Gagal menyimpan profil: ' + (res.message || 'Terjadi kesalahan'))
  }
}

// Log out handler
const handleLogout = () => {
  store.logout()
  router.push('/welcome')
}

// Dynamic Logged meals for "Situasi Harian" (from database/store)
const todayMeals = computed(() => {
  return store.insights.today_meals && store.insights.today_meals.length > 0
    ? store.insights.today_meals
    : [
        { id: 101, title: 'Telur Rebus & Roti Gandum', calories: 280, carbs: 32, protein: 14, fat: 8, time: '07:30', category: 'Sarapan' },
        { id: 102, title: 'Nasi Goreng Telur', calories: 450, carbs: 60, protein: 12, fat: 15, time: '12:45', category: 'Makan Siang', waste_prevented_kg: 0.35 }
      ]
})

// Dynamic Logged meals for "Riwayat 7 Hari"
const recentMeals = computed(() => {
  return store.insights.recent_meals && store.insights.recent_meals.length > 0
    ? store.insights.recent_meals
    : []
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

// Remaining calories calculation
const remainingCalories = computed(() => {
  const target = store.user.target_calories || 2000
  return Math.max(0, target - todayNutr.value.calories)
})

const caloriePercentage = computed(() => {
  const target = store.user.target_calories || 2000
  return Math.min(100, Math.round((todayNutr.value.calories / target) * 100))
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
  name.value = store.user?.name || 'Budi Santoso'
  username.value = store.user?.username || 'budisantoso'
  email.value = store.user?.email || 'user@olahin.com'
  gender.value = store.user?.gender || 'male'
  avatar.value = store.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
  weight.value = store.user?.weight || 65
  height.value = store.user?.height || 170
  age.value = store.user?.age || 26
  targetCalories.value = store.user?.target_calories || 2000
  healthGoal.value = store.user?.health_goal || 'maintain'
  allergies.value = [...(store.user?.allergies || [])]
})
</script>

<template>
  <div class="flex-1 flex flex-col">
    <!-- Header title & Logout -->
    <div class="flex justify-between items-center mb-4 pt-1">
      <div class="flex items-center">
        <img 
          src="/logo-dark.png" 
          alt="Olahin - Apa pun Bahanmu, Olahin Ada Resepnya" 
          class="h-9 object-contain select-none"
        />
      </div>
      <div class="flex gap-2">
        <!-- Edit Profil -->
        <button 
          @click="activeProfileTab = 'Edit Profil & Gizi'"
          class="bg-white border border-gray-150 p-2 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-nature-zaitun"
          title="Edit Data Profil & Gizi"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <!-- Keluar / Log Out -->
        <button 
          @click="handleLogout"
          class="bg-white border border-rose-100 p-2 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all text-rose-500 hover:bg-rose-50"
          title="Keluar Akun"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- User Profile Hero Card (Prominent identity banner) -->
    <div class="bg-white border border-gray-150 rounded-[28px] p-4 mb-4 shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="relative cursor-pointer group" @click="activeProfileTab = 'Edit Profil & Gizi'">
          <img 
            :src="store.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'" 
            class="w-13 h-13 rounded-full object-cover border-2 border-emerald-500/40 shadow-md group-hover:scale-105 transition-transform"
            alt="Foto Profil"
          />
          <span class="absolute -bottom-1 -right-1 bg-[#4D5C48] text-white rounded-full p-1 shadow-sm text-[8px] flex items-center justify-center">
            ✏️
          </span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h3 class="font-extrabold text-nature-forest text-sm sm:text-base leading-tight">{{ store.user?.name || 'Budi Santoso' }}</h3>
            <span class="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md">
              {{ store.user?.gender === 'female' ? '♀️ Perempuan' : '♂️ Laki-laki' }}
            </span>
          </div>
          <p class="text-[10px] text-gray-400 font-semibold mt-0.5">@{{ store.user?.username || 'budisantoso' }} • {{ store.user?.email || 'user@olahin.com' }}</p>
          <div class="flex items-center gap-1.5 mt-1.5">
            <span class="text-[8px] bg-nature-mint text-nature-zaitun font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {{ store.user?.health_goal === 'lose_weight' ? '🥗 Diet Defisit' : store.user?.health_goal === 'gain_weight' ? '💪 Bulking' : '⚖️ Jaga Berat' }}
            </span>
            <span v-if="store.user?.allergies?.length" class="text-[8px] bg-rose-50 text-rose-600 border border-rose-200 font-black px-2 py-0.5 rounded-full">
              🛡️ {{ store.user.allergies.length }} Pantangan
            </span>
          </div>
        </div>
      </div>

      <button 
        @click="activeProfileTab = 'Edit Profil & Gizi'"
        class="py-2 px-3 bg-nature-mint hover:bg-emerald-100 text-nature-zaitun font-black text-[10px] uppercase rounded-xl transition-all shadow-xs flex items-center gap-1 active:scale-95"
        title="Edit Profil Lengkap"
      >
        <span>✏️</span>
        <span class="hidden sm:inline">Edit</span>
      </button>
    </div>

    <!-- Sub-tabs selection pills -->
    <div class="bg-nature-input p-1 rounded-2xl flex gap-1 mb-4 select-none">
      <button 
        v-for="tab in ['Status Harian', 'Edit Profil & Gizi', 'Riwayat 7 Hari']"
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
      <div class="bg-[#4D5C48] text-white border border-transparent rounded-[30px] p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
        <!-- Overlay backdrop leaves -->
        <div class="absolute inset-0 opacity-10 bg-cover pointer-events-none select-none" style="background-image: url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=200');"></div>
        
        <div class="flex justify-between items-start z-10">
          <div>
            <h4 class="text-[9px] font-black text-white/70 uppercase tracking-widest mb-0.5">Situasi Kalori Hari Ini</h4>
            <div class="flex items-baseline gap-1.5">
              <span class="text-3xl font-black">{{ todayNutr.calories }}</span>
              <span class="text-xs text-[#EBF0E9]/80 font-bold">/ {{ store.user.target_calories }} kkal</span>
            </div>
          </div>
          <!-- Sisa Kalori Badge -->
          <div class="text-right bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-2xl">
            <span class="block text-[8px] font-black uppercase text-amber-200 tracking-wider">Sisa Kebutuhan</span>
            <span class="text-sm font-black text-white">{{ remainingCalories }} kkal</span>
          </div>
        </div>

        <!-- Overall progress bar -->
        <div class="z-10">
          <div class="flex justify-between text-[9px] text-[#EBF0E9]/80 font-bold mb-1">
            <span>Pemenuhan Kalori</span>
            <span>{{ caloriePercentage }}% Tercapai</span>
          </div>
          <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-400 transition-all duration-1000" :style="{ width: `${caloriePercentage}%` }"></div>
          </div>
        </div>

        <!-- Tiny macro progress bars -->
        <div class="flex flex-col gap-2 w-full text-[9px] font-bold z-10 pt-1 border-t border-white/10">
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

      <!-- Meal Target items (Dinamis dari CookingLog / Database) -->
      <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm">
        <div class="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
          <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Catatan Makanan Hari Ini</h4>
          <span class="text-[8px] font-bold text-nature-zaitun">{{ todayMeals.length }} Catatan</span>
        </div>

        <div v-if="todayMeals.length > 0" class="flex flex-col gap-2.5">
          <div 
            v-for="meal in todayMeals" 
            :key="meal.id" 
            class="flex justify-between items-center text-xs font-bold text-nature-forest bg-[#FDFBF7] p-3 border border-gray-150/60 rounded-2xl shadow-sm hover:border-nature-zaitun/40 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white border border-gray-150 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                {{ meal.title.toLowerCase().includes('bayam') ? '🥬' : meal.title.toLowerCase().includes('telur') ? '🍳' : meal.title.toLowerCase().includes('nasi') ? '🍚' : '🍲' }}
              </div>
              <div>
                <h5 class="text-nature-forest font-extrabold text-xs leading-tight">{{ meal.title }}</h5>
                <p class="text-gray-400 text-[9px] font-medium mt-0.5">
                  Pukul {{ meal.time }} • Karbo {{ meal.carbs }}g • Prot {{ meal.protein }}g • Lemak {{ meal.fat }}g
                </p>
                <span v-if="meal.waste_prevented_kg" class="inline-block mt-1 text-[8px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  🌱 Mencegah {{ meal.waste_prevented_kg }} kg sisa kulkas
                </span>
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-2">
              <span class="text-orange-500 font-black text-sm">{{ meal.calories }}</span>
              <span class="block text-[8px] text-gray-400 font-bold uppercase">kkal</span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-gray-400 text-xs">
          <span class="text-3xl block mb-2">🍽️</span>
          <p class="font-bold text-nature-forest">Belum ada makanan yang dimasak hari ini.</p>
          <p class="text-[10px] text-gray-400 mt-0.5">Masak salah satu resep kulkas untuk mencatat asupan kalori Anda otomatis.</p>
          <button 
            @click="router.push('/recipes')" 
            class="mt-3 px-4 py-2 bg-nature-zaitun text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm"
          >
            Lihat Resep Kulkas
          </button>
        </div>
      </div>
    </div>

    <!-- ----------------------- TAB 2: EDIT PROFIL & GIZI ----------------------- -->
    <div v-if="activeProfileTab === 'Edit Profil & Gizi'" class="flex-1 flex flex-col gap-4">
      
      <!-- CARD 1: DATA DIRI & IDENTITAS AKUN -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="text-base">👤</span>
            <h4 class="text-xs font-black text-nature-forest uppercase tracking-widest">Data Diri & Akun</h4>
          </div>
          <span class="text-[9px] text-nature-zaitun font-bold bg-nature-mint px-2 py-0.5 rounded-full">Identitas Profil</span>
        </div>

        <!-- Avatar Selection -->
        <div>
          <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-2">Foto Profil (Pilih Avatar atau Gunakan URL Sendiri)</label>
          <div class="flex items-center gap-3 mb-3">
            <img 
              :src="avatar" 
              class="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md flex-shrink-0"
              alt="Avatar Terpilih"
            />
            <div class="flex-1">
              <span class="block text-[9px] font-bold text-gray-500 mb-1.5">Pilihan Avatar Cepat:</span>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="p in avatarPresets" 
                  :key="p.label"
                  type="button"
                  @click="avatar = p.url"
                  class="relative rounded-full overflow-hidden border-2 transition-all active:scale-95"
                  :class="avatar === p.url ? 'border-emerald-600 ring-2 ring-emerald-300 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'"
                  :title="p.label"
                >
                  <img :src="p.url" class="w-8 h-8 object-cover" />
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Avatar URL -->
          <div class="mt-1">
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-0.5">Atau Masukkan Tautan / Link Foto Pribadi</label>
            <input 
              type="url" 
              v-model="avatar" 
              placeholder="https://images.unsplash.com/..."
              class="w-full px-3 py-2 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-[11px] font-semibold text-nature-forest shadow-inner"
            />
          </div>
        </div>

        <!-- Form fields: Nama, Username, Email, Jenis Kelamin -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              v-model="name" 
              placeholder="Contoh: Budi Santoso"
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>

          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Nama Pengguna (Username)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-bold text-xs">@</span>
              <input 
                type="text" 
                v-model="username" 
                placeholder="budisantoso"
                class="w-full pl-7 pr-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
              />
            </div>
          </div>

          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Email Akun</label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="user@olahin.com"
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>

          <div>
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Jenis Kelamin</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button"
                @click="gender = 'male'"
                class="py-2.5 px-2 rounded-xl text-xs font-black uppercase border transition-all text-center flex items-center justify-center gap-1"
                :class="gender === 'male' ? 'bg-[#4D5C48] text-white border-[#4D5C48] shadow-sm' : 'bg-nature-cream border-gray-200 text-gray-600'"
              >
                <span>♂️</span>
                <span>Laki-laki</span>
              </button>
              <button 
                type="button"
                @click="gender = 'female'"
                class="py-2.5 px-2 rounded-xl text-xs font-black uppercase border transition-all text-center flex items-center justify-center gap-1"
                :class="gender === 'female' ? 'bg-[#4D5C48] text-white border-[#4D5C48] shadow-sm' : 'bg-nature-cream border-gray-200 text-gray-600'"
              >
                <span>♀️</span>
                <span>Perempuan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 2: DATA FISIK, TARGET GIZI & ALERGI -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="text-base">🏃‍♂️</span>
            <h4 class="text-xs font-black text-nature-forest uppercase tracking-widest">Data Fisik & Target Gizi</h4>
          </div>
          <span class="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Kalkulasi Cerdas</span>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1">Target Kalori (kkal)</label>
            <input 
              type="number" 
              v-model="targetCalories" 
              class="w-full px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest shadow-inner"
            />
          </div>

          <!-- Target Tujuan Kesehatan / Fitness Goal -->
          <div class="col-span-2 sm:col-span-4 pt-1 border-t border-gray-150">
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1.5">Tujuan Pola Makan (Goal)</label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                type="button"
                @click="setGoal('lose_weight')"
                class="py-2.5 px-1 rounded-xl text-[9px] font-black uppercase border transition-all text-center"
                :class="healthGoal === 'lose_weight' ? 'bg-[#4D5C48] text-white border-[#4D5C48] shadow-sm' : 'bg-nature-cream border-gray-200 text-gray-600'"
              >
                🥗 Diet Defisit
              </button>
              <button 
                type="button"
                @click="setGoal('maintain')"
                class="py-2.5 px-1 rounded-xl text-[9px] font-black uppercase border transition-all text-center"
                :class="healthGoal === 'maintain' ? 'bg-[#4D5C48] text-white border-[#4D5C48] shadow-sm' : 'bg-nature-cream border-gray-200 text-gray-600'"
              >
                ⚖️ Jaga Berat
              </button>
              <button 
                type="button"
                @click="setGoal('gain_weight')"
                class="py-2.5 px-1 rounded-xl text-[9px] font-black uppercase border transition-all text-center"
                :class="healthGoal === 'gain_weight' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-nature-cream border-gray-200 text-gray-600'"
              >
                💪 Bulking (Naik BB)
              </button>
            </div>
          </div>

          <!-- Riwayat / Pantangan Alergi -->
          <div class="col-span-2 sm:col-span-4 pt-1 border-t border-gray-150">
            <label class="block text-[8px] font-black uppercase text-gray-400 tracking-wider mb-1.5">
              Pantangan Alergi Anda (Proteksi Otomatis di Resep)
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button 
                v-for="a in ['Telur', 'Kacang', 'Seafood', 'Susu', 'Gluten', 'Pedas']"
                :key="a"
                type="button"
                @click="toggleAllergy(a)"
                class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all flex items-center gap-1 active:scale-95"
                :class="allergies.includes(a) ? 'bg-rose-500 border-rose-500 text-white shadow-xs' : 'bg-nature-cream border-gray-200 text-gray-500 hover:bg-gray-100'"
              >
                <span>{{ allergies.includes(a) ? '✕' : '+' }}</span>
                <span>{{ a }}</span>
              </button>
            </div>
            <p class="text-[8px] text-gray-400 mt-1">
              Resep yang mengandung bahan alergi akan disaring dan diberi tanda peringatan bahaya secara otomatis.
            </p>
          </div>
        </div>

        <button 
          @click="saveProfile"
          class="w-full py-3.5 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-full shadow-md text-xs mt-2 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
        >
          <span>💾</span>
          <span>Simpan Data Profil & Akun</span>
        </button>
      </div>
    </div>

    <!-- ----------------------- TAB 3: RIWAYAT 7 HARI ----------------------- -->
    <div v-if="activeProfileTab === 'Riwayat 7 Hari'" class="flex-1 flex flex-col gap-4">
      <!-- 7 Days Summary Metric Cards -->
      <div class="grid grid-cols-3 gap-2.5">
        <div class="bg-white border border-gray-150 rounded-2xl p-3 text-center shadow-sm">
          <span class="block text-[8px] font-black uppercase text-gray-400 tracking-wider">Rata-rata</span>
          <span class="text-sm font-black text-nature-forest">
            {{ Math.round((store.insights.chart_data?.reduce((acc, c) => acc + (c.calories || 0), 0) || 12000) / 7) }}
          </span>
          <span class="block text-[8px] font-bold text-orange-500">kkal / hari</span>
        </div>
        <div class="bg-white border border-gray-150 rounded-2xl p-3 text-center shadow-sm">
          <span class="block text-[8px] font-black uppercase text-gray-400 tracking-wider">Dimasak</span>
          <span class="text-sm font-black text-nature-zaitun">
            {{ store.insights.summary?.meals_cooked_count || 7 }}
          </span>
          <span class="block text-[8px] font-bold text-gray-400">menu</span>
        </div>
        <div class="bg-white border border-gray-150 rounded-2xl p-3 text-center shadow-sm">
          <span class="block text-[8px] font-black uppercase text-gray-400 tracking-wider">Limbah Dicegah</span>
          <span class="text-sm font-black text-emerald-600">
            {{ store.insights.summary?.total_waste_saved_kg || 5.6 }}
          </span>
          <span class="block text-[8px] font-bold text-emerald-600">kg bahan</span>
        </div>
      </div>

      <!-- Chart card (Matches screen 14 mockup) -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-5 shadow-sm flex flex-col">
        <div class="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
          <div>
            <h4 class="text-[10px] font-black text-nature-zaitun uppercase tracking-widest">Riwayat Konsumsi 7 Hari</h4>
            <p class="text-[8px] font-bold text-gray-400">Grafik tren asupan kalori dan komposisi nutrisi harian</p>
          </div>
          <span class="text-[8px] font-extrabold text-nature-zaitun bg-[#EBF0E9] px-2 py-0.5 rounded-full">kkal</span>
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

      <!-- Riwayat Detail Catatan Masakan & Kalori -->
      <div class="bg-white border border-gray-150 rounded-[30px] p-4 shadow-sm flex flex-col gap-3">
        <div class="flex justify-between items-center border-b border-gray-50 pb-2">
          <h4 class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Catatan Masakan 7 Hari</h4>
          <span class="text-[8px] font-bold text-gray-400">Total Kalori per Menu</span>
        </div>

        <!-- If recentMeals list exists -->
        <div v-if="recentMeals && recentMeals.length > 0" class="flex flex-col gap-2.5">
          <div 
            v-for="meal in recentMeals" 
            :key="meal.id"
            class="flex justify-between items-center p-3 rounded-2xl bg-[#FDFBF7] border border-gray-150/60 text-xs text-nature-forest shadow-sm hover:border-nature-zaitun/40 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-white border border-gray-150 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                {{ meal.title.toLowerCase().includes('bayam') ? '🥬' : meal.title.toLowerCase().includes('telur') ? '🍳' : '🍲' }}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[8px] font-black uppercase text-nature-zaitun bg-[#EBF0E9] px-2 py-0.5 rounded-full">
                    {{ meal.day }}
                  </span>
                  <h5 class="font-extrabold text-xs text-nature-forest">{{ meal.title }}</h5>
                </div>
                <p class="text-gray-400 text-[9px] font-medium mt-0.5">
                  {{ meal.time }} • Karbo {{ meal.carbs }}g • Prot {{ meal.protein }}g • Lemak {{ meal.fat }}g
                </p>
                <p v-if="meal.waste_prevented_kg" class="text-[8px] font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <span>🌱 Cegah {{ meal.waste_prevented_kg }} kg limbah</span>
                  <span>•</span>
                  <span>Hemat Rp {{ (meal.cost_saved_rp || 12000).toLocaleString('id-ID') }}</span>
                </p>
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-2">
              <span class="text-orange-500 font-black text-sm">{{ meal.calories }}</span>
              <span class="block text-[8px] text-gray-400 font-bold uppercase">kkal</span>
            </div>
          </div>
        </div>

        <!-- Weekly Summary Days breakdown -->
        <div class="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
          <span class="text-[8px] font-black uppercase tracking-wider text-gray-400 mb-1">Akumulasi Harian</span>
          <div 
            v-for="log in store.insights.chart_data" 
            :key="log.date"
            class="flex justify-between items-center text-[10px] font-bold text-nature-forest bg-white p-2 border border-gray-100 rounded-xl"
          >
            <span class="text-gray-600">Hari {{ log.day }} ({{ log.date }})</span>
            <span class="text-nature-zaitun font-black">{{ Math.round(log.calories) }} kkal</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
