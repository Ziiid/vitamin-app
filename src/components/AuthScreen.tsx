import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    setError('')
    setLoading(true)
    if (mode === 'login') {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      if (e) setError(e.message)
    } else {
      const { error: e } = await supabase.auth.signUp({ email, password })
      if (e) setError(e.message)
      else setDone(true)
    }
    setLoading(false)
  }

  return (
    <div className="onboarding-container">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="onboarding-logo">
          <span>🌿</span>
          <h1>Vitalize</h1>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 className="step-title">Kolla din e-post</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              Vi har skickat en bekräftelselänk till <strong>{email}</strong>. Klicka på länken för att aktivera ditt konto.
            </p>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError('') }}
              >Logga in</button>
              <button
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError('') }}
              >Skapa konto</button>
            </div>

            <div className="auth-fields">
              <input
                type="email"
                placeholder="E-post"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input"
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <input
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input"
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="next-btn"
              onClick={submit}
              disabled={loading || !email || !password}
              style={{ marginTop: 8 }}
            >
              {loading ? '...' : mode === 'login' ? 'Logga in' : 'Skapa konto'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
