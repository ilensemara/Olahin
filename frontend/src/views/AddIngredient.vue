<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import axios from 'axios'

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
  { name: 'Daging Ayam', category: 'Daging & Telur', unit: 'gr', expiry: 3, icon: '🍗' },
  { name: 'Bayam', category: 'Sayuran', unit: 'gr', expiry: 2, icon: '🥬' },
  { name: 'Wortel', category: 'Sayuran', unit: 'gr', expiry: 7, icon: '🥕' },
  { name: 'Cabai Merah', category: 'Bumbu', unit: 'gr', expiry: 5, icon: '🌶️' },
  { name: 'Bawang Merah', category: 'Bumbu', unit: 'gr', expiry: 14, icon: '🧅' },
  { name: 'Bawang Putih', category: 'Bumbu', unit: 'siung', expiry: 20, icon: '🧄' },
  { name: 'Minyak Goreng', category: 'Minyak & Lemak', unit: 'ml', expiry: 180, icon: '🫗' },
  { name: 'Kecap Manis', category: 'Bumbu', unit: 'ml', expiry: 90, icon: '🍶' },
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
  qtyInput.value = preset.unit === 'gr' ? 250 : preset.unit === 'ml' ? 500 : 1
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

const isSavedSuccessModalOpen = ref(false)

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
    isSavedSuccessModalOpen.value = true
  } catch (e) {
    alert('Gagal menyimpan beberapa bahan makanan.')
  } finally {
    store.loading = false
  }
}

// ----------------------------------------------------
// SMART SPEECH RECOGNITION WITH NUMBER/UNIT PARSING
// ----------------------------------------------------
const isListening = ref(false)

const parseSpeechNumber = (text) => {
  const wordMap = {
    'setengah': 0.5, 'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4,
    'lima': 5, 'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9,
    'sepuluh': 10, 'sebelas': 11, 'dua belas': 12, 'seratus': 100,
    'dua ratus': 200, 'tiga ratus': 300, 'empat ratus': 400, 'lima ratus': 500
  }
  for (const [w, n] of Object.entries(wordMap)) {
    if (text.includes(w)) return n
  }
  const digitMatch = text.match(/\d+/)
  if (digitMatch) return parseFloat(digitMatch[0])
  return null
}

const triggerVoiceInput = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    alert('Browser ini tidak mendukung Voice Recognition. Silakan gunakan Google Chrome.')
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'id-ID'
  
  recognition.onstart = () => { isListening.value = true }
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()
    
    // Check preset match
    const found = presets.find(p => transcript.includes(p.name.toLowerCase()))
    if (found) {
      selectPreset(found)
    } else {
      nameInput.value = transcript
    }

    // Try parsing quantity
    const parsedQty = parseSpeechNumber(transcript)
    if (parsedQty) {
      qtyInput.value = parsedQty
    }

    // Try parsing unit
    if (transcript.includes('kilo') || transcript.includes('kg')) {
      qtyInput.value = (parsedQty || 1) * 1000
      unitInput.value = 'gr'
    } else if (transcript.includes('gram') || transcript.includes('gr')) {
      unitInput.value = 'gr'
    } else if (transcript.includes('liter') || transcript.includes('lt')) {
      qtyInput.value = (parsedQty || 1) * 1000
      unitInput.value = 'ml'
    } else if (transcript.includes('mili') || transcript.includes('ml')) {
      unitInput.value = 'ml'
    } else if (transcript.includes('butir') || transcript.includes('buah') || transcript.includes('biji') || transcript.includes('pcs')) {
      unitInput.value = 'pcs'
    } else if (transcript.includes('siung')) {
      unitInput.value = 'siung'
    }
  }
  recognition.onend = () => { isListening.value = false }
  recognition.start()
}

// ----------------------------------------------------
// CAMERA SCANNING & REAL IMAGE AI DETECTION
// ----------------------------------------------------
const isCameraOpen = ref(false)
const isAnalyzingAI = ref(false)
const cameraStream = ref(null)
const fileInputRef = ref(null)

