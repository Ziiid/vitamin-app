import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { vitamins } from '../data/vitamins'
import type { UserProfile } from './Onboarding'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface Props {
  profile: UserProfile
}

const today = () => new Date().toISOString().split('T')[0]

export default function DailyLog({ profile }: Props) {
  const { user } = useAuth()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const relevant = vitamins.filter(v => v.goals.some(g => profile.goals.includes(g)))
  const total = relevant.length
  const done = checked.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  useEffect(() => {
    const loadLog = async () => {
      setLoading(true)
      if (user) {
        const { data } = await supabase
          .from('daily_logs')
          .select('vitamin_id')
          .eq('user_id', user.id)
          .eq('date', today())
        if (data) setChecked(new Set(data.map((r: { vitamin_id: string }) => r.vitamin_id)))
      } else {
        const stored = localStorage.getItem(`log_${today()}`)
        if (stored) setChecked(new Set(JSON.parse(stored)))
      }
      setLoading(false)
    }
    loadLog()
  }, [user])

  const toggle = async (id: string) => {
    const next = new Set(checked)
    if (next.has(id)) {
      next.delete(id)
      if (user) {
        await supabase.from('daily_logs')
          .delete()
          .eq('user_id', user.id)
          .eq('date', today())
          .eq('vitamin_id', id)
      }
    } else {
      next.add(id)
      if (user) {
        await supabase.from('daily_logs').insert({
          user_id: user.id,
          date: today(),
          vitamin_id: id,
        })
      }
    }
    setChecked(next)
    if (!user) localStorage.setItem(`log_${today()}`, JSON.stringify([...next]))
  }

  const dateLabel = new Date().toLocaleDateString('sv-SE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  if (loading) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Laddar...</div>

  return (
    <div className="schedule-container">
      <motion.div
        className="schedule-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="schedule-title">Dagens logg</h2>
        <p className="schedule-subtitle" style={{ textTransform: 'capitalize' }}>{dateLabel}</p>

        <div className="progress-bar-wrap">
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="progress-label">{done}/{total} tagna</span>
        </div>
      </motion.div>

      {pct === 100 && (
        <motion.div
          className="completed-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span>🎉</span>
          <span>Bra jobbat! Alla vitaminer tagna idag.</span>
        </motion.div>
      )}

      <div className="log-list">
        {relevant.map((v, i) => {
          const isDone = checked.has(v.id)
          return (
            <motion.button
              key={v.id}
              className={`log-item ${isDone ? 'log-done' : ''}`}
              onClick={() => toggle(v.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="log-check">
                {isDone ? <span className="check-icon">✓</span> : <span className="check-empty" />}
              </div>
              <span className="log-emoji">{v.emoji}</span>
              <div className="log-info">
                <span className="log-name">{v.name}</span>
                <span className="log-dose">{v.dose(profile.age, profile.sex)}</span>
              </div>
              <div className="log-time">
                {v.times.map(t => (
                  <span key={t} className="log-time-badge">{
                    { morning: '🌅', midday: '☀️', evening: '🌆', night: '🌙' }[t]
                  }</span>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
