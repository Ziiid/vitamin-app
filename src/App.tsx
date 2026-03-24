import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import Onboarding from './components/Onboarding'
import MainApp from './components/MainApp'
import type { UserProfile } from './components/Onboarding'
import type { GeneratedSchedule } from './types/schedule'
import { supabase } from './lib/supabase'

function Inner() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null)
  const [appLoading, setAppLoading] = useState(false)

  useEffect(() => {
    if (!user) { setProfile(null); setSchedule(null); return }
    setAppLoading(true)
    Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('schedules').select('schedule').eq('user_id', user.id).maybeSingle(),
    ]).then(([{ data: profileData }, { data: scheduleData }]) => {
      if (profileData) {
        setProfile({
          age: profileData.age,
          sex: profileData.sex,
          weight: profileData.weight,
          height: profileData.height,
          goals: profileData.goals,
        })
      }
      if (scheduleData?.schedule?.dailyGoals) setSchedule(scheduleData.schedule)
      setAppLoading(false)
    })
  }, [user])

  const handleProfileComplete = (p: UserProfile, s: GeneratedSchedule) => {
    setProfile(p)
    setSchedule(s)
  }

  if (loading || appLoading) {
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
  if (!profile || !schedule) return <Onboarding onComplete={handleProfileComplete} />

  return <MainApp profile={profile} schedule={schedule} onReset={() => { setProfile(null); setSchedule(null) }} />
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
