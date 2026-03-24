export type TimeOfDay = "morning" | "midday" | "evening"

export interface ScheduleItem {
  id: string
  name: string
  emoji: string
  color: string
  times: TimeOfDay[]
  withFood: boolean
  dose: string
  why: string
  tip: string
  conflicts: string[]
  synergies: string[]
  foodSources: string[]
}

export interface DailyGoals {
  water: { liters: number; why: string }
  protein: { grams: number; why: string }
  carbs: { grams: number; why: string }
}

export interface GeneratedSchedule {
  summary: string
  items: ScheduleItem[]
  dailyGoals: DailyGoals
}
