import { useState } from 'react'
import { motion } from 'framer-motion'
import type { UserProfile } from './Onboarding'
import Schedule from './Schedule'
import DailyLog from './DailyLog'
import { useAuth } from '../context/AuthContext'

interface Props {
  profile: UserProfile
  onReset: () => void
}

type Tab = 'schedule' | 'log' | 'profile'

export default function MainApp({ profile, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('log')
  const { user, signOut } = useAuth()

  return (
    <div className="main-app">
      <div className="tab-content">
        {tab === 'schedule' && <Schedule profile={profile} onReset={onReset} />}
        {tab === 'log' && <DailyLog profile={profile} />}
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
              {user && (
                <button className="reset-btn profile-btn danger-btn" onClick={signOut}>
                  Logga ut
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        {([
          { id: 'log', label: 'Idag', icon: '✅' },
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
  )
}
