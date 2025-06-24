import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from '@firebase/firestore';
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

// Get all questions
export const getAllQuestions = async (): Promise<Question[]> => {
  const questionsRef = collection(db, QUESTION_COLLECTION);
  const snapshot = await getDocs(questionsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

// Get questions by type
export const getQuestionsByType = async (type: Question['type']): Promise<Question[]> => {
  const questionsRef = collection(db, QUESTION_COLLECTION);
  const q = query(questionsRef, where('type', '==', type));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

// Create new question
export const createQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  const questionsRef = collection(db, QUESTION_COLLECTION);
  const docRef = await addDoc(questionsRef, question);
  return {
    ...question,
    id: docRef.id
  } as Question;
};

// Update question
export const updateQuestion = async (id: string, question: Partial<Question>): Promise<void> => {
  const questionRef = doc(db, QUESTION_COLLECTION, id);
  await updateDoc(questionRef, question);
};

// Delete question
export const deleteQuestion = async (id: string): Promise<void> => {
  const questionRef = doc(db, QUESTION_COLLECTION, id);
  await deleteDoc(questionRef);
}; 