import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";
import { QUEST_COLLECTION, QUESTIONS_COLLECTION, QUEST_COMPLETION_COLLECTION, ANSWER_COLLECTION } from "./shared/quest";
import { updateMoodLogic } from "./updateMood";
import { updateStreakLogic } from "./updateStreak";

export const completeQuest = onRequest({ maxInstances: 10 }, async (req, res) => {
  // Check if user is authenticated via Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Unauthorized - Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  // Verify the Firebase ID token and get the user ID
  let userId: string;
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication token" });
    return;
  }
  
  const { questId } = JSON.parse(req.body);

  if (!questId) {
    res.status(400).json({ error: "Missing required parameter: questId" });
    return;
  }

  try {
    const db = getFirestore();
    
    // Get the quest data
    const questRef = db.collection(QUEST_COLLECTION).doc(questId);
    const questDoc = await questRef.get();

    if (!questDoc.exists) {
      res.status(404).json({ error: "Quest not found" });
      return;
    }

    const questData = questDoc.data();

    // Check if quest is already completed
    const existingCompletionRef = db.collection("users").doc(userId).collection(QUEST_COMPLETION_COLLECTION).doc(questId);
    const existingCompletion = await existingCompletionRef.get();

    if (existingCompletion.exists) {
      res.status(409).json({ error: "Quest already completed" });
      return;
    }

    // Get all questions for this quest
    const questionsRef = db.collection(QUESTIONS_COLLECTION);
    const questionsQuery = await questionsRef.where("questId", "==", questId).get();
    
    const questionIds: string[] = [];
    questionsQuery.forEach((doc: any) => {
      questionIds.push(doc.id);
    });

    if (questionIds.length === 0) {
      res.status(404).json({ error: "No questions found for this quest" });
      return;
    }

    // Check if user has answered all questions
    const userAnswersRef = db.collection("users").doc(userId).collection(ANSWER_COLLECTION);
    const userAnswersQuery = await userAnswersRef.where("questId", "==", questId).get();

    const answeredQuestionIds: string[] = [];
    userAnswersQuery.forEach((doc: any) => {
      answeredQuestionIds.push(doc.data().questionId);
    });

    // Check if all questions are answered
    const allQuestionsAnswered = questionIds.every(id => answeredQuestionIds.includes(id));
    
    if (!allQuestionsAnswered) {
      res.status(400).json({ error: "All questions must be answered before completing quest" });
      return;
    }

    // Create quest completion document
    const completionData = {
      id: questId,
      questId: questId,
      completedAt: FieldValue.serverTimestamp(),
      reward: questData?.reward || { xp: 0, coins: 0, itemIds: [] },
    };

    // Save completion to user's quest completion collection
    await existingCompletionRef.set(completionData);

    // Update user stats with quest reward
    if (questData?.reward) {
      const userRef = db.collection("users").doc(userId);
      await userRef.update({
        current_xp: FieldValue.increment(questData.reward.xp || 0),
        current_coins: FieldValue.increment(questData.reward.coins || 0),
      });
    }

    // Calculate quest accuracy for mood adjustment
    let correctAnswers = 0;
    let totalQuestions = questionIds.length;
    
      const answerData = doc.data();
      if (answerData.correct) {
        correctAnswers++;
      }
    });
    
    const accuracyPercentage = (correctAnswers / totalQuestions) * 100;
    let moodIncrease = 0;
    
    if (accuracyPercentage >= 80) {
      moodIncrease = 10; // 80-100% correct = +10 mood
    } else if (accuracyPercentage >= 50) {
      moodIncrease = 5;  // 50-79% correct = +5 mood
    }
    // Below 50% = no mood increase
    
    // Update mood and streak after quest completion
    try {
      if (moodIncrease > 0) {
        await updateMoodLogic(userId, moodIncrease);
        logger.info(`Mood increased by ${moodIncrease} for user ${userId} (${accuracyPercentage.toFixed(1)}% accuracy)`);
      }
      
      // Update streak based on quest completions
      await updateStreakLogic(userId);
      
      logger.info(`Mood and streak updated for user ${userId} after quest completion`);
    } catch (error) {
      logger.error("Error updating mood/streak after quest completion:", error);
      // Don't fail the quest completion if mood/streak update fails
    }

    logger.info(`Quest completed for user ${userId}, quest ${questId}`);

    res.json({
      success: true,
      reward: questData?.reward || { xp: 0, coins: 0, itemIds: [] },
    });

  } catch (error) {
    logger.error("Error completing quest:", error);
    res.status(500).json({ error: "Failed to complete quest" });
  }
}); 
