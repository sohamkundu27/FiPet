import { StreakData } from "../components/providers/GamificationProvider";

export function getStreakMinuteRequirement(streakInfo: StreakData) {
  // 0.1-0.3 multiplier based on streak progress
  // If you fall off your streak, we want an easier goal to get you back on track!
  return Math.round( 10 + (20 * streakInfo.current / 7) );
}

export function getLevelXPRequirement(level: number) {
  return 5 * Math.pow(level - 1, 2);
}
