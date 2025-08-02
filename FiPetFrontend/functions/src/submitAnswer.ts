import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";

// Collection constants (matching the types)
const QUESTIONS_COLLECTION = 'questions2';
const OPTIONS_COLLECTION = 'options2';
const ANSWER_COLLECTION = 'questAnswers2';

export const submitAnswer = onRequest({ maxInstances: 10 }, async (req, res) => {

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
  
  const { questionId, selectedOptionId } = JSON.parse(req.body);

  if (!questionId || !selectedOptionId) {
    res.status(400).json({ error: "Missing required parameters: questionId and selectedOptionId" });
    return;
  }


  try {
    const db = getFirestore();
    
    // Get the question and its options
    const questionRef = db.collection(QUESTIONS_COLLECTION).doc(questionId);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const questionData = questionDoc.data();
    
    // Get the options for this question
    const optionsRef = db.collection(OPTIONS_COLLECTION);
    const optionsQuery = await optionsRef.where("questionId", "==", questionId).get();
    
    let correctOptionId = "";
    let selectedOptionCorrect = false;
    
    optionsQuery.forEach((doc: any) => {
      const optionData = doc.data();
      if (optionData.correct) {
        correctOptionId = doc.id;
      }
      if (doc.id === selectedOptionId) {
        selectedOptionCorrect = optionData.correct;
      }
    });

    // Create answer document
    const answerData = {
      id: questionId,
      questId: questionData?.questId || null,
      questionId: questionId,
      order: questionData?.order || 0,
      answeredAt: FieldValue.serverTimestamp(),
      correct: selectedOptionCorrect,
      correctOptionId: correctOptionId,
      selectedOptionId: selectedOptionId,
      reward: selectedOptionCorrect ? questionData?.reward || null : null,
    };

    // Save answer to user's answer collection
    const userAnswerRef = db.collection("users").doc(userId).collection(ANSWER_COLLECTION).doc(questionId);
    await userAnswerRef.set(answerData);

    // If answer is correct and there's a reward, update user stats
    if (selectedOptionCorrect && questionData?.reward) {
      const userRef = db.collection("users").doc(userId);
      await userRef.update({
        current_xp: FieldValue.increment(questionData.reward.xp || 0),
        current_coins: FieldValue.increment(questionData.reward.coins || 0),
      });
    }

    logger.info(`Answer submitted for user ${userId}, question ${questionId}, correct: ${selectedOptionCorrect}`);

    // Return result without revealing correct answer
    res.json({
      success: true,
      correct: selectedOptionCorrect,
      reward: selectedOptionCorrect ? questionData?.reward || null : null,
    });

  } catch (error) {
    logger.error("Error submitting answer:", error);
    res.status(500).json({ error: "Failed to submit answer" });
  }
}); 
