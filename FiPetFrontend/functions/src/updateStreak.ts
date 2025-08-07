import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";
import { updateMoodLogic } from "./updateMood";

// Logic function that can be called from other functions
export const updateStreakLogic = async (userId: string) => {
  const db = getFirestore();

  // Check how many quests were completed today
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const questCompletionsRef = db.collection("users").doc(userId).collection("questCompletion2");
  const questsQuery = await questCompletionsRef
    .where("completedAt", ">=", startOfToday)
    .where("completedAt", "<", endOfToday)
    .get();

  const questsCompletedToday = questsQuery.size;

  // Check if user has a current streak (yesterday's streak)
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayRefName = `${yesterday.getMonth().toString().padStart(2, "0")}-${yesterday.getDate().toString().padStart(2, "0")}-${yesterday.getFullYear()}`;
  const yesterdayStreakRef = db.collection("users").doc(userId).collection("streakData").doc(yesterdayRefName);
  const yesterdayStreakDoc = await yesterdayStreakRef.get();

  const refName = `${today.getMonth().toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}-${today.getFullYear()}`;
  const streakCollection = db.collection("users").doc(userId).collection("streakData");
  const streakDocRef = streakCollection.doc(refName);

  if (questsCompletedToday >= 2) {
    // User completed 2+ quests today - continue or start streak
    const streakDoc = await streakDocRef.get();

    if (streakDoc.exists) {
      // Update existing streak for today
      await streakDocRef.update({
        endTime: FieldValue.serverTimestamp(),
        duration: FieldValue.increment(1), // Increment streak duration
      });
    } else {
      // Create new streak for today
      let currentStreakDuration = 1;

      // If user had a streak yesterday, continue it
      if (yesterdayStreakDoc.exists) {
        const yesterdayData = yesterdayStreakDoc.data();
        currentStreakDuration = (yesterdayData?.duration || 0) + 1;
      }

      await streakDocRef.set({
        startTime: FieldValue.serverTimestamp(),
        endTime: FieldValue.serverTimestamp(),
        duration: currentStreakDuration,
      });

      logger.info(`Streak continued/started for user ${userId} - ${questsCompletedToday} quests completed today, streak duration: ${currentStreakDuration}`);
    }

    // Increase mood by 5 when streak is continued or started
    try {
      await updateMoodLogic(userId, 5);
      logger.info(`Mood increased by 5 for user ${userId} due to streak continuation`);
    } catch (error) {
      logger.error("Error updating mood for streak continuation:", error);
      // Don't fail streak update if mood update fails
    }

    return {
      success: true,
      streakDate: refName,
      questsCompleted: questsCompletedToday,
      streakContinued: true,
      message: "Streak continued/started",
    };

  } else {
    // User didn't complete 2+ quests today - end streak
    if (yesterdayStreakDoc.exists) {
      logger.info(`Streak ended for user ${userId} - only ${questsCompletedToday} quests completed today (need 2+)`);

      return {
        success: true,
        questsCompleted: questsCompletedToday,
        streakContinued: false,
        message: "Streak ended - not enough quests completed today",
      };
    } else {
      // No previous streak to end
      logger.info(`No streak to end for user ${userId} - only ${questsCompletedToday} quests completed today`);

      return {
        success: true,
        questsCompleted: questsCompletedToday,
        streakContinued: false,
        message: "No streak to end",
      };
    }
  }
};

// HTTP handler function
export const updateStreak = onRequest({ maxInstances: 10 }, async (req, res) => {
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
  
  try {
    const db = getFirestore();
    
    // Check how many quests were completed today
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Count quests completed today
    const questCompletionsRef = db.collection("users").doc(userId).collection("questCompletion2");
    const questsQuery = await questCompletionsRef
      .where("completedAt", ">=", startOfToday)
      .where("completedAt", "<", endOfToday)
      .get();
    
    const questsCompletedToday = questsQuery.size;
    
    // Check if user has a current streak (yesterday's streak)
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayRefName = `${yesterday.getMonth().toString().padStart(2, "0")}-${yesterday.getDate().toString().padStart(2, "0")}-${yesterday.getFullYear()}`;
    const yesterdayStreakRef = db.collection("users").doc(userId).collection("streakData").doc(yesterdayRefName);
    const yesterdayStreakDoc = await yesterdayStreakRef.get();
    
    const refName = `${today.getMonth().toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}-${today.getFullYear()}`;
    const streakCollection = db.collection("users").doc(userId).collection("streakData");
    const streakDocRef = streakCollection.doc(refName);
    
    if (questsCompletedToday >= 2) {
      // User completed 2+ quests today - continue or start streak
      const streakDoc = await streakDocRef.get();
      
      if (streakDoc.exists) {
        // Update existing streak for today
        await streakDocRef.update({
          endTime: FieldValue.serverTimestamp(),
          duration: FieldValue.increment(1), // Increment streak duration
        });
             } else {
         // Create new streak for today
         let currentStreakDuration = 1;
         
         // If user had a streak yesterday, continue it
         if (yesterdayStreakDoc.exists) {
           const yesterdayData = yesterdayStreakDoc.data();
           currentStreakDuration = (yesterdayData?.duration || 0) + 1;
         }
         
         await streakDocRef.set({
           startTime: FieldValue.serverTimestamp(),
           endTime: FieldValue.serverTimestamp(),
           duration: currentStreakDuration,
         });
         
         logger.info(`Streak continued/started for user ${userId} - ${questsCompletedToday} quests completed today, streak duration: ${currentStreakDuration}`);
       }
      
      res.json({
        success: true,
        streakDate: refName,
        questsCompleted: questsCompletedToday,
        streakContinued: true,
        message: "Streak continued/started",
      });
      
    } else {
      // User didn't complete 2+ quests today - end streak
      if (yesterdayStreakDoc.exists) {
        logger.info(`Streak ended for user ${userId} - only ${questsCompletedToday} quests completed today (need 2+)`);
        
        res.json({
          success: true,
          questsCompleted: questsCompletedToday,
          streakContinued: false,
          message: "Streak ended - not enough quests completed today",
        });
      } else {
        // No previous streak to end
        logger.info(`No streak to end for user ${userId} - only ${questsCompletedToday} quests completed today`);
        
        res.json({
          success: true,
          questsCompleted: questsCompletedToday,
          streakContinued: false,
          message: "No streak to end",
        });
      }
    }

  } catch (error) {
    logger.error("Error updating streak:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
}); 