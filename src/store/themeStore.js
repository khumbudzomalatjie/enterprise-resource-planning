import { create } from 'zustand'

const useThemeStore = create((set, get) => ({
  isDark: (() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('ndanduleni-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })(),

  toggleTheme: () => {
    const newIsDark = !get().isDark
    set({ isDark: newIsDark })
    localStorage.setItem('ndanduleni-theme', newIsDark ? 'dark' : 'light')
    
    // Update DOM
    if (newIsDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  initTheme: () => {
    const isDark = get().isDark
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}))

export default useThemeStore
