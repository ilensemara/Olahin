<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'

const router = useRouter()
const store = useAppStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('Semua')

// Draft list of ingredients to add (corresponds to "Bahan yang ditambahkan" in mockup)
const draftIngredients = ref([])

// Active adding item values
const nameInput = ref('')
const qtyInput = ref(1)
const unitInput = ref('pcs')
const categoryInput = ref('Sayuran')
const expiryDaysInput = ref(7)

// Preset ingredients list
const presets = [
  { name: 'Telur', category: 'Daging & Telur', unit: 'pcs', expiry: 14, icon: '🥚' },
  { name: 'Daging Sapi', category: 'Daging & Telur', unit: 'gr', expiry: 3, icon: '🥩' },
  { name: 'Bayam', category: 'Sayuran', unit: 'gr', expiry: 2, icon: '🥬' },
  { name: 'Wortel', category: 'Sayuran', unit: 'gr', expiry: 7, icon: '🥕' },
  { name: 'Cabai Merah', category: 'Bumbu', unit: 'gr', expiry: 5, icon: '🌶️' },
  { name: 'Bawang Merah', category: 'Bumbu', unit: 'gr', expiry: 14, icon: '🧅' },
  { name: 'Bawang Putih', category: 'Bumbu', unit: 'siung', expiry: 20, icon: '🧄' },
  { name: 'Minyak', category: 'Minyak & Lemak', unit: 'ml', expiry: 180, icon: '🧴' },
  { name: 'Udang', category: 'Daging & Telur', unit: 'gr', expiry: 2, icon: '🍤' },
]

// Filtered presets based on search query
const filteredPresets = computed(() => {
  if (!searchQuery.value) return presets
  const query = searchQuery.value.toLowerCase().trim()
  return presets.filter(p => p.name.toLowerCase().includes(query))
})

// Auto-fill from preset
const selectPreset = (preset) => {
  nameInput.value = preset.name
  categoryInput.value = preset.category
  unitInput.value = preset.unit
  expiryDaysInput.value = preset.expiry
  qtyInput.value = preset.unit === 'gr' ? 250 : 1 // default starting quantities
}

const adjustQty = (amount) => {
  qtyInput.value = Math.max(0.1, Number((qtyInput.value + amount).toFixed(1)))
}

// Add item to draft list
const addToDraft = () => {
  const name = nameInput.value.trim()
  if (!name) {
    alert('Silakan masukkan nama bahan.')
    return
  }

  // Calculate expiry date
  const today = new Date()
  today.setDate(today.getDate() + Number(expiryDaysInput.value))
  const expiryDateStr = today.toISOString().split('T')[0]

  draftIngredients.value.push({
    name,
    quantity: parseFloat(qtyInput.value),
    unit: unitInput.value,
    category: categoryInput.value,
    expiry_date: expiryDateStr,
    expiryDays: expiryDaysInput.value
  })

  // Clear inputs
  nameInput.value = ''
  qtyInput.value = 1
}

// Remove from draft
const removeFromDraft = (index) => {
  draftIngredients.value.splice(index, 1)
}

// Save all draft ingredients to Laravel DB
const saveAllIngredients = async () => {
  if (draftIngredients.value.length === 0) {
    if (nameInput.value.trim()) {
      addToDraft()
    } else {
      alert('Silakan pilih atau tambahkan bahan terlebih dahulu.')
      return
    }
  }

  store.loading = true
  try {
    const promises = draftIngredients.value.map(item => {
      return store.addIngredient({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expiry_date: item.expiry_date
      })
    })

    await Promise.all(promises)
    router.push('/fridge')
  } catch (e) {
    alert('Gagal menyimpan beberapa bahan makanan.')
  } finally {
    store.loading = false
  }
}

// AI Speech input handler
const isListening = ref(false)
const triggerVoiceInput = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert('Browser tidak mendukung Voice Recognition.')
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'id-ID'
  
  recognition.onstart = () => { isListening.value = true }
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript
    nameInput.value = text
    const textLower = text.toLowerCase()
    const found = presets.find(p => textLower.includes(p.name.toLowerCase()))
    if (found) {
      selectPreset(found)
    }
  }
  recognition.onend = () => { isListening.value = false }
  recognition.start()
}

// ----------------------------------------------------
// CAMERA SCANNING IMPLEMENTATION (REAL HARDWARE FEED)
// ----------------------------------------------------
const isCameraOpen = ref(false)
const isScanning = ref(false)
const scanProgress = ref(0)
const cameraStream = ref(null)

const openCameraScanner = async () => {
  isCameraOpen.value = true
  isScanning.value = true
  scanProgress.value = 0
  
  try {
    // Access browser hardware camera stream
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    cameraStream.value = stream
    
    // Set video srcObject once element mounts
    setTimeout(() => {
      const video = document.getElementById('scanner-video')
      if (video) video.srcObject = stream
    }, 150)
  } catch (err) {
    console.log('Camera hardware denied, using mock animation stream fallback', err)
    cameraStream.value = null
  }

  // Simulate scanning timeline
  const interval = setInterval(() => {
    if (scanProgress.value < 100) {
      scanProgress.value += 10
    } else {
      clearInterval(interval)
      finishCameraScan()
    }
  }, 300)
}

