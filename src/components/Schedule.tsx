import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { TimeOfDay } from "../data/vitamins";
import { vitamins, timeLabels, timeIcons } from "../data/vitamins";
import type { UserProfile } from "./Onboarding";
import VitaminCard from "./VitaminCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Props {
  profile: UserProfile;
  onReset: () => void;
}

const timeOrder: TimeOfDay[] = ["morning", "midday", "evening", "night"];
const today = () => new Date().toISOString().split("T")[0];

export default function Schedule({ profile, onReset }: Props) {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const relevant = vitamins.filter((v) =>
    v.goals.some((g) => profile.goals.includes(g))
  );

  const byTime: Record<TimeOfDay, typeof vitamins> = {
    morning: [],
    midday: [],
    evening: [],
    night: [],
  };

  relevant.forEach((v) => {
    v.times.forEach((t) => {
      if (!byTime[t].find((x) => x.id === v.id)) {
        byTime[t].push(v);
      }
    });
  });

  const activeTimes = timeOrder.filter((t) => byTime[t].length > 0);
  const total = relevant.length;
  const done = checked.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from("daily_logs")
          .select("vitamin_id")
          .eq("user_id", user.id)
          .eq("date", today());
        if (data) setChecked(new Set(data.map((r: { vitamin_id: string }) => r.vitamin_id)));
      } else {
        const stored = localStorage.getItem(`log_${today()}`);
        if (stored) setChecked(new Set(JSON.parse(stored)));
      }
    };
    load();
  }, [user]);

  const toggle = async (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
      if (user) {
        await supabase.from("daily_logs")
          .delete()
          .eq("user_id", user.id)
          .eq("date", today())
          .eq("vitamin_id", id);
      }
    } else {
      next.add(id);
      if (user) {
        await supabase.from("daily_logs").insert({
          user_id: user.id,
          date: today(),
          vitamin_id: id,
        });
      }
    }
    setChecked(next);
    if (!user) localStorage.setItem(`log_${today()}`, JSON.stringify([...next]));
  };

  return (
    <div className="schedule-container">
      <motion.div
        className="schedule-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-top">
          <div className="logo-small">
            <span>🌿</span>
            <span>Vitalize</span>
          </div>
          <button className="reset-btn" onClick={onReset}>
            Ändra profil
          </button>
        </div>
        <h2 className="schedule-title">Ditt dagliga schema</h2>
        <p className="schedule-subtitle">Baserat på dina mål – {profile.age} år</p>

        <div className="progress-bar-wrap">
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="progress-label">{done}/{total} tagna idag</span>
        </div>
      </motion.div>

      <div className="time-sections">
        {activeTimes.map((time, i) => (
          <motion.section
            key={time}
            className="time-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
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
                  checked={checked.has(v.id)}
                  onToggle={() => toggle(v.id)}
                />
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      <div className="disclaimer">
        <p>
          ⚕️ Detta är generell information – konsultera alltid läkare eller dietist innan du börjar med kosttillskott, särskilt om du tar mediciner.
        </p>
      </div>
    </div>
  );
}
