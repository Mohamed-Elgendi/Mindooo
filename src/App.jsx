import './index.css'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setConnected(true)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">AXIS</h1>
        <p className="text-gray-400 text-lg mb-6">
          Personal Second Brain and AI Power User System
        </p>
        <div className="bg-green-900 text-green-300 px-6 py-3 rounded-lg text-sm font-medium">
          {connected ? 'Supabase connected successfully' : 'Connecting...'}
        </div>
      </div>
    </div>
  )
}

export default App