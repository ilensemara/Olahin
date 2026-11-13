<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// Active Main Tab: 'jadwal' | 'belanja'
const activeMainTab = ref('jadwal')

// Day selection
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const selectedDay = ref('Senin')

// Toast notification
const toastMessage = ref('')
const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

// Current day meal object
const currentDayPlan = computed(() => {
  return store.mealPlan.find(d => d.day === selectedDay.value) || {
    day: selectedDay.value,
    meals: { breakfast: 'Nasi Goreng Telur', lunch: 'Bayam Bening Segar', dinner: 'Telur Dadar Cabai' }
  }
})

// Helper to find full recipe object by title
const getRecipeByTitle = (title) => {
  if (!title) return null
  return store.allRecipes.find(r => r.title.toLowerCase().trim() === title.toLowerCase().trim()) || {
    title: title,
    calories: 250,
    prep_time: 15,
    match_percentage: 100,
    missing_ingredients: []
  }
}

// Check recipe availability in fridge
const checkRecipeStock = (recipeTitle) => {
  const recipe = store.allRecipes.find(r => r.title.toLowerCase().trim() === recipeTitle.toLowerCase().trim())
  if (!recipe) return { isComplete: true, missing: [] }

  const stockMap = {}
  store.fridgeItems.forEach(item => {
    stockMap[item.name.toLowerCase().trim()] = item.quantity
  })

  const missing = []
  recipe.ingredients.forEach(ing => {
    const nameLower = ing.name.toLowerCase().trim()
    const available = stockMap[nameLower] || 0
    if (available < ing.quantity) {
      missing.push({
        name: ing.name,
        needed: ing.quantity - available,
        unit: ing.unit
      })
    }
  })

  return {
    isComplete: missing.length === 0,
    missing
  }
}

// Check recipe allergens against user profile
const checkRecipeAllergen = (recipeTitle) => {
  const recipe = store.allRecipes.find(r => r.title.toLowerCase().trim() === recipeTitle.toLowerCase().trim())
  if (!recipe) return []
  const userAllergies = store.user?.allergies || []
  const detected = []
  recipe.ingredients.forEach(ing => {
    const ingLower = ing.name.toLowerCase()
    userAllergies.forEach(a => {
      const aLower = a.toLowerCase()
      if (
        ingLower.includes(aLower) ||
        (aLower === 'seafood' && (ingLower.includes('udang') || ingLower.includes('ikan') || ingLower.includes('cumi'))) ||
        (aLower === 'pedas' && (ingLower.includes('cabai') || ingLower.includes('sambal')))
      ) {
        if (!detected.includes(a)) detected.push(a)
      }
    })
  })
  return detected
}

// Modal State: Swap / Pick Recipe
const isPickerOpen = ref(false)
const targetSlot = ref('lunch') // 'breakfast' | 'lunch' | 'dinner'
const customRecipeName = ref('')
const searchFilter = ref('')

const openRecipePicker = (slot) => {
  targetSlot.value = slot
  customRecipeName.value = ''
  searchFilter.value = ''
  isPickerOpen.value = true
}

const selectRecipeForSlot = (recipeTitle) => {
  store.setMealPlan(selectedDay.value, targetSlot.value, recipeTitle)
  isPickerOpen.value = false
  showToast(`Menu ${getSlotLabel(targetSlot.value)} hari ${selectedDay.value} diganti ke "${recipeTitle}"!`)
}

const setCustomRecipe = () => {
  if (!customRecipeName.value.trim()) return
  const title = customRecipeName.value.trim()
  store.setMealPlan(selectedDay.value, targetSlot.value, title)
  isPickerOpen.value = false
  showToast(`Menu kustom "${title}" berhasil dijadwalkan!`)
}

const getSlotLabel = (slot) => {
  if (slot === 'breakfast') return 'Sarapan'
  if (slot === 'lunch') return 'Makan Siang'
  if (slot === 'dinner') return 'Makan Malam'
  return slot
}

const getSlotIcon = (slot) => {
  if (slot === 'breakfast') return '☀️'
  if (slot === 'lunch') return '🌤️'
  if (slot === 'dinner') return '🌙'
  return '🍽️'
}

