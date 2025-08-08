import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

// Logic function that can be called from other functions
export const updateMoodLogic = async (userId: string, moodPercentage: number) => {
  if (moodPercentage === undefined || moodPercentage === null) {
    throw new Error("Missing required parameter: moodPercentage");
  }

  if (moodPercentage < 0 || moodPercentage > 100) {
    throw new Error("Mood percentage must be between 0 and 100");
  }

  const constrainedMood = Math.min(Math.max(moodPercentage, 0), 100);

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  await userRef.update({
    pet_mood: constrainedMood,
  });

  logger.info(`Mood updated for user ${userId} to ${constrainedMood}%`);
  return { success: true, mood: constrainedMood };
};
