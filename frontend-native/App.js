import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Audio, Video } from 'expo-av';
import { ResizeMode } from 'expo-av';
import Constants from 'expo-constants';


// Setup API Base URL - Fallback to local simulation if offline
// KONTROL URL BACKEND DI SINI:
const getBackendHost = () => {
  // Try to get local IP dynamically from Expo's Metro host uri
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || '';
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // Platform fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

const BACKEND_HOST = getBackendHost();
const API_URL = `${BACKEND_HOST}/api`;

// Initial Mock data for offline/standalone mode
const INITIAL_FRIDGE = [
  { id: 1, name: 'Telur', quantity: 6, unit: 'pcs', expiry_date: '2026-06-30', category: 'Daging & Telur' },
  { id: 2, name: 'Bawang Merah', quantity: 150, unit: 'gr', expiry_date: '2026-07-09', category: 'Bumbu' },
  { id: 3, name: 'Bawang Putih', quantity: 80, unit: 'gr', expiry_date: '2026-07-15', category: 'Bumbu' },
  { id: 4, name: 'Cabai Merah', quantity: 50, unit: 'gr', expiry_date: '2026-06-27', category: 'Sayuran' }, // Nearing expiry
  { id: 5, name: 'Bayam', quantity: 300, unit: 'gr', expiry_date: '2026-06-26', category: 'Sayuran' }, // Nearing expiry
  { id: 6, name: 'Minyak Goreng', quantity: 1000, unit: 'ml', expiry_date: '2026-09-25', category: 'Minyak & Lemak' },
  { id: 7, name: 'Kecap Manis', quantity: 250, unit: 'ml', expiry_date: '2026-08-25', category: 'Bumbu' },
];

const INITIAL_RECIPES = [
  {
    id: 1,
    title: 'Nasi Goreng Telur',
    description: 'Resep nasi goreng sederhana khas rumahan yang gurih dan cepat disajikan.',
    prep_time: 15,
    calories: 450,
    carbs: 60,
    protein: 12,
    fat: 15,
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
];

const INITIAL_INSIGHTS = [
  { day: 'Sen', waste_kg: 0.8, cost_saved: 18000 },
  { day: 'Sel', waste_kg: 1.2, cost_saved: 24000 },
  { day: 'Rab', waste_kg: 0.4, cost_saved: 12000 },
  { day: 'Kam', waste_kg: 1.5, cost_saved: 30000 },
  { day: 'Jum', waste_kg: 0.6, cost_saved: 15000 },
  { day: 'Sab', waste_kg: 1.1, cost_saved: 22000 },
  { day: 'Min', waste_kg: 1.9, cost_saved: 45000 },
];

export default function App() {
  // Navigation State
  // 'SPLASH', 'WELCOME', 'REGISTER', 'LOGIN', 'MAIN', 'COOKING', 'COOKING_SUCCESS'
  const [screen, setScreen] = useState('SPLASH');
  const [activeTab, setActiveTab] = useState('kulkas'); // 'kulkas', 'resep', 'insight', 'profil'

  // User State
  const [user, setUser] = useState({
    name: 'Budi Santoso',
    email: 'user@olahin.com',
    target_calories: 2000,
    target_carbs: 250,
    target_protein: 75,
    target_fat: 65,
  });

  // Application Data States
  const [fridge, setFridge] = useState(INITIAL_FRIDGE);
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);

  // Loading & Network indicators
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Form States
  const [loginEmail, setLoginEmail] = useState('user@olahin.com');
  const [loginPassword, setLoginPassword] = useState('password');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Add Item Modal & Form
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('gr');
  const [newItemCategory, setNewItemCategory] = useState('Sayuran');
  const [newItemExpiry, setNewItemExpiry] = useState('3'); // days from now

  // Camera & Voice Simulation Modals
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [webRecorder, setWebRecorder] = useState(null);
  const [webAudioChunks, setWebAudioChunks] = useState([]);
  const [webSpeech, setWebSpeech] = useState(null);
  const [nlpProcessing, setNlpProcessing] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Manual ingredient entry after picking an image / recording voice (web fallback)
  const [manualDetectVisible, setManualDetectVisible] = useState(false);
  const [manualDetectName, setManualDetectName] = useState('');
  const [manualDetectQty, setManualDetectQty] = useState('');
  const [manualDetectSource, setManualDetectSource] = useState('foto'); // 'foto' | 'suara'

  // Cooking Mode States
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cookingTimer, setCookingTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Success Cooking Summary
  const [cookingSuccessData, setCookingSuccessData] = useState({
    waste_prevented: 0,
    cost_saved: 0,
    recipe_title: '',
  });

  // Profile Edit Target Modal
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [targetCaloriesInput, setTargetCaloriesInput] = useState('2000');
  const [targetCarbsInput, setTargetCarbsInput] = useState('250');
  const [targetProteinInput, setTargetProteinInput] = useState('75');
  const [targetFatInput, setTargetFatInput] = useState('65');

  // Check backend server connection
  useEffect(() => {
    fetch(`${API_URL}/inventory`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setIsOnline(true);
          loadDataFromServer();
        }
      })
      .catch(() => {
        setIsOnline(false); // Fallback to offline mock simulation
      });
  }, []);

  // Splash countdown
  useEffect(() => {
    if (screen === 'SPLASH') {
      const timer = setTimeout(() => {
        setScreen('WELCOME');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Load Data from Server
  const loadDataFromServer = async () => {
    try {
      setLoading(true);
      const [resFridge, resRecipes, resInsights] = await Promise.all([
        fetch(`${API_URL}/inventory`).then((r) => r.json()),
        fetch(`${API_URL}/recipes/match`).then((r) => r.json()),
        fetch(`${API_URL}/insight`).then((r) => r.json()),
      ]);

      if (resFridge.success) setFridge(resFridge.data);
      if (resRecipes.success) setMatchedRecipes(resRecipes.data);
      if (resInsights.success) setInsights(resInsights.chart_data);
    } catch (e) {
      console.log('Error loading server data', e);
    } finally {
      setLoading(false);
    }
  };

  // Recipe Matching Engine calculation (Offline Mode)
  useEffect(() => {
    if (!isOnline) {
      calculateOfflineMatches();
    }
  }, [fridge, isOnline]);

  const calculateOfflineMatches = () => {
    const stockMap = {};
    fridge.forEach(item => {
      stockMap[item.name.toLowerCase().trim()] = item;
    });

    const matched = [];
    INITIAL_RECIPES.forEach(recipe => {
      let matchCount = 0;
      const matchedList = [];
      const missingList = [];
      let minExpiryDays = 9999;

      recipe.ingredients.forEach(recipeIng => {
        const nameLower = recipeIng.name.toLowerCase().trim();
        if (stockMap[nameLower]) {
          matchCount++;
          const stockItem = stockMap[nameLower];

          // Calculate expiry days
          const expiryDate = new Date(stockItem.expiry_date);
          const today = new Date();
          const diffTime = expiryDate - today;
          const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          matchedList.push({
            name: recipeIng.name,
            qty_needed: recipeIng.quantity,
            qty_available: stockItem.quantity,
            unit: recipeIng.unit,
            days_until_expiry: expiryDays
          });

          if (expiryDays < minExpiryDays) {
            minExpiryDays = expiryDays;
          }
        } else {
          missingList.push({
            name: recipeIng.name,
            qty_needed: recipeIng.quantity,
            unit: recipeIng.unit
          });
        }
      });

      const matchPct = Math.round((matchCount / recipe.ingredients.length) * 100);

      // Matching Engine filter >= 50%
      if (matchPct >= 50) {
        matched.push({
          ...recipe,
          match_percentage: matchPct,
          min_expiry_days: minExpiryDays === 9999 ? null : minExpiryDays,
          matched_ingredients: matchedList,
          missing_ingredients: missingList
        });
      }
    });

    // Sort: 1st Match Percentage (desc), 2nd Expiry Days (asc)
    matched.sort((a, b) => {
      if (b.match_percentage === a.match_percentage) {
        const daysA = a.min_expiry_days ?? 9999;
        const daysB = b.min_expiry_days ?? 9999;
        return daysA - daysB;
      }
      return b.match_percentage - a.match_percentage;
    });

    setMatchedRecipes(matched);
  };

  // Auth Operations
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Tolong lengkapi form login!');
      return;
    }

    if (isOnline) {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setScreen('MAIN');
        } else {
          alert(data.message);
        }
      } catch (e) {
        alert('Gagal tersambung ke backend.');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline fallback login success
      if (loginEmail === 'user@olahin.com' && loginPassword === 'password') {
        setScreen('MAIN');
      } else {
        alert('Email/password salah untuk mode offline. Gunakan user@olahin.com / password');
      }
    }
  };

  const handleRegister = () => {
    if (!regName || !regEmail || !regPassword) {
      alert('Mohon lengkapi semua isian!');
      return;
    }
    setUser({
      name: regName,
      email: regEmail,
      target_calories: 2000,
      target_carbs: 250,
      target_protein: 75,
      target_fat: 65,
    });
    setScreen('MAIN');
  };

  // Add Item to Fridge
  const handleAddFridgeItem = async () => {
    if (!newItemName || !newItemQty) {
      alert('Nama bahan dan jumlah tidak boleh kosong!');
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(newItemExpiry));
    const expiryStr = expiryDate.toISOString().split('T')[0];

    const newItemData = {
      name: newItemName,
      quantity: parseFloat(newItemQty),
      unit: newItemUnit,
      expiry_date: expiryStr,
      category: newItemCategory,
    };

    if (isOnline) {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItemData),
        });
        const data = await res.json();
        if (data.success) {
          loadDataFromServer();
        }
      } catch (e) {
        console.log('Error adding item online', e);
      } finally {
        setLoading(false);
      }
    } else {
      // Local state update
      const localItem = {
        id: Date.now(),
        ...newItemData,
      };
      setFridge([localItem, ...fridge]);
    }

    // Reset Form & Close Modal
    setNewItemName('');
    setNewItemQty('');
    setAddModalVisible(false);
  };

  // Delete Item from Fridge
  const handleDeleteFridgeItem = async (id) => {
    if (isOnline) {
      try {
        setLoading(true);
        await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
        loadDataFromServer();
      } catch (e) {
        console.log('Error deleting item', e);
      } finally {
        setLoading(false);
      }
    } else {
      setFridge(fridge.filter((item) => item.id !== id));
    }
  };

  // Update Profile Targets
  const handleUpdateTargets = () => {
    const updated = {
      ...user,
      target_calories: parseInt(targetCaloriesInput),
      target_carbs: parseInt(targetCarbsInput),
      target_protein: parseInt(targetProteinInput),
      target_fat: parseInt(targetFatInput),
    };
    setUser(updated);
    setProfileModalVisible(false);
  };

  // Parse Indonesian voice transcript into ingredient items (web Speech API fallback)
  const parseVoiceTranscript = (transcript) => {
    const text = (transcript || '').toLowerCase();
    const KNOWN = [
      'telur', 'bawang merah', 'bawang putih', 'cabai merah', 'bayam', 'daging ayam',
      'minyak goreng', 'kecap manis', 'wortel', 'kentang', 'tomat', 'apel', 'pisang',
      'jeruk', 'brokoli', 'sawi', 'jahe', 'kunyit', 'santan', 'tempe', 'tahu', 'terong',
    ];
    const wordToNum = {
      'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5, 'enam': 6, 'tujuh': 7,
      'delapan': 8, 'sembilan': 9, 'sepuluh': 10, 'sebelas': 11, 'seratus': 100,
      'dua ratus': 200, 'tiga ratus': 300, 'empat ratus': 400, 'lima ratus': 500,
    };
    const found = [];
    KNOWN.forEach((key) => {
      const idx = text.indexOf(key);
      if (idx === -1) return;
      let qty = 1;
      const before = text.slice(0, idx).trim().split(/\s+/).pop();
      if (wordToNum[before] !== undefined) qty = wordToNum[before];
      const afterMatch = text.slice(idx + key.length).trim().match(/^(\d+)/);
      if (afterMatch) qty = parseInt(afterMatch[1], 10);
      if (!found.some((f) => f.key === key)) {
        found.push({
          key,
          name: key.replace(/\b\w/g, (c) => c.toUpperCase()),
          quantity: qty,
          unit: 'pcs',
        });
      }
    });
    return found;
  };

  // Helper to add detected items to fridge (used by both Camera & Voice)
  const addDetectedItemsToFridge = async (detected) => {
    const today = new Date();

    if (isOnline) {
      try {
        setLoading(true);

        // Optimistically show detected items immediately so they always appear,
        // even if the server round-trip fails (e.g. DB not seeded).
        setFridge(prevFridge => {
          const updatedFridge = [...prevFridge];
          detected.forEach(d => {
            const expDate = new Date();
            let days = 7;
            if (d.expiry_days !== undefined && d.expiry_days !== null) {
              days = parseInt(d.expiry_days);
            } else if (d.expiry_date) {
              const diffTime = new Date(d.expiry_date) - today;
              days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            }
            expDate.setDate(today.getDate() + days);
            const existingIdx = updatedFridge.findIndex(item => item.name.toLowerCase().trim() === d.name.toLowerCase().trim());
            if (existingIdx > -1) {
              updatedFridge[existingIdx].quantity += d.quantity;
            } else {
              updatedFridge.push({
                id: Date.now() + Math.random(),
                name: d.name,
                quantity: d.quantity,
                unit: d.unit,
                expiry_date: expDate.toISOString().split('T')[0],
                category: d.category || 'Lainnya',
              });
            }
          });
          return updatedFridge;
        });

        // Save all detected items to the server database
        const promises = detected.map(async (d) => {
          const expDate = new Date();
          let days = 7;
          if (d.expiry_days !== undefined && d.expiry_days !== null) {
            days = parseInt(d.expiry_days);
          } else if (d.expiry_date) {
            const diffTime = new Date(d.expiry_date) - today;
            days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
          expDate.setDate(today.getDate() + days);

          const newItemData = {
            name: d.name,
            quantity: parseFloat(d.quantity),
            unit: d.unit,
            expiry_date: expDate.toISOString().split('T')[0],
            category: d.category || 'Lainnya',
          };

          return fetch(`${API_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItemData),
          });
        });

        await Promise.all(promises);
        // Reload fresh data from the server database
        loadDataFromServer();
      } catch (e) {
        console.log('Error saving detected ingredients to online DB:', e);
      } finally {
        setLoading(false);
      }
    } else {
      // Local state update fallback (Offline Mode)
      setFridge(prevFridge => {
        const updatedFridge = [...prevFridge];

        detected.forEach(d => {
          const expDate = new Date();
          let days = 7;
          if (d.expiry_days !== undefined && d.expiry_days !== null) {
            days = parseInt(d.expiry_days);
          } else if (d.expiry_date) {
            const diffTime = new Date(d.expiry_date) - today;
            days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
          expDate.setDate(today.getDate() + days);

          const existingIdx = updatedFridge.findIndex(item => item.name.toLowerCase().trim() === d.name.toLowerCase().trim());
          if (existingIdx > -1) {
            updatedFridge[existingIdx].quantity += d.quantity;
          } else {
            updatedFridge.push({
              id: Date.now() + Math.random(),
              name: d.name,
              quantity: d.quantity,
              unit: d.unit,
              expiry_date: expDate.toISOString().split('T')[0],
              category: d.category || 'Lainnya'
            });
          }
        });

        return updatedFridge;
      });
    }
  };

  // Camera capture and image selection
  const handleScanIngredients = () => {
    setScanModalVisible(true);
  };

  const launchCameraScan = async () => {
    // On web there is no camera capture; fall back to file/photo picker.
    if (Platform.OS === 'web') {
      return launchGalleryScan();
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Kamera Ditolak', 'Aplikasi memerlukan izin kamera untuk mengambil foto bahan.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processDetectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Error launching camera:', e);
      Alert.alert('Error', 'Gagal membuka kamera.');
    }
  };

  const launchGalleryScan = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Galeri Ditolak', 'Aplikasi memerlukan izin galeri untuk memilih foto bahan.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processDetectedImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Error launching library:', e);
      Alert.alert('Error', 'Gagal membuka galeri foto.');
    }
  };

  const processDetectedImage = async (uri) => {
    setScannedImageUri(uri);
    setCameraModalVisible(true);

    // On web there is no reliable AI upload (FormData object style isn't supported
    // by browsers), so we let the user name the ingredient directly. This guarantees
    // the picked item (e.g. "Terong") always appears in the fridge.
    if (Platform.OS === 'web') {
      setCameraModalVisible(false);
      setManualDetectName('');
      setManualDetectQty('');
      setManualDetectVisible(true);
      return;
    }

    if (isOnline) {
      try {
        const formData = new FormData();
        const uriParts = uri.split('/');
        const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';
        const fileType = fileName.split('.').pop() || 'jpeg';

        formData.append('file', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: fileName,
          type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
        });

        const response = await fetch(`${API_URL}/ai/detect-ingredients`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();
        setCameraModalVisible(false);

        if (data.success && data.detected_items) {
          await addDetectedItemsToFridge(data.detected_items);
          Alert.alert(
            'AI Deteksi Bahan',
            `Berhasil mendeteksi ${data.detected_items.length} bahan:\n` +
            data.detected_items.map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')
          );
        } else {
          Alert.alert('Deteksi Gagal', data.message || 'Gagal mengenali bahan makanan.');
        }
      } catch (e) {
        console.log('Error scanning photo via API:', e);
        setCameraModalVisible(false);
        await runOfflineCameraSimulation();
      }
    } else {
      // Offline fallback simulation
      setTimeout(async () => {
        setCameraModalVisible(false);
        await runOfflineCameraSimulation();
      }, 2000);
    }
  };

  const runOfflineCameraSimulation = async () => {
    const detected = [
      { name: 'Telur', category: 'Daging & Telur', unit: 'pcs', quantity: 4, expiry_days: 10 },
      { name: 'Cabai Merah', category: 'Sayuran', unit: 'gr', quantity: 100, expiry_days: 3 }
    ];
    await addDetectedItemsToFridge(detected);
    Alert.alert(
      'AI Deteksi Bahan (Offline)',
      'Koneksi offline. Hasil simulasi deteksi: Telur (4 pcs) & Cabai Merah (100 gr) telah dimasukkan ke kulkas!'
    );
  };

  // Add an ingredient the user named after picking an image / recording voice (web fallback)
  const handleManualDetect = async () => {
    const name = manualDetectName.trim();
    if (!name) {
      Alert.alert('Nama bahan tidak boleh kosong!');
      return;
    }
    const qty = parseFloat(manualDetectQty) || 1;
    const detected = [{ name, category: 'Lainnya', unit: 'pcs', quantity: qty, expiry_days: 7 }];
    await addDetectedItemsToFridge(detected);
    setManualDetectVisible(false);
    const src = manualDetectSource === 'suara' ? 'suara' : 'foto';
    Alert.alert('Bahan Ditambahkan', `${name} (${qty} pcs) dari ${src} telah dimasukkan ke kulkas!`);
  };

  // Audio Recording (Voice Note) Implementation
  const startRecording = async () => {
    // Web: use the browser MediaRecorder + Web Speech API (expo-av recording is not supported on web)
    if (Platform.OS === 'web') {
      try {
        // Clean up any existing recording before starting new one
        if (webRecorder && webRecorder.state !== 'inactive') {
          webRecorder.stop();
          setWebRecorder(null);
        }
        if (webSpeech) {
          try { webSpeech.stop(); } catch (e) { /* ignore */ }
          setWebSpeech(null);
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        const chunks = [];
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        mr.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          stream.getTracks().forEach((t) => t.stop());
          setWebAudioChunks([]);
          await processWebVoiceNote(blob);
          setWebRecorder(null);
          setWebSpeech(null);
        };
        mr.start();
        setWebRecorder(mr);
        setWebAudioChunks(chunks);

        // Start Web Speech recognition to transcribe speech live
        let recognition = null;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
          recognition = new SR();
          recognition.lang = 'id-ID';
          recognition.interimResults = false;
          recognition.continuous = false;
          const finalText = { value: '' };
          recognition.onresult = (event) => {
            finalText.value = event.results[0][0].transcript;
          };
          recognition.onend = async () => {
            const transcript = finalText.value;
            if (transcript) {
              const items = parseVoiceTranscript(transcript);
              setWebSpeech(null);
              if (items.length > 0) {
                setVoiceModalVisible(false);
                setNlpProcessing(false);
                await addDetectedItemsToFridge(items.map((i) => ({
                  name: i.name, category: 'Lainnya', unit: i.unit,
                  quantity: i.quantity, expiry_days: 7,
                })));
                Alert.alert(
                  'NLP Ekstraksi Suara (Browser)',
                  `Transkrip: "${transcript}"\n\nBahan berhasil ditambahkan:\n` +
                  items.map((i) => `- ${i.name} (${i.quantity} ${i.unit})`).join('\n')
                );
                return;
              }
              // Recognized but no known ingredient -> manual entry
              setManualDetectSource('suara');
              setManualDetectName('');
              setManualDetectQty('');
              setManualDetectVisible(true);
              setVoiceModalVisible(false);
              setNlpProcessing(false);
              return;
            }
            setWebSpeech(null);
          };
          recognition.onerror = () => { setWebSpeech(null); };
          try { recognition.start(); setWebSpeech(recognition); } catch (e) { /* ignore */ }
        }

        setIsRecording(true);
        setNlpProcessing(false);
        setVoiceModalVisible(true);
      } catch (err) {
        console.error('Gagal memulai perekaman web:', err);
        Alert.alert('Error', 'Gagal mengakses mikrofon di browser.');
        setIsRecording(false);
        setVoiceModalVisible(false);
        setWebRecorder(null);
        setWebSpeech(null);
        return;
      }
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Mikrofon Ditolak', 'Aplikasi memerlukan akses mikrofon untuk merekam voice note.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsRecording(true);
      setNlpProcessing(false);
      setVoiceModalVisible(true);

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error('Gagal memulai perekaman:', err);
      Alert.alert('Error', 'Gagal memulai perekaman audio.');
      setIsRecording(false);
      setVoiceModalVisible(false);
    }
  };

  const stopRecording = async () => {
    if (Platform.OS === 'web') {
      // Hentikan Web Speech dan MediaRecorder, lalu reset semua state.
      if (webSpeech) {
        try { webSpeech.stop(); } catch (e) { /* ignore */ }
        setWebSpeech(null);
      }
      if (webRecorder && webRecorder.state !== 'inactive') {
        setIsRecording(false);
        setNlpProcessing(true);
        webRecorder.stop();
        setWebRecorder(null);
      }
      return;
    }

    if (!recording) return;

    try {
      setIsRecording(false);
      setNlpProcessing(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      await processVoiceNote(uri);
    } catch (err) {
      console.error('Gagal menghentikan perekaman:', err);
      setVoiceModalVisible(false);
      setNlpProcessing(false);
      Alert.alert('Error', 'Gagal memproses perekaman audio.');
      setWebRecorder(null);
      setWebSpeech(null);
    }
  };

  // Web voice note: try the API, but always open manual entry so the
  // spoken ingredient is guaranteed to appear in the fridge.
  const processWebVoiceNote = async (blob) => {
    setVoiceModalVisible(false);
    setNlpProcessing(false);

    if (isOnline) {
      try {
        const formData = new FormData();
        formData.append('audio', blob, 'voice.webm');

        const response = await fetch(`${API_URL}/ai/voice-to-text`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success && data.extracted_items && data.extracted_items.length > 0) {
          await addDetectedItemsToFridge(data.extracted_items);
          Alert.alert(
            'NLP Ekstraksi Suara',
            `Hasil transkrip: "${data.transcript}"\n\nBahan berhasil ditambahkan:\n` +
            data.extracted_items.map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')
          );
          return;
        }
      } catch (e) {
        console.log('Error transcribing web voice via API:', e);
      }
    }

    // Fallback: let the user name the ingredient directly (web reliable path)
    setManualDetectSource('suara');
    setManualDetectName('');
    setManualDetectQty('');
    setManualDetectVisible(true);
  };

  const processVoiceNote = async (uri) => {
    if (isOnline) {
      try {
        const formData = new FormData();
        const uriParts = uri.split('/');
        const fileName = uriParts[uriParts.length - 1] || 'voice.m4a';
        const fileType = fileName.split('.').pop() || 'm4a';

        formData.append('audio', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: fileName,
          type: `audio/${fileType === '3gp' ? '3gpp' : 'm4a'}`,
        });

        const response = await fetch(`${API_URL}/ai/voice-to-text`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();
        setVoiceModalVisible(false);
        setNlpProcessing(false);

        if (data.success && data.extracted_items) {
          await addDetectedItemsToFridge(data.extracted_items);
          Alert.alert(
            'NLP Ekstraksi Suara',
            `Hasil transkrip: "${data.transcript}"\n\nBahan berhasil ditambahkan:\n` +
            data.extracted_items.map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n')
          );
        } else {
          Alert.alert('Transkripsi Gagal', 'Gagal mengekstrak kosa kata dari rekaman.');
        }
      } catch (e) {
        console.log('Error transcribing voice via API:', e);
        setVoiceModalVisible(false);
        setNlpProcessing(false);
        await runOfflineVoiceSimulation();
      }
    } else {
      // Offline fallback simulation
      setTimeout(async () => {
        setVoiceModalVisible(false);
        setNlpProcessing(false);
        await runOfflineVoiceSimulation();
      }, 2000);
    }
  };

  const runOfflineVoiceSimulation = async () => {
    const detected = [
      { name: 'Bayam', category: 'Sayuran', unit: 'gr', quantity: 250, expiry_days: 1 },
      { name: 'Bawang Merah', category: 'Bumbu', unit: 'gr', quantity: 50, expiry_days: 14 }
    ];
    await addDetectedItemsToFridge(detected);
    Alert.alert(
      'NLP Suara (Offline)',
      'Transkrip simulasi: "Masukkan bayam 250 gram dan bawang merah 50 gram". Bahan telah ditambahkan ke kulkas!'
    );
  };

  // Cooking Timer handlers
  const startCookingTimer = (seconds) => {
    clearInterval(timerRef.current);
    setCookingTimer(seconds);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setCookingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          Alert.alert('Waktu Memasak Selesai!', 'Langkah memasak ini telah selesai timernya.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCookingTimer = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
  };

  // Trigger Cooking Flow
  const startCooking = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentStepIndex(0);
    setCookingTimer(0);
    setTimerActive(false);
    setIsPlayingVideo(false);
    setScreen('COOKING');
  };

  // Finish Cooking Mode & Auto-Deduct Stock
  const handleFinishCooking = async () => {
    clearInterval(timerRef.current);
    setTimerActive(false);

    if (isOnline) {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/recipes/cook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe_id: selectedRecipe.id }),
        });
        const data = await res.json();
        if (data.success) {
          setCookingSuccessData({
            recipe_title: selectedRecipe.title,
            waste_prevented: data.data.waste_prevented_kg,
            cost_saved: data.data.cost_saved_rp,
          });
          loadDataFromServer();
        }
      } catch (e) {
        console.log('Error finishing cooking online', e);
      } finally {
        setLoading(false);
      }
    } else {
      // Local Auto-Deduct logic
      let wastePreventedKg = 0;
      const today = new Date();
      const updatedFridge = fridge.map(item => {
        const recipeIng = selectedRecipe.ingredients.find(
          ri => ri.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        if (recipeIng) {
          // Calculate waste prevention
          const expDate = new Date(item.expiry_date);
          const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

          if (diffDays <= 3) {
            let weightKg = 0;
            const qtyUsed = Math.min(recipeIng.quantity, item.quantity);
            if (item.unit.toLowerCase() === 'gr') weightKg = qtyUsed / 1000;
            else if (item.unit.toLowerCase() === 'ml') weightKg = qtyUsed / 1000;
            else weightKg = qtyUsed * 0.1;

            wastePreventedKg += weightKg;
          }

          // Deduct quantity
          const nextQty = item.quantity - recipeIng.quantity;
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(item => item.quantity > 0); // remove empty items

      setFridge(updatedFridge);

      const costSaved = Math.round(wastePreventedKg * 20000) || 15000;
      const wasteSaved = roundDec(wastePreventedKg, 2) || 0.45;

      setCookingSuccessData({
        recipe_title: selectedRecipe.title,
        waste_prevented: wasteSaved,
        cost_saved: costSaved
      });

      // Add to local insights
      const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const currentDay = dayNames[today.getDay() === 0 ? 6 : today.getDay() - 1];
      setInsights(insights.map(day => {
        if (day.day === currentDay) {
          return {
            ...day,
            waste_kg: roundDec(day.waste_kg + wasteSaved, 2),
            cost_saved: day.cost_saved + costSaved
          };
        }
        return day;
      }));
    }

    setScreen('COOKING_SUCCESS');
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m} : ${s}`;
  };

  const getExpiryStyle = (dateStr) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diff <= 2) return styles.expiryAlertRed;
    if (diff <= 5) return styles.expiryAlertYellow;
    return styles.expiryAlertGreen;
  };

  const getExpiryLabel = (dateStr) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return 'Kedaluwarsa!';
    if (diff === 1) return 'Besok Kedaluwarsa';
    return `${diff} hari lagi`;
  };

  const roundDec = (val, decs) => {
    return Number(Math.round(val + 'e' + decs) + 'e-' + decs);
  };

  // CALCULATE SUMMARIES FOR INSIGHT PAGE
  const totalWastePrevented = insights.reduce((acc, curr) => acc + curr.waste_kg, 0);
  const totalCostSaved = insights.reduce((acc, curr) => acc + curr.cost_saved, 0);
  const co2Prevented = roundDec(totalWastePrevented * 2.5, 1);

  // RENDER SCREENS
  if (screen === 'SPLASH') {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&q=80' }}
            style={styles.splashLogoImage}
          />
          <Text style={styles.splashAppName}>Olahin</Text>
          <Text style={styles.splashTagline}>Kelola kulkas pintar, cegah limbah pangan.</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  if (screen === 'WELCOME') {
    return (
      <View style={styles.welcomeContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600' }}
          style={styles.bgImage}
        />
        <View style={styles.welcomeOverlay} />

        <View style={styles.welcomeModal}>
          <Text style={styles.welcomeTitle}>Mulai Hidup Hemat & Peduli Lingkungan</Text>
          <Text style={styles.welcomeDesc}>Olah bahan kulkasmu menjadi resep masakan nusantara sehat nan lezat.</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('LOGIN')}>
            <Text style={styles.primaryButtonText}>Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('REGISTER')}>
            <Text style={styles.secondaryButtonText}>Daftar Akun Baru</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  if (screen === 'LOGIN') {
    return (
      <ScrollView contentContainerStyle={styles.authScrollContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Masuk Ke Akun</Text>

          <Text style={styles.inputLabel}>Alamat Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: budi@gmail.com"
            value={loginEmail}
            onChangeText={setLoginEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Kata Sandi</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Masukkan kata sandi Anda"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => setScreen('WELCOME')}>
            <Text style={styles.backLinkText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (screen === 'REGISTER') {
    return (
      <ScrollView contentContainerStyle={styles.authScrollContainer}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Daftar Akun</Text>

          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Budi Santoso"
            value={regName}
            onChangeText={setRegName}
          />

          <Text style={styles.inputLabel}>Alamat Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="budi@gmail.com"
            value={regEmail}
            onChangeText={setRegEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Kata Sandi</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Minimal 6 karakter"
            value={regPassword}
            onChangeText={setRegPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryButtonText}>Daftar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => setScreen('WELCOME')}>
            <Text style={styles.backLinkText}>Sudah punya akun? Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // COOKING INTERACTIVE MODE (LANGKAH MEMASAK)
  if (screen === 'COOKING') {
    const steps = selectedRecipe && Array.isArray(selectedRecipe.steps) ? selectedRecipe.steps : [];
    const totalSteps = steps.length;
    const stepText = totalSteps > 0 ? steps[currentStepIndex] : 'Tidak ada langkah memasak.';
    // Custom mock steps with timer configurations
    const hasTimer = stepText ? (stepText.includes('rebus') || stepText.includes('menit') || stepText.includes('Tumis') || stepText.includes('masak')) : false;
    const timerSeconds = 120; // 2 minutes standard countdown for demo

    return (
      <View style={styles.cookingModeContainer}>
        <View style={styles.cookingHeader}>
          <Text style={styles.cookingHeaderSub}>Sedang Memasak:</Text>
          <Text style={styles.cookingHeaderTitle}>{selectedRecipe.title}</Text>
        </View>

        <View style={styles.cookingVideoPanel}>
          {isPlayingVideo ? (
            <CookingVideoPlayer />
          ) : (
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setIsPlayingVideo(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400' }}
                style={styles.cookingVideoImage}
              />
              <View style={styles.cookingVideoOverlay}>
                <Text style={styles.videoPlayBtn}>▶ Putar Video Panduan</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.cookingStepCard}>
          <Text style={styles.stepIndicator}>Langkah {currentStepIndex + 1} dari {totalSteps}</Text>
          <ScrollView style={styles.stepTextScroll}>
            <Text style={styles.stepTextContent}>{stepText}</Text>
          </ScrollView>

          {hasTimer && (
            <View style={styles.timerWrapper}>
              <Text style={styles.timerDigits}>{formatTimer(cookingTimer > 0 ? cookingTimer : timerSeconds)}</Text>
              {!timerActive ? (
                <TouchableOpacity style={styles.timerBtnStart} onPress={() => startCookingTimer(timerSeconds)}>
                  <Text style={styles.timerBtnText}>Mulai Pengatur Waktu</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.timerBtnStop} onPress={stopCookingTimer}>
                  <Text style={styles.timerBtnText}>Jeda</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.cookingFooter}>
          <TouchableOpacity
            style={styles.cookingNavBtn}
            onPress={() => {
              if (currentStepIndex === 0) {
                setScreen('MAIN');
                setActiveTab('resep');
                setIsPlayingVideo(false);
              } else {
                setCurrentStepIndex(currentStepIndex - 1);
                stopCookingTimer();
              }
            }}
          >
            <Text style={styles.cookingNavBtnText}>
              {currentStepIndex === 0 ? '❌ Batal' : '◀ Mundur'}
            </Text>
          </TouchableOpacity>

          {currentStepIndex < totalSteps - 1 ? (
            <TouchableOpacity
              style={styles.cookingNavBtnHighlight}
              onPress={() => {
                setCurrentStepIndex(currentStepIndex + 1);
                stopCookingTimer();
              }}
            >
              <Text style={styles.cookingNavBtnHighlightText}>Lanjut ▶</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cookingNavBtnDone} onPress={handleFinishCooking}>
              <Text style={styles.cookingNavBtnDoneText}>Selesai Memasak! 🎉</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // COOKING SUCCESS SCREEN
  if (screen === 'COOKING_SUCCESS') {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🍳</Text>
        <Text style={styles.successHeading}>Selamat! Hidangan Selesai</Text>
        <Text style={styles.successSub}>Anda telah memasak **{cookingSuccessData.recipe_title}**.</Text>

        <View style={styles.successReportCard}>
          <Text style={styles.reportCardTitle}>Dampak Nyata Pilihan Anda:</Text>

          <View style={styles.reportRow}>
            <Text style={styles.reportRowLabel}>Limbah Pangan Dicegah:</Text>
            <Text style={styles.reportRowVal}>{cookingSuccessData.waste_prevented} kg</Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={styles.reportRowLabel}>Estimasi Biaya Dihemat:</Text>
            <Text style={styles.reportRowVal}>Rp {cookingSuccessData.cost_saved.toLocaleString('id-ID')}</Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={styles.reportRowLabel}>Pengurangan CO2:</Text>
            <Text style={styles.reportRowVal}>{roundDec(cookingSuccessData.waste_prevented * 2.5, 2)} kg CO2</Text>
          </View>

          <Text style={styles.successFootnote}>
            * Stok bahan di menu "Kulkas Saya" Anda telah otomatis terpotong (Auto-Deduct).
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => { setScreen('MAIN'); setActiveTab('kulkas'); }}>
          <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // MAIN SYSTEM WITH BOTTOM NAV
  return (
    <View style={styles.container}>
      {/* HEADER PANELS */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Olahin</Text>
          <Text style={styles.headerSubtitle}>Halo, {user.name} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.networkBadge, isOnline ? styles.networkOnline : styles.networkOffline]}>
            {isOnline ? 'Online DB' : 'Offline Mode'}
          </Text>
        </View>
      </View>

      {/* VIEWPORT SCROLL FOR CONTENT */}
      <ScrollView style={styles.viewport}>

        {/* TAB 1: KULKAS SAYA (MY REFRIGERATOR) */}
        {activeTab === 'kulkas' && (
          <View style={styles.tabContent}>
            <View style={styles.inlineHeader}>
              <Text style={styles.sectionTitle}>Kulkas Saya</Text>
              <TouchableOpacity style={styles.btnSmallText} onPress={() => setAddModalVisible(true)}>
                <Text style={styles.btnSmallTextLabel}>+ Tambah Bahan</Text>
              </TouchableOpacity>
            </View>

            {/* Smart AI Inputs Panel */}
            <View style={styles.aiInputsContainer}>
              <TouchableOpacity style={styles.aiInputBtn} onPress={handleScanIngredients}>
                <Text style={styles.aiInputBtnEmoji}>📷</Text>
                <Text style={styles.aiInputBtnTitle}>Scan Bahan</Text>
                <Text style={styles.aiInputBtnDesc}>Deteksi AI Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.aiInputBtn} onPress={startRecording}>
                <Text style={styles.aiInputBtnEmoji}>🎙️</Text>
                <Text style={styles.aiInputBtnTitle}>Input Suara</Text>
                <Text style={styles.aiInputBtnDesc}>Ekstraksi NLP</Text>
              </TouchableOpacity>
            </View>

            {/* Ingredients List */}
            {fridge.length === 0 ? (
              <View style={styles.emptyFridgeContainer}>
                <Text style={styles.emptyFridgeEmoji}>🥬</Text>
                <Text style={styles.emptyFridgeText}>Kulkas Anda kosong.</Text>
                <Text style={styles.emptyFridgeSubText}>Tambahkan bahan masakan secara manual atau gunakan AI input di atas.</Text>
              </View>
            ) : (
              fridge.map((item) => (
                <View key={item.id} style={styles.fridgeCard}>
                  <View style={styles.fridgeCardHeader}>
                    <Text style={styles.fridgeCardName}>{item.name}</Text>
                    <Text style={styles.fridgeCardCategory}>{item.category}</Text>
                  </View>

                  <View style={styles.fridgeCardDetails}>
                    <Text style={styles.fridgeCardQty}>
                      Stok: {item.quantity} {item.unit}
                    </Text>
                    <View style={[styles.expiryLabelWrapper, getExpiryStyle(item.expiry_date)]}>
                      <Text style={styles.expiryLabelText}>{getExpiryLabel(item.expiry_date)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteFridgeItem(item.id)}>
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: REVERSE RECIPE MATCHING ENGINE */}
        {activeTab === 'resep' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Pencarian Resep Pintar</Text>
            <Text style={styles.sectionDesc}>
              Berdasarkan bahan di Kulkas Saya, berikut resep dengan tingkat kecocokan bahan $\ge 50\%$:
            </Text>

            {matchedRecipes.length === 0 ? (
              <View style={styles.emptyRecipes}>
                <Text style={styles.emptyRecipesEmoji}>🍳</Text>
                <Text style={styles.emptyRecipesTitle}>Tidak Ada Resep yang Cocok</Text>
                <Text style={styles.emptyRecipesDesc}>
                  Tambahkan lebih banyak bahan ke kulkas Anda (terutama protein, sayur, atau bumbu) untuk mencocokkan resep masakan.
                </Text>
              </View>
            ) : (
              matchedRecipes.map((recipe) => (
                <View key={recipe.id} style={styles.recipeCard}>
                  <View style={styles.recipeCardHeader}>
                    <View style={styles.badgePercentage}>
                      <Text style={styles.badgePercentageText}>{recipe.match_percentage}% Cocok</Text>
                    </View>
                    <Text style={styles.recipeCardTitle}>{recipe.title}</Text>
                  </View>

                  <Text style={styles.recipeCardDesc}>{recipe.description}</Text>

                  {/* Nutrition Summary */}
                  <View style={styles.recipeNutritionStrip}>
                    <Text style={styles.nutriLabel}>Kalori: {recipe.calories} kkal</Text>
                    <Text style={styles.nutriLabel}>Karbo: {recipe.carbs}g</Text>
                    <Text style={styles.nutriLabel}>Pro: {recipe.protein}g</Text>
                    <Text style={styles.nutriLabel}>Lemak: {recipe.fat}g</Text>
                  </View>

                  {/* Cooking prep time */}
                  <Text style={styles.recipeMetaText}>⏱️ Waktu Persiapan: {recipe.prep_time} Menit</Text>

                  {/* Expiry Priority Warning */}
                  {recipe.min_expiry_days !== null && recipe.min_expiry_days <= 2 && (
                    <View style={styles.expiryPriorityWarning}>
                      <Text style={styles.expiryPriorityWarningText}>
                        ⚠️ Rekomendasi: Menggunakan bahan yang akan kedaluwarsa dalam {recipe.min_expiry_days} hari!
                      </Text>
                    </View>
                  )}

                  {/* Detail Ingredients Breakdown */}
                  <View style={styles.ingBreakdownContainer}>
                    <Text style={styles.ingBreakdownTitle}>Bahan Tersedia:</Text>
                    <Text style={styles.ingBreakdownText}>
                      {recipe.matched_ingredients?.map(i => i.name).join(', ') || 'Semua'}
                    </Text>

                    {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                      <>
                        <Text style={styles.ingBreakdownTitleMissing}>Bahan Kurang:</Text>
                        <Text style={styles.ingBreakdownTextMissing}>
                          {recipe.missing_ingredients.map(i => `${i.name} (${i.qty_needed} ${i.unit})`).join(', ')}
                        </Text>
                      </>
                    )}
                  </View>

                  <TouchableOpacity style={styles.cookButton} onPress={() => startCooking(recipe)}>
                    <Text style={styles.cookButtonText}>Mulai Panduan Memasak 🍳</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: INSIGHT WEEKLY REPORTS */}
        {activeTab === 'insight' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Laporan Mingguan Insight</Text>
            <Text style={styles.sectionDesc}>Statistik pencegahan limbah makanan di kulkas Anda.</Text>

            {/* Impact Metric Cards */}
            <View style={styles.insightMetricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricCardVal}>{totalWastePrevented} kg</Text>
                <Text style={styles.metricCardLabel}>Limbah Makanan Dicegah</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricCardVal}>Rp {totalCostSaved.toLocaleString('id-ID')}</Text>
                <Text style={styles.metricCardLabel}>Efisiensi Belanja Dihemat</Text>
              </View>
            </View>

            <View style={styles.carbonBox}>
              <Text style={styles.carbonBoxTitle}>🌱 Kontribusi Karbon Anda</Text>
              <Text style={styles.carbonBoxText}>
                Dengan mencegah membuang bahan pangan kedaluwarsa, Anda berhasil mengurangi emisi karbon sebesar **{co2Prevented} kg CO2** minggu ini!
              </Text>
            </View>

            {/* Graphic Bar Chart (Volume of Prevented Waste) */}
            <Text style={styles.chartTitle}>Limbah Dicegah 7 Hari Terakhir (kg)</Text>
            <View style={styles.chartContainer}>
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>2.0</Text>
                <Text style={styles.yAxisLabel}>1.5</Text>
                <Text style={styles.yAxisLabel}>1.0</Text>
                <Text style={styles.yAxisLabel}>0.5</Text>
                <Text style={styles.yAxisLabel}>0.0</Text>
              </View>

              <View style={styles.chartBarsArea}>
                {insights.map((item, idx) => {
                  // Max height representation = 2.0 kg
                  const pct = Math.min((item.waste_kg / 2.0) * 100, 100);
                  return (
                    <View key={idx} style={styles.chartCol}>
                      <View style={styles.barBackground}>
                        <View style={[styles.barFill, { height: `${pct}%` }]} />
                      </View>
                      <Text style={styles.chartBarLabel}>{item.day}</Text>
                      <Text style={styles.chartBarVal}>{item.waste_kg}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Shopping Cost Efficiency Calculator */}
            <View style={styles.calculatorCard}>
              <Text style={styles.calculatorTitle}>🧮 Estimasi Kalkulator Efisiensi Belanja</Text>
              <Text style={styles.calculatorDesc}>
                Jika rata-rata anggaran belanja bulanan Anda adalah **Rp 1.500.000**, dengan tingkat pencegahan limbah **{totalWastePrevented} kg** saat ini,
                estimasi uang belanja Anda yang berhasil diselamatkan adalah:
              </Text>
              <View style={styles.calculatorResult}>
                <Text style={styles.calculatorResultTitle}>Uang Belanja Dihemat Bulan Ini:</Text>
                <Text style={styles.calculatorResultVal}>
                  Rp {(totalCostSaved * 4).toLocaleString('id-ID')}
                </Text>
                <Text style={styles.calculatorResultNote}>
                  (Mengurangi pemborosan bulanan Anda sebesar ~{Math.round((totalCostSaved * 4 / 1500000) * 100)}%)
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: PROFILE & NUTRIENT GOALS */}
        {activeTab === 'profil' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Profil Target Gizi</Text>

            <View style={styles.profileSummaryCard}>
              <View style={styles.profileSummaryRow}>
                <Text style={styles.profileSummaryLabel}>Nama Pengguna:</Text>
                <Text style={styles.profileSummaryVal}>{user.name}</Text>
              </View>
              <View style={styles.profileSummaryRow}>
                <Text style={styles.profileSummaryLabel}>Email:</Text>
                <Text style={styles.profileSummaryVal}>{user.email}</Text>
              </View>
            </View>

            {/* Nutrients Target Progress Visual */}
            <Text style={styles.chartTitle}>Target Nutrisi Harian Anda</Text>
            <View style={styles.nutritionBox}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutriRowHeader}>
                  <Text style={styles.nutriName}>🔥 Kalori</Text>
                  <Text style={styles.nutriVal}>{user.target_calories} kkal</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#2E7D32' }]} />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <View style={styles.nutriRowHeader}>
                  <Text style={styles.nutriName}>🍞 Karbohidrat</Text>
                  <Text style={styles.nutriVal}>{user.target_carbs}g</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#1976D2' }]} />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <View style={styles.nutriRowHeader}>
                  <Text style={styles.nutriName}>🥩 Protein</Text>
                  <Text style={styles.nutriVal}>{user.target_protein}g</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#E53935' }]} />
                </View>
              </View>

              <View style={styles.nutritionRow}>
                <View style={styles.nutriRowHeader}>
                  <Text style={styles.nutriName}>🥑 Lemak</Text>
                  <Text style={styles.nutriVal}>{user.target_fat}g</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#F57C00' }]} />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => {
              setTargetCaloriesInput(user.target_calories.toString());
              setTargetCarbsInput(user.target_carbs.toString());
              setTargetProteinInput(user.target_protein.toString());
              setTargetFatInput(user.target_fat.toString());
              setProfileModalVisible(true);
            }}>
              <Text style={styles.primaryButtonText}>Sesuaikan Target Gizi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen('WELCOME')}>
              <Text style={styles.secondaryButtonText}>Keluar / Ganti Akun</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* BOTTOM NAV BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'kulkas' && styles.navItemActive]}
          onPress={() => setActiveTab('kulkas')}
        >
          <Text style={styles.navIcon}>🥬</Text>
          <Text style={[styles.navText, activeTab === 'kulkas' && styles.navTextActive]}>Kulkas Saya</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'resep' && styles.navItemActive]}
          onPress={() => setActiveTab('resep')}
        >
          <Text style={styles.navIcon}>🍳</Text>
          <Text style={[styles.navText, activeTab === 'resep' && styles.navTextActive]}>Resep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'insight' && styles.navItemActive]}
          onPress={() => setActiveTab('insight')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navText, activeTab === 'insight' && styles.navTextActive]}>Insight</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profil' && styles.navItemActive]}
          onPress={() => setActiveTab('profil')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navText, activeTab === 'profil' && styles.navTextActive]}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}

      {/* Add Item Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tambah Bahan Baru</Text>

            <Text style={styles.inputLabel}>Nama Bahan</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Wortel, Bawang"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <View style={styles.inlineInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Jumlah</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: 100"
                  value={newItemQty}
                  onChangeText={setNewItemQty}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Satuan</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="gr, ml, pcs"
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Kategori</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Sayuran, Bumbu, Daging & Telur"
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />

            <Text style={styles.inputLabel}>Masa Simpan (Hari)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 5"
              value={newItemExpiry}
              onChangeText={setNewItemExpiry}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalBtnTextCancel}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtnSave} onPress={handleAddFridgeItem}>
                <Text style={styles.modalBtnTextSave}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Adjust Profile Target Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Target Gizi Harian</Text>

            <Text style={styles.inputLabel}>Target Kalori (kkal)</Text>
            <TextInput
              style={styles.textInput}
              value={targetCaloriesInput}
              onChangeText={setTargetCaloriesInput}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Target Karbohidrat (g)</Text>
            <TextInput
              style={styles.textInput}
              value={targetCarbsInput}
              onChangeText={setTargetCarbsInput}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Target Protein (g)</Text>
            <TextInput
              style={styles.textInput}
              value={targetProteinInput}
              onChangeText={setTargetProteinInput}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Target Lemak (g)</Text>
            <TextInput
              style={styles.textInput}
              value={targetFatInput}
              onChangeText={setTargetFatInput}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.modalBtnTextCancel}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtnSave} onPress={handleUpdateTargets}>
                <Text style={styles.modalBtnTextSave}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Scan Options Modal */}
      <Modal visible={scanModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.aiFeedbackCard}>
            <Text style={styles.aiFeedbackEmoji}>📷</Text>
            <Text style={styles.aiFeedbackTitle}>Pindai Bahan Makanan</Text>
            <Text style={styles.aiFeedbackDesc}>Pilih metode pengambilan gambar bahan makanan Anda:</Text>
            
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 20, width: '100%' }]}
              onPress={() => {
                setScanModalVisible(false);
                launchCameraScan();
              }}
            >
              <Text style={styles.primaryButtonText}>📷 Ambil Foto (Kamera)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 10, width: '100%', marginBottom: 20 }]}
              onPress={() => {
                setScanModalVisible(false);
                launchGalleryScan();
              }}
            >
              <Text style={styles.secondaryButtonText}>🖼️ Pilih dari Galeri</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtnCancel, { paddingVertical: 10, width: '100%', alignItems: 'center' }]}
              onPress={() => setScanModalVisible(false)}
            >
              <Text style={styles.modalBtnTextCancel}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera Scanning Simulation Modal */}
      <Modal visible={cameraModalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.aiFeedbackCard}>
            <Text style={styles.aiFeedbackEmoji}>📷</Text>
            {scannedImageUri && (
              <Image
                source={{ uri: scannedImageUri }}
                style={{ width: 150, height: 150, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#C8E6C9' }}
              />
            )}
            <Text style={styles.aiFeedbackTitle}>Menganalisis Foto...</Text>
            <Text style={styles.aiFeedbackDesc}>Modul Computer Vision sedang mendeteksi bahan makanan Anda secara real-time.</Text>
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>

      {/* Manual Ingredient Entry Modal (web fallback when AI upload is unavailable) */}
      <Modal visible={manualDetectVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {manualDetectSource === 'suara' ? 'Nama Bahan dari Suara' : 'Nama Bahan dari Foto'}
            </Text>
            <Text style={styles.inputLabel}>Nama Bahan</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Terong, Wortel, Tomat"
              value={manualDetectName}
              onChangeText={setManualDetectName}
            />
            <Text style={styles.inputLabel}>Jumlah (pcs)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 2"
              value={manualDetectQty}
              onChangeText={setManualDetectQty}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setManualDetectVisible(false)}>
                <Text style={styles.modalBtnTextCancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleManualDetect}>
                <Text style={styles.modalBtnTextSave}>Tambahkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Voice Recording Simulation Modal */}
      <Modal visible={voiceModalVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.aiFeedbackCard}>
            <Text style={styles.aiFeedbackEmoji}>🎙️</Text>
            <Text style={styles.aiFeedbackTitle}>
              {isRecording ? 'Merekam Suara...' : 'Menganalisis Suara...'}
            </Text>
            <Text style={styles.aiFeedbackDesc}>
              {isRecording
                ? 'Katakan bahan makanan & jumlahnya. Contoh: "Satu butir telur dan dua ratus gram bayam".'
                : 'Mengekstrak bahan dapur menggunakan modul NLP...'}
            </Text>
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 16 }} />

            {isRecording && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 20, width: '100%' }]}
                onPress={stopRecording}
              >
                <Text style={styles.primaryButtonText}>Selesai Bicara & Analisis 🎙️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const COOKING_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

function CookingVideoPlayer() {
  return (
    <Video
      style={styles.cookingVideoPlayer}
      source={{ uri: COOKING_VIDEO_URL }}
      rate={1.0}
      volume={1.0}
      isMuted={false}
      resizeMode={ResizeMode.COVER}
      shouldPlay
      isLooping
      useNativeControls
    />
  );
}

// PREMIUM GLASSMORPHISM AESTHETIC PALETTE (GREEN NATURE)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8F5',
    fontFamily: Platform.OS === 'web' ? 'Outfit, Roboto, sans-serif' : undefined,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoContainer: {
    alignItems: 'center',
  },
  splashLogoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#C8E6C9',
  },
  splashAppName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  splashTagline: {
    fontSize: 16,
    color: '#C8E6C9',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  welcomeOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(27, 54, 29, 0.6)',
  },
  welcomeModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F1F8F5',
  },
  authCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  inlineInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  backLinkText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#C8E6C9',
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  networkBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  networkOnline: {
    backgroundColor: '#43A047',
  },
  networkOffline: {
    backgroundColor: '#F57C00',
  },
  viewport: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContent: {
    paddingBottom: 80,
  },
  inlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  btnSmallText: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnSmallTextLabel: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 12,
  },
  aiInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aiInputBtn: {
    flex: 1,
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.15)',
  },
  aiInputBtnEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  aiInputBtnTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  aiInputBtnDesc: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  emptyFridgeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  emptyFridgeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyFridgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emptyFridgeSubText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    lineHeight: 16,
  },
  fridgeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    position: 'relative',
  },
  fridgeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fridgeCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fridgeCardCategory: {
    fontSize: 11,
    color: '#777',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fridgeCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingRight: 60,
  },
  fridgeCardQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  expiryLabelWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  expiryLabelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  expiryAlertRed: {
    backgroundColor: '#E53935',
  },
  expiryAlertYellow: {
    backgroundColor: '#FFB300',
  },
  expiryAlertGreen: {
    backgroundColor: '#43A047',
  },
  deleteBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyRecipes: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  emptyRecipesEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyRecipesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emptyRecipesDesc: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    lineHeight: 16,
  },
  recipeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  recipeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePercentage: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  badgePercentageText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 12,
  },
  recipeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  recipeCardDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  recipeNutritionStrip: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  nutriLabel: {
    fontSize: 11,
    color: '#444',
    marginRight: 12,
    fontWeight: '600',
  },
  recipeMetaText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    marginBottom: 10,
  },
  expiryPriorityWarning: {
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#FFF59D',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  expiryPriorityWarningText: {
    color: '#F57F17',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ingBreakdownContainer: {
    backgroundColor: '#FAFDFB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 14,
  },
  ingBreakdownTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  ingBreakdownText: {
    fontSize: 12,
    color: '#444',
    marginBottom: 6,
  },
  ingBreakdownTitleMissing: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 2,
  },
  ingBreakdownTextMissing: {
    fontSize: 12,
    color: '#C62828',
  },
  cookButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cookButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  insightMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    alignItems: 'center',
  },
  metricCardVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  metricCardLabel: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
  carbonBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  carbonBoxTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  carbonBoxText: {
    fontSize: 12,
    color: '#388E3C',
    lineHeight: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 20,
    height: 180,
  },
  yAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 25,
    paddingRight: 6,
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    height: 120,
  },
  yAxisLabel: {
    fontSize: 9,
    color: '#999',
  },
  chartBarsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingLeft: 8,
  },
  chartCol: {
    alignItems: 'center',
  },
  barBackground: {
    width: 14,
    height: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#555',
    marginTop: 6,
  },
  chartBarVal: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 2,
  },
  calculatorCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 20,
  },
  calculatorTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6,
  },
  calculatorDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 12,
  },
  calculatorResult: {
    backgroundColor: '#F1F8F5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  calculatorResultTitle: {
    fontSize: 12,
    color: '#555',
  },
  calculatorResultVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 4,
  },
  calculatorResultNote: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },
  profileSummaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 20,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  profileSummaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  profileSummaryVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 20,
  },
  nutritionRow: {
    marginBottom: 12,
  },
  nutriRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutriName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444',
  },
  nutriVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemActive: {
    borderTopWidth: 3,
    borderTopColor: '#2E7D32',
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
  },
  navTextActive: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  modalBtnTextCancel: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalBtnSave: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalBtnTextSave: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  aiFeedbackCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  aiFeedbackEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  aiFeedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6,
    textAlign: 'center',
  },
  aiFeedbackDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  cookingModeContainer: {
    flex: 1,
    backgroundColor: '#F1F8F5',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  cookingHeader: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  cookingHeaderSub: {
    fontSize: 12,
    color: '#555',
  },
  cookingHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 2,
  },
  cookingVideoPanel: {
    width: '100%',
    height: 180,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cookingVideoImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  cookingVideoPlayer: {
    width: '100%',
    height: '100%',
  },
  cookingVideoOverlay: {
    position: 'absolute',
  },
  videoPlayBtn: {
    color: '#FFF',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cookingStepCard: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  stepTextScroll: {
    maxHeight: 120,
  },
  stepTextContent: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    fontWeight: '500',
  },
  timerWrapper: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  timerDigits: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 2,
    marginBottom: 10,
  },
  timerBtnStart: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timerBtnStop: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timerBtnText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cookingNavBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cookingNavBtnText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cookingNavBtnHighlight: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cookingNavBtnHighlightText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cookingNavBtnDone: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cookingNavBtnDoneText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#F1F8F5',
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  successReportCard: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 24,
  },
  reportCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  reportRowLabel: {
    fontSize: 13,
    color: '#666',
  },
  reportRowVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  successFootnote: {
    fontSize: 10,
    color: '#777',
    marginTop: 14,
    fontStyle: 'italic',
    lineHeight: 14,
    textAlign: 'center',
  },
});
