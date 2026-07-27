import { defineStore } from 'pinia'
import axios from 'axios'

// API base URL configuration (uses Vite server proxy)
const API_URL = '/api'

// Set up default axios headers from localStorage if token exists
const token = localStorage.getItem('auth_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const useAppStore = defineStore('app', {
  state: () => ({
    // Auth & User State
    user: JSON.parse(localStorage.getItem('auth_user')) || {
      id: 1,
      name: 'Budi Santoso',
      email: 'user@olahin.com',
      target_calories: 2000,
      target_carbs: 250,
      target_protein: 75,
      target_fat: 65,
      weight: 65,
      height: 170,
      age: 26
    },
    token: token || null,
    isOnline: false,
    loading: false,

    // App Data Cache
    fridgeItems: [],
    matchedRecipes: [],
    insights: {
      summary: {
        total_waste_saved_kg: 5.6,
        total_cost_saved_rp: 120000,
        meals_cooked_count: 7,
        carbon_reduction_kg: 14.0
      },
      chart_data: []
    },

    // Cooking Session State
    selectedRecipe: null,
    cookingSuccessData: null,

    // Categories
    categories: ['Semua', 'Daging & Telur', 'Sayuran', 'Bumbu', 'Minyak & Lemak', 'Protein Nabati', 'Buah', 'Lainnya']
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    // Group fridge items by category
    categorizedFridge: (state) => {
      const groups = { Semua: state.fridgeItems }
      state.fridgeItems.forEach(item => {
        const cat = item.category || 'Lainnya'
        if (!groups[cat]) groups[cat] = []
        groups[cat].push(item)
      })
      return groups
    }
  },

  actions: {
    // Check backend health
    async checkConnection() {
      try {
        const res = await axios.get(`${API_URL}/inventory`, { timeout: 2000 })
        if (res.data) {
          this.isOnline = true
          return true
        }
      } catch (e) {
        this.isOnline = false
      }
      return false
    },

    // Initialize app data
    async initApp() {
      await this.checkConnection()
      if (this.isAuthenticated) {
        await this.loadAllData()
      } else {
        this.loadOfflineData()
      }
    },

    // Load all data from Laravel or Offline Cache
    async loadAllData() {
      this.loading = true
      if (this.isOnline) {
        try {
          await Promise.all([
            this.loadFridge(),
            this.loadMatchedRecipes(),
            this.loadInsights()
          ])
        } catch (e) {
          console.error('Error loading data from Laravel. Falling back to local data.', e)
          this.loadOfflineData()
        } finally {
          this.loading = false
        }
      } else {
        this.loadOfflineData()
        this.loading = false
      }
    },

    // Load Fridge Items
    async loadFridge() {
      if (this.isOnline) {
        const res = await axios.get(`${API_URL}/inventory`)
        if (res.data.success) {
          this.fridgeItems = res.data.data
        }
      }
    },

    // Load Matched Recipes
    async loadMatchedRecipes() {
      if (this.isOnline) {
        const res = await axios.get(`${API_URL}/recipes/match`)
        if (res.data.success) {
          this.matchedRecipes = res.data.data
        }
      } else {
        this.calculateOfflineMatches()
      }
    },

    // Load Insights / Statistics
    async loadInsights() {
      if (this.isOnline) {
        const res = await axios.get(`${API_URL}/insight`)
        if (res.data.success) {
          this.insights = {
            summary: res.data.summary,
            chart_data: res.data.chart_data,
            today_nutrition: res.data.today_nutrition
          }
          if (res.data.user) {
            this.user = res.data.user
            localStorage.setItem('auth_user', JSON.stringify(this.user))
          }
        }
      }
    },

    // Auth Operations
    async login(email, password) {
      this.loading = true
      await this.checkConnection()

      if (this.isOnline) {
        try {
          const res = await axios.post(`${API_URL}/auth/login`, { email, password })
          if (res.data.success) {
            this.token = res.data.token
            this.user = res.data.user
            localStorage.setItem('auth_token', this.token)
            localStorage.setItem('auth_user', JSON.stringify(this.user))
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            await this.loadAllData()
            return { success: true }
          }
        } catch (e) {
          const msg = e.response?.data?.message || 'Gagal login.'
          return { success: false, message: msg }
        } finally {
          this.loading = false
        }
      } else {
        this.loading = false
        // Offline login simulation
        if (email === 'user@olahin.com' && password === 'password') {
          this.token = 'offline-token-123'
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('auth_user', JSON.stringify(this.user))
          this.loadOfflineData()
          return { success: true }
        }
        return { success: false, message: 'Koneksi Offline. Gunakan email: user@olahin.com dan password: password' }
      }
    },

    async register(name, email, password) {
      this.loading = true
      await this.checkConnection()

      if (this.isOnline) {
        try {
          const res = await axios.post(`${API_URL}/auth/register`, { name, email, password })
          if (res.data.success) {
            this.token = res.data.token
            this.user = res.data.user
            localStorage.setItem('auth_token', this.token)
            localStorage.setItem('auth_user', JSON.stringify(this.user))
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            await this.loadAllData()
            return { success: true }
          }
        } catch (e) {
          const msg = e.response?.data?.message || 'Registrasi gagal.'
          return { success: false, message: msg }
        } finally {
          this.loading = false
        }
      } else {
        this.loading = false
        // Offline register simulation
        this.user = {
          id: Date.now(),
          name,
          email,
          target_calories: 2000,
          target_carbs: 250,
          target_protein: 75,
          target_fat: 65,
          weight: 60,
          height: 165,
          age: 25
        }
        this.token = 'offline-token-123'
        localStorage.setItem('auth_token', this.token)
        localStorage.setItem('auth_user', JSON.stringify(this.user))
        this.loadOfflineData()
        return { success: true }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.fridgeItems = []
      this.matchedRecipes = []
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      delete axios.defaults.headers.common['Authorization']
    },

    // Update Profile
    async updateProfile(profileData) {
      this.loading = true
      if (this.isOnline) {
        try {
          const res = await axios.put(`${API_URL}/auth/user`, profileData)
          if (res.data.success) {
            this.user = res.data.user
            localStorage.setItem('auth_user', JSON.stringify(this.user))
            await this.loadInsights()
            return { success: true }
          }
        } catch (e) {
          console.error(e)
          return { success: false, message: 'Gagal memperbarui profil di server.' }
        } finally {
          this.loading = false
        }
      } else {
        // Offline local update
        this.user = { ...this.user, ...profileData }
        localStorage.setItem('auth_user', JSON.stringify(this.user))
        this.loading = false
        return { success: true }
      }
    },

    // Add Ingredient
    async addIngredient(item) {
      this.loading = true
      if (this.isOnline) {
        try {
          const res = await axios.post(`${API_URL}/inventory`, item)
          if (res.data.success) {
            await this.loadFridge()
            await this.loadMatchedRecipes()
            return { success: true }
          }
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      } else {
        // Local offline update
        const existingIdx = this.fridgeItems.findIndex(i => i.name.toLowerCase().trim() === item.name.toLowerCase().trim())
        if (existingIdx > -1) {
          this.fridgeItems[existingIdx].quantity += parseFloat(item.quantity)
          if (item.expiry_date < this.fridgeItems[existingIdx].expiry_date) {
            this.fridgeItems[existingIdx].expiry_date = item.expiry_date
          }
        } else {
          this.fridgeItems.push({
            id: Date.now(),
            ...item,
            quantity: parseFloat(item.quantity)
          })
        }
        this.calculateOfflineMatches()
        this.loading = false
        return { success: true }
      }
    },

    // Delete Ingredient
    async deleteIngredient(id) {
      if (this.isOnline) {
        try {
          const res = await axios.delete(`${API_URL}/inventory/${id}`)
          if (res.data.success) {
            await this.loadFridge()
            await this.loadMatchedRecipes()
          }
        } catch (e) {
          console.error(e)
        }
      } else {
        this.fridgeItems = this.fridgeItems.filter(item => item.id !== id)
        this.calculateOfflineMatches()
      }
    },

    // Cook Recipe
    async cookRecipe(recipeId) {
      this.loading = true
      if (this.isOnline) {
        try {
          const res = await axios.post(`${API_URL}/recipes/cook`, { recipe_id: recipeId })
          if (res.data.success) {
            this.cookingSuccessData = {
              recipe_title: this.selectedRecipe.title,
              waste_prevented: res.data.data.waste_prevented_kg,
              cost_saved: res.data.data.cost_saved_rp,
              ingredients_used: this.selectedRecipe.ingredients
            }
            await this.loadFridge()
            await this.loadMatchedRecipes()
            await this.loadInsights()
            return { success: true }
          }
        } catch (e) {
          console.error(e)
        } finally {
          this.loading = false
        }
      } else {
        // Local offline simulation
        let wastePreventedKg = 0.5
        let totalCostSaved = 15000

        // Auto-deduct ingredients from local fridge stock
        this.selectedRecipe.ingredients.forEach(recipeIng => {
          const ingLower = recipeIng.name.toLowerCase().trim()
          const stockItem = this.fridgeItems.find(item => item.name.toLowerCase().trim() === ingLower)
          if (stockItem) {
            stockItem.quantity -= recipeIng.quantity
          }
        })
        this.fridgeItems = this.fridgeItems.filter(item => item.quantity > 0)

        // Record offline stats
        this.cookingSuccessData = {
          recipe_title: this.selectedRecipe.title,
          waste_prevented: wastePreventedKg,
          cost_saved: totalCostSaved,
          ingredients_used: this.selectedRecipe.ingredients
        }

        // Add calories consumed offline to chart_data
        const today = new Date().toISOString().split('T')[0]
        const todayChartItem = this.insights.chart_data.find(c => c.date === today)
        if (todayChartItem) {
          todayChartItem.calories += this.selectedRecipe.calories
          todayChartItem.carbs += this.selectedRecipe.carbs
          todayChartItem.protein += this.selectedRecipe.protein
          todayChartItem.fat += this.selectedRecipe.fat
        }
        if (this.insights.today_nutrition) {
          this.insights.today_nutrition.calories += this.selectedRecipe.calories
          this.insights.today_nutrition.carbs += this.selectedRecipe.carbs
          this.insights.today_nutrition.protein += this.selectedRecipe.protein
          this.insights.today_nutrition.fat += this.selectedRecipe.fat
        }

        this.calculateOfflineMatches()
        this.loading = false
        return { success: true }
      }
    },

    // Load fallback data for standalone offline usage
    loadOfflineData() {
      const today = new Date()

      // Stock
      this.fridgeItems = [
        { id: 1, name: 'Telur', quantity: 6, unit: 'pcs', expiry_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Daging & Telur' },
        { id: 2, name: 'Bawang Merah', quantity: 150, unit: 'gr', expiry_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
        { id: 3, name: 'Bawang Putih', quantity: 80, unit: 'gr', expiry_date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
        { id: 4, name: 'Cabai Merah', quantity: 50, unit: 'gr', expiry_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
        { id: 5, name: 'Bayam', quantity: 300, unit: 'gr', expiry_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Sayuran' },
        { id: 6, name: 'Minyak Goreng', quantity: 1000, unit: 'ml', expiry_date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Minyak & Lemak' },
        { id: 7, name: 'Kecap Manis', quantity: 250, unit: 'ml', expiry_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
      ]

      // Weekly calories chart data fallback
      const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
      const chart_data = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const dayLabel = dayNames[(date.getDay() + 6) % 7]

        // Mock caloric intake values
        const seedCalories = [1750, 1920, 1550, 2050, 1800, 1650, 1240]
        const seedCarbs = [220, 240, 190, 260, 230, 210, 160]
        const seedProtein = [68, 72, 60, 80, 70, 65, 50]
        const seedFat = [58, 62, 45, 70, 60, 55, 40]

        chart_data.push({
          date: dateStr,
          day: dayLabel,
          waste_kg: i === 0 ? 0 : [0.8, 1.2, 0.4, 1.5, 0.6, 1.1][i % 6],
          cost_saved: i === 0 ? 0 : [18000, 24000, 12000, 30000, 15000, 22000][i % 6],
          calories: seedCalories[6 - i],
          carbs: seedCarbs[6 - i],
          protein: seedProtein[6 - i],
          fat: seedFat[6 - i]
        })
      }

      this.insights = {
        summary: {
          total_waste_saved_kg: 5.6,
          total_cost_saved_rp: 120000,
          meals_cooked_count: 7,
          carbon_reduction_kg: 14.0
        },
        chart_data,
        today_nutrition: {
          calories: 1240,
          carbs: 160,
          protein: 50,
          fat: 40
        }
      }

      this.calculateOfflineMatches()
    },

    // Offline Matching Engine (identical to Laravel matching)
    calculateOfflineMatches() {
      const recipes = [
        {
          id: 1,
          title: 'Nasi Goreng Telur',
          description: 'Resep nasi goreng sederhana khas rumahan yang gurih dan cepat disajikan.',
          prep_time: 15,
          calories: 450,
          carbs: 60,
          protein: 12,
          fat: 15,
          youtube_video_url: 'https://www.youtube.com/watch?v=i6yHVLgrELQ',
          youtube_id: 'i6yHVLgrELQ',
          ingredients: [
            { name: 'Telur', quantity: 1, unit: 'pcs' },
            { name: 'Bawang Merah', quantity: 15, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 15, unit: 'ml' },
            { name: 'Kecap Manis', quantity: 10, unit: 'ml' },
          ],
          steps: [
            "Panaskan 15ml minyak goreng di wajan dengan api sedang.",
            "Tumis irisan bawang merah dan bawang putih hingga harum dan layu.",
            "Masukkan telur, buat orak-arik hingga setengah matang.",
            "Masukkan nasi putih, aduk rata dengan bumbu dan telur.",
            "Tambahkan kecap manis dan garam secukupnya, aduk hingga matang merata."
          ]
        },
        {
          id: 2,
          title: 'Bayam Bening Segar',
          description: 'Sayur bayam kuah bening yang kaya serat dan sangat menyegarkan tubuh.',
          prep_time: 10,
          calories: 80,
          carbs: 12,
          protein: 4,
          fat: 1,
          youtube_video_url: 'https://www.youtube.com/watch?v=SId6rIr24O8',
          youtube_id: 'SId6rIr24O8',
          ingredients: [
            { name: 'Bayam', quantity: 200, unit: 'gr' },
            { name: 'Bawang Merah', quantity: 10, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 5, unit: 'gr' },
          ],
          steps: [
            "Didihkan 500ml air di panci kecil.",
            "Masukkan irisan bawang merah dan bawang putih ke dalam air mendidih.",
            "Masukkan daun bayam yang sudah dicuci bersih.",
            "Tambahkan garam dan sedikit gula, rebus sekitar 2-3 menit hingga bayam layu, lalu sajikan."
          ]
        },
        {
          id: 3,
          title: 'Telur Dadar Cabai',
          description: 'Telur dadar tebal dicampur irisan daun bawang dan cabai merah yang pedas nikmat.',
          prep_time: 10,
          calories: 210,
          carbs: 4,
          protein: 13,
          fat: 17,
          youtube_video_url: 'https://www.youtube.com/watch?v=6uKarev2O8w',
          youtube_id: '6uKarev2O8w',
          ingredients: [
            { name: 'Telur', quantity: 2, unit: 'pcs' },
            { name: 'Cabai Merah', quantity: 15, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 10, unit: 'ml' },
          ],
          steps: [
            "Kocok lepas 2 butir telur di mangkuk kecil.",
            "Masukkan irisan cabai merah dan sedikit garam, kocok hingga rata.",
            "Panaskan 10ml minyak goreng di wajan teflon.",
            "Tuang telur kocok, masak dengan api sedang hingga kecokelatan di kedua sisi."
          ]
        },
        {
          id: 4,
          title: 'Tumis Bayam Pedas',
          description: 'Tumis sayur bayam praktis dengan bumbu bawang dan cabai merah.',
          prep_time: 12,
          calories: 110,
          carbs: 10,
          protein: 5,
          fat: 6,
          youtube_video_url: 'https://www.youtube.com/watch?v=tjHi6ZVWapI',
          youtube_id: 'tjHi6ZVWapI',
          ingredients: [
            { name: 'Bayam', quantity: 250, unit: 'gr' },
            { name: 'Bawang Merah', quantity: 10, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 5, unit: 'gr' },
            { name: 'Cabai Merah', quantity: 15, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 10, unit: 'ml' },
          ],
          steps: [
            "Panaskan minyak goreng, tumis bawang merah, bawang putih, dan cabai merah hingga harum.",
            "Masukkan bayam yang sudah disiangi dan dicuci.",
            "Bumbui dengan garam dan sedikit penyedap rasa.",
            "Tumis cepat sekitar 2 menit dengan api besar agar bayam tetap segar, lalu angkat."
          ]
        }
      ]

      const stockMap = {}
      this.fridgeItems.forEach(item => {
        stockMap[item.name.toLowerCase().trim()] = item
      })

      const matched = []
      recipes.forEach(recipe => {
        let matchCount = 0
        const matchedList = []
        const missingList = []
        let minExpiryDays = 9999

        recipe.ingredients.forEach(recipeIng => {
          const nameLower = recipeIng.name.toLowerCase().trim()
          if (stockMap[nameLower]) {
            matchCount++
            const stockItem = stockMap[nameLower]

            const expiryDate = new Date(stockItem.expiry_date)
            const today = new Date()
            const diffTime = expiryDate - today
            const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            matchedList.push({
              name: recipeIng.name,
              qty_needed: recipeIng.quantity,
              qty_available: stockItem.quantity,
              unit: recipeIng.unit,
              days_until_expiry: expiryDays
            })

            if (expiryDays < minExpiryDays) {
              minExpiryDays = expiryDays
            }
          } else {
            missingList.push({
              name: recipeIng.name,
              qty_needed: recipeIng.quantity,
              unit: recipeIng.unit
            })
          }
        })

        const matchPct = Math.round((matchCount / recipe.ingredients.length) * 100)

        if (matchPct >= 50) {
          matched.push({
            ...recipe,
            match_percentage: matchPct,
            min_expiry_days: minExpiryDays === 9999 ? null : minExpiryDays,
            matched_ingredients: matchedList,
            missing_ingredients: missingList
          })
        }
      })

      // Sort
      matched.sort((a, b) => {
        if (b.match_percentage === a.match_percentage) {
          const daysA = a.min_expiry_days ?? 9999
          const daysB = b.min_expiry_days ?? 9999
          return daysA - daysB
        }
        return b.match_percentage - a.match_percentage
      })

      this.matchedRecipes = matched
    }
  }
})
