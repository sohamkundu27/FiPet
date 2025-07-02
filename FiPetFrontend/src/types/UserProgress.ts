export type UserProgress = {
  level: number,
  currentXP: number,
  earnedXP: number, // amount of xp earned today.
  requiredLevelXP: number, // amount of XP before leveling up.
  requiredStreakXP: number, // amount of XP before achieving streak.
  levelProgress: number, // percent of xp required to reach next level
  streakProgress: number, // percent of xp required to satisfy today's streak
  coins: number,
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
  days: StreakDay[]
}