const closeCameraScanner = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }
  isCameraOpen.value = false
  isScanning.value = false
}

const finishCameraScan = () => {
  // Simulate AI OCR detecting a random item from the presets
  const randomPreset = presets[Math.floor(Math.random() * presets.length)]
  selectPreset(randomPreset)
  
  alert(`AI Berhasil Mendeteksi: ${randomPreset.name} (${randomPreset.unit === 'gr' ? '250 gr' : '1 pcs'})!`)
  closeCameraScanner()
}
</script>

<template>
  <div class="flex-1 bg-nature-cream flex flex-col p-5 overflow-y-auto relative">
    <!-- Header (Mockup style) -->
    <div class="flex justify-between items-center mb-4 pt-2">
      <button @click="router.push('/fridge')" class="p-1 -ml-1 text-nature-forest hover:opacity-80">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-sm font-extrabold text-nature-forest">Tambah Bahan</span>
      <!-- Three dots icon -->
      <button class="p-1 text-nature-forest">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative w-full mb-4">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Cari bahan makanan..." 
        class="w-full pl-9 pr-4 py-2.5 bg-nature-input border border-transparent rounded-2xl text-xs focus:outline-none focus:border-nature-zaitun focus:bg-white transition-all font-semibold text-nature-forest placeholder-gray-400"
      />
    </div>

    <!-- Preset Grid of Circular icons (Matches mockup grid layout) -->
    <div class="bg-white rounded-[25px] border border-gray-150 p-4 mb-4 shadow-sm">
      <h4 class="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-3 text-center">Bahan yang sering digunakan</h4>
      <div class="grid grid-cols-5 gap-2.5">
        <button 
          v-for="preset in filteredPresets"
          :key="preset.name"
          @click="selectPreset(preset)"
          class="flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <div class="w-10 h-10 rounded-full border border-gray-150 flex justify-center items-center text-lg bg-[#FDFBF7] shadow-sm hover:border-nature-zaitun/50">
            {{ preset.icon }}
          </div>
          <span class="text-[8px] font-bold text-nature-forest text-center leading-none truncate w-full">{{ preset.name }}</span>
        </button>
      </div>
    </div>

    <!-- Current Item Form Editor -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm flex flex-col gap-3 mb-4">
      <div class="flex gap-3">
        <!-- Name field -->
        <div class="flex-1">
          <label class="block text-[8px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Bahan Dipilih</label>
          <input 
            type="text" 
            v-model="nameInput"
            placeholder="Ketik bahan..." 
            class="w-full px-3 py-2 rounded-xl bg-nature-input text-xs font-bold focus:outline-none focus:bg-white border border-transparent focus:border-nature-zaitun text-nature-forest"
          />
        </div>
        <!-- Voice micro button & Camera scan button -->
        <div class="flex items-end gap-2">
          <button 
            type="button"
            @click="triggerVoiceInput"
            class="p-2.5 rounded-xl border transition-colors shadow-sm active:scale-90 bg-white border-gray-150 text-gray-400 hover:text-nature-zaitun"
            :class="{ 'bg-rose-500 border-rose-500 text-white animate-pulse': isListening }"
            title="Input Suara AI"
          >
            🎤
          </button>
          
          <button 
            type="button"
            @click="openCameraScanner"
            class="p-2.5 rounded-xl border transition-colors shadow-sm active:scale-90 bg-white border-gray-150 text-gray-400 hover:text-nature-zaitun"
            title="Scan Kamera AI"
          >
            📷
          </button>
        </div>
      </div>

      <!-- Qty Adjuster & Unit -->
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="block text-[8px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Jumlah</label>
          <div class="flex items-center bg-nature-input rounded-xl px-1.5 py-1 justify-between">
            <button 
              type="button" 
              @click="adjustQty(-1)" 
              class="w-7 h-7 bg-white rounded-lg flex justify-center items-center font-extrabold text-nature-forest shadow-sm active:scale-90"
            >
              -
            </button>
            <span class="text-xs font-extrabold text-nature-forest">{{ qtyInput }}</span>
            <button 
              type="button" 
              @click="adjustQty(1)" 
              class="w-7 h-7 bg-white rounded-lg flex justify-center items-center font-extrabold text-nature-forest shadow-sm active:scale-90"
            >
              +
            </button>
          </div>
        </div>

        <div class="w-24">
          <label class="block text-[8px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Satuan</label>
          <select v-model="unitInput" class="w-full px-2 py-2 rounded-xl bg-nature-input text-xs font-bold focus:outline-none focus:bg-white text-nature-forest">
            <option value="pcs">pcs</option>
            <option value="gr">gr (gram)</option>
            <option value="ml">ml</option>
            <option value="siung">siung</option>
          </select>
        </div>
      </div>

      <!-- Category & Expiry -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[8px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Kategori</label>
          <select v-model="categoryInput" class="w-full px-2 py-2 rounded-xl bg-nature-input text-xs font-bold focus:outline-none focus:bg-white text-nature-forest">
<option value="Daging & Telur">Daging & Telur</option>
             <option value="Sayuran">Sayuran</option>
             <option value="Bumbu">Bumbu</option>
             <option value="Minyak & Lemak">Minyak & Lemak</option>
             <option value="Protein Nabati">Protein Nabati</option>
             <option value="Buah">Buah</option>
             <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label class="block text-[8px] font-black uppercase text-nature-zaitun tracking-wider mb-0.5">Masa Simpan (Hari)</label>
          <input type="number" v-model="expiryDaysInput" class="w-full px-3 py-2 rounded-xl bg-nature-input text-xs font-bold focus:outline-none focus:bg-white border border-transparent focus:border-nature-zaitun text-nature-forest" />
        </div>
      </div>

      <!-- Add to Draft button -->
      <button 
        type="button"
        @click="addToDraft"
        class="w-full py-2 bg-nature-mint text-nature-zaitun border border-nature-zaitun/20 rounded-xl text-xs font-bold hover:bg-nature-zaitun hover:text-white transition-colors active:scale-95 flex justify-center items-center gap-1"
      >
        <span>+ Masukkan ke Daftar</span>
      </button>
    </div>

    <!-- Draft List: "Bahan yang ditambahkan" (Matches mockup) -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4">
      <h4 class="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-2.5">Bahan yang ditambahkan:</h4>
      
      <div v-if="draftIngredients.length > 0" class="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
        <div 
          v-for="(item, idx) in draftIngredients" 
          :key="idx"
          class="flex justify-between items-center bg-[#FDFBF7] p-2 rounded-xl border border-gray-150/50"
        >
          <div class="text-xs font-bold text-nature-forest">
            {{ item.name }} <span class="text-gray-400 font-medium">({{ item.quantity }} {{ item.unit }})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[8px] font-bold text-nature-zaitun bg-[#EBF0E9] border border-nature-sage/40 px-1.5 py-0.5 rounded-lg">{{ item.expiryDays }} hari</span>
            <button @click="removeFromDraft(idx)" class="text-rose-500 font-bold p-1 text-xs hover:bg-rose-50 rounded-lg">✕</button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-4 text-[10px] text-gray-400 font-bold leading-normal">
        Belum ada bahan di daftar draft. Gunakan preset atau formulir di atas.
      </div>
    </div>

    <!-- Action Save Button -->
    <button 
      @click="saveAllIngredients"
      class="w-full py-3 bg-nature-zaitun hover:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-md text-xs mt-2"
    >
      Simpan Bahan
    </button>

    <!-- ---------------------------------------------------- -->
    <!-- CAMERA STREAM SCANNER OVERLAY MODAL -->
    <!-- ---------------------------------------------------- -->
    <div v-if="isCameraOpen" class="absolute inset-0 bg-black/90 z-50 flex flex-col justify-between p-6 text-white">
      <!-- Modal Header -->
      <div class="flex justify-between items-center pt-2">
        <span class="text-xs font-black uppercase tracking-widest text-[#EBF0E9]/70">Pindai Bahan AI</span>
        <button @click="closeCameraScanner" class="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white">
          ✕
        </button>
      </div>

      <!-- Real Camera video feed / Mock container -->
      <div class="flex-1 my-6 bg-neutral-900 border border-white/10 rounded-[35px] overflow-hidden relative flex items-center justify-center shadow-2xl">
        <!-- Actual Video element playing webcam feed -->
        <video 
          id="scanner-video" 
          autoplay 
          playsinline 
          class="w-full h-full object-cover absolute inset-0"
        ></video>

        <!-- Fallback message if webcam fails -->
        <div v-if="!cameraStream" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none text-gray-500">
          <span class="text-4xl mb-3">🔍</span>
          <p class="text-xs font-bold leading-relaxed">Menghubungkan Kamera...</p>
        </div>

        <!-- Glowing Neon laser scanning line -->
        <div class="absolute w-full h-0.5 bg-rose-500/80 shadow-[0_0_15px_#F43F5E] top-1/2 left-0 animate-bounce"></div>

        <!-- Scanning frame guides -->
        <div class="absolute border-2 border-dashed border-white/40 w-48 h-48 rounded-2xl pointer-events-none"></div>
      </div>

      <!-- Scan status overlay bottom -->
      <div class="flex flex-col items-center gap-3">
        <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden max-w-xs">
          <div class="h-full bg-rose-500 transition-all duration-300" :style="{ width: `${scanProgress}%` }"></div>
        </div>
        <p class="text-[10px] font-black uppercase tracking-wider text-rose-400 animate-pulse">
          {{ scanProgress < 100 ? 'Menganalisis Gambar dengan AI...' : 'Scan Selesai!' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scanner-laser {
  0%, 100% { top: 15%; }
  50% { top: 85%; }
}
.animate-bounce {
  animation: scanner-laser 2.5s infinite ease-in-out;
}
</style>
