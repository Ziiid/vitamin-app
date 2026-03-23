import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ScheduleItem } from "../types/schedule"
import type { UserProfile } from "./Onboarding"

interface Props {
  vitamin: ScheduleItem
  profile: UserProfile
  checked?: boolean
  onToggle?: () => void
}

export default function VitaminCard({ vitamin, checked = false, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)

  const conflictNames = vitamin.conflicts
  const synergyNames = vitamin.synergies

  return (
    <motion.div
      className={`vitamin-card ${checked ? "card-checked" : ""}`}
      style={{ backgroundColor: checked ? undefined : vitamin.color }}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="card-header">
        {onToggle && (
          <button
            className={`card-checkbox ${checked ? "checked" : ""}`}
            onClick={onToggle}
            aria-label="Markera som tagen"
          >
            {checked && <span className="card-checkmark">✓</span>}
          </button>
        )}
        <button className="card-header-inner" onClick={() => setExpanded((e) => !e)}>
          <div className="card-left">
            <span className="card-emoji">{vitamin.emoji}</span>
            <div>
              <p className="card-name">{vitamin.name}</p>
              <p className="card-dose">{vitamin.dose}</p>
            </div>
          </div>
          <div className="card-right">
            <span className={`food-badge ${vitamin.withFood ? "with-food" : "without-food"}`}>
              {vitamin.withFood ? "Med mat" : "Utan mat"}
            </span>
            <span className="expand-icon">{expanded ? "▲" : "▼"}</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="card-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="detail-why">{vitamin.why}</p>
            <div className="detail-tip">
              <span>💡</span>
              <p>{vitamin.tip}</p>
            </div>
            {conflictNames.length > 0 && (
              <div className="detail-conflicts">
                <span>⚠️ Ta inte med:</span>
                <div className="tag-list">
                  {conflictNames.map((n) => (
                    <span key={n} className="tag conflict-tag">{n}</span>
                  ))}
                </div>
              </div>
            )}
            {synergyNames.length > 0 && (
              <div className="detail-synergies">
                <span>✅ Förstärks av:</span>
                <div className="tag-list">
                  {synergyNames.map((n) => (
                    <span key={n} className="tag synergy-tag">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
