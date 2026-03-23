import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/signin')
      } else {
        setUser(session.user)
      }
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/signin')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex">
        <div className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">AXIS</h1>
          <p className="text-gray-500 text-xs mb-8">Personal Second Brain</p>
          <nav className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-purple-600 text-white text-sm font-medium">
              Chat
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-sm">
              Engines
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-sm">
              Prompt Chains
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-sm">
              Templates
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-sm">
              Skill Builder
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-sm">
              Memory
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 text-sm">
              Settings
            </button>
          </nav>
          <div className="absolute bottom-6">
            <p className="text-gray-500 text-xs mb-3">{user.email}</p>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome to AXIS</h2>
            <p className="text-gray-400">Your Second Brain is ready. What is on your mind?</p>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <p className="text-gray-500 text-sm text-center py-12">
              AXIS Chat coming next...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}