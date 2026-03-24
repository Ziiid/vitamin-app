import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ScheduleItem, DailyGoals } from '../types/schedule'

type BodyMode = 'vitamins' | 'water' | 'macro'

interface Props {
  schedule: ScheduleItem[]
  checkedIds: Set<string>
  dailyGoals: DailyGoals
  waterGlasses: number
  proteinG: number
  onAddWater: () => void
  onRemoveWater: () => void
  onAddProtein: (g: number) => void
  onRemoveProtein: () => void
}

const GLASS_ML = 250

export default function BodyMap({
  schedule,
  checkedIds,
  dailyGoals,
  waterGlasses,
  proteinG,
  onAddWater,
  onRemoveWater,
  onAddProtein,
  onRemoveProtein,
}: Props) {
  const [mode, setMode] = useState<BodyMode>('vitamins')

  const waterGoalGlasses = Math.round((dailyGoals.water.liters * 1000) / GLASS_ML)
  const waterPct = Math.min(waterGlasses / waterGoalGlasses, 1)
  const proteinPct = Math.min(proteinG / dailyGoals.protein.grams, 1)

  const vitaminPct = schedule.length > 0 ? Math.min(checkedIds.size / schedule.length, 1) : 0


  // Vitamin region highlighting
  const checkedItems = schedule.filter(v => checkedIds.has(v.id))
  const hasV = (ids: string[], names: string[]) => checkedItems.some(v =>
    ids.some(id => v.id.toLowerCase().includes(id)) ||
    names.some(n => v.name.toLowerCase().includes(n))
  )
  const brain = hasV(['b12', 'omega', 'magnesium'], ['b12', 'omega', 'magnesium'])
  const heart = hasV(['omega', 'iron', 'b12'], ['omega', 'järn', 'b12'])
  const bones = hasV(['d3', 'k2', 'calcium'], ['d3', 'k2', 'kalcium'])
  const muscle = hasV(['magnesium', 'iron', 'zinc', 'protein'], ['magnesium', 'järn', 'zink', 'protein', 'kreatin'])
  const skin = hasV(['zinc', 'vitaminc', 'omega', 'biotin'], ['zink', 'c', 'omega', 'biotin', 'collagen'])
  const immune = hasV(['vitaminc', 'd3', 'zinc'], ['vitamin c', 'd3', 'zink']) || vitaminPct >= 0.8

  const fillColor =
    mode === 'water' ? 'rgba(96,165,250,0.55)' :
    mode === 'macro' ? 'rgba(251,191,36,0.55)' :
    'rgba(134,239,172,0.2)'

  const fillPct =
    mode === 'water' ? waterPct :
    mode === 'macro' ? proteinPct :
    vitaminPct

  const fillY = 280 * (1 - fillPct)

  // Body paths for clipPath
  const bodyPaths = [
    <ellipse key="head" cx="60" cy="28" rx="20" ry="22" />,
    <rect key="neck" x="54" y="48" width="12" height="10" rx="4" />,
    <path key="torso" d="M30,58 Q28,62 28,90 L28,148 Q28,154 34,156 L86,156 Q92,154 92,148 L92,90 Q92,62 90,58 Z" />,
    <path key="larm" d="M30,60 Q20,70 16,100 Q14,115 16,130 Q18,136 22,136 Q26,136 28,130 Q30,115 30,100 Z" />,
    <path key="rarm" d="M90,60 Q100,70 104,100 Q106,115 104,130 Q102,136 98,136 Q94,136 92,130 Q90,115 90,100 Z" />,
    <path key="lleg" d="M38,156 Q34,170 32,200 Q30,220 32,248 Q33,254 38,254 Q43,254 44,248 Q46,220 46,200 L46,156 Z" />,
    <path key="rleg" d="M82,156 Q86,170 88,200 Q90,220 88,248 Q87,254 82,254 Q77,254 76,248 Q74,220 74,200 L74,156 Z" />,
  ]

  return (
    <div className="bodymap-container">
      {/* Mode tabs */}
      <div className="bodymap-tabs">
        {([
          { id: 'vitamins', label: 'Vitaminer', icon: '💊' },
          { id: 'water',    label: 'Vatten',    icon: '💧' },
          { id: 'macro',    label: 'Protein',   icon: '🥩' },
        ] as { id: BodyMode; label: string; icon: string }[]).map(t => (
          <button
            key={t.id}
            className={`bodymap-tab ${mode === t.id ? 'bodymap-tab-active' : ''}`}
            onClick={() => setMode(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Body SVG */}
      <div className="bodymap-svg-wrap">
        <svg viewBox="0 0 120 280" className="bodymap-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="body-clip">{bodyPaths}</clipPath>
          </defs>

          {/* Immune aura */}
          {mode === 'vitamins' && immune && (
            <motion.ellipse cx="60" cy="145" rx="52" ry="135"
              fill="rgba(134,239,172,0.07)" stroke="rgba(134,239,172,0.25)" strokeWidth="1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            />
          )}

          {/* Body outline */}
          <g fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5">
            {bodyPaths}
          </g>

          {/* Fill layer */}
          <motion.rect
            clipPath="url(#body-clip)"
            x="0" width="120" height="280"
            fill={fillColor}
            animate={{ y: fillY }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          {/* Skeleton overlay */}
          {mode === 'vitamins' && bones && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line x1="60" y1="58" x2="60" y2="155" stroke="rgba(253,224,71,0.85)" strokeWidth="2" strokeDasharray="4,3" />
              {[72,84,96,108,120,132].map((y, i) => (
                <g key={i}>
                  <path d={`M60,${y} Q45,${y-4} 36,${y+4}`} fill="none" stroke="rgba(253,224,71,0.65)" strokeWidth="1.5" />
                  <path d={`M60,${y} Q75,${y-4} 84,${y+4}`} fill="none" stroke="rgba(253,224,71,0.65)" strokeWidth="1.5" />
                </g>
              ))}
            </motion.g>
          )}

          {/* Brain */}
          {mode === 'vitamins' && (
            <motion.ellipse cx="60" cy="23" rx="12" ry="11"
              fill={brain ? 'rgba(167,139,250,0.55)' : 'transparent'}
              stroke={brain ? 'rgba(167,139,250,0.9)' : 'transparent'}
              strokeWidth="1.2"
              animate={{ opacity: brain ? 1 : 0 }}
            />
          )}

          {/* Heart */}
          {mode === 'vitamins' && (
            <motion.path
              d="M60,94 C60,94 48,86 48,80 C48,75 52,72 56,74 C58,75 60,77 60,77 C60,77 62,75 64,74 C68,72 72,75 72,80 C72,86 60,94 60,94Z"
              fill={heart ? 'rgba(248,113,113,0.7)' : 'transparent'}
              stroke={heart ? 'rgba(248,113,113,0.9)' : 'transparent'}
              strokeWidth="1"
              animate={{ scale: heart ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.8, repeat: heart ? Infinity : 0, repeatDelay: 0.8 }}
              style={{ transformOrigin: '60px 85px' }}
            />
          )}

          {/* Skin outline glow */}
          {mode === 'vitamins' && skin && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ellipse cx="60" cy="28" rx="21" ry="23" fill="none" stroke="rgba(94,234,212,0.5)" strokeWidth="2.5" />
              <path d="M30,58 Q28,62 28,90 L28,148 Q28,154 34,156 L86,156 Q92,154 92,148 L92,90 Q92,62 90,58 Z"
                fill="none" stroke="rgba(94,234,212,0.5)" strokeWidth="2.5" />
            </motion.g>
          )}

          {/* Water level line */}
          {mode === 'water' && waterPct > 0 && (
            <motion.line
              x1="5" x2="115"
              stroke="rgba(147,210,255,0.8)" strokeWidth="1.5" strokeDasharray="4,3"
              animate={{ y1: fillY, y2: fillY }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}

          {/* Protein muscle highlights */}
          {mode === 'macro' && proteinPct > 0 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: proteinPct }}>
              <path d="M30,60 Q20,70 16,100 Q14,115 16,130 Q18,136 22,136 Q26,136 28,130 Q30,115 30,100 Z"
                fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.7)" strokeWidth="1.5" />
              <path d="M90,60 Q100,70 104,100 Q106,115 104,130 Q102,136 98,136 Q94,136 92,130 Q90,115 90,100 Z"
                fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.7)" strokeWidth="1.5" />
              <path d="M38,156 Q34,170 32,200 Q30,220 32,248 Q33,254 38,254 Q43,254 44,248 Q46,220 46,200 L46,156 Z"
                fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.7)" strokeWidth="1.5" />
              <path d="M82,156 Q86,170 88,200 Q90,220 88,248 Q87,254 82,254 Q77,254 76,248 Q74,220 74,200 L74,156 Z"
                fill="rgba(251,191,36,0.4)" stroke="rgba(251,191,36,0.7)" strokeWidth="1.5" />
            </motion.g>
          )}
        </svg>

        {/* Center pct label */}
        <div className="bodymap-pct">
          <span className="bodymap-pct-num">
            {mode === 'vitamins' && `${Math.round(vitaminPct * 100)}%`}
            {mode === 'water' && `${waterGlasses}/${waterGoalGlasses}`}
            {mode === 'macro' && `${proteinG}g`}
          </span>
          <span className="bodymap-pct-label">
            {mode === 'vitamins' && 'tagna idag'}
            {mode === 'water' && 'glas vatten'}
            {mode === 'macro' && `av ${dailyGoals.protein.grams}g protein`}
          </span>
        </div>
      </div>

      {/* Controls */}
      <AnimatePresence mode="wait">
        {mode === 'water' && (
          <motion.div key="water-ctrl" className="bodymap-controls"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <p className="bodymap-goal-why">💧 {dailyGoals.water.why}</p>
            <div className="bodymap-ctrl-row">
              <button className="ctrl-btn ctrl-minus" onClick={onRemoveWater} disabled={waterGlasses === 0}>−</button>
              <div className="ctrl-glasses">
                {Array.from({ length: waterGoalGlasses }).map((_, i) => (
                  <span key={i} className={`ctrl-glass ${i < waterGlasses ? 'ctrl-glass-filled' : ''}`}>💧</span>
                ))}
              </div>
              <button className="ctrl-btn ctrl-plus" onClick={onAddWater} disabled={waterGlasses >= waterGoalGlasses}>+</button>
            </div>
          </motion.div>
        )}

        {mode === 'macro' && (
          <motion.div key="macro-ctrl" className="bodymap-controls"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <p className="bodymap-goal-why">🥩 {dailyGoals.protein.why}</p>
            <div className="bodymap-meal-row">
              {([
                { label: 'Liten måltid', g: 20, emoji: '🥣' },
                { label: 'Normal', g: 35, emoji: '🍽️' },
                { label: 'Stor måltid', g: 50, emoji: '🥩' },
              ]).map(meal => (
                <button key={meal.label} className="meal-btn" onClick={() => onAddProtein(meal.g)}>
                  <span>{meal.emoji}</span>
                  <span>{meal.label}</span>
                  <span className="meal-g">+{meal.g}g</span>
                </button>
              ))}
            </div>
            {proteinG > 0 && (
              <button className="ctrl-reset" onClick={onRemoveProtein}>Nollställ ({proteinG}g loggat)</button>
            )}
          </motion.div>
        )}

        {mode === 'vitamins' && (
          <motion.div key="vitamin-legend" className="bodymap-legend"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            {[
              { label: 'Hjärna', active: brain, color: '#a78bfa' },
              { label: 'Hjärta', active: heart, color: '#f87171' },
              { label: 'Skelett', active: bones, color: '#fde047' },
              { label: 'Muskler', active: muscle, color: '#fb923c' },
              { label: 'Hud', active: skin, color: '#5eead4' },
              { label: 'Immunförsvar', active: immune, color: '#86efac' },
            ].map(item => (
              <div key={item.label} className={`legend-item ${item.active ? 'legend-active' : ''}`}>
                <span className="legend-dot" style={{ background: item.active ? item.color : 'rgba(255,255,255,0.15)' }} />
                <span style={{ color: item.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}>{item.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
