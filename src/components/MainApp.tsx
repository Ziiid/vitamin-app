import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UserProfile } from './Onboarding'
import type { GeneratedSchedule } from '../types/schedule'
import Schedule from './Schedule'
import PrivacyPolicy from './PrivacyPolicy'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

interface Props {
  profile: UserProfile
  schedule: GeneratedSchedule
  onReset: () => void
}

type Tab = 'schedule' | 'profile'

export default function MainApp({ profile, schedule, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('schedule')
  const [showPolicy, setShowPolicy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { user, signOut } = useAuth()

  const deleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    await supabase.rpc('delete_user')
    await signOut()
    setDeleting(false)
  }

  return (
    <>
      <div className="main-app">
        <div className="tab-content">
          {tab === 'schedule' && <Schedule profile={profile} schedule={schedule} onReset={onReset} />}
          {tab === 'profile' && (
            <div className="schedule-container">
              <motion.div
                className="schedule-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="schedule-title">Din profil</h2>
                <p className="schedule-subtitle">{user?.email}</p>
              </motion.div>

              <div className="profile-card">
                <div className="profile-row">
                  <span className="profile-label">Ålder</span>
                  <span className="profile-value">{profile.age} år</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Kön</span>
                  <span className="profile-value">{profile.sex === 'female' ? 'Kvinna' : 'Man'}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Vikt</span>
                  <span className="profile-value">{profile.weight} kg</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Längd</span>
                  <span className="profile-value">{profile.height} cm</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">BMI</span>
                  <span className="profile-value">
                    {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                  </span>
                </div>
                <div className="profile-row" style={{ alignItems: 'flex-start' }}>
                  <span className="profile-label">Mål</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                    {profile.goals.map(g => (
                      <span key={g} className="goal-tag">{g}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <button className="reset-btn profile-btn" onClick={onReset}>
                  Ändra profil
                </button>
                <button className="reset-btn profile-btn" onClick={() => setShowPolicy(true)}>
                  Integritetspolicy
                </button>
                {user && (
                  <button className="reset-btn profile-btn danger-btn" onClick={signOut}>
                    Logga ut
                  </button>
                )}
                {user && !confirmDelete && (
                  <button className="reset-btn profile-btn delete-btn" onClick={() => setConfirmDelete(true)}>
                    Radera mitt konto
                  </button>
                )}
                {confirmDelete && (
                  <div className="delete-confirm">
                    <p>Är du säker? All din data raderas permanent.</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className="delete-cancel-btn" onClick={() => setConfirmDelete(false)}>Avbryt</button>
                      <button className="delete-confirm-btn" onClick={deleteAccount} disabled={deleting}>
                        {deleting ? 'Raderar...' : 'Ja, radera allt'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <nav className="bottom-nav">
          {([
            { id: 'schedule', label: 'Schema', icon: '📋' },
            { id: 'profile', label: 'Profil', icon: '👤' },
          ] as { id: Tab; label: string; icon: string }[]).map(item => (
            <button
              key={item.id}
              className={`nav-tab ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {showPolicy && <PrivacyPolicy onClose={() => setShowPolicy(false)} />}
      </AnimatePresence>
    </>
  )
}