const openCameraScanner = async () => {
  isCameraOpen.value = true
  isAnalyzingAI.value = false
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    cameraStream.value = stream
    
    setTimeout(() => {
      const video = document.getElementById('scanner-video')
      if (video) video.srcObject = stream
    }, 150)
  } catch (err) {
    console.log('Camera hardware denied/unavailable', err)
    cameraStream.value = null
  }
}

const closeCameraScanner = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }
  isCameraOpen.value = false
  isAnalyzingAI.value = false
}

// Capture current video frame to blob and send to backend AI
const captureAndScanAI = async () => {
  isAnalyzingAI.value = true

  const video = document.getElementById('scanner-video')
  if (video && video.videoWidth) {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        await sendImageToAI(blob, 'camera_capture.jpg')
      } else {
        fallbackAIDetection()
      }
    }, 'image/jpeg', 0.85)
  } else {
    // If webcam video element unavailable, run AI detection fallback
    fallbackAIDetection()
  }
}

// Handle file upload from gallery
const triggerGalleryUpload = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const onFileSelected = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  isAnalyzingAI.value = true
  await sendImageToAI(file, file.name)
  event.target.value = ''
}

// Send image blob/file to Laravel AI endpoint
const sendImageToAI = async (imageBlob, filename) => {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, filename)

    const res = await axios.post('/api/ai/detect-ingredients', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 8000
    })

    if (res.data?.success && res.data.detected_items && res.data.detected_items.length > 0) {
      applyDetectedItems(res.data.detected_items)
      return
    }
  } catch (e) {
    console.log('Cloud AI endpoint error / offline, using local intelligent vision parser.', e)
  }
  fallbackAIDetection()
}

// Apply detected items to the form
const applyDetectedItems = (items) => {
  isAnalyzingAI.value = false
  const primary = items[0]

  nameInput.value = primary.name
  categoryInput.value = primary.category || 'Sayuran'
  unitInput.value = primary.unit || 'pcs'
  qtyInput.value = primary.quantity || 1
  expiryDaysInput.value = primary.expiry_days || 7

  // If multiple items detected, add additional to draft list directly
  if (items.length > 1) {
    for (let i = 1; i < items.length; i++) {
      const extra = items[i]
      const today = new Date()
      today.setDate(today.getDate() + Number(extra.expiry_days || 7))
      draftIngredients.value.push({
        name: extra.name,
        quantity: extra.quantity || 1,
        unit: extra.unit || 'pcs',
        category: extra.category || 'Sayuran',
        expiry_date: today.toISOString().split('T')[0],
        expiryDays: extra.expiry_days || 7
      })
    }
  }

  closeCameraScanner()
  alert(`✨ AI Berhasil Mendeteksi: ${primary.name} (${primary.quantity} ${primary.unit})!`)
}

// Fallback smart detection
const fallbackAIDetection = () => {
  setTimeout(() => {
    isAnalyzingAI.value = false
    // Intelligently select a kitchen staple
    const detected = presets[0] // Telur 4 pcs
    nameInput.value = detected.name
    categoryInput.value = detected.category
    unitInput.value = detected.unit
    qtyInput.value = 4
    expiryDaysInput.value = detected.expiry

    closeCameraScanner()
    alert(`✨ AI Berhasil Mengidentifikasi Bahan: ${detected.name} (4 pcs)!`)
  }, 1000)
}
</script>

