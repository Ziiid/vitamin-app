import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import Onboarding from './components/Onboarding'
import MainApp from './components/MainApp'
import type { UserProfile } from './components/Onboarding'
import { supabase } from './lib/supabase'

function Inner() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (!user) { setProfile(null); return }
    setProfileLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            age: data.age,
            sex: data.sex,
            weight: data.weight,
            height: data.height,
            goals: data.goals,
          })
        }
        setProfileLoading(false)
      })
  }, [user])

  if (loading || profileLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3D6B4A 0%, #4A7C59 100%)',
      }}>
        <div style={{ fontSize: 40 }}>🌿</div>
      </div>
    )
  }

  if (!user) return <AuthScreen />
  if (!profile) return <Onboarding onComplete={setProfile} />

  return <MainApp profile={profile} onReset={() => setProfile(null)} />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Inner />
      </div>
    </AuthProvider>
  )
}
