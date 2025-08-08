import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin
let app;
try {
  app = initializeApp();
} catch (error) {
  // App might already be initialized
  app = initializeApp({ projectId: "fipet-521d1" });
}

const db = getFirestore(app);

// HTTP function to record answered question (correct or incorrect)
export const answeredQuestion = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { userId, questId, questionId, isCorrect, answer } = req.body;
  
  // Validate required fields
  if (!userId || !questId || !questionId) {
    console.error('Missing required fields:', { userId, questId, questionId });
    res.status(400).send("Missing required fields");
    return;
  }

  try {
    console.log('Recording answered question:', { userId, questId, questionId, isCorrect });
    
    // Get question data to store additional information
    const questionDoc = await db.collection('questions').doc(questionId).get();
    const questionData = questionDoc.data();
    
    await db
      .collection("users")
      .doc(userId)
      .collection("answeredQuestions")
      .doc(questId)
      .collection("questions")
      .doc(questionId)
      .set({
        questId,
        questionId,
        isCorrect,
        answer,
        timestamp: new Date().toISOString(),
        order: questionData?.order || 0,
        correctOptionId: answer?.correctOptionId || '',
        selectedOptionId: answer?.optionId || '',
        type: questionData?.type || 'singleSelect'
      });
    
    console.log('Successfully recorded answered question');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error recording answer:', err);
    res.status(500).send("Error recording answer");
  }
});

