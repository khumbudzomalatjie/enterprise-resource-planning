import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'
import useAuthStore from './store/authStore'

export default function App() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#3a3a3a',
            color: '#fff',
            borderRadius: '25px',
            boxShadow: '5px 5px 20px #2a2a2a, -5px -5px 20px #4a4a4a',
          },
        }}
      />
      <AppRoutes />
    </>
  )
}
