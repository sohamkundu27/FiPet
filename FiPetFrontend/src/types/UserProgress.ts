export type LevelInfo = {
  current: number,
  xp: number,
  earnedXP: number,
  requiredXP: number,
  progress: number,
  previousProgress: number,
}

export type CoinInfo = {
  coins: number,
}

export type StreakInfo = {
  current: number,
  questsDone: number,
  questsRequired: number,
  progress: number,
  previousProgress: number,
  days: StreakDay[],
}

export const dayAbbreviations = {
  0: "S",
  1: "M",
  2: "T",
  3: "W",
  4: "T",
  5: "F",
  6: "S"
};

export type DayAbbreviation = typeof dayAbbreviations[keyof typeof dayAbbreviations];

export type StreakDay = {
  achieved: boolean,
  dayAbbreviation: DayAbbreviation,
}

export type StreakProgress = {
  currentStreak: number,
}

export type MoodClassification = "Asleep" | "Sad" | "Neutral" | "Happy" | "Excited";

export type MoodInfo = {
  current: number,
  previous: number,
  moodClassification: MoodClassification,
}
