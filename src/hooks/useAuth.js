import { useEffect } from 'react'
import useAuthStore from '../store/authStore'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    store.initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        store.fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        // Clear state
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return store
}

import { supabase } from '../lib/supabaseClient'
