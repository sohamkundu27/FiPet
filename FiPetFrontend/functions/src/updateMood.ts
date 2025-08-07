import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
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

// HTTP handler function
export const updateMood = onRequest({ maxInstances: 10 }, async (req, res) => {
  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Unauthorized - Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  let userId: string;

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication token" });
    return;
  }
  
  const { moodPercentage } = req.body;

  if (moodPercentage === undefined || moodPercentage === null) {
    res.status(400).json({ error: "Missing required parameter: moodPercentage" });
    return;
  }

  // Validate mood percentage is between 0 and 100
  if (moodPercentage < 0 || moodPercentage > 100) {
    res.status(400).json({ error: "Mood percentage must be between 0 and 100" });
    return;
  }

  // Constrain the mood value to ensure it stays within bounds
  const constrainedMood = Math.min(Math.max(moodPercentage, 0), 100);

  try {
    const db = getFirestore();
    
    // Update user's pet mood
    const userRef = db.collection("users").doc(userId);
    await userRef.update({
      pet_mood: constrainedMood,
    });

    logger.info(`Mood updated for user ${userId} to ${constrainedMood}%`);

    res.json({
      success: true,
      mood: constrainedMood,
    });

  } catch (error) {
    logger.error("Error updating mood:", error);
    res.status(500).json({ error: "Failed to update mood" });
  }
}); 