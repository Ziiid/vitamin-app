import { motion } from 'framer-motion'
import type { ScheduleItem } from '../types/schedule'

interface Props {
  schedule: ScheduleItem[]
  checkedIds: Set<string> // vitamin ids that are checked today (regardless of time)
}

export default function BodyMap({ schedule, checkedIds }: Props) {
  // Since Claude-generated items don't have goals, we map by vitamin id conventions
  // that Claude is instructed to use, plus fallback to all checked = full body
  const checkedItems = schedule.filter(v => checkedIds.has(v.id))
  const totalItems = schedule.length
  const checkedCount = checkedItems.length
  const pct = totalItems > 0 ? checkedCount / totalItems : 0

  // Heuristic goal mapping by common vitamin ids/names
  const hasGoal = (goal: string) => checkedItems.some(v => {
    const id = v.id.toLowerCase()
    const name = v.name.toLowerCase()
    switch (goal) {
      case 'bones': return id.includes('d3') || id.includes('k2') || id.includes('calcium') || name.includes('d3') || name.includes('k2') || name.includes('kalcium')
      case 'brain': return id.includes('b12') || id.includes('omega') || id.includes('magnesium') || name.includes('b12') || name.includes('omega') || name.includes('magnesium')
      case 'heart': return id.includes('omega') || id.includes('iron') || id.includes('b12') || name.includes('omega') || name.includes('järn') || name.includes('b12')
      case 'muscle': return id.includes('magnesium') || id.includes('iron') || id.includes('zinc') || name.includes('magnesium') || name.includes('järn') || name.includes('zink') || name.includes('protein')
      case 'skin': return id.includes('zinc') || id.includes('vitaminc') || id.includes('omega') || name.includes('zink') || name.includes('c') || name.includes('omega') || name.includes('biotin') || name.includes('collagen')
      case 'immune': return id.includes('vitaminc') || id.includes('d3') || id.includes('zinc') || name.includes('vitamin c') || name.includes('d3') || name.includes('zink')
      default: return false
    }
  })

  const bones = hasGoal('bones')
  const brain = hasGoal('brain')
  const heart = hasGoal('heart')
  const muscle = hasGoal('muscle')
  const skin = hasGoal('skin')
  const immune = hasGoal('immune') || pct >= 0.8

  const glow = (color: string, active: boolean) =>
    active ? color : 'rgba(255,255,255,0.08)'

  const textColor = (active: boolean) =>
    active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)'

  return (
    <div className="body-map-wrap">
      <svg
        viewBox="0 0 120 280"
        className="body-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Immune system — full body aura */}
        {immune && (
          <motion.ellipse
            cx="60" cy="145" rx="48" ry="130"
            fill="rgba(134,239,172,0.08)"
            stroke="rgba(134,239,172,0.3)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Body outline */}
        <g opacity="0.9">
          {/* Head */}
          <ellipse cx="60" cy="28" rx="20" ry="22"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
          />

          {/* Neck */}
          <rect x="54" y="48" width="12" height="10" rx="4"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />

          {/* Torso */}
          <path d="M30,58 Q28,62 28,90 L28,148 Q28,154 34,156 L86,156 Q92,154 92,148 L92,90 Q92,62 90,58 Z"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
          />

          {/* Left arm */}
          <path d="M30,60 Q20,70 16,100 Q14,115 16,130 Q18,136 22,136 Q26,136 28,130 Q30,115 30,100 Z"
            fill={glow('rgba(251,146,60,0.25)', muscle)}
            stroke={muscle ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1.2"
          />
          {/* Right arm */}
          <path d="M90,60 Q100,70 104,100 Q106,115 104,130 Q102,136 98,136 Q94,136 92,130 Q90,115 90,100 Z"
            fill={glow('rgba(251,146,60,0.25)', muscle)}
            stroke={muscle ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1.2"
          />

          {/* Left leg */}
          <path d="M38,156 Q34,170 32,200 Q30,220 32,248 Q33,254 38,254 Q43,254 44,248 Q46,220 46,200 L46,156 Z"
            fill={glow('rgba(251,146,60,0.25)', muscle)}
            stroke={muscle ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1.2"
          />
          {/* Right leg */}
          <path d="M82,156 Q86,170 88,200 Q90,220 88,248 Q87,254 82,254 Q77,254 76,248 Q74,220 74,200 L74,156 Z"
            fill={glow('rgba(251,146,60,0.25)', muscle)}
            stroke={muscle ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1.2"
          />
        </g>

        {/* Skeleton overlay — spine + ribs */}
        {bones && (
          <motion.g
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            filter="url(#glow-green)"
          >
            {/* Spine */}
            <line x1="60" y1="58" x2="60" y2="155" stroke="rgba(253,224,71,0.9)" strokeWidth="2" strokeDasharray="4,3" />
            {/* Ribs */}
            {[72, 84, 96, 108, 120, 132].map((y, i) => (
              <g key={i}>
                <path d={`M60,${y} Q45,${y-4} 36,${y+4}`} fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="1.5" />
                <path d={`M60,${y} Q75,${y-4} 84,${y+4}`} fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="1.5" />
              </g>
            ))}
          </motion.g>
        )}

        {/* Brain */}
        <motion.g
          animate={{ opacity: brain ? 1 : 0.3 }}
          transition={{ duration: 0.4 }}
          filter={brain ? 'url(#glow-blue)' : undefined}
        >
          <ellipse cx="60" cy="24" rx="13" ry="12"
            fill={brain ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.04)'}
            stroke={brain ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.1)'}
            strokeWidth="1.2"
          />
          {brain && (
            <path d="M52,24 Q56,18 60,22 Q64,18 68,24 Q66,30 60,28 Q54,30 52,24"
              fill="rgba(167,139,250,0.3)" stroke="rgba(167,139,250,0.6)" strokeWidth="0.8"
            />
          )}
        </motion.g>

        {/* Heart */}
        <motion.g
          animate={{ scale: heart ? [1, 1.12, 1] : 1 }}
          transition={{ duration: 0.8, repeat: heart ? Infinity : 0, repeatDelay: 0.8 }}
          style={{ transformOrigin: '60px 88px' }}
          filter={heart ? 'url(#glow-red)' : undefined}
        >
          <path d="M60,94 C60,94 48,86 48,80 C48,75 52,72 56,74 C58,75 60,77 60,77 C60,77 62,75 64,74 C68,72 72,75 72,80 C72,86 60,94 60,94Z"
            fill={heart ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.06)'}
            stroke={heart ? 'rgba(248,113,113,0.9)' : 'rgba(255,255,255,0.12)'}
            strokeWidth="1"
          />
        </motion.g>

        {/* Skin glow — body outline highlight */}
        {skin && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ellipse cx="60" cy="28" rx="21" ry="23"
              fill="none" stroke="rgba(94,234,212,0.5)" strokeWidth="2.5"
            />
            <path d="M30,58 Q28,62 28,90 L28,148 Q28,154 34,156 L86,156 Q92,154 92,148 L92,90 Q92,62 90,58 Z"
              fill="none" stroke="rgba(94,234,212,0.5)" strokeWidth="2.5"
            />
          </motion.g>
        )}
      </svg>

      {/* Legend */}
      <div className="body-legend">
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
            <span style={{ color: textColor(item.active) }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
