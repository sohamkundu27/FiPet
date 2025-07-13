import { doc, getDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { Question } from '../types/quest';

const QUESTION_COLLECTION = 'questions';

// Get question by ID
export const getQuestionById = async (id: string): Promise<Question | null> => {
  const questionRef = doc(db, QUESTION_COLLECTION, id);
  const questionDoc = await getDoc(questionRef);
  if (!questionDoc.exists()) return null;
  return { id: questionDoc.id, ...questionDoc.data() } as Question;
};

// Get questions by their IDs
export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  if (questionIds.length === 0) return [];
  
  const questions: Question[] = [];
  
  for (const questionId of questionIds) {
    try {
      const question = await getQuestionById(questionId);
      if (question) {
        questions.push(question);
      }
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error);
    }
  }
  
  return questions;
}; 