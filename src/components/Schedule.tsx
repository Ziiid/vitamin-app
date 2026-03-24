import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { TimeOfDay, GeneratedSchedule } from "../types/schedule"
import { timeLabels, timeIcons } from "../data/vitamins"
import type { UserProfile } from "./Onboarding"
import VitaminCard from "./VitaminCard"
import BodyMap from "./BodyMap"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"

interface Props {
  profile: UserProfile
  schedule: GeneratedSchedule
  onReset: () => void
}

const timeOrder: TimeOfDay[] = ["morning", "midday", "evening"]
const today = () => new Date().toISOString().split("T")[0]
const logKey = (vitaminId: string, time: TimeOfDay) => `${vitaminId}__${time}`

export default function Schedule({ profile, schedule, onReset }: Props) {
  const { user } = useAuth()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [proteinG, setProteinG] = useState(0)

  const byTime: Record<TimeOfDay, typeof schedule.items> = {
    morning: [], midday: [], evening: [],
  }
  schedule.items.forEach((v) => {
    v.times.forEach((t) => {
      if (!byTime[t].find((x) => x.id === v.id)) byTime[t].push(v)
    })
  })
  const activeTimes = timeOrder.filter((t) => byTime[t].length > 0)

  useEffect(() => {
    const load = async () => {
      if (user) {
        const [logs, water, macro] = await Promise.all([
          supabase.from("daily_logs").select("vitamin_id, time_of_day")
            .eq("user_id", user.id).eq("date", today()),
          supabase.from("daily_water").select("glasses")
            .eq("user_id", user.id).eq("date", today()).maybeSingle(),
          supabase.from("daily_macro").select("protein_g")
            .eq("user_id", user.id).eq("date", today()).maybeSingle(),
        ])
        if (logs.data) setChecked(new Set(logs.data.map((r: { vitamin_id: string; time_of_day: string }) =>
          logKey(r.vitamin_id, r.time_of_day as TimeOfDay)
        )))
        if (water.data) setWaterGlasses(water.data.glasses)
        if (macro.data) setProteinG(macro.data.protein_g)
      } else {
        try {
          const d = today()
          const logs = localStorage.getItem(`log_${d}`)
          if (logs) setChecked(new Set(JSON.parse(logs)))
          const w = localStorage.getItem(`water_${d}`)
          if (w) setWaterGlasses(parseInt(w))
          const p = localStorage.getItem(`protein_${d}`)
          if (p) setProteinG(parseInt(p))
        } catch {}
      }
    }
    load()
  }, [user])

  const toggle = async (vitaminId: string, time: TimeOfDay) => {
    const key = logKey(vitaminId, time)
    const next = new Set(checked)
    if (next.has(key)) {
      next.delete(key)
      if (user) await supabase.from("daily_logs").delete()
        .eq("user_id", user.id).eq("date", today())
        .eq("vitamin_id", vitaminId).eq("time_of_day", time)
    } else {
      next.add(key)
      if (user) await supabase.from("daily_logs").insert({
        user_id: user.id, date: today(), vitamin_id: vitaminId, time_of_day: time,
      })
    }
    setChecked(next)
    if (!user) localStorage.setItem(`log_${today()}`, JSON.stringify([...next]))
  }

  const addWater = async () => {
    const goal = Math.round((schedule.dailyGoals.water.liters * 1000) / 250)
    if (waterGlasses >= goal) return
    const next = waterGlasses + 1
    setWaterGlasses(next)
    if (user) await supabase.from("daily_water").upsert(
      { user_id: user.id, date: today(), glasses: next }, { onConflict: 'user_id,date' })
    else localStorage.setItem(`water_${today()}`, String(next))
  }

  const removeWater = async () => {
    if (waterGlasses === 0) return
    const next = waterGlasses - 1
    setWaterGlasses(next)
    if (user) await supabase.from("daily_water").upsert(
      { user_id: user.id, date: today(), glasses: next }, { onConflict: 'user_id,date' })
    else localStorage.setItem(`water_${today()}`, String(next))
  }

  const addProtein = async (g: number) => {
    const next = proteinG + g
    setProteinG(next)
    if (user) await supabase.from("daily_macro").upsert(
      { user_id: user.id, date: today(), protein_g: next }, { onConflict: 'user_id,date' })
    else localStorage.setItem(`protein_${today()}`, String(next))
  }

  const removeProtein = async () => {
    setProteinG(0)
    if (user) await supabase.from("daily_macro").upsert(
      { user_id: user.id, date: today(), protein_g: 0 }, { onConflict: 'user_id,date' })
    else localStorage.setItem(`protein_${today()}`, '0')
  }

  const checkedVitaminIds = new Set([...checked].map(k => k.split('__')[0]))

  return (
    <div className="schedule-container">
      <motion.div className="schedule-header"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="header-top">
          <div className="logo-small"><span>🌿</span><span>Vitalize</span></div>
          <button className="reset-btn" onClick={onReset}>Ändra profil</button>
        </div>
        <p className="schedule-subtitle">{schedule.summary}</p>
      </motion.div>

      <BodyMap
        schedule={schedule.items}
        checkedIds={checkedVitaminIds}
        dailyGoals={schedule.dailyGoals}
        waterGlasses={waterGlasses}
        proteinG={proteinG}
        onAddWater={addWater}
        onRemoveWater={removeWater}
        onAddProtein={addProtein}
        onRemoveProtein={removeProtein}
      />

      <div className="time-sections">
        {activeTimes.map((time, i) => (
          <motion.section key={time} className="time-section"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <div className="time-label">
              <span className="time-icon">{timeIcons[time]}</span>
              <h3>{timeLabels[time]}</h3>
              <span className="time-count">{byTime[time].length} st</span>
            </div>
            <div className="card-list">
              {byTime[time].map((v) => (
                <VitaminCard
                  key={v.id}
                  vitamin={v}
                  profile={profile}
                  checked={checked.has(logKey(v.id, time))}
                  onToggle={() => toggle(v.id, time)}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <div className="disclaimer">
        <p>⚕️ Detta är generell information – konsultera alltid läkare eller dietist innan du börjar med kosttillskott, särskilt om du tar mediciner.</p>
      </div>
    </div>
  )
}
