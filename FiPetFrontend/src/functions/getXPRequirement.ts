import { StreakProgress } from "../types/UserProgress";

export function getStreakXPRequirement(level: number, streakProgress: StreakProgress) {
  // Basically the amount of xp needed to get to the next level.
  let levelDerivative = 30 * Math.pow(level, 2);
  // 0.1-0.3 multiplier based on streak progress
  // If you fall off your streak, we want an easier goal to get you back on track!
  let multiplier = 0.1 + (0.2 * streakProgress.currentStreak / 7);
  return Math.round(levelDerivative * multiplier);
}

export function getLevelXPRequirement(level: number) {
  return Math.round( 10 * Math.pow(level, 3) );
}
