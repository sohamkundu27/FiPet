import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, getDocs } from '@firebase/firestore';
import { db } from '../config/firebase';
import { QuestAnswer } from '../components/questProvider';

export interface UserQuestProgress {
  userId: string;
  questId: string;
  startedAt: string;
  lastUpdated: string;
  completedAt?: string;
  isCompleted: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  xpEarned: number;
}

export interface QuestProgressSummary {
  questId: string;
  isCompleted: boolean;
  isStarted: boolean;
  correctAnswers: number;
  totalQuestions: number;
  answeredQuestions: number;
  xpEarned: number;
  lastUpdated: string;
  startedAt?: string;
  completedAt?: string;
}

// Initialize quest progress for a user
export const initializeQuestProgress = async (
  userId: string, 
  questId: string,
  totalQuestions: number
): Promise<void> => {
  try {
    const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
    
    await setDoc(userProgressRef, {
      userId,
      questId,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isCompleted: false,
      totalQuestions,
      answeredQuestions: 0,
      correctAnswers: 0,
      xpEarned: 0
    }, { merge: true });
  } catch (error) {
    console.error('Error initializing quest progress:', error);
    throw error;
  }
};

// Save user's answer for a specific question in a quest
export const saveUserAnswer = async (
  userId: string, 
  questId: string, 
  questionId: string, 
  answer: QuestAnswer
): Promise<void> => {
  try {
    const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
    const answerRef = doc(collection(userProgressRef, 'answers'), questionId);
    
    await setDoc(answerRef, {
      questionId,
      option: answer.option,
      outcome: answer.outcome,
      timestamp: new Date().toISOString()
    });

    // Update the main progress document
    await updateDoc(userProgressRef, {
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user answer:', error);
    throw error;
  }
};

// Load user's answers for a specific quest
export const loadUserQuestAnswers = async (
  userId: string, 
  questId: string
): Promise<{ [questionId: string]: QuestAnswer }> => {
  try {
    const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
    const answersRef = collection(userProgressRef, 'answers');
    const answersSnapshot = await getDocs(answersRef);
    
    const answers: { [questionId: string]: QuestAnswer } = {};
    
    answersSnapshot.forEach(doc => {
      const data = doc.data();
      answers[data.questionId] = {
        option: data.option,
        outcome: data.outcome,
        nextQuestion: null // We'll reconstruct this based on quest structure
      };
    });
    
    return answers;
  } catch (error) {
    console.error('Error loading user quest answers:', error);
    return {};
  }
};

// Load user's XP progress for a quest
export const loadUserXpProgress = async (
  userId: string, 
  questId: string
): Promise<{ awardedQuestions: string[], questBonusAwarded: boolean }> => {
  try {
    const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
    const xpProgressRef = doc(collection(userProgressRef, 'xpProgress'), 'tracking');
    
    const xpProgressSnap = await getDoc(xpProgressRef);
    if (xpProgressSnap.exists()) {
      const data = xpProgressSnap.data();
      return {
        awardedQuestions: data.awardedQuestions || [],
        questBonusAwarded: data.questBonusAwarded || false
      };
    }
    
    return { awardedQuestions: [], questBonusAwarded: false };
  } catch (error) {
    console.error('Error loading XP progress:', error);
    return { awardedQuestions: [], questBonusAwarded: false };
  }
};

// Save user's XP progress for a quest
export const saveUserXpProgress = async (
  userId: string, 
  questId: string, 
  awardedQuestions: string[], 
  questBonusAwarded: boolean
): Promise<void> => {
  try {
    const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
    const xpProgressRef = doc(collection(userProgressRef, 'xpProgress'), 'tracking');
    
    await setDoc(xpProgressRef, {
      awardedQuestions,
      questBonusAwarded,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving XP progress:', error);
    throw error;
  }
};

// Get all quest progress for a user
export const getUserQuestProgress = async (
  userId: string
): Promise<QuestProgressSummary[]> => {
  try {
    const userProgressRef = collection(db, 'users', userId, 'questProgress');
    const progressSnapshot = await getDocs(userProgressRef);
    
    const progressSummaries: QuestProgressSummary[] = [];
    
    for (const progressDoc of progressSnapshot.docs) {
      const questId = progressDoc.id;
      const progressData = progressDoc.data();
      const answers = await loadUserQuestAnswers(userId, questId);
      
      const answeredQuestions = Object.keys(answers);
      const correctAnswers = Object.values(answers).filter(answer => answer.outcome.isCorrectAnswer).length;
      const xpEarned = Object.values(answers).reduce((sum, answer) => sum + (answer.outcome.xpReward || 0), 0);
      
      // Check if all questions are answered to determine completion
      const allQuestionsAnswered = answeredQuestions.length >= (progressData.totalQuestions || 0);
      const isCompleted = progressData.isCompleted || allQuestionsAnswered;
      const isStarted = answeredQuestions.length > 0;
      
      progressSummaries.push({
        questId,
        isCompleted,
        isStarted,
        correctAnswers,
        totalQuestions: progressData.totalQuestions || 0,
        answeredQuestions: answeredQuestions.length,
        xpEarned,
        lastUpdated: progressData.lastUpdated || new Date().toISOString(),
        startedAt: progressData.startedAt,
        completedAt: progressData.completedAt
      });
    }
    
    return progressSummaries;
  } catch (error) {
    console.error('Error getting user quest progress:', error);
    return [];
  }
};

// Mark quest as completed
export const markQuestCompleted = async (
  userId: string,
  questId: string
): Promise<void> => {
  try {
    const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
    
    await updateDoc(userProgressRef, {
      isCompleted: true,
      completedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking quest as completed:', error);
    throw error;
  }
};

// Real-time listener for quest progress
export const subscribeToQuestProgress = (
  userId: string,
  questId: string,
  callback: (progress: { 
    answers: { [questionId: string]: QuestAnswer }, 
    xpProgress: { awardedQuestions: string[], questBonusAwarded: boolean },
    summary: QuestProgressSummary | null
  }) => void
) => {
  const userProgressRef = doc(db, 'users', userId, 'questProgress', questId);
  
  return onSnapshot(userProgressRef, async (doc) => {
    if (doc.exists()) {
      const progressData = doc.data();
      const answers = await loadUserQuestAnswers(userId, questId);
      const xpProgress = await loadUserXpProgress(userId, questId);
      
      const summary: QuestProgressSummary = {
        questId,
        isCompleted: progressData.isCompleted || false,
        isStarted: Object.keys(answers).length > 0,
        correctAnswers: Object.values(answers).filter(answer => answer.outcome.isCorrectAnswer).length,
        totalQuestions: progressData.totalQuestions || 0,
        answeredQuestions: Object.keys(answers).length,
        xpEarned: Object.values(answers).reduce((sum, answer) => sum + (answer.outcome.xpReward || 0), 0),
        lastUpdated: progressData.lastUpdated || new Date().toISOString(),
        startedAt: progressData.startedAt,
        completedAt: progressData.completedAt
      };
      
      callback({ answers, xpProgress, summary });
    } else {
      callback({ 
        answers: {}, 
        xpProgress: { awardedQuestions: [], questBonusAwarded: false },
        summary: null
      });
    }
  });
}; 