// Add recipe's missing ingredients to shopping list
const addMissingToShoppingList = (recipeTitle) => {
  const stock = checkRecipeStock(recipeTitle)
  if (stock.missing.length === 0) {
    showToast('Semua bahan masakan ini sudah ada di kulkas!')
    return
  }

  stock.missing.forEach(m => {
    store.addToShoppingList({
      name: m.name,
      quantity: m.needed,
      unit: m.unit,
      recipe_title: recipeTitle
    })
  })
  showToast(`${stock.missing.length} bahan dimasukkan ke Daftar Belanja!`)
}

// Generate weekly shopping list automatically
const generateWeeklyShopping = () => {
  const added = store.autoGenerateWeeklyShoppingList()
  if (added > 0) {
    showToast(`Berhasil! ${added} bahan belanjaan mingguan ditambahkan otomatis.`)
    activeMainTab.value = 'belanja'
  } else {
    showToast('Kulkasmu sudah lengkap untuk semua menu minggu ini! 🎉')
  }
}

// Direct cooking jump
const startCooking = (recipeTitle) => {
  const recipe = store.allRecipes.find(r => r.title.toLowerCase().trim() === recipeTitle.toLowerCase().trim())
  if (recipe) {
    store.setSelectedRecipe(recipe)
    router.push('/recipe-detail')
  } else {
    showToast(`Resep "${recipeTitle}" belum memiliki langkah otomatis. Silakan pilih dari resep rekomendasi.`)
  }
}

// Shopping list manual input
const manualItemName = ref('')
const manualItemQty = ref(1)
const manualItemUnit = ref('pcs')

const addManualShoppingItem = () => {
  if (!manualItemName.value.trim()) return
  store.addToShoppingList({
    name: manualItemName.value.trim(),
    quantity: manualItemQty.value,
    unit: manualItemUnit.value,
    recipe_title: 'Belanja Tambahan'
  })
  manualItemName.value = ''
  manualItemQty.value = 1
  showToast('Barang berhasil ditambahkan ke daftar belanja!')
}

// Transfer bought items to fridge
const transferToFridge = () => {
  const transferred = store.transferBoughtItemsToFridge()
  if (transferred > 0) {
    showToast(`🎉 Sukses! ${transferred} bahan telah masuk ke Kulkas Saya!`)
  } else {
    showToast('Centang bahan yang sudah dibeli terlebih dahulu!')
  }
}

// Filtered recipes inside picker modal
const filteredModalRecipes = computed(() => {
  if (!searchFilter.value) return store.allRecipes
  const q = searchFilter.value.toLowerCase().trim()
  return store.allRecipes.filter(r => 
    r.title.toLowerCase().includes(q) || 
    r.description.toLowerCase().includes(q)
  )
})

// Unchecked shopping items count
const uncheckedShoppingCount = computed(() => {
  return store.shoppingList.filter(i => !i.checked).length
})
</script>

