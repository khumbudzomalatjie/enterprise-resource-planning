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
      set({ loading: true, error: null })
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        set({ loading: false })
        return
      }
      
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
      console.log('Fetching profile for user:', userId)
      
      // First try to get existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // If profile doesn't exist, create one
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...')
        const user = get().user
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            role: user?.user_metadata?.role || 'customer',
            is_active: true
          }])
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          // Set a default profile so the app doesn't break
          set({ 
            profile: {
              id: userId,
              email: user?.email || '',
              full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
              role: user?.user_metadata?.role || 'customer'
            }
          })
          return
        }
        
        data = newProfile
      } else if (error) {
        console.error('Error fetching profile:', error)
        // Set a basic profile from user metadata
        const user = get().user
        set({ 
          profile: {
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            role: user?.user_metadata?.role || 'customer'
          }
        })
        return
      }
      
      console.log('Profile loaded:', data)
      set({ profile: data })
    } catch (error) {
      console.error('Error in fetchProfile:', error)
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
      console.error('Sign in error:', error)
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
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
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
      console.error('Forgot password error:', error)
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
      console.error('Reset password error:', error)
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
      return { success: true, data }
    } catch (error) {
      console.error('Update profile error:', error)
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
      console.error('Get all users error:', error)
      return { success: false, error: error.message, data: [] }
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
