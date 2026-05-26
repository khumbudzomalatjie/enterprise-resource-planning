import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true })
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session?.user) {
        set({ 
          user: session.user, 
          session,
          loading: false 
        })
        await get().fetchProfile(session.user.id)
      } else {
        set({ loading: false })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ error: error.message, loading: false })
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      set({ profile: data })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      set({ 
        user: data.user, 
        session: data.session,
        loading: false 
      })
      
      await get().fetchProfile(data.user.id)
      
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      set({ 
        user: null, 
        profile: null, 
        session: null,
        loading: false 
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  resetPassword: async (newPassword) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  updateProfile: async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      set({ profile: data })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
