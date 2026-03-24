import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Goal } from '../data/vitamins'
import { goalLabels, goalEmojis } from '../data/vitamins'
import type { GeneratedSchedule } from '../types/schedule'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { mockProfile, mockSchedule } from '../data/mockSchedule'

export interface UserProfile {
  age: number
  sex: 'male' | 'female'
  weight: number
  height: number
  goals: Goal[]
}

interface Props {
  onComplete: (profile: UserProfile, schedule: GeneratedSchedule) => void
}

const allGoals: Goal[] = ['immunity', 'energy', 'sleep', 'bones', 'skin', 'training']

export default function Onboarding({ onComplete }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | ''>('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goals, setGoals] = useState<Goal[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const toggleGoal = (g: Goal) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const canContinue = [
    age !== '' && Number(age) > 0 && Number(age) < 120 && sex !== '',
    weight !== '' && Number(weight) > 0 && height !== '' && Number(height) > 0,
    goals.length > 0,
  ]

  const handleSubmit = async () => {
    setGenerating(true)
    setError('')
    const profile: UserProfile = {
      age: Number(age),
      sex: sex as 'male' | 'female',
      weight: Number(weight),
      height: Number(height),
      goals,
    }

    try {
      const res = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error('API-fel')
      const schedule: GeneratedSchedule = await res.json()

      if (user) {
        await Promise.all([
          supabase.from('profiles').upsert({
            user_id: user.id,
            age: profile.age,
            sex: profile.sex,
            weight: profile.weight,
            height: profile.height,
            goals: profile.goals,
          }),
          supabase.from('schedules').upsert({
            user_id: user.id,
            schedule,
          }),
        ])
      }

      onComplete(profile, schedule)
    } catch {
      setError('Något gick fel. Försök igen.')
      setGenerating(false)
    }
  }

  const bmi = weight && height && Number(weight) > 0 && Number(height) > 0
    ? Number(weight) / Math.pow(Number(height) / 100, 2)
    : null

  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Undervikt' : bmi < 25 ? 'Normalvikt' : bmi < 30 ? 'Övervikt' : 'Fetma'
    : ''

  if (generating) {
    return (
      <div className="onboarding-container">
        <motion.div
          className="onboarding-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '48px 36px' }}
        >
          <div className="onboarding-logo" style={{ justifyContent: 'center' }}>
            <span>🌿</span>
            <h1>Vitalize</h1>
          </div>
          <div className="generating-spinner">🔬</div>
          <h2 className="step-title" style={{ marginBottom: 8 }}>Analyserar din profil</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            Skapar ett personligt schema baserat på din ålder, vikt, längd och mål...
          </p>
        </motion.div>
      </div>
    )
  }

  const steps = [
    {
      title: 'Berätta om dig',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="Ålder"
            min={1}
            max={120}
            className="age-input"
            style={{ fontSize: 24 }}
          />
          <div className="sex-grid">
            {(['female', 'male'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className={`sex-btn ${sex === s ? 'selected' : ''}`}
              >
                <span className="sex-emoji">{s === 'female' ? '♀️' : '♂️'}</span>
                <span>{s === 'female' ? 'Kvinna' : 'Man'}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Kropp & mått',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="measure-row">
            <label className="measure-label">Vikt</label>
            <div className="measure-input-wrap">
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="70"
                min={20}
                max={300}
                className="measure-input"
              />
              <span className="measure-unit">kg</span>
            </div>
          </div>
          <div className="measure-row">
            <label className="measure-label">Längd</label>
            <div className="measure-input-wrap">
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="175"
                min={100}
                max={250}
                className="measure-input"
              />
              <span className="measure-unit">cm</span>
            </div>
          </div>
          {bmi && (
            <div className="bmi-display">
              <span className="bmi-label">BMI</span>
              <span className="bmi-value">{bmi.toFixed(1)}</span>
              <span className="bmi-category">— {bmiCategory}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vad vill du fokusera på?',
      content: (
        <div>
          <p className="goals-hint">Välj ett eller flera områden</p>
          <div className="goals-grid">
            {allGoals.map(g => (
              <button
                key={g}
                onClick={() => toggleGoal(g)}
                className={`goal-btn ${goals.includes(g) ? 'selected' : ''}`}
              >
                <span className="goal-emoji">{goalEmojis[g]}</span>
                <span>{goalLabels[g]}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="onboarding-container">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="onboarding-logo">
          <span>🌿</span>
          <h1>Vitalize</h1>
        </div>

        {import.meta.env.DEV && (
          <button
            onClick={() => onComplete(mockProfile, mockSchedule)}
            style={{
              width: '100%', marginBottom: 16, padding: '10px',
              background: '#1e293b', color: '#94a3b8', border: '1px dashed #334155',
              borderRadius: 10, fontSize: 12, cursor: 'pointer',
            }}
          >
            🛠️ Dev: Ladda testprofil (skippar Claude)
          </button>
        )}

        <div className="step-dots">
          {steps.map((_, i) => (
            <div key={i} className={`dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="step-title">{steps[step].title}</h2>
          {steps[step].content}
        </motion.div>

        {error && <p className="auth-error" style={{ marginTop: 12 }}>{error}</p>}

        <div className="onboarding-nav">
          {step > 0 && (
            <button className="back-btn" onClick={() => setStep(s => s - 1)}>
              Tillbaka
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              className="next-btn"
              disabled={!canContinue[step]}
              onClick={() => setStep(s => s + 1)}
            >
              Fortsätt
            </button>
          ) : (
            <button
              className="next-btn"
              disabled={!canContinue[step]}
              onClick={handleSubmit}
            >
              Skapa mitt schema
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
