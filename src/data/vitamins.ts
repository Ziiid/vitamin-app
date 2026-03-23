export type TimeOfDay = "morning" | "midday" | "evening";
export type Goal = "immunity" | "energy" | "sleep" | "bones" | "skin" | "training";

export interface Vitamin {
  id: string;
  name: string;
  times: TimeOfDay[];
  withFood: boolean;
  dose: (age: number, sex: "male" | "female") => string;
  why: string;
  tip: string;
  conflicts: string[];
  synergies: string[];
  goals: Goal[];
  color: string;
  emoji: string;
}

export const vitamins: Vitamin[] = [
  {
    id: "d3",
    name: "Vitamin D3",
    times: ["morning"],
    withFood: true,
    dose: (age) => age > 70 ? "2000 IE" : "1000–2000 IE",
    why: "Stödjer immunförsvar, humör och kalciumupptag. Särskilt viktigt i Sverige under mörka månader.",
    tip: "Ta med en fetthaltig måltid – D3 är fettlösligt och tas upp bättre med fett.",
    conflicts: [],
    synergies: ["k2", "magnesium"],
    goals: ["immunity", "bones"],
    color: "#FEFCE8",
    emoji: "☀️",
  },
  {
    id: "k2",
    name: "Vitamin K2 (MK-7)",
    times: ["morning"],
    withFood: true,
    dose: () => "100–200 mcg",
    why: "Leder kalcium till skelettet istället för artärerna. Viktigt komplement till D3.",
    tip: "Ta alltid tillsammans med D3 för bästa effekt.",
    conflicts: [],
    synergies: ["d3"],
    goals: ["bones"],
    color: "#F0FDF4",
    emoji: "🦴",
  },
  {
    id: "magnesium",
    name: "Magnesium (Glycinat)",
    times: ["evening"],
    withFood: false,
    dose: (_age, sex) => sex === "female" ? "310–320 mg" : "400–420 mg",
    why: "Involverat i 300+ enzymatiska processer. Förbättrar sömnkvalitet och minskar stress.",
    tip: "Glycinatformen absorberas bäst och orsakar minst magbesvär. Ta 1h innan sänggående.",
    conflicts: ["iron", "zinc"],
    synergies: ["d3"],
    goals: ["sleep", "training"],
    color: "#FAF5FF",
    emoji: "🌙",
  },
  {
    id: "omega3",
    name: "Omega-3 (EPA/DHA)",
    times: ["morning", "evening"],
    withFood: true,
    dose: () => "500–1000 mg EPA+DHA",
    why: "Anti-inflammatorisk, stödjer hjärna, hjärta och leder. Dela dosen för bättre absorption.",
    tip: "Ta med en fettrik måltid för bästa absorption. Frys tabletterna för att minska fisksmak.",
    conflicts: [],
    synergies: ["d3"],
    goals: ["immunity", "training", "skin"],
    color: "#EFF6FF",
    emoji: "🐟",
  },
  {
    id: "vitaminc",
    name: "Vitamin C",
    times: ["morning", "midday"],
    withFood: false,
    dose: (age) => age > 60 ? "250–500 mg x2" : "250 mg x2",
    why: "Kraftfull antioxidant. Stödjer immunförsvar och kollagenproduktion.",
    tip: "Dela upp dosen under dagen – kroppen tar upp max ~500 mg åt gången.",
    conflicts: [],
    synergies: ["iron"],
    goals: ["immunity", "skin"],
    color: "#FFF7ED",
    emoji: "🍊",
  },
  {
    id: "iron",
    name: "Järn",
    times: ["morning"],
    withFood: false,
    dose: (_age, sex) => sex === "female" ? "18 mg" : "8 mg",
    why: "Nödvändigt för syretransport i blodet. Vanlig brist hos menstruerande kvinnor.",
    tip: "Ta på fastande mage för bäst absorption. Vänta minst 2h med kaffe/te efter intag.",
    conflicts: ["calcium", "magnesium", "zinc"],
    synergies: ["vitaminc"],
    goals: ["energy", "training"],
    color: "#FFF1F2",
    emoji: "💪",
  },
  {
    id: "b12",
    name: "Vitamin B12",
    times: ["morning"],
    withFood: false,
    dose: () => "500–1000 mcg",
    why: "Kritiskt för nervsystem och energiproduktion. Vanlig brist vid växtbaserad kost.",
    tip: "Sublinguala tabletter (under tungan) absorberas bättre än kapslar.",
    conflicts: [],
    synergies: [],
    goals: ["energy"],
    color: "#ECFDF5",
    emoji: "⚡",
  },
  {
    id: "zinc",
    name: "Zink",
    times: ["evening"],
    withFood: true,
    dose: (_age, sex) => sex === "male" ? "11 mg" : "8 mg",
    why: "Stödjer immunförsvar, sårläkning och hormonproduktion.",
    tip: "Ta med mat för att undvika illamående. Inte samtidigt med järn eller magnesium.",
    conflicts: ["iron", "magnesium"],
    synergies: [],
    goals: ["immunity", "skin", "training"],
    color: "#FAF5FF",
    emoji: "🛡️",
  },
];

export const timeLabels: Record<TimeOfDay, string> = {
  morning: "Morgon",
  midday: "Lunch",
  evening: "Kväll",
};

export const timeIcons: Record<TimeOfDay, string> = {
  morning: "🌅",
  midday: "☀️",
  evening: "🌆",
};

export const goalLabels: Record<Goal, string> = {
  immunity: "Immunförsvar",
  energy: "Energi",
  sleep: "Sömn",
  bones: "Ben & leder",
  skin: "Hud & hår",
  training: "Träning",
};

export const goalEmojis: Record<Goal, string> = {
  immunity: "🛡️",
  energy: "⚡",
  sleep: "😴",
  bones: "🦴",
  skin: "✨",
  training: "💪",
};
