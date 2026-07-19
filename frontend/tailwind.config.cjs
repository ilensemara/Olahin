/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          cream: '#F4F3EA',   // Background krem hangat aplikasi
          card: '#FFFFFF',    // Background kartu putih bersih
          input: '#EAE8DC',   // Latar belakang input abu-krem
          forest: '#2C3529',  // Teks arang kehijauan gelap
          zaitun: '#4D5C48',  // Warna utama (Olive/Zaitun utama)
          olive: '#6E8067',   // Warna zaitun sedang
          sage: '#D1D8CD',    // Hijau sage muda untuk border/badge
          mint: '#EBF0E9',    // Hijau mint muda
          red: '#C85C5C',     // Merah kadaluwarsa
          yellow: '#DF9D4F',  // Jingga/Kuning gizi/sedang
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'mobile': '0 8px 30px rgb(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
