import { motion } from "framer-motion";
import type { TimeOfDay } from "../data/vitamins";
import { vitamins, timeLabels, timeIcons } from "../data/vitamins";
import type { UserProfile } from "./Onboarding";
import VitaminCard from "./VitaminCard";

interface Props {
  profile: UserProfile;
  onReset: () => void;
}

const timeOrder: TimeOfDay[] = ["morning", "midday", "evening", "night"];

export default function Schedule({ profile, onReset }: Props) {
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
        <p className="schedule-subtitle">
          Baserat på dina mål – {profile.age} år
        </p>
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
                <VitaminCard key={v.id} vitamin={v} profile={profile} />
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
