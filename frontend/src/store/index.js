import { defineStore } from 'pinia'
import axios from 'axios'
import { getRecipeImage, getRecipeYoutubeId, getRecipeYoutubeAppUrl } from '../utils/recipeMedia'

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
    user: (() => {
      try {
        const item = localStorage.getItem('auth_user')
        if (item && item !== 'undefined' && item !== 'null') {
          return JSON.parse(item)
        }
      } catch (e) {}
      return {
        id: 1,
        name: 'Budi Santoso',
        username: 'budisantoso',
        email: 'user@olahin.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        target_calories: 2000,
        target_carbs: 250,
        target_protein: 75,
        target_fat: 65,
        weight: 65,
        height: 170,
        age: 26,
        gender: 'male',
        health_goal: 'maintain', // 'lose_weight' | 'maintain' | 'gain_weight'
        allergies: [] // e.g. ['Telur', 'Kacang', 'Seafood', 'Susu', 'Gluten', 'Pedas']
      }
    })(),
    token: token || null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isBackendConnected: false,
    loading: false,

    // App Data Cache (persisted in localStorage for robust offline PWA experience)
    fridgeItems: (() => {
      try {
        const saved = localStorage.getItem('olahin_fridge_items')
        if (saved) return JSON.parse(saved)
      } catch (e) {}
      return []
    })(),
    matchedRecipes: [],
    insights: (() => {
      try {
        const saved = localStorage.getItem('olahin_insights')
        if (saved) return JSON.parse(saved)
      } catch (e) {}
      return {
        summary: {
          total_waste_saved_kg: 5.6,
          total_cost_saved_rp: 120000,
          meals_cooked_count: 7,
          carbon_reduction_kg: 14.0
        },
        chart_data: [],
        today_nutrition: {
          calories: 1240,
          carbs: 160,
          protein: 50,
          fat: 40
        },
        today_meals: [],
        recent_meals: []
      }
    })(),

    // Cooking Session State
    selectedRecipe: (() => {
      try {
        return JSON.parse(localStorage.getItem('olahin_selected_recipe') || 'null')
      } catch (e) {
        return null
      }
    })(),
    cookingSuccessData: (() => {
      try {
        return JSON.parse(localStorage.getItem('olahin_cooking_success') || 'null')
      } catch (e) {
        return null
      }
    })(),

    // Weekly Meal Planner State
    mealPlan: (() => {
      try {
        const saved = localStorage.getItem('olahin_meal_plan')
        if (saved) return JSON.parse(saved)
      } catch (e) {}
      return [
        { day: 'Senin', meals: { breakfast: 'Nasi Goreng Telur', lunch: 'Bayam Bening Segar', dinner: 'Telur Dadar Cabai' } },
        { day: 'Selasa', meals: { breakfast: 'Telur Dadar Cabai', lunch: 'Tumis Bayam Pedas', dinner: 'Nasi Goreng Telur' } },
        { day: 'Rabu', meals: { breakfast: 'Nasi Goreng Telur', lunch: 'Sop Ayam Wortel', dinner: 'Tempe Orek Manis Pedas' } },
        { day: 'Kamis', meals: { breakfast: 'Telur Dadar Cabai', lunch: 'Capcay Sayur Gurih', dinner: 'Bayam Bening Segar' } },
        { day: 'Jumat', meals: { breakfast: 'Nasi Goreng Telur', lunch: 'Ayam Goreng Lengkuas', dinner: 'Tumis Bayam Pedas' } },
        { day: 'Sabtu', meals: { breakfast: 'Telur Dadar Cabai', lunch: 'Soto Ayam Lamongan', dinner: 'Tahu Telur Bumbu Petis' } },
        { day: 'Minggu', meals: { breakfast: 'Nasi Goreng Telur', lunch: 'Sop Ayam Wortel', dinner: 'Tumis Buncis Jagung Manis' } }
      ]
    })(),

    // Smart Shopping List State (Items to buy)
    shoppingList: (() => {
      try {
        const saved = localStorage.getItem('olahin_shopping_list')
        if (saved) return JSON.parse(saved)
      } catch (e) {}
      return [
        { id: 1, name: 'Daging Ayam', quantity: 500, unit: 'gr', checked: false, recipe_title: 'Sop Ayam Wortel', category: 'Daging & Telur' },
        { id: 2, name: 'Wortel', quantity: 250, unit: 'gr', checked: false, recipe_title: 'Sop Ayam Wortel', category: 'Sayuran' },
        { id: 3, name: 'Tempe', quantity: 1, unit: 'papan', checked: false, recipe_title: 'Tempe Orek Manis Pedas', category: 'Protein Nabati' },
        { id: 4, name: 'Kembang Kol', quantity: 200, unit: 'gr', checked: false, recipe_title: 'Capcay Sayur Gurih', category: 'Sayuran' }
      ]
    })(),

    allRecipes: [],

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
    // Storage persistence helpers
    saveFridgeToStorage() {
      try {
        localStorage.setItem('olahin_fridge_items', JSON.stringify(this.fridgeItems))
      } catch (e) {
        console.error('Failed to save fridge to storage', e)
      }
    },

    saveInsightsToStorage() {
      try {
        localStorage.setItem('olahin_insights', JSON.stringify(this.insights))
      } catch (e) {
        console.error('Failed to save insights to storage', e)
      }
    },

    // Check backend health & network
    async checkConnection() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.isOnline = false
        this.isBackendConnected = false
        return false
      }
      this.isOnline = true

      try {
        const res = await axios.get(`${API_URL}/inventory`, { timeout: 4000 })
        if (res.data) {
          this.isBackendConnected = true
          return true
        }
      } catch (e) {
        this.isBackendConnected = false
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
          this.saveFridgeToStorage()
        }
      }
    },

    // Load Matched Recipes
    async loadMatchedRecipes() {
      if (this.isOnline) {
        const res = await axios.get(`${API_URL}/recipes/match`)
        if (res.data.success) {
          this.matchedRecipes = (res.data.data || []).map(r => ({
            ...r,
            image: r.image || getRecipeImage(r),
            youtube_id: getRecipeYoutubeId(r),
            youtube_video_url: getRecipeYoutubeAppUrl(r)
          }))
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
            today_nutrition: res.data.today_nutrition,
            today_meals: res.data.today_meals || [],
            recent_meals: res.data.recent_meals || []
          }
          this.saveInsightsToStorage()
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
        this.loadEmptyData()
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
        this.saveFridgeToStorage()
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
        this.saveFridgeToStorage()
        this.calculateOfflineMatches()
      }
    },

    // Update Ingredient Quantity
    async updateIngredientQuantity(id, quantity) {
      if (this.isOnline) {
        try {
          await axios.put(`${API_URL}/inventory/${id}`, { quantity })
        } catch (e) {
          console.error(e)
        }
      }
      const item = this.fridgeItems.find(i => i.id === id)
      if (item) {
        item.quantity = quantity
        this.saveFridgeToStorage()
        this.calculateOfflineMatches()
      }
    },

    // Meal Planner Actions
    setMealPlan(dayName, slot, recipeTitle) {
      const dayItem = this.mealPlan.find(d => d.day === dayName)
      if (dayItem) {
        dayItem.meals[slot] = recipeTitle
        localStorage.setItem('olahin_meal_plan', JSON.stringify(this.mealPlan))
      }
    },

    // Shopping List Actions
    addToShoppingList(item) {
      const existing = this.shoppingList.find(i => i.name.toLowerCase().trim() === item.name.toLowerCase().trim())
      if (existing) {
        existing.quantity += (item.quantity || item.qty_needed || 1)
      } else {
        this.shoppingList.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: item.name,
          quantity: item.quantity || item.qty_needed || 1,
          unit: item.unit || 'pcs',
          checked: false,
          recipe_title: item.recipe_title || 'Bahan Kebutuhan',
          category: item.category || 'Sayuran'
        })
      }
      localStorage.setItem('olahin_shopping_list', JSON.stringify(this.shoppingList))
    },

    removeFromShoppingList(id) {
      this.shoppingList = this.shoppingList.filter(item => item.id !== id)
      localStorage.setItem('olahin_shopping_list', JSON.stringify(this.shoppingList))
    },

    toggleShoppingItem(id) {
      const item = this.shoppingList.find(i => i.id === id)
      if (item) {
        item.checked = !item.checked
        localStorage.setItem('olahin_shopping_list', JSON.stringify(this.shoppingList))
      }
    },

    // Transfer all checked items in shopping list directly into fridge stock
    transferBoughtItemsToFridge() {
      const checkedItems = this.shoppingList.filter(i => i.checked)
      if (checkedItems.length === 0) return 0

      const today = new Date()
      checkedItems.forEach(bought => {
        const existingStock = this.fridgeItems.find(f => f.name.toLowerCase().trim() === bought.name.toLowerCase().trim())
        if (existingStock) {
          existingStock.quantity += bought.quantity
        } else {
          // Default expiry 7 days from today
          const expiryDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          this.fridgeItems.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: bought.name,
            quantity: bought.quantity,
            unit: bought.unit,
            expiry_date: expiryDate,
            category: bought.category || 'Lainnya'
          })
        }
      })

      // Remove checked from shopping list
      this.shoppingList = this.shoppingList.filter(i => !i.checked)
      localStorage.setItem('olahin_shopping_list', JSON.stringify(this.shoppingList))
      this.saveFridgeToStorage()
      this.calculateOfflineMatches()
      return checkedItems.length
    },

    // Auto-generate missing ingredients across all planned meals
    autoGenerateWeeklyShoppingList() {
      const stockMap = {}
      this.fridgeItems.forEach(item => {
        stockMap[item.name.toLowerCase().trim()] = item.quantity
      })

      const plannedTitles = new Set()
      this.mealPlan.forEach(d => {
        Object.values(d.meals).forEach(title => {
          if (title) plannedTitles.add(title.toLowerCase().trim())
        })
      })

      let addedCount = 0
      this.allRecipes.forEach(recipe => {
        if (plannedTitles.has(recipe.title.toLowerCase().trim())) {
          recipe.ingredients.forEach(ing => {
            const nameLower = ing.name.toLowerCase().trim()
            const availableQty = stockMap[nameLower] || 0
            if (availableQty < ing.quantity) {
              const needed = ing.quantity - availableQty
              const alreadyInList = this.shoppingList.some(s => s.name.toLowerCase().trim() === ing.name.toLowerCase().trim())
              if (!alreadyInList) {
                this.addToShoppingList({
                  name: ing.name,
                  quantity: needed,
                  unit: ing.unit,
                  recipe_title: recipe.title
                })
                addedCount++
              }
            }
          })
        }
      })
      return addedCount
    },

    // Set selected recipe with persistent storage and enriched media
    setSelectedRecipe(recipe) {
      if (recipe) {
        const enriched = {
          ...recipe,
          image: recipe.image || getRecipeImage(recipe),
          youtube_id: getRecipeYoutubeId(recipe),
          youtube_video_url: getRecipeYoutubeAppUrl(recipe)
        }
        this.selectedRecipe = enriched
        localStorage.setItem('olahin_selected_recipe', JSON.stringify(enriched))
      } else {
        this.selectedRecipe = null
        localStorage.removeItem('olahin_selected_recipe')
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
            localStorage.setItem('olahin_cooking_success', JSON.stringify(this.cookingSuccessData))
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
        this.saveFridgeToStorage()

        // Record offline stats
        this.cookingSuccessData = {
          recipe_title: this.selectedRecipe.title,
          waste_prevented: wastePreventedKg,
          cost_saved: totalCostSaved,
          ingredients_used: this.selectedRecipe.ingredients
        }
        localStorage.setItem('olahin_cooking_success', JSON.stringify(this.cookingSuccessData))

        // Update summary metrics
        if (!this.insights.summary) {
          this.insights.summary = { total_waste_saved_kg: 0, total_cost_saved_rp: 0, meals_cooked_count: 0, carbon_reduction_kg: 0 }
        }
        this.insights.summary.meals_cooked_count = (this.insights.summary.meals_cooked_count || 0) + 1
        this.insights.summary.total_waste_saved_kg = Number(((this.insights.summary.total_waste_saved_kg || 0) + wastePreventedKg).toFixed(2))
        this.insights.summary.total_cost_saved_rp = (this.insights.summary.total_cost_saved_rp || 0) + totalCostSaved
        this.insights.summary.carbon_reduction_kg = Number((this.insights.summary.total_waste_saved_kg * 2.5).toFixed(2))

        // Add to today_meals and recent_meals
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        const todayStr = now.toISOString().split('T')[0]
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
        const dayLabel = dayNames[now.getDay()]

        const cookedMealEntry = {
          id: Date.now(),
          title: this.selectedRecipe.title,
          calories: this.selectedRecipe.calories,
          carbs: this.selectedRecipe.carbs || 35,
          protein: this.selectedRecipe.protein || 12,
          fat: this.selectedRecipe.fat || 10,
          time: timeStr,
          date: todayStr,
          day: dayLabel,
          waste_prevented_kg: wastePreventedKg,
          cost_saved_rp: totalCostSaved
        }

        if (!this.insights.today_meals) this.insights.today_meals = []
        this.insights.today_meals.unshift(cookedMealEntry)

        if (!this.insights.recent_meals) this.insights.recent_meals = []
        this.insights.recent_meals.unshift(cookedMealEntry)

        // Add calories consumed offline to chart_data
        const todayChartItem = this.insights.chart_data.find(c => c.date === todayStr)
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

        this.saveInsightsToStorage()
        this.calculateOfflineMatches()
        this.loading = false
        return { success: true }
      }
    },

    // Load clean empty state for new users
    loadEmptyData() {
      this.fridgeItems = []
      this.saveFridgeToStorage()
      this.matchedRecipes = []
      this.insights = {
        summary: {
          total_waste_saved_kg: 0,
          total_cost_saved_rp: 0,
          meals_cooked_count: 0,
          carbon_reduction_kg: 0
        },
        chart_data: [],
        today_nutrition: { calories: 0, carbs: 0, protein: 0, fat: 0 },
        today_meals: [],
        recent_meals: []
      }
      this.saveInsightsToStorage()
      this.calculateOfflineMatches()
    },

    // Load fallback data for standalone offline usage / demo
    loadOfflineData(forceSeed = false) {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      const savedFridge = localStorage.getItem('olahin_fridge_items')
      const savedInsights = localStorage.getItem('olahin_insights')

      if (!forceSeed && savedFridge) {
        try {
          this.fridgeItems = JSON.parse(savedFridge)
        } catch (e) {
          this.seedDefaultFridge()
        }
      } else {
        this.seedDefaultFridge()
      }

      if (!forceSeed && savedInsights) {
        try {
          this.insights = JSON.parse(savedInsights)
        } catch (e) {
          this.seedDefaultInsights(todayStr)
        }
      } else {
        this.seedDefaultInsights(todayStr)
      }

      this.calculateOfflineMatches()
    },

    seedDefaultFridge() {
      const today = new Date()
      this.fridgeItems = [
        { id: 1, name: 'Telur', quantity: 6, unit: 'pcs', expiry_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Daging & Telur' },
        { id: 2, name: 'Bawang Merah', quantity: 150, unit: 'gr', expiry_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
        { id: 3, name: 'Bawang Putih', quantity: 80, unit: 'gr', expiry_date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
        { id: 4, name: 'Cabai Merah', quantity: 50, unit: 'gr', expiry_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
        { id: 5, name: 'Bayam', quantity: 300, unit: 'gr', expiry_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Sayuran' },
        { id: 6, name: 'Minyak Goreng', quantity: 1000, unit: 'ml', expiry_date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Minyak & Lemak' },
        { id: 7, name: 'Kecap Manis', quantity: 250, unit: 'ml', expiry_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Bumbu' },
      ]
      this.saveFridgeToStorage()
    },

    seedDefaultInsights(todayStr) {
      const today = new Date()
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
        },
        today_meals: [
          { id: 101, title: 'Telur Rebus & Roti Gandum', calories: 280, carbs: 32, protein: 14, fat: 8, time: '07:30', date: todayStr, waste_prevented_kg: 0.1, cost_saved_rp: 5000 },
          { id: 102, title: 'Nasi Goreng Telur', calories: 450, carbs: 60, protein: 12, fat: 15, time: '12:45', date: todayStr, waste_prevented_kg: 0.35, cost_saved_rp: 12000 },
          { id: 103, title: 'Bayam Bening Segar', calories: 80, carbs: 12, protein: 4, fat: 1, time: '18:15', date: todayStr, waste_prevented_kg: 0.25, cost_saved_rp: 8000 }
        ],
        recent_meals: [
          { id: 103, title: 'Bayam Bening Segar', calories: 80, carbs: 12, protein: 4, fat: 1, time: '18:15', day: 'Hari ini', date: todayStr, waste_prevented_kg: 0.25, cost_saved_rp: 8000 },
          { id: 102, title: 'Nasi Goreng Telur', calories: 450, carbs: 60, protein: 12, fat: 15, time: '12:45', day: 'Hari ini', date: todayStr, waste_prevented_kg: 0.35, cost_saved_rp: 12000 },
          { id: 98, title: 'Telur Dadar Cabai', calories: 210, carbs: 4, protein: 13, fat: 17, time: '13:00', day: 'Kemarin', date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], waste_prevented_kg: 0.2, cost_saved_rp: 8000 },
          { id: 97, title: 'Tumis Bayam Pedas', calories: 110, carbs: 10, protein: 5, fat: 6, time: '19:10', day: '2 hr lalu', date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], waste_prevented_kg: 0.4, cost_saved_rp: 12000 },
          { id: 96, title: 'Nasi Goreng Telur', calories: 450, carbs: 60, protein: 12, fat: 15, time: '12:30', day: '3 hr lalu', date: new Date(today.getTime() - 259200000).toISOString().split('T')[0], waste_prevented_kg: 0.3, cost_saved_rp: 10000 }
        ]
      }
      this.saveInsightsToStorage()
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
        },
        {
          id: 5,
          title: 'Sop Ayam Wortel',
          description: 'Kuah kaldu ayam hangat dipadu wortel segar dan seledri harum yang kaya vitamin.',
          prep_time: 25,
          calories: 280,
          carbs: 18,
          protein: 26,
          fat: 8,
          youtube_video_url: 'https://www.youtube.com/watch?v=tjHi6ZVWapI',
          youtube_id: 'tjHi6ZVWapI',
          ingredients: [
            { name: 'Daging Ayam', quantity: 250, unit: 'gr' },
            { name: 'Wortel', quantity: 100, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
            { name: 'Bawang Merah', quantity: 10, unit: 'gr' },
          ],
          steps: [
            "Rebus daging ayam dalam 700ml air hingga keluar kaldu gurih.",
            "Tumis bawang putih dan bawang merah, lalu masukkan ke dalam kuah kaldu.",
            "Masukkan potongan wortel, masak hingga empuk.",
            "Beri garam, merica, dan taburan seledri sebelum disajikan hangat."
          ]
        },
        {
          id: 6,
          title: 'Tempe Orek Manis Pedas',
          description: 'Potongan tempe renyah berbalut bumbu kecap manis gurih dan irisan cabai merah.',
          prep_time: 15,
          calories: 195,
          carbs: 22,
          protein: 15,
          fat: 7,
          youtube_video_url: 'https://www.youtube.com/watch?v=i6yHVLgrELQ',
          youtube_id: 'i6yHVLgrELQ',
          ingredients: [
            { name: 'Tempe', quantity: 1, unit: 'papan' },
            { name: 'Kecap Manis', quantity: 20, unit: 'ml' },
            { name: 'Cabai Merah', quantity: 15, unit: 'gr' },
            { name: 'Bawang Merah', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 15, unit: 'ml' },
          ],
          steps: [
            "Potong tempe bentuk korek api, goreng hingga kering kecokelatan.",
            "Tumis irisan bawang dan cabai merah sampai wangi.",
            "Tambahkan kecap manis, garam, dan sedikit air hingga berbuih kental.",
            "Masukkan tempe goreng, aduk cepat sampai bumbu meresap rata."
          ]
        },
        {
          id: 7,
          title: 'Capcay Sayur Gurih',
          description: 'Aneka sayuran renyah kembang kol dan wortel yang ditumis saus tiram lezat.',
          prep_time: 15,
          calories: 150,
          carbs: 16,
          protein: 6,
          fat: 5,
          youtube_video_url: 'https://www.youtube.com/watch?v=SId6rIr24O8',
          youtube_id: 'SId6rIr24O8',
          ingredients: [
            { name: 'Wortel', quantity: 100, unit: 'gr' },
            { name: 'Kembang Kol', quantity: 150, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 10, unit: 'ml' },
          ],
          steps: [
            "Tumis bawang putih cincang hingga harum kekuningan.",
            "Masukkan wortel dan kembang kol, tuang 100ml air.",
            "Bumbui dengan garam, saus tiram, dan sedikit merica.",
            "Masak hingga sayuran matang tapi tetap renyah segar."
          ]
        },
        {
          id: 8,
          title: 'Ayam Goreng Lengkuas',
          description: 'Ayam ungkep bumbu kuning tradisional dengan kremesan lengkuas renyah.',
          prep_time: 30,
          calories: 340,
          carbs: 6,
          protein: 32,
          fat: 20,
          youtube_video_url: 'https://www.youtube.com/watch?v=6uKarev2O8w',
          youtube_id: '6uKarev2O8w',
          ingredients: [
            { name: 'Daging Ayam', quantity: 300, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 15, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 30, unit: 'ml' },
          ],
          steps: [
            "Ungkep ayam bersama parutan lengkuas dan bawang putih hingga air menyusut.",
            "Panaskan minyak goreng dalam jumlah cukup.",
            "Goreng ayam dan remah lengkuas hingga kecokelatan keemasan.",
            "Tiriskan dan sajikan bersama sambal terasi."
          ]
        },
        {
          id: 9,
          title: 'Tahu Telur Bumbu Petis',
          description: 'Tahu goreng selimut telur disiram saus petis pedas manis khas Jawa Timur.',
          prep_time: 15,
          calories: 310,
          carbs: 18,
          protein: 20,
          fat: 16,
          youtube_video_url: 'https://www.youtube.com/watch?v=6uKarev2O8w',
          youtube_id: '6uKarev2O8w',
          ingredients: [
            { name: 'Telur', quantity: 2, unit: 'pcs' },
            { name: 'Cabai Merah', quantity: 10, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 15, unit: 'ml' },
            { name: 'Kecap Manis', quantity: 15, unit: 'ml' },
          ],
          steps: [
            "Kocok telur bersama potongan tahu dan garam.",
            "Goreng di wajan panas hingga dadar tahu mengembang gurih.",
            "Haluskan bawang putih, cabai, petis, dan kecap manis.",
            "Siram bumbu di atas tahu telur yang masih panas."
          ]
        },
        {
          id: 10,
          title: 'Tumis Buncis Jagung Manis',
          description: 'Kombinasi buncis manis dan pipilan jagung segar yang kaya serat dan warna cerah.',
          prep_time: 12,
          calories: 130,
          carbs: 22,
          protein: 4,
          fat: 3,
          youtube_video_url: 'https://www.youtube.com/watch?v=tjHi6ZVWapI',
          youtube_id: 'tjHi6ZVWapI',
          ingredients: [
            { name: 'Bawang Merah', quantity: 10, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 5, unit: 'gr' },
            { name: 'Cabai Merah', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 10, unit: 'ml' },
          ],
          steps: [
            "Tumis bawang dan cabai hingga wangi.",
            "Masukkan buncis dan jagung pipil dengan sedikit air.",
            "Bumbui dengan garam, gula pasir, dan kaldu bubuk secukupnya.",
            "Aduk rata selama 3 menit hingga matang pas."
          ]
        },
        {
          id: 11,
          title: 'Soto Ayam Lamongan',
          description: 'Soto ayam berkuah kuning kaya rempah dengan aroma bawang putih yang khas.',
          prep_time: 35,
          calories: 320,
          carbs: 24,
          protein: 28,
          fat: 10,
          youtube_video_url: 'https://www.youtube.com/watch?v=SId6rIr24O8',
          youtube_id: 'SId6rIr24O8',
          ingredients: [
            { name: 'Daging Ayam', quantity: 250, unit: 'gr' },
            { name: 'Bawang Merah', quantity: 15, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 10, unit: 'ml' },
          ],
          steps: [
            "Rebus ayam hingga empuk, lalu suwir-suwir dagingnya.",
            "Tumis bumbu halus bawang dan kunyit, tuang ke dalam rebusan kaldu ayam.",
            "Bumbui kuah dengan garam dan penyedap.",
            "Sajikan suwiran ayam bersama kuah soto panas dan koya gurih."
          ]
        },
        {
          id: 12,
          title: 'Telur Balado Pedas Manis',
          description: 'Telur rebus goreng dilumuri sambal balado merah segar bercita rasa gurih pedas.',
          prep_time: 20,
          calories: 260,
          carbs: 8,
          protein: 14,
          fat: 18,
          youtube_video_url: 'https://www.youtube.com/watch?v=i6yHVLgrELQ',
          youtube_id: 'i6yHVLgrELQ',
          ingredients: [
            { name: 'Telur', quantity: 2, unit: 'pcs' },
            { name: 'Cabai Merah', quantity: 30, unit: 'gr' },
            { name: 'Bawang Merah', quantity: 15, unit: 'gr' },
            { name: 'Bawang Putih', quantity: 10, unit: 'gr' },
            { name: 'Minyak Goreng', quantity: 15, unit: 'ml' },
          ],
          steps: [
            "Rebus telur, kupas kulitnya, lalu goreng sebentar hingga berkulit keemasan.",
            "Ulek kasar cabai merah, bawang merah, dan bawang putih.",
            "Tumis sambal dengan minyak hingga matang harum dan tidak langu.",
            "Masukkan telur, aduk pelan hingga terbalut rata dengan sambal."
          ]
        }
      ]

      this.allRecipes = recipes

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

        // Check allergens against user profile
        const userAllergies = this.user?.allergies || []
        const detectedAllergens = []
        recipe.ingredients.forEach(ing => {
          const ingLower = ing.name.toLowerCase()
          userAllergies.forEach(allergy => {
            const aLower = allergy.toLowerCase()
            if (
              ingLower.includes(aLower) ||
              (aLower === 'seafood' && (ingLower.includes('udang') || ingLower.includes('ikan') || ingLower.includes('cumi'))) ||
              (aLower === 'pedas' && (ingLower.includes('cabai') || ingLower.includes('sambal') || ingLower.includes('lada'))) ||
              (aLower === 'kacang' && (ingLower.includes('kacang') || ingLower.includes('kedelai') || ingLower.includes('tempe') || ingLower.includes('tahu')))
            ) {
              if (!detectedAllergens.includes(allergy)) {
                detectedAllergens.push(allergy)
              }
            }
          })
        })

        const isDietFriendly = (recipe.calories || 300) <= 250
        const isBulkingFriendly = (recipe.calories || 300) >= 300 && (recipe.protein || 0) >= 12

        matched.push({
          ...recipe,
          image: recipe.image || getRecipeImage(recipe),
          youtube_id: getRecipeYoutubeId(recipe),
          youtube_video_url: getRecipeYoutubeAppUrl(recipe),
          match_percentage: matchPct,
          min_expiry_days: minExpiryDays === 9999 ? null : minExpiryDays,
          matched_ingredients: matchedList,
          missing_ingredients: missingList,
          has_allergen: detectedAllergens.length > 0,
          detected_allergens: detectedAllergens,
          is_diet_friendly: isDietFriendly,
          is_bulking_friendly: isBulkingFriendly
        })
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