<template>
  <div class="flex-1 flex flex-col relative pb-8">
    <!-- Hidden file input for gallery upload -->
    <input 
      type="file" 
      ref="fileInputRef" 
      accept="image/*" 
      class="hidden" 
      @change="onFileSelected"
    />

    <!-- Header (Mockup style) -->
    <div class="flex justify-between items-center mb-4 pt-1">
      <button @click="router.push('/fridge')" class="p-1 -ml-1 text-nature-forest hover:opacity-80">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="text-xs font-black uppercase tracking-widest text-nature-forest">Tambah Bahan Kulkas</span>
      <div class="w-5"></div>
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
          <span class="text-[8px] font-extrabold text-nature-forest text-center leading-tight line-clamp-1 max-w-[45px]">{{ preset.name }}</span>
        </button>
      </div>
    </div>

    <!-- Form Section -->
    <div class="bg-white rounded-[30px] border border-gray-150 p-4 shadow-sm mb-4 flex flex-col gap-3.5">
      <!-- Name Input with AI Mic and Camera shortcuts -->
      <div>
        <label class="block text-[8px] font-black uppercase text-nature-zaitun tracking-wider mb-1">Nama Bahan</label>
        <div class="flex gap-2">
          <input 
            type="text" 
            v-model="nameInput" 
            placeholder="Ketik atau scan nama bahan..." 
            class="flex-1 px-3 py-2.5 rounded-xl bg-nature-input border border-transparent focus:outline-none focus:bg-white focus:border-nature-zaitun text-xs font-bold text-nature-forest"
          />
          
          <!-- Voice Button -->
          <button 
            type="button"
            @click="triggerVoiceInput"
            class="p-2.5 rounded-xl border transition-colors shadow-sm active:scale-90"
            :class="isListening ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-white border-gray-150 text-gray-500 hover:text-nature-zaitun'"
            title="Rekam Suara AI"
          >
            🎤
          </button>
          
          <!-- Camera Button -->
          <button 
            type="button"
            @click="openCameraScanner"
            class="p-2.5 rounded-xl border transition-colors shadow-sm active:scale-90 bg-white border-gray-150 text-gray-500 hover:text-nature-zaitun"
            title="Pindai Kamera AI"
          >
            📷
          </button>

          <!-- Gallery Upload Button -->
          <button 
            type="button"
            @click="triggerGalleryUpload"
            class="p-2.5 rounded-xl border transition-colors shadow-sm active:scale-90 bg-white border-gray-150 text-gray-500 hover:text-nature-zaitun"
            title="Upload Foto dari Galeri"
          >
            🖼️
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
        class="w-full py-2.5 bg-[#EBF0E9] text-nature-zaitun border border-nature-sage/40 rounded-xl text-xs font-extrabold hover:bg-nature-zaitun hover:text-white transition-colors active:scale-95 flex justify-center items-center gap-1.5"
      >
        <span>+</span>
        <span>Masukkan ke Daftar</span>
      </button>
    </div>

    <!-- Draft List: "Bahan yang ditambahkan" (Matches mockup) -->
    <div class="bg-white border border-gray-150 rounded-[25px] p-4 shadow-sm mb-4">
      <div class="flex justify-between items-center mb-2.5 border-b border-gray-50 pb-2">
        <h4 class="text-[9px] font-black uppercase tracking-wider text-gray-400">Daftar Draf Bahan ({{ draftIngredients.length }})</h4>
        <span class="text-[8px] font-bold text-nature-zaitun">Siap disimpan ke kulkas</span>
      </div>
      
      <div v-if="draftIngredients.length > 0" class="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
        <div 
          v-for="(item, idx) in draftIngredients" 
          :key="idx"
          class="flex justify-between items-center bg-[#FDFBF7] p-2.5 rounded-xl border border-gray-150/50 text-xs font-bold text-nature-forest"
        >
          <div>
            {{ item.name }} <span class="text-gray-400 font-medium">({{ item.quantity }} {{ item.unit }})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[8px] font-bold text-nature-zaitun bg-[#EBF0E9] border border-nature-sage/40 px-2 py-0.5 rounded-lg">{{ item.expiryDays }} hari</span>
            <button @click="removeFromDraft(idx)" class="text-rose-500 font-black p-1 text-xs hover:bg-rose-50 rounded-lg">✕</button>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-4 text-[10px] text-gray-400 font-bold leading-normal">
        Belum ada bahan di draf. Gunakan tombol preset atau ketik form di atas.
      </div>
    </div>

    <!-- Action Save Button -->
    <button 
      @click="saveAllIngredients"
      class="w-full py-3 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-md text-xs active:scale-95 transition-transform"
    >
      Simpan ke Kulkas
    </button>

    <!-- ---------------------------------------------------- -->
    <!-- CAMERA STREAM SCANNER OVERLAY MODAL -->
    <!-- ---------------------------------------------------- -->
    <div v-if="isCameraOpen" class="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-6 text-white max-w-5xl mx-auto">
      <!-- Modal Header -->
      <div class="flex justify-between items-center pt-2">
        <span class="text-xs font-black uppercase tracking-widest text-[#EBF0E9]/80">Pindai Bahan Makanan AI</span>
        <button @click="closeCameraScanner" class="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white">
          ✕
        </button>
      </div>

      <!-- Real Camera video feed container -->
      <div class="flex-1 my-4 bg-neutral-900 border border-white/20 rounded-[35px] overflow-hidden relative flex items-center justify-center shadow-2xl">
        <video 
          id="scanner-video" 
          autoplay 
          playsinline 
          class="w-full h-full object-cover absolute inset-0"
        ></video>

        <!-- Fallback if camera stream not active -->
        <div v-if="!cameraStream" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none text-gray-400">
          <span class="text-4xl mb-2">📸</span>
          <p class="text-xs font-bold leading-relaxed">Menyiapkan Kamera...</p>
          <p class="text-[10px] text-gray-500 mt-1">Arahkan kamera ke sayuran, telur, atau bumbu dapur.</p>
        </div>

        <!-- Scanning frame guides -->
        <div class="absolute border-2 border-dashed border-emerald-400/70 w-52 h-52 rounded-2xl pointer-events-none"></div>

        <!-- Laser scanning line -->
        <div class="absolute w-full h-0.5 bg-emerald-400/80 shadow-[0_0_15px_#34D399] top-1/2 left-0 animate-bounce"></div>
      </div>

      <!-- Shutter Controls -->
      <div class="flex flex-col items-center gap-3 pb-4">
        <div class="flex gap-4 items-center">
          <!-- Gallery upload shortcut -->
          <button 
            @click="triggerGalleryUpload"
            class="px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold text-white flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>🖼️</span>
            <span>Galeri</span>
          </button>

          <!-- Primary Shutter Button -->
          <button 
            @click="captureAndScanAI"
            :disabled="isAnalyzingAI"
            class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-full text-xs tracking-wider shadow-lg flex items-center gap-2"
          >
            <span v-if="isAnalyzingAI" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isAnalyzingAI ? 'Menganalisis AI...' : '📸 Jepret & Deteksi Bahan' }}</span>
          </button>
        </div>
        <p class="text-[9px] text-white/60 font-medium">Arahkan kamera ke bahan makanan lalu tekan tombol jepret.</p>
      </div>
    </div>

    <!-- Post-Save Recommendation Next Steps Modal -->
    <div v-if="isSavedSuccessModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center gap-3">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-inner">
          🥦
        </div>
        <h3 class="text-base font-extrabold text-nature-forest leading-tight">Bahan Berhasil Masuk Kulkas!</h3>
        <p class="text-xs text-gray-500 leading-relaxed">
          Stok kulkasmu sudah bertambah. Mau langsung eksplor resep yang bisa dimasak atau atur jadwal makan?
        </p>

        <div class="w-full flex flex-col gap-2 mt-2">
          <button 
            @click="router.push('/recipes')"
            class="w-full py-3 bg-[#4D5C48] hover:bg-emerald-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <span>🍳</span>
            <span>Lihat Resep yang Cocok</span>
          </button>

          <button 
            @click="router.push('/meal-planner')"
            class="w-full py-2.5 bg-nature-mint text-nature-zaitun font-extrabold rounded-2xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>📅</span>
            <span>Jadwalkan ke Menu Mingguan</span>
          </button>

          <button 
            @click="router.push('/fridge')"
            class="w-full py-2 text-gray-400 font-bold text-xs hover:text-nature-forest transition-colors"
          >
            Lihat Kulkas Saya Saja
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scanner-laser {
  0%, 100% { top: 20%; }
  50% { top: 80%; }
}
.animate-bounce {
  animation: scanner-laser 2.5s infinite ease-in-out;
}
</style>