<template>
  <div class="flex-1 flex flex-col pb-24 relative select-none">
    <!-- Toast Feedback -->
    <div 
      v-if="toastMessage" 
      class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2C3529] text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-white/20"
    >
      <span>✨</span>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Header Section -->
    <div class="flex justify-between items-center mb-4 pt-1">
      <div class="flex items-center gap-2">
        <button 
          @click="router.push('/home')" 
          class="w-9 h-9 rounded-full bg-white border border-gray-150 flex items-center justify-center text-nature-forest hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          title="Kembali ke Beranda"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 class="text-base font-extrabold text-nature-forest leading-tight">Perencana Menu & Belanja</h2>
          <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Atur Jadwal 7 Hari & Checklist Belanjaan</p>
        </div>
      </div>

      <!-- Quick Belanja Shortcut Badge -->
      <button 
        @click="activeMainTab = 'belanja'"
        class="relative p-2 bg-white rounded-full border border-gray-150 shadow-sm active:scale-95 text-nature-zaitun flex items-center gap-1.5 px-3"
      >
        <span class="text-xs">🛒</span>
        <span class="text-[10px] font-black text-nature-zaitun">{{ uncheckedShoppingCount }} Beli</span>
      </button>
    </div>

    <!-- Segment Switcher (Jadwal 7 Hari vs Daftar Belanja) -->
    <div class="bg-nature-input p-1 rounded-2xl flex gap-1 mb-4 select-none shadow-inner">
      <button 
        @click="activeMainTab = 'jadwal'"
        class="flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
        :class="activeMainTab === 'jadwal' ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        <span>📅</span>
        <span>Jadwal Menu 7 Hari</span>
      </button>
      <button 
        @click="activeMainTab = 'belanja'"
        class="flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
        :class="activeMainTab === 'belanja' ? 'bg-white text-nature-zaitun shadow-sm' : 'text-gray-500 hover:text-nature-forest'"
      >
        <span>🛒</span>
        <span>Daftar Belanja ({{ uncheckedShoppingCount }})</span>
      </button>
    </div>

    <!-- ==================== TAB 1: JADWAL 7 HARI ==================== -->
    <div v-if="activeMainTab === 'jadwal'" class="flex flex-col gap-4">
      <!-- 7 Days Scrollable Pill Selector -->
      <div class="flex gap-2 overflow-x-auto pb-1 scroll-smooth -mx-1 px-1">
        <button 
          v-for="d in days" 
          :key="d"
          @click="selectedDay = d"
          class="flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-0.5 border"
          :class="selectedDay === d ? 'bg-[#4D5C48] border-[#4D5C48] text-white shadow-md scale-102' : 'bg-white border-gray-150 text-gray-500 hover:bg-gray-50'"
        >
          <span>{{ d }}</span>
          <span class="text-[8px] opacity-75 font-bold">Menu</span>
        </button>
      </div>

      <!-- Banner Tip: Auto Sync with Fridge -->
      <div class="bg-emerald-50 border border-emerald-150 rounded-2xl p-3 flex items-center justify-between text-emerald-900">
        <div class="flex items-center gap-2">
          <span class="text-xl">💡</span>
          <div>
            <h4 class="text-[10px] font-black uppercase tracking-wider">Perencanaan Anti-Basi</h4>
            <p class="text-[9px] text-emerald-800/80 leading-tight">Menu disesuaikan otomatis dengan bahan kulkas & daftar belanjaan.</p>
          </div>
        </div>
        <button 
          @click="generateWeeklyShopping"
          class="bg-nature-zaitun hover:bg-emerald-800 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider active:scale-95 shadow-sm transition-all"
        >
          ⚡ Cek Belanja Seminggu
        </button>
      </div>

      <!-- 3 Daily Meal Cards: Sarapan, Siang, Malam -->
      <div class="flex flex-col gap-3.5">
        <!-- Breakfast Card -->
        <div 
          v-for="slot in ['breakfast', 'lunch', 'dinner']" 
          :key="slot"
          class="bg-white border border-gray-150 rounded-[28px] p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
        >
          <div class="flex justify-between items-center border-b border-gray-100 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-lg leading-none">{{ getSlotIcon(slot) }}</span>
              <span class="text-xs font-black text-nature-forest uppercase tracking-wider">
                {{ getSlotLabel(slot) }}
              </span>
            </div>

            <!-- Stock & Allergen Status Badges -->
            <div class="flex items-center gap-1.5 flex-wrap justify-end">
              <!-- Allergen Warning Badge -->
              <span 
                v-if="checkRecipeAllergen(currentDayPlan.meals[slot]).length > 0"
                class="bg-rose-100 text-rose-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <span>⚠️</span>
                <span>Alergen: {{ checkRecipeAllergen(currentDayPlan.meals[slot]).join(', ') }}</span>
              </span>

              <span 
                v-if="checkRecipeStock(currentDayPlan.meals[slot]).isComplete"
                class="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <span>✅</span>
                <span>Bahan Lengkap</span>
              </span>
              <span 
                v-else
                class="bg-amber-100 text-amber-900 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <span>🛒</span>
                <span>Kurang {{ checkRecipeStock(currentDayPlan.meals[slot]).missing.length }} Bahan</span>
              </span>
            </div>
          </div>

          <!-- Recipe Details & Action -->
          <div class="flex justify-between items-center gap-3">
            <div class="flex-1">
              <h4 class="text-sm font-extrabold text-nature-forest leading-tight">
                {{ currentDayPlan.meals[slot] }}
              </h4>
              <p class="text-[9px] text-gray-400 font-bold mt-1">
                🔥 ~{{ getRecipeByTitle(currentDayPlan.meals[slot]).calories }} kkal &bull; ⏱️ {{ getRecipeByTitle(currentDayPlan.meals[slot]).prep_time }} mnt
              </p>

              <!-- Missing Ingredients Detail -->
              <div 
                v-if="!checkRecipeStock(currentDayPlan.meals[slot]).isComplete"
                class="mt-2 text-[9px] text-amber-800 font-medium bg-amber-50/70 p-2 rounded-xl flex flex-col gap-1"
              >
                <span class="font-bold">Bahan belum ada di kulkas:</span>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(m, idx) in checkRecipeStock(currentDayPlan.meals[slot]).missing" 
                    :key="idx"
                    class="bg-white border border-amber-200 px-1.5 py-0.5 rounded-md text-[8px] font-extrabold text-amber-900"
                  >
                    {{ m.name }} ({{ m.needed }} {{ m.unit }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons for this card -->
            <div class="flex flex-col gap-2 items-end">
              <button 
                @click="openRecipePicker(slot)"
                class="py-1.5 px-3 bg-nature-input hover:bg-gray-200 text-nature-forest font-black text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all shadow-xs flex items-center gap-1"
              >
                <span>🔄</span>
                <span>Ganti Menu</span>
              </button>

              <button 
                v-if="checkRecipeStock(currentDayPlan.meals[slot]).isComplete"
                @click="startCooking(currentDayPlan.meals[slot])"
                class="py-1.5 px-3 bg-nature-zaitun hover:bg-emerald-800 text-white font-black text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-1"
              >
                <span>🍳</span>
                <span>Masak Ini</span>
              </button>

              <button 
                v-else
                @click="addMissingToShoppingList(currentDayPlan.meals[slot])"
                class="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-wider rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-1"
              >
                <span>🛒</span>
                <span>+ Ke Belanja</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: DAFTAR BELANJA ==================== -->
    <div v-if="activeMainTab === 'belanja'" class="flex flex-col gap-4">
      <!-- Quick Add Bar -->
      <div class="bg-white border border-gray-150 rounded-[25px] p-3.5 shadow-sm flex flex-col gap-2">
        <span class="text-[9px] font-black uppercase tracking-wider text-gray-400">Tambah Bahan Belanjaan Manual:</span>
        <div class="flex gap-2">
          <input 
            v-model="manualItemName" 
            type="text" 
            placeholder="Misal: Daging Sapi, Santan, Wortel..."
            class="flex-1 bg-nature-cream border border-gray-150 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-zaitun"
            @keyup.enter="addManualShoppingItem"
          />
          <input 
            v-model.number="manualItemQty" 
            type="number" 
            min="1"
            class="w-16 bg-nature-cream border border-gray-150 px-2 py-2 rounded-xl text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-nature-zaitun"
          />
          <button 
            @click="addManualShoppingItem"
            class="bg-nature-zaitun hover:bg-emerald-800 text-white font-black text-xs px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all"
          >
            + Tambah
          </button>
        </div>
      </div>

      <!-- Shopping Checklist List -->
      <div class="bg-white border border-gray-150 rounded-[28px] p-4 shadow-sm flex flex-col gap-3">
        <div class="flex justify-between items-center border-b border-gray-100 pb-2">
          <div>
            <h4 class="text-xs font-black uppercase tracking-wider text-nature-forest">Checklist Belanjaan di Pasar</h4>
            <p class="text-[8px] text-gray-400 font-bold">Centang bahan yang sudah kamu beli!</p>
          </div>
          <span class="text-[10px] font-black text-nature-zaitun bg-nature-mint px-2.5 py-1 rounded-full">
            {{ store.shoppingList.filter(i => i.checked).length }} / {{ store.shoppingList.length }} Terbeli
          </span>
        </div>

        <!-- Empty state -->
        <div v-if="store.shoppingList.length === 0" class="text-center py-10 text-gray-400 text-xs flex flex-col items-center gap-2">
          <span class="text-3xl">🛒</span>
          <p class="font-bold">Daftar belanjaanmu masih kosong!</p>
          <p class="text-[9px]">Tekan "Cek Belanja Seminggu" di tab Jadwal untuk generate otomatis dari menu 7 hari.</p>
        </div>

        <!-- Items Loop -->
        <div v-else class="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
          <div 
            v-for="item in store.shoppingList" 
            :key="item.id"
            @click="store.toggleShoppingItem(item.id)"
            class="flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer select-none"
            :class="item.checked ? 'bg-emerald-50/70 border-emerald-200 opacity-60' : 'bg-gray-50/80 border-gray-150 hover:bg-gray-100'"
          >
            <div class="flex items-center gap-3">
              <input 
                type="checkbox" 
                :checked="item.checked"
                @click.stop="store.toggleShoppingItem(item.id)"
                class="w-4 h-4 rounded text-nature-zaitun accent-nature-zaitun cursor-pointer"
              />
              <div>
                <h5 
                  class="text-xs font-extrabold text-nature-forest leading-none"
                  :class="{ 'line-through text-gray-400': item.checked }"
                >
                  {{ item.name }}
                </h5>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[9px] text-gray-500 font-bold">{{ item.quantity }} {{ item.unit }}</span>
                  <span class="text-[8px] bg-white border border-gray-200 text-gray-500 font-extrabold px-1.5 py-0.2 rounded-md">
                    {{ item.recipe_title }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Delete action -->
            <button 
              @click.stop="store.removeFromShoppingList(item.id)" 
              class="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg transition-colors"
              title="Hapus"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Action: Transfer Checked to Fridge -->
        <div v-if="store.shoppingList.some(i => i.checked)" class="pt-2 border-t border-gray-100">
          <button 
            @click="transferToFridge"
            class="w-full py-3 bg-nature-zaitun hover:bg-emerald-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Masukkan Bahan Tercentang ke Kulkas Sekarang</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL: GANTI MENU ==================== -->
    <div v-if="isPickerOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] p-5 w-full max-w-md shadow-2xl flex flex-col gap-3.5 max-h-[85vh]">
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-gray-150 pb-2.5">
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-nature-forest">
              Pilih Menu {{ getSlotLabel(targetSlot) }} ({{ selectedDay }})
            </h3>
            <p class="text-[8px] text-gray-400 font-bold">Pilih resep katalog atau buat masakan kustom</p>
          </div>
          <button @click="isPickerOpen = false" class="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg">
            ✕
          </button>
        </div>

        <!-- Custom Dish Input -->
        <div class="bg-nature-cream p-2.5 rounded-2xl flex gap-2 items-center border border-gray-150">
          <input 
            v-model="customRecipeName"
            type="text" 
            placeholder="Tulis masakan kustom (mis: Soto Betawi)..."
            class="flex-1 bg-transparent text-xs font-bold text-nature-forest focus:outline-none"
            @keyup.enter="setCustomRecipe"
          />
          <button 
            @click="setCustomRecipe"
            class="bg-[#4D5C48] text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl active:scale-95 shadow-sm"
          >
            Pilih Kustom
          </button>
        </div>

        <!-- Search Bar for Catalog -->
        <div class="relative">
          <input 
            v-model="searchFilter"
            type="text" 
            placeholder="Cari resep katalog..."
            class="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-nature-zaitun"
          />
        </div>

        <!-- Recipe Catalog Grid -->
        <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[300px]">
          <div 
            v-for="recipe in filteredModalRecipes" 
            :key="recipe.id"
            @click="selectRecipeForSlot(recipe.title)"
            class="p-3 rounded-2xl border border-gray-150 hover:border-nature-zaitun bg-white hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer"
          >
            <div>
              <h5 class="text-xs font-extrabold text-nature-forest">{{ recipe.title }}</h5>
              <p class="text-[9px] text-gray-400 font-bold mt-0.5">
                🔥 {{ recipe.calories }} kkal &bull; {{ recipe.prep_time }} mnt
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <span 
                v-if="checkRecipeStock(recipe.title).isComplete"
                class="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-full"
              >
                ✅ Siap Masak
              </span>
              <span 
                v-else
                class="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full"
              >
                🛒 Butuh Beli
              </span>
              <span class="text-xs text-nature-zaitun font-black">➔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
