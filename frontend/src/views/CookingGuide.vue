<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store'
import { getRecipeImage, getRecipeYoutubeId, getRecipeYoutubeAppUrl } from '../utils/recipeMedia'

const router = useRouter()
const store = useAppStore()

const fallbackCookRecipe = {
  id: 1,
  title: 'Nasi Goreng Telur',
  steps: [
    "Panaskan 15ml minyak goreng di wajan dengan api sedang.",
    "Tumis irisan bawang merah dan bawang putih hingga harum dan layu.",
    "Masukkan telur, buat orak-arik hingga setengah matang.",
    "Masukkan nasi putih, aduk rata dengan bumbu dan telur.",
    "Tambahkan kecap manis dan garam secukupnya, aduk hingga matang merata."
  ],
  youtube_id: 'i6yHVLgrELQ',
  ingredients: [
    { name: 'Telur', quantity: 1, unit: 'pcs' },
    { name: 'Bawang Merah', quantity: 15, unit: 'gr' },
    { name: 'Bawang Putih', quantity: 10, unit: 'gr' }
  ]
}

const recipe = computed(() => {
  const sel = store.selectedRecipe || fallbackCookRecipe
  return {
    ...sel,
    image: sel.image || getRecipeImage(sel),
    youtube_id: getRecipeYoutubeId(sel),
    youtube_video_url: getRecipeYoutubeAppUrl(sel)
  }
})

const currentStep = ref(0)
const totalSteps = computed(() => recipe.value.steps?.length || 0)

// Countdown Timer State
const defaultTime = 120 // 2 minutes in seconds
const timeLeft = ref(defaultTime)
const timerInterval = ref(null)
const isTimerActive = ref(false)

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const startTimer = () => {
  if (isTimerActive.value) return
  isTimerActive.value = true
  timerInterval.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      pauseTimer()
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = audioCtx.createOscillator()
        osc.connect(audioCtx.destination)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.3)
      } catch (e) {
        console.log('Audio chime disabled')
      }
      alert('Waktu langkah memasak selesai!')
    }
  }, 1000)
}

const pauseTimer = () => {
  isTimerActive.value = false
  clearInterval(timerInterval.value)
  timerInterval.value = null
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = defaultTime
}

// Next / Prev step controls
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    resetTimer()
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
    resetTimer()
  } else {
    finishCooking()
  }
}

const finishCooking = () => {
  pauseTimer()
  router.push('/cooking-success')
}

// Video Modal State
const isVideoModalOpen = ref(false)
const openVideoModal = () => {
  isVideoModalOpen.value = true
}
const closeVideoModal = () => {
  isVideoModalOpen.value = false
}

const youtubeEmbedUrl = computed(() => {
  const videoId = recipe.value?.youtube_id || getRecipeYoutubeId(recipe.value)
  const origin = typeof window !== 'undefined' && window.location?.origin ? encodeURIComponent(window.location.origin) : ''
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1${origin ? `&origin=${origin}` : ''}`
})

onUnmounted(() => {
  clearInterval(timerInterval.value)
})
</script>

<template>
  <div class="flex-1 flex flex-col justify-between">
    <!-- Header -->
    <div class="flex items-center gap-1 pt-2">
      <button @click="router.push('/recipe-detail')" class="p-1 -ml-1 text-nature-forest hover:opacity-80">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h3 class="text-xs font-black text-nature-forest leading-none">{{ recipe.title }}</h3>
        <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Langkah {{ currentStep + 1 }} dari {{ totalSteps }}</p>
      </div>
    </div>

    <!-- LARGE DARK GREEN CARD (Matches Row 2, #1-5 mockup) -->
    <div class="flex-1 my-5 bg-[#4D5C48] text-white rounded-[30px] p-6 shadow-lg flex flex-col justify-between items-center text-center">
      <!-- Empty space to align text center vertically -->
      <div class="h-4"></div>

      <!-- Step text -->
      <div class="flex flex-col gap-3">
        <h4 class="text-sm font-black uppercase tracking-widest text-[#EBF0E9]/70">Langkah {{ currentStep + 1 }}</h4>
        <p class="text-base font-extrabold leading-relaxed px-2">
          {{ recipe.steps[currentStep] }}
        </p>
      </div>

      <!-- Large Countdown timer & Video triggers (inside card) -->
      <div class="flex flex-col items-center gap-4 w-full">
        <!-- Display large time -->
        <div class="text-5xl font-black tracking-widest text-white leading-none">
          {{ formatTime(timeLeft) }}
        </div>

        <!-- Timer / Video Actions -->
        <div class="flex flex-col gap-2.5 w-44">
          <button 
            v-if="!isTimerActive"
            @click="startTimer"
            class="py-2.5 bg-transparent border border-white rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all text-white flex justify-center items-center gap-1 shadow-sm"
          >
            ▶ Mulai Timer
          </button>
          <button 
            v-else
            @click="pauseTimer"
            class="py-2.5 bg-white text-nature-zaitun rounded-full text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex justify-center items-center gap-1 shadow-sm"
          >
            ⏸ Jeda Timer
          </button>
          
          <button 
            @click="openVideoModal"
            class="py-2.5 bg-transparent border border-white/50 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all text-white flex justify-center items-center gap-1 shadow-sm"
          >
            🎥 Lihat Video
          </button>
        </div>
      </div>

      <div class="h-4"></div>
    </div>

    <!-- Bottom navigation buttons (Matches mockup style) -->
    <div class="flex justify-between items-center gap-4 select-none">
      <button 
        @click="prevStep"
        :disabled="currentStep === 0"
        class="flex-1 py-2.5 bg-white border border-nature-zaitun/20 rounded-full font-black text-xs text-nature-zaitun hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-sm"
      >
        ◀ Mundur
      </button>

      <button 
        @click="nextStep"
        class="flex-1 py-2.5 bg-[#4D5C48] text-white font-black rounded-full shadow-md transition-all active:scale-95 text-xs flex justify-center items-center gap-1"
      >
        <span>{{ currentStep === totalSteps - 1 ? 'Selesai' : 'Lanjut ▶' }}</span>
      </button>
    </div>

    <!-- YouTube Video Modal (Overlay Popup) -->
    <div v-if="isVideoModalOpen" class="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-[30px] overflow-hidden w-full max-w-sm shadow-2xl flex flex-col">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-150">
          <span class="text-xs font-black text-nature-forest uppercase tracking-wider">Video Tutorial</span>
          <button @click="closeVideoModal" class="p-1 text-gray-400 hover:text-rose-500 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- IFrame wrapper -->
        <div class="aspect-video w-full bg-black">
          <iframe 
            class="w-full h-full"
            :src="youtubeEmbedUrl" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-4 bg-gray-50 flex flex-col gap-2.5">
          <div class="text-center">
            <p class="text-xs font-bold text-nature-slate leading-relaxed truncate">
              Menonton: {{ recipe.title }}
            </p>
            <p class="text-[10px] text-gray-400">
              Putar langsung di sini atau alihkan ke aplikasi YouTube.
            </p>
          </div>

          <a 
            :href="recipe.youtube_video_url || getRecipeYoutubeAppUrl(recipe)" 
            target="_blank" 
            rel="noopener noreferrer"
            class="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition"
          >
            <span>▶</span>
            <span>Buka di Aplikasi YouTube</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